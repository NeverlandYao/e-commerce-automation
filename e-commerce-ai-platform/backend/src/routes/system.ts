import { Hono } from 'hono'

const systemRoutes = new Hono()

// 获取系统状态
systemRoutes.get('/status', async (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: '1.0.0'
  })
})

// 获取系统信息
systemRoutes.get('/info', async (c) => {
  return c.json({
    name: 'E-commerce AI Platform Backend',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version
  })
})

export { systemRoutes }