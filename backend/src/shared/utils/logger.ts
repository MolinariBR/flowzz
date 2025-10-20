// src/shared/utils/logger.ts
// Referência: design.md §Logging, dev-stories.md - Monitoring

import * as winston from 'winston'
import { env } from '../config/env'

// Custom log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  performance: 4,
}

// Custom colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue',
  performance: 'cyan',
}

winston.addColors(colors)

// Create logger instance
export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  levels,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'flowzz-api',
    environment: env.NODE_ENV,
  },
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.simple(),
        winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
          const metaString = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
          return `${timestamp} [${service}] ${level}: ${message} ${metaString}`
        })
      ),
    }),

    // Write error logs to file
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),

    // Write all logs to file
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
})

// If we're not in production, log to the console with simple format
if (env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    })
  )
}

// Utility functions for structured logging
export const logRequest = (req: {
  method: string
  url: string
  ip: string
  userAgent?: string
}): void => {
  logger.info('HTTP Request', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.userAgent,
  })
}

export const logResponse = (res: { statusCode: number; responseTime?: number }): void => {
  logger.info('HTTP Response', {
    statusCode: res.statusCode,
    responseTime: res.responseTime,
  })
}

export const logError = (error: Error, context?: Record<string, unknown>): void => {
  logger.error('Application Error', {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    context,
  })
}

export const logExternalApiCall = (
  service: string,
  endpoint: string,
  method: string,
  duration: number,
  statusCode?: number
): void => {
  logger.info('External API Call', {
    service,
    endpoint,
    method,
    duration,
    statusCode,
  })
}

export default logger
