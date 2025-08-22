import { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';

// Custom error types
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
export const errorHandler = async (err: Error, c: Context) => {
  console.error('Error:', err);

  // Handle HTTPException from Hono
  if (err instanceof HTTPException) {
    return c.json(
      {
        success: false,
        error: {
          message: err.message,
          status: err.status,
        },
      },
      err.status as any
    );
  }

  // Handle custom AppError
  if (err instanceof AppError) {
    return c.json(
      {
        success: false,
        error: {
          message: err.message,
          status: err.statusCode,
        },
      },
      err.statusCode as any
    );
  }

  // Handle unknown errors
  return c.json(
    {
      success: false,
      error: {
        message: 'Internal Server Error',
        status: 500,
      },
    },
    500
  );
};

// Helper functions for common errors
export const createValidationError = (message: string) => {
  return new AppError(message, 400);
};

export const createAuthenticationError = (message = 'Authentication required') => {
  return new AppError(message, 401);
};

export const createForbiddenError = (message = 'Access forbidden') => {
  return new AppError(message, 403);
};

export const createNotFoundError = (message = 'Resource not found') => {
  return new AppError(message, 404);
};

export const createConflictError = (message = 'Resource conflict') => {
  return new AppError(message, 409);
};

export const createRateLimitError = (message = 'Too many requests') => {
  return new AppError(message, 429);
};