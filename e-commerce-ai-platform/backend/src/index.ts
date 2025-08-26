import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { serve } from '@hono/node-server'
import { config } from './lib/config'
import { errorHandler } from './middleware/error'
import { 
  corsMiddleware, 
  securityHeadersMiddleware, 
  requestLoggerMiddleware,
  rateLimit 
} from './middleware/auth'
import { authRoutes } from './routes/auth'
import { userRoutes } from './routes/users'
import { productRoutes } from './routes/products'
import { taskRoutes } from './routes/tasks'
import { systemRoutes } from './routes/system'
import { analyticsRoutes } from './routes/analytics'
import { crawlerRoutes } from './routes/crawler'
import { scriptRoutes } from './routes/scripts'
import { publisherRoutes } from './routes/publisher'
import { aiRoutes } from './routes/ai'
import { proxyRoutes } from './routes/proxy'
import { queueRoutes } from './routes/queue'
import { browserRoutes } from './routes/browser'
import { websocketRoutes } from './routes/websocket'

const app = new Hono()

// 全局中间件
app.use('*', requestLoggerMiddleware)
app.use('*', corsMiddleware)
app.use('*', securityHeadersMiddleware)
app.use('*', prettyJSON())
app.use('/api/*', rateLimit(1000, 15 * 60 * 1000)) // 每15分钟1000次请求
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
app.route('/api/analytics', analyticsRoutes)
app.route('/api/crawler', crawlerRoutes)
app.route('/api/scripts', scriptRoutes)
app.route('/api/publisher', publisherRoutes)
app.route('/api/ai', aiRoutes)
app.route('/api/browser', browserRoutes)
app.route('/api/proxy', proxyRoutes)
app.route('/api/queue', queueRoutes)
app.route('/api/websocket', websocketRoutes)

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