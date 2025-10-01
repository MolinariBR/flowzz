// src/routes/protected.ts
// Exemplo de uso dos middlewares de validação de subscription
// Referência: tasks.md Task 2.2.3, design.md Authorization

import { Router } from 'express';
import { authenticate } from '../shared/middlewares/authenticate';
import { validateSubscription, validateSubscriptionWithWarning } from '../shared/middlewares/validateSubscription';

const router = Router();

/**
 * Rotas que requerem subscription ativa ou trial válido
 * Referência: plan.md Jornada 1, user-stories.md Story 1.1
 */

// Exemplo: Dashboard básico (disponível durante trial)
router.get('/dashboard', authenticate, validateSubscriptionWithWarning, (req, res) => {
  res.json({ 
    message: 'Dashboard data',
    user_id: req.user?.userId,
    note: 'Trial users have access to this feature'
  });
});

// Exemplo: Funcionalidade premium (requer subscription ativa)
router.get('/analytics', authenticate, validateSubscription, (req, res) => {
  res.json({ 
    message: 'Advanced analytics data',
    user_id: req.user?.userId,
    note: 'This feature requires active subscription'
  });
});

// Exemplo: Relatórios (requer subscription ativa)
router.get('/reports', authenticate, validateSubscription, (req, res) => {
  res.json({ 
    message: 'Reports data',
    user_id: req.user?.userId,
    note: 'This feature requires active subscription'
  });
});

export { router as protectedRoutes };