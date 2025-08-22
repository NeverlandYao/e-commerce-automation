import { Hono } from 'hono'

const productRoutes = new Hono()

// 获取产品列表
productRoutes.get('/', async (c) => {
  return c.json({
    message: '产品列表',
    products: []
  })
})

// 获取产品详情
productRoutes.get('/:id', async (c) => {
  const id = c.req.param('id')
  return c.json({
    message: '产品详情',
    product: { id }
  })
})

export { productRoutes }