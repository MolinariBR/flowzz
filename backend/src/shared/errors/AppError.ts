// src/shared/errors/AppError.ts
// Referência: design.md §Error Handling, user-stories.md - Error cases

export class AppError extends Error {
  public readonly statusCode: number
  public readonly isOperational: boolean
  public readonly code?: string | undefined
  public readonly details?: Record<string, unknown> | undefined

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    code?: string,
    details?: Record<string, unknown>
  ) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = isOperational
    this.code = code
    this.details = details

    // Maintain proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor)
  }
}

// Common application errors
export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 400, true, 'VALIDATION_ERROR', details)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, true, 'NOT_FOUND')
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, true, 'UNAUTHORIZED')
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, true, 'FORBIDDEN')
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, true, 'CONFLICT')
  }
}

export class TooManyRequestsError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, true, 'TOO_MANY_REQUESTS')
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message?: string) {
    super(
      message || `External service ${service} is unavailable`,
      503,
      true,
      'EXTERNAL_SERVICE_ERROR',
      { service }
    )
  }
}
