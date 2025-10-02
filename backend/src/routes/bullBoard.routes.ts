/**
 * Bull Board Dashboard Configuration
 *
 * Referências:
 * - tasks.md: Task 4.0.4 - Configurar Bull Board
 * - design.md: Admin Tools - Queue Monitoring
 *
 * Rota: GET /admin/queues
 * Acesso: Apenas ADMIN (protegido via authenticate middleware + role check)
 */

import { Router } from 'express';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { allQueues } from '../queues/queues';
import { authenticate } from '../shared/middlewares/authenticate';
import { logger } from '../shared/utils/logger';

/**
 * Cria e configura o router do Bull Board
 *
 * @returns Express Router configurado com Bull Board
 */
export function createBullBoardRouter(): Router {
  // Configura o adapter do Express para Bull Board
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');

  // Cria Bull Board com todas as queues
  createBullBoard({
    queues: allQueues.map((queue) => new BullAdapter(queue)),
    serverAdapter,
  });

  const router = Router();

  // Middleware de autenticação + verificação de role ADMIN
  router.use(authenticate);
  router.use((req, res, next) => {
    // Verifica se o usuário é ADMIN
    if (req.user?.role !== 'ADMIN') {
      logger.warn('Unauthorized access attempt to Bull Board', {
        userId: req.user?.userId,
        role: req.user?.role,
        ip: req.ip,
      });

      res.status(403).json({
        error: 'FORBIDDEN',
        message: 'Acesso negado. Apenas administradores podem acessar o dashboard de queues.',
      });
      return;
    }

    logger.info('Admin accessing Bull Board', {
      userId: req.user.userId,
    });

    next();
  });

  // Registra as rotas do Bull Board
  router.use('/', serverAdapter.getRouter());

  logger.info('Bull Board router created', {
    basePath: '/admin/queues',
    queues: allQueues.map((q) => q.name),
  });

  return router;
}
