import { Hono } from 'hono'

const taskRoutes = new Hono()

// 获取任务列表
taskRoutes.get('/', async (c) => {
  return c.json({
    message: '任务列表',
    tasks: []
  })
})

// 获取任务详情
taskRoutes.get('/:id', async (c) => {
  const id = c.req.param('id')
  return c.json({
    message: '任务详情',
    task: { id }
  })
})

export { taskRoutes }