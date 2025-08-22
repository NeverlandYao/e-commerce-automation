import { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { config } from '../lib/config'

export interface AppError extends Error {
  statusCode?: number
  code?: string
  details?: any
}

export const errorHandler = (err: Error, c: Context) => {
  console.error('Error:', err)

  // HTTP异常处理
  if (err instanceof HTTPException) {
    return c.json(
      {
        error: err.message,
        status: err.status,
        timestamp: new Date().toISOString()
      },
      err.status
    )
  }

  // 自定义应用错误
  if (err instanceof Error && 'statusCode' in err) {
    const appError = err as AppError
    const statusCode = appError.statusCode || 500
    return c.json(
      {
        error: appError.message,
        code: appError.code,
        details: config.nodeEnv === 'development' ? appError.details : undefined,
        timestamp: new Date().toISOString()
      },
      statusCode as any
    )
  }

  // 默认服务器错误
  return c.json(
    {
      error: config.nodeEnv === 'development' ? err.message : 'Internal Server Error',
      timestamp: new Date().toISOString()
    },
    500
  )
}

// 创建自定义错误的辅助函数
export const createError = (message: string, statusCode: number = 500, code?: string, details?: any): AppError => {
  const error = new Error(message) as AppError
  error.statusCode = statusCode
  error.code = code
  error.details = details
  return error
}

// 常用错误创建函数
export const createValidationError = (message: string, details?: any) => 
  createError(message, 400, 'VALIDATION_ERROR', details)

export const createAuthError = (message: string = 'Unauthorized') => 
  createError(message, 401, 'AUTH_ERROR')

export const createForbiddenError = (message: string = 'Forbidden') => 
  createError(message, 403, 'FORBIDDEN_ERROR')

export const createNotFoundError = (message: string = 'Not Found') => 
  createError(message, 404, 'NOT_FOUND_ERROR')

export const createConflictError = (message: string, details?: any) => 
  createError(message, 409, 'CONFLICT_ERROR', details)