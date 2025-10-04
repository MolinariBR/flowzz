import { Request, Response, NextFunction } from 'express'
import '../types/auth' // Import para extender Request com user

/**
 * Middleware para autorização baseada em roles (RBAC)
 * Verifica se o usuário tem uma das roles permitidas
 *
 * @param allowedRoles - Array de roles permitidas
 * @returns Middleware function
 *
 * @example
 * router.get('/admin/users', authorize([UserRole.ADMIN, UserRole.SUPER_ADMIN]), getUsersController)
 */
export const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Verificar se usuário está autenticado
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        })
        return
      }

      // Verificar se role do usuário está nas roles permitidas
      if (!allowedRoles.includes(req.user.role)) {
        res.status(403).json({
          success: false,
          error: 'Insufficient permissions',
          required: allowedRoles,
          current: req.user.role
        })
        return
      }

      // Usuário autorizado, continuar
      next()
    } catch (error) {
      console.error('Authorization middleware error:', error)
      res.status(500).json({
        success: false,
        error: 'Authorization check failed'
      })
    }
  }
}

/**
 * Middleware específico para admins (ADMIN ou SUPER_ADMIN)
 */
export const requireAdmin = authorize(['ADMIN', 'SUPER_ADMIN'])

/**
 * Middleware específico para super admins apenas
 */
export const requireSuperAdmin = authorize(['SUPER_ADMIN'])

/**
 * Middleware para usuários regulares (não suspensos)
 */
export const requireActiveUser = (req: Request, res: Response, next: NextFunction): void => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      })
      return
    }

    // Verificar se usuário não está suspenso
    if (req.user.role === 'SUSPENDED') {
      res.status(403).json({
        success: false,
        error: 'Account suspended'
      })
      return
    }

    next()
  } catch (error) {
    console.error('Active user check error:', error)
    res.status(500).json({
      success: false,
      error: 'User status check failed'
    })
  }
}