// src/shared/middlewares/performanceLogger.ts
// Middleware para logging de performance de requests

import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Middleware que loga métricas de performance para cada request
 * - Tempo de resposta
 * - Status HTTP
 * - Usuário (se autenticado)
 * - Endpoint
 */
export const performanceLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  const { method, originalUrl, ip } = req;
  // Extrair userId do req.user se existir
  const userId = (req as any).user?.userId || 'anonymous';

  // Log quando a resposta é finalizada
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const { statusCode } = res;

    // Log de performance com nível específico
    logger.log('performance', 'Request completed', {
      method,
      url: originalUrl,
      statusCode,
      duration,
      userId,
      ip: ip || req.connection?.remoteAddress,
      userAgent: req.get('User-Agent'),
      // Flag para requests lentas (>2s)
      slow: duration > 2000,
      // Flag para requests muito lentas (>5s)
      critical: duration > 5000,
    });

    // Alert para requests críticos
    if (duration > 5000) {
      logger.error('CRITICAL: Request took longer than 5 seconds', {
        method,
        url: originalUrl,
        duration,
        userId,
        statusCode,
      });
    } else if (duration > 2000) {
      logger.warn('SLOW: Request took longer than 2 seconds', {
        method,
        url: originalUrl,
        duration,
        userId,
        statusCode,
      });
    }
  });

  next();
};