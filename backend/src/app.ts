// app.ts - Exporta apenas a aplicação Express sem iniciar o servidor
// Para uso em testes de integração

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { env } from './shared/config/env';
import { globalRateLimiter } from './shared/middlewares/rateLimiter';
import { sanitizeInput, preventNoSqlInjection } from './shared/middlewares/sanitize';
import { performanceLogger } from './shared/middlewares/performanceLogger';
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
import adminRoutes from './routes/admin.routes';
import whatsappRoutes from './routes/whatsapp.routes';
import { pagBankRoutes } from './routes/pagbank.routes';

const app = express();

// Security middlewares
app.use(helmet());
app.use(compression());

// CORS configuration
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = [
      env.FRONTEND_USER_URL,
      env.FRONTEND_ADMIN_URL,
      env.FRONTEND_LANDING_URL,
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

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
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.name || 'Internal Server Error',
    message: err.message || 'An unexpected error occurred',
  });
});

export default app;
