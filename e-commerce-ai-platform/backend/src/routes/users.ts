import { Hono } from 'hono'

const userRoutes = new Hono()

// 获取用户列表
userRoutes.get('/', async (c) => {
  return c.json({
    message: '用户列表',
    users: []
  })
})

// 获取用户详情
userRoutes.get('/:id', async (c) => {
  const id = c.req.param('id')
  return c.json({
    message: '用户详情',
    user: { id }
  })
})

export { userRoutes }