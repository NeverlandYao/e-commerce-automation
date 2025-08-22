import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import { logger } from 'hono/logger'
import { serve } from '@hono/node-server'
import { config } from './lib/config'
import { errorHandler } from './middleware/error'
import { authRoutes } from './routes/auth'
import { userRoutes } from './routes/users'
import { productRoutes } from './routes/products'
import { taskRoutes } from './routes/tasks'
import { systemRoutes } from './routes/system'

const app = new Hono()

// 全局中间件
app.use('*', logger())
app.use('*', secureHeaders())
app.use('*', cors({
  origin: config.cors.origins,
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}))

// 错误处理中间件
app.onError(errorHandler)

// 健康检查
app.get('/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// API 路由
app.route('/api/auth', authRoutes)
app.route('/api/users', userRoutes)
app.route('/api/products', productRoutes)
app.route('/api/tasks', taskRoutes)
app.route('/api/system', systemRoutes)

// 404 处理
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404)
})

const port = config.port
console.log(`🚀 Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})

export default app