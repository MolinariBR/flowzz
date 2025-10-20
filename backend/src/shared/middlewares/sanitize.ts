// src/shared/middlewares/sanitize.ts
// Referência: tasks.md Task 12.3.3, design.md - Security - XSS Prevention

import type { NextFunction, Request, Response } from 'express'
import sanitizeHtml from 'sanitize-html'
import xss from 'xss'

/**
 * XSS sanitization middleware
 * Sanitizes all string inputs in req.body, req.query, and req.params
 * Referência: design.md Security - XSS Prevention
 */
export const sanitizeInput = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body)
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query)
    }

    // Sanitize URL parameters
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params)
    }

    next()
  } catch (error) {
    next(error)
  }
}

/**
 * Recursively sanitize all string values in an object
 */
function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item))
  }

  if (typeof obj === 'object') {
    const sanitized: any = {}
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value)
    }
    return sanitized
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj)
  }

  return obj
}

/**
 * Sanitize a single string value
 * Uses xss library for basic XSS protection
 */
function sanitizeString(str: string): string {
  // Basic XSS sanitization with xss library
  return xss(str, {
    whiteList: {}, // No HTML tags allowed by default
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'style'],
  })
}

/**
 * Sanitize HTML content - allows safe HTML tags
 * Used for rich text fields like descriptions, notes, etc.
 * Referência: tasks.md Task 12.3.3
 */
export const sanitizeHtmlContent = (html: string): string => {
  return sanitizeHtml(html, {
    allowedTags: [
      'p',
      'br',
      'strong',
      'em',
      'u',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'ul',
      'ol',
      'li',
      'a',
      'blockquote',
    ],
    allowedAttributes: {
      a: ['href', 'title', 'target'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    disallowedTagsMode: 'discard',
  })
}

/**
 * Middleware for rich text fields
 * Allows safe HTML tags in specific fields
 */
export const sanitizeRichText = (fields: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (req.body && typeof req.body === 'object') {
        for (const field of fields) {
          if (req.body[field] && typeof req.body[field] === 'string') {
            req.body[field] = sanitizeHtmlContent(req.body[field])
          }
        }
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}

/**
 * Escape HTML entities for output
 * Use when displaying user input in HTML context
 */
export const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Strip all HTML tags from a string
 * Use for plain text fields
 */
export const stripHtml = (html: string): string => {
  return sanitizeHtml(html, {
    allowedTags: [],
    allowedAttributes: {},
  })
}

/**
 * Sanitize SQL inputs (additional layer, Prisma already protects against SQL injection)
 * Removes common SQL injection patterns
 */
export const sanitizeSqlInput = (input: string): string => {
  // Remove common SQL keywords and patterns
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
    /(--|\*|;|\/\*|\*\/)/g,
    /(\bOR\b.*=.*)/gi,
    /(\bAND\b.*=.*)/gi,
  ]

  let sanitized = input
  for (const pattern of sqlPatterns) {
    sanitized = sanitized.replace(pattern, '')
  }

  return sanitized.trim()
}

/**
 * Validate and sanitize file paths
 * Prevents directory traversal attacks
 */
export const sanitizeFilePath = (path: string): string => {
  // Remove directory traversal patterns
  return path.replace(/\.\./g, '').replace(/[/\\]/g, '')
}

/**
 * Middleware to prevent NoSQL injection (for future MongoDB usage)
 */
export const preventNoSqlInjection = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const checkObject = (obj: any): boolean => {
      if (obj && typeof obj === 'object') {
        for (const key in obj) {
          // Block MongoDB operators
          if (key.startsWith('$')) {
            return false
          }
          if (!checkObject(obj[key])) {
            return false
          }
        }
      }
      return true
    }

    if (req.body && !checkObject(req.body)) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid characters in request',
      })
      return
    }

    if (req.query && !checkObject(req.query)) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid characters in query parameters',
      })
      return
    }

    next()
  } catch (error) {
    next(error)
  }
}
