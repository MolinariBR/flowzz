// src/routes/auth.ts
// Referência: tasks.md Task 2.1.3, openapi.yaml Auth endpoints

import { Router } from 'express'
import { AuthController } from '../controllers/AuthController'
import { authenticate } from '../shared/middlewares/authenticate'
import { loginRateLimiter, registerRateLimiter } from '../shared/middlewares/rateLimiter'

const router = Router()
const authController = new AuthController()

/**
 * Auth routes
 * Referência: openapi.yaml Auth paths, dev-stories.md Dev Story 1.3
 */

// POST /auth/register - Register new user (rate limited: 3/hour)
router.post('/register', registerRateLimiter, (req, res) => authController.register(req, res))

// POST /auth/login - Login user (rate limited: 5/15min)
router.post('/login', loginRateLimiter, (req, res) => authController.login(req, res))

// POST /auth/refresh - Refresh access token
router.post('/refresh', (req, res) => authController.refresh(req, res))

// POST /auth/logout - Logout user
router.post('/logout', (req, res) => authController.logout(req, res))

// GET /auth/me - Get current user data (protected)
router.get('/me', authenticate, (req, res) => authController.me(req, res))

// GET /auth/trial-status - Get trial status (protected)
router.get('/trial-status', authenticate, (req, res) => authController.getTrialStatus(req, res))

// GET /auth/subscription - Get subscription info (protected)
router.get('/subscription', authenticate, (req, res) =>
  authController.getSubscriptionInfo(req, res)
)

// GET /auth/profile - Get current user profile (protected)
router.get('/profile', authenticate, (req, res) => authController.getProfile(req, res))

// PUT /auth/profile - Update current user profile (protected)
router.put('/profile', authenticate, (req, res) => authController.updateProfile(req, res))

// GET /auth/system-settings - Get system settings (protected)
router.get('/system-settings', authenticate, (req, res) =>
  authController.getSystemSettings(req, res)
)

// PUT /auth/system-settings - Update system settings (protected)
router.put('/system-settings', authenticate, (req, res) =>
  authController.updateSystemSettings(req, res)
)

// PUT /auth/security - Change password (protected)
router.put('/security', authenticate, (req, res) => authController.changePassword(req, res))

// GET /auth/sessions - Get active sessions (protected)
router.get('/sessions', authenticate, (req, res) => authController.getSessions(req, res))

// DELETE /auth/sessions/:id - Revoke session (protected)
router.delete('/sessions/:id', authenticate, (req, res) => authController.revokeSession(req, res))

export { router as authRoutes }
