// app.ts - Exporta apenas a aplicação Express sem iniciar o servidor
// Para uso em testes de integração

import compression from 'compression';
import cors from 'cors';
import express, { type Application } from 'express';
import helmet from 'helmet';
import adminRoutes from './routes/admin.routes';
import { authRoutes } from './routes/auth';
import { createBullBoardRouter } from './routes/bullBoard.routes';
import clientRoutes from './routes/client.routes';
import coinzzRoutes from './routes/coinzz.routes';
import { dashboardRoutes } from './routes/dashboard.routes';
import facebookRoutes from './routes/facebook.routes';
import { goalRoutes } from './routes/goal.routes';
import healthRoutes from './routes/health.routes';
import integrationRoutes from './routes/integration.routes';
import { pagBankRoutes } from './routes/pagbank.routes';
import { projectionRoutes } from './routes/projection.routes';
import { reportRoutes } from './routes/report.routes';
import { saleRoutes } from './routes/sale.routes';
import tagRoutes from './routes/tag.routes';
import whatsappRoutes from './routes/whatsapp.routes';
import { performanceLogger } from './shared/middlewares/performanceLogger';
import { globalRateLimiter } from './shared/middlewares/rateLimiter';
import { preventNoSqlInjection, sanitizeInput } from './shared/middlewares/sanitize';
import { logger } from './shared/utils/logger';
import coinzzWebhookRoutes from './webhooks/coinzzWebhook';

const app: Application = express();

// Security middlewares
app.use(helmet());
app.use(compression());
// CORS configuration - Basic approach for TypeScript compatibility
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
      'Cache-Control',
      'Pragma',
    ],
  }),
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global security middlewares
app.use(preventNoSqlInjection);
app.use(sanitizeInput);

// Apply global rate limiter
app.use(globalRateLimiter);

// Performance logging middleware
app.use(performanceLogger);

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/clients', clientRoutes);
app.use('/api/v1/sales', saleRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/tags', tagRoutes);
app.use('/api/v1/projections', projectionRoutes);
app.use('/api/v1/goals', goalRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/integrations/coinzz', coinzzRoutes);
app.use('/api/v1/integrations/facebook', facebookRoutes);
app.use('/api/v1/integrations/whatsapp', whatsappRoutes);
app.use('/api/v1/integrations', integrationRoutes);
app.use('/api/v1/pagbank', pagBankRoutes);
app.use('/health', healthRoutes);

// Bull Board (Job Queue Dashboard)
const bullBoardRouter = createBullBoardRouter();
app.use('/admin/queues', bullBoardRouter);

// Webhooks (raw body parser required)
app.use('/webhooks/coinzz', express.raw({ type: 'application/json' }), coinzzWebhookRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.url} not found`,
  });
});

// Error handler
app.use(
  (
    err: { status?: number; name?: string; message?: string },
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    logger.error('Error:', err);
    res.status(err.status || 500).json({
      error: err.name || 'Internal Server Error',
      message: err.message || 'An unexpected error occurred',
    });
  },
);

export default app;
