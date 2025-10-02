// src/server.ts
// Referência: design.md §Server Setup, dev-stories.md Dev Story 1.1

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { env } from './shared/config/env';
import { logger } from './shared/utils/logger';
import { checkDatabaseHealth, disconnectPrisma } from './shared/config/database';
import { authRoutes } from './routes/auth';
import clientRoutes from './routes/client.routes';
import { saleRoutes } from './routes/sale.routes';
import { dashboardRoutes } from './routes/dashboard.routes';
import tagRoutes from './routes/tag.routes';
import healthRoutes from './routes/health.routes';
import { createBullBoardRouter } from './routes/bullBoard.routes';
import coinzzRoutes from './routes/coinzz.routes';
import facebookRoutes from './routes/facebook.routes';
import coinzzWebhookRoutes from './webhooks/coinzzWebhook';
import { projectionRoutes } from './routes/projection.routes';
import { goalRoutes } from './routes/goal.routes';
import { reportRoutes } from './routes/report.routes';
import { startAllWorkers, stopAllWorkers } from './workers';
import { closeAllQueues } from './queues/index';
import { allQueues } from './queues/queues';
import { startStorageCleanup, stopStorageCleanup } from './jobs/storageCleanup';

// Create Express application
const app = express();

// Trust proxy (for accurate IP addresses behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: env.NODE_ENV === 'production' ? [env.API_BASE_URL] : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  }),
);

// Compression middleware
app.use(compression());

// Rate limiter for report generation (10 req/hour)
// Referência: tasks.md Task 10.1.5 - Rate limiting 10 relatórios/hora
// NOTA: Requer instalação de express-rate-limit: npm install express-rate-limit
// Implementação temporária com middleware customizado até instalação do pacote
const reportGenerateLimiter = (_req: express.Request, _res: express.Response, next: express.NextFunction) => {
  // TODO: Implementar rate limiting com express-rate-limit
  // Por ora, permite todas as requisições
  next();
};

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();

  // Log request
  logger.info('HTTP Request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  // Log response on finish
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Response', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: `${duration}ms`,
    });
  });

  next();
});

// Health check endpoint
// Health check endpoint
app.get('/health', async (_req, res) => {
  const dbHealthy = await checkDatabaseHealth();

  res.status(dbHealthy ? 200 : 503).json({
    status: dbHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    database: dbHealthy ? 'connected' : 'disconnected',
    version: '1.0.0',
  });
});

// API base route
app.get('/', (_req, res) => {
  res.status(200).json({
    message: 'Flowzz API - SaaS de Gestão Financeira para Afiliados',
    version: process.env.npm_package_version || '1.0.0',
    environment: env.NODE_ENV,
    documentation: `${env.API_BASE_URL}/docs`,
  });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/clients', clientRoutes);
app.use('/api/v1/sales', saleRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/projections', projectionRoutes);
app.use('/api/v1/goals', goalRoutes);
app.use('/api/v1/tags', tagRoutes);
app.use('/api/v1/reports', reportRoutes);

// Apply rate limiting to report generation endpoint
app.post('/api/v1/reports/generate', reportGenerateLimiter);

// Integration routes
app.use('/api/v1/integrations/coinzz', coinzzRoutes);
app.use('/api/v1/integrations/facebook', facebookRoutes);

// Webhook routes (public, no auth)
app.use('/webhooks/coinzz', coinzzWebhookRoutes);

// Health check routes (queues)
app.use('/health', healthRoutes);

// Bull Board dashboard (admin only)
app.use('/admin/queues', createBullBoardRouter());

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled Error', {
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
    },
    request: {
      method: req.method,
      url: req.url,
      ip: req.ip,
    },
  });

  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    timestamp: new Date().toISOString(),
  });
});

// Start server
const server = app.listen(env.PORT, () => {
  logger.info('🚀 Flowzz API started successfully', {
    port: env.PORT,
    environment: env.NODE_ENV,
    baseUrl: env.API_BASE_URL,
  });

  // Start all workers after server is running
  try {
    startAllWorkers();
    logger.info('All workers started', {
      queues: allQueues.map((q) => q.name),
    });
  } catch (error) {
    logger.error('Failed to start workers', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  // Start storage cleanup job
  try {
    startStorageCleanup();
    logger.info('Storage cleanup job started');
  } catch (error) {
    logger.error('Failed to start storage cleanup job', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Graceful shutdown
const shutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  server.close(async () => {
    logger.info('HTTP server closed');

    // Stop all workers
    try {
      await stopAllWorkers();
      logger.info('All workers stopped');
    } catch (error) {
      logger.error('Error stopping workers', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // Stop storage cleanup job
    try {
      stopStorageCleanup();
      logger.info('Storage cleanup job stopped');
    } catch (error) {
      logger.error('Error stopping storage cleanup job', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // Close all queues
    try {
      await closeAllQueues(allQueues);
      logger.info('All queues closed');
    } catch (error) {
      logger.error('Error closing queues', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // Disconnect from database
    await disconnectPrisma();

    logger.info('Graceful shutdown completed');
    process.exit(0);
  });

  // Force shutdown if graceful shutdown takes too long
  setTimeout(() => {
    logger.error('Forcing shutdown after timeout');
    process.exit(1);
  }, 30000);
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', {
    reason,
    promise,
  });
  // Don't exit in development
  if (env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', error => {
  logger.error('Uncaught Exception', {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
  });
  process.exit(1);
});

// Handle process termination signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;