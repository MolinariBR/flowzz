// src/shared/middlewares/authenticate.ts
// Referência: tasks.md Task 2.1.2, dev-stories.md Dev Story 1.3, design.md Authentication Flow

import type { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { prisma } from '../config/database';

/**
 * Authentication middleware
 * Referência: dev-stories.md - Dev Story 1.3 Middleware, design.md Security
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authorization header is required',
      });
      return;
    }

    if (!authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authorization header must start with Bearer',
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Token is required',
      });
      return;
    }

    // Verify token using AuthService
    const authService = new AuthService(prisma);
    const payload = authService.verifyAccessToken(token);

    // Inject user info into request
    req.user = {
      userId: payload.userId,
      role: payload.role,
    };

    next();
  } catch (error) {
    // Handle JWT specific errors
    if (error instanceof Error) {
      if (error.name === 'TokenExpiredError') {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Token has expired',
        });
        return;
      }

      if (error.name === 'JsonWebTokenError') {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid token',
        });
        return;
      }
    }

    // Generic error
    res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid token',
    });
  }
};

/**
 * Authorization middleware factory for role-based access control
 * Referência: design.md Authorization (RBAC)
 */
export const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient permissions',
      });
      return;
    }

    next();
  };
};

/**
 * Admin-only authorization middleware (ADMIN or SUPER_ADMIN)
 */
export const requireAdmin = authorize(['ADMIN', 'SUPER_ADMIN']);

/**
 * Super Admin-only authorization middleware
 */
export const requireSuperAdmin = authorize(['SUPER_ADMIN']);

/**
 * User or Admin authorization middleware
 */
export const requireAuth = authorize(['USER', 'ADMIN', 'SUPER_ADMIN']);