# Backend - E-commerce AI Platform

基于Hono框架构建的高性能后端API服务，提供电商平台的核心业务逻辑。

## 🚀 技术栈

- **Hono**: 轻量级、高性能的Web框架
- **TypeScript**: 类型安全的JavaScript超集
- **PostgreSQL**: 关系型数据库
- **Redis**: 内存数据库和缓存
- **JWT**: JSON Web Token认证
- **Zod**: 数据验证和类型推断
- **Winston**: 结构化日志记录
- **tsx**: TypeScript执行器

## 📁 项目结构

```
backend/
├── src/
│   ├── index.ts           # 应用入口文件
│   ├── routes/            # API路由
│   │   ├── auth.ts       # 认证路由
│   │   ├── users.ts      # 用户管理
│   │   ├── products.ts   # 产品管理
│   │   ├── orders.ts     # 订单管理
│   │   └── index.ts      # 路由汇总
│   ├── middleware/        # 中间件
│   │   ├── auth.ts       # 认证中间件
│   │   ├── cors.ts       # CORS中间件
│   │   ├── logger.ts     # 日志中间件
│   │   └── error.ts      # 错误处理
│   ├── services/          # 业务逻辑服务
│   │   ├── auth.ts       # 认证服务
│   │   ├── user.ts       # 用户服务
│   │   ├── product.ts    # 产品服务
│   │   └── order.ts      # 订单服务
│   ├── models/            # 数据模型
│   │   ├── user.ts       # 用户模型
│   │   ├── product.ts    # 产品模型
│   │   └── order.ts      # 订单模型
│   ├── lib/               # 工具库
│   │   ├── db.ts         # 数据库连接
│   │   ├── redis.ts      # Redis连接
│   │   ├── jwt.ts        # JWT工具
│   │   └── validation.ts # 验证工具
│   └── types/             # TypeScript类型定义
├── .env.example           # 环境变量示例
├── Dockerfile             # Docker配置
├── package.json           # 依赖配置
└── tsconfig.json          # TypeScript配置
```

## 🛠️ 开发指南

### 环境要求

- Node.js 18+
- pnpm 8+
- PostgreSQL 15+
- Redis 7+

### 安装依赖

```bash
cd backend
pnpm install
```

### 环境配置

```bash
cp .env.example .env
# 编辑 .env 文件，配置数据库和其他环境变量
```

### 数据库设置

```bash
# 启动PostgreSQL和Redis（使用Docker）
docker-compose up postgres redis -d

# 运行数据库迁移
pnpm db:migrate

# 填充示例数据
pnpm db:seed
```

### 开发服务器

```bash
pnpm dev
```

服务器将在 http://localhost:3001 启动

### 构建生产版本

```bash
pnpm build
pnpm start
```

### 代码检查

```bash
pnpm lint
pnpm lint:fix
```

## 🌐 API端点

### 认证相关

```
POST   /auth/register     # 用户注册
POST   /auth/login        # 用户登录
POST   /auth/refresh      # 刷新Token
POST   /auth/logout       # 用户登出
GET    /auth/profile      # 获取用户信息
```

### 用户管理

```
GET    /users             # 获取用户列表（管理员）
GET    /users/:id         # 获取用户详情
PUT    /users/:id         # 更新用户信息
DELETE /users/:id         # 删除用户（管理员）
```

### 产品管理

```
GET    /products          # 获取产品列表
GET    /products/:id      # 获取产品详情
POST   /products          # 创建产品（管理员）
PUT    /products/:id      # 更新产品（管理员）
DELETE /products/:id      # 删除产品（管理员）
GET    /products/search   # 搜索产品
```

### 订单管理

```
GET    /orders            # 获取订单列表
GET    /orders/:id        # 获取订单详情
POST   /orders            # 创建订单
PUT    /orders/:id        # 更新订单状态
DELETE /orders/:id        # 取消订单
```

### 购物车

```
GET    /cart              # 获取购物车
POST   /cart/items        # 添加商品到购物车
PUT    /cart/items/:id    # 更新购物车商品
DELETE /cart/items/:id    # 从购物车移除商品
DELETE /cart              # 清空购物车
```

### 健康检查

```
GET    /health            # 服务健康检查
GET    /health/db         # 数据库连接检查
GET    /health/redis      # Redis连接检查
```

## 🔐 认证和授权

### JWT认证

```typescript
// 认证中间件示例
import { jwt } from 'hono/jwt'

app.use('/api/*', jwt({
  secret: process.env.JWT_SECRET!,
  cookie: 'token'
}))
```

### 角色权限

```typescript
// 权限检查中间件
export const requireRole = (roles: string[]) => {
  return async (c: Context, next: Next) => {
    const payload = c.get('jwtPayload')
    if (!roles.includes(payload.role)) {
      return c.json({ error: 'Insufficient permissions' }, 403)
    }
    await next()
  }
}

// 使用示例
app.get('/admin/users', requireRole(['admin']), getUsersHandler)
```

## 🗄️ 数据库

### 连接配置

```typescript
// src/lib/db.ts
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

export default pool
```

### 查询示例

```typescript
// 获取用户
export async function getUserById(id: string) {
  const result = await pool.query(
    'SELECT id, email, first_name, last_name, role FROM users WHERE id = $1',
    [id]
  )
  return result.rows[0]
}

// 创建产品
export async function createProduct(product: CreateProductData) {
  const result = await pool.query(
    `INSERT INTO products (name, description, price, category_id) 
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [product.name, product.description, product.price, product.categoryId]
  )
  return result.rows[0]
}
```

## 🔄 缓存策略

### Redis缓存

```typescript
// src/lib/redis.ts
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!)

// 缓存产品数据
export async function cacheProduct(productId: string, product: Product) {
  await redis.setex(`product:${productId}`, 3600, JSON.stringify(product))
}

// 获取缓存的产品
export async function getCachedProduct(productId: string): Promise<Product | null> {
  const cached = await redis.get(`product:${productId}`)
  return cached ? JSON.parse(cached) : null
}
```

## 📝 数据验证

### Zod验证

```typescript
import { z } from 'zod'

// 用户注册验证
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1)
})

// 产品创建验证
const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  categoryId: z.string().uuid()
})

// 验证中间件
export const validate = (schema: z.ZodSchema) => {
  return async (c: Context, next: Next) => {
    try {
      const body = await c.req.json()
      const validatedData = schema.parse(body)
      c.set('validatedData', validatedData)
      await next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        return c.json({ error: 'Validation failed', details: error.errors }, 400)
      }
      throw error
    }
  }
}
```

## 📊 日志记录

### Winston配置

```typescript
// src/lib/logger.ts
import winston from 'winston'

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
})

export default logger
```

## 🚨 错误处理

### 全局错误处理

```typescript
// src/middleware/error.ts
export const errorHandler = async (err: Error, c: Context) => {
  logger.error('Unhandled error:', err)
  
  if (err instanceof ValidationError) {
    return c.json({ error: 'Validation failed', details: err.details }, 400)
  }
  
  if (err instanceof AuthenticationError) {
    return c.json({ error: 'Authentication required' }, 401)
  }
  
  if (err instanceof AuthorizationError) {
    return c.json({ error: 'Insufficient permissions' }, 403)
  }
  
  return c.json({ error: 'Internal server error' }, 500)
}
```

## 🧪 测试

### 单元测试

```bash
pnpm test
pnpm test:watch
pnpm test:coverage
```

### 集成测试

```bash
pnpm test:integration
```

### API测试

```bash
# 使用curl测试API
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 📦 部署

### Docker部署

```bash
# 构建镜像
docker build -t ecommerce-backend .

# 运行容器
docker run -p 3001:3001 --env-file .env ecommerce-backend
```

### 环境变量

```bash
# 生产环境必需的环境变量
DATABASE_URL=postgresql://user:password@host:5432/database
REDIS_URL=redis://host:6379
JWT_SECRET=your-super-secret-key
NODE_ENV=production
```

## 🔧 开发工具

### 数据库工具

```bash
# 连接到PostgreSQL
psql $DATABASE_URL

# 查看表结构
\d+ users
\d+ products
\d+ orders
```

### Redis工具

```bash
# 连接到Redis
redis-cli -u $REDIS_URL

# 查看缓存键
KEYS *
GET product:123
```

## 📚 学习资源

- [Hono 文档](https://hono.dev)
- [PostgreSQL 文档](https://www.postgresql.org/docs/)
- [Redis 文档](https://redis.io/documentation)
- [Zod 文档](https://zod.dev)
- [Winston 文档](https://github.com/winstonjs/winston)

---

**Happy Coding! 🎉**