# Scripts Service - E-commerce AI Platform

基于Hono框架构建的AI脚本服务，提供智能化的电商功能，包括商品推荐、价格优化、库存预测等AI驱动的业务逻辑。

## 🚀 技术栈

- **Hono**: 轻量级、高性能的Web框架
- **TypeScript**: 类型安全的JavaScript超集
- **OpenAI API**: GPT模型集成
- **FastGPT**: 本地化AI服务
- **Puppeteer**: 网页爬虫和自动化
- **Redis**: 缓存和任务队列
- **PostgreSQL**: 数据存储
- **Winston**: 结构化日志记录
- **tsx**: TypeScript执行器

## 📁 项目结构

```
scripts/
├── src/
│   ├── index.ts           # 应用入口文件
│   ├── routes/            # API路由
│   │   ├── ai.ts         # AI服务路由
│   │   ├── crawler.ts    # 爬虫服务路由
│   │   ├── tasks.ts      # 任务管理路由
│   │   └── index.ts      # 路由汇总
│   ├── services/          # 业务逻辑服务
│   │   ├── ai/           # AI服务
│   │   │   ├── openai.ts # OpenAI集成
│   │   │   ├── fastgpt.ts# FastGPT集成
│   │   │   ├── recommendation.ts # 商品推荐
│   │   │   ├── pricing.ts# 价格优化
│   │   │   └── analysis.ts# 数据分析
│   │   ├── crawler/       # 爬虫服务
│   │   │   ├── product.ts# 商品信息爬取
│   │   │   ├── price.ts  # 价格监控
│   │   │   └── review.ts # 评论采集
│   │   ├── tasks/         # 任务管理
│   │   │   ├── queue.ts  # 任务队列
│   │   │   ├── scheduler.ts # 任务调度
│   │   │   └── worker.ts # 任务执行器
│   │   └── notification/  # 通知服务
│   │       ├── email.ts  # 邮件通知
│   │       └── webhook.ts# Webhook通知
│   ├── models/            # 数据模型
│   │   ├── script.ts     # 脚本模型
│   │   ├── task.ts       # 任务模型
│   │   └── result.ts     # 结果模型
│   ├── lib/               # 工具库
│   │   ├── db.ts         # 数据库连接
│   │   ├── redis.ts      # Redis连接
│   │   ├── browser.ts    # 浏览器管理
│   │   └── validation.ts # 验证工具
│   ├── middleware/        # 中间件
│   │   ├── auth.ts       # 认证中间件
│   │   ├── rate-limit.ts # 限流中间件
│   │   └── logger.ts     # 日志中间件
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
- Redis 7+
- PostgreSQL 15+
- Chrome/Chromium (用于Puppeteer)

### 安装依赖

```bash
cd scripts
pnpm install
```

### 环境配置

```bash
cp .env.example .env
# 编辑 .env 文件，配置AI服务密钥和其他环境变量
```

### 重要环境变量

```bash
# AI服务配置
OPENAI_API_KEY=your-openai-api-key
FASTGPT_API_URL=http://localhost:3000
FASTGPT_API_KEY=your-fastgpt-api-key

# 数据库配置
DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce
REDIS_URL=redis://localhost:6379

# 浏览器配置
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
HEADLESS_BROWSER=true

# 代理配置（可选）
PROXY_URL=http://proxy-server:8080
```

### 开发服务器

```bash
pnpm dev
```

服务器将在 http://localhost:3002 启动

### 构建生产版本

```bash
pnpm build
pnpm start
```

## 🤖 AI服务功能

### 商品推荐

```typescript
// 基于用户行为的商品推荐
POST /ai/recommendations
{
  "userId": "user-123",
  "category": "electronics",
  "limit": 10,
  "context": {
    "recentViews": ["product-1", "product-2"],
    "purchaseHistory": ["product-3"]
  }
}
```

### 价格优化

```typescript
// 智能定价建议
POST /ai/pricing/optimize
{
  "productId": "product-123",
  "currentPrice": 99.99,
  "competitorPrices": [89.99, 109.99, 95.00],
  "salesData": {
    "lastMonth": 150,
    "inventory": 50
  }
}
```

### 内容生成

```typescript
// 商品描述生成
POST /ai/content/generate
{
  "type": "product_description",
  "product": {
    "name": "iPhone 15 Pro",
    "features": ["A17 Pro chip", "Titanium design", "48MP camera"],
    "category": "smartphones"
  },
  "tone": "professional",
  "length": "medium"
}
```

### 情感分析

```typescript
// 评论情感分析
POST /ai/analysis/sentiment
{
  "reviews": [
    "Great product, highly recommended!",
    "Poor quality, waste of money",
    "Average product, nothing special"
  ]
}
```

## 🕷️ 爬虫服务功能

### 商品信息爬取

```typescript
// 爬取竞品信息
POST /crawler/products
{
  "urls": [
    "https://example-store.com/product/123",
    "https://another-store.com/item/456"
  ],
  "fields": ["name", "price", "description", "images", "reviews"]
}
```

### 价格监控

```typescript
// 设置价格监控任务
POST /crawler/price-monitor
{
  "productUrl": "https://competitor.com/product/123",
  "checkInterval": "1h",
  "priceThreshold": 50.00,
  "notifyWebhook": "https://your-api.com/webhook/price-alert"
}
```

### 评论采集

```typescript
// 采集产品评论
POST /crawler/reviews
{
  "productUrl": "https://store.com/product/123",
  "maxPages": 5,
  "minRating": 1,
  "includeImages": true
}
```

## 📋 任务管理

### 任务队列

```typescript
// 创建AI任务
POST /tasks/create
{
  "type": "product_analysis",
  "priority": "high",
  "data": {
    "productId": "product-123",
    "analysisType": "comprehensive"
  },
  "schedule": "2024-01-01T10:00:00Z"
}

// 获取任务状态
GET /tasks/:taskId/status

// 获取任务结果
GET /tasks/:taskId/result
```

### 批量任务

```typescript
// 批量处理商品
POST /tasks/batch
{
  "type": "price_optimization",
  "items": [
    {"productId": "product-1", "priority": "high"},
    {"productId": "product-2", "priority": "medium"},
    {"productId": "product-3", "priority": "low"}
  ],
  "concurrency": 3
}
```

### 定时任务

```typescript
// 设置定时任务
POST /tasks/schedule
{
  "name": "daily_price_check",
  "cron": "0 9 * * *",
  "task": {
    "type": "price_monitor",
    "data": {"category": "electronics"}
  },
  "enabled": true
}
```

## 🔧 服务集成

### OpenAI集成

```typescript
// src/services/ai/openai.ts
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function generateProductDescription(product: Product) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are a professional e-commerce copywriter."
      },
      {
        role: "user",
        content: `Write a compelling product description for: ${product.name}`
      }
    ],
    max_tokens: 500
  })
  
  return completion.choices[0].message.content
}
```

### FastGPT集成

```typescript
// src/services/ai/fastgpt.ts
import axios from 'axios'

const fastgptClient = axios.create({
  baseURL: process.env.FASTGPT_API_URL,
  headers: {
    'Authorization': `Bearer ${process.env.FASTGPT_API_KEY}`
  }
})

export async function analyzeCustomerQuery(query: string) {
  const response = await fastgptClient.post('/chat/completions', {
    model: 'gpt-3.5-turbo',
    messages: [{
      role: 'user',
      content: query
    }]
  })
  
  return response.data.choices[0].message.content
}
```

### Puppeteer爬虫

```typescript
// src/services/crawler/product.ts
import puppeteer from 'puppeteer'

export async function scrapeProductInfo(url: string) {
  const browser = await puppeteer.launch({
    headless: process.env.HEADLESS_BROWSER === 'true',
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH
  })
  
  const page = await browser.newPage()
  
  try {
    await page.goto(url, { waitUntil: 'networkidle2' })
    
    const productData = await page.evaluate(() => {
      return {
        name: document.querySelector('h1')?.textContent?.trim(),
        price: document.querySelector('.price')?.textContent?.trim(),
        description: document.querySelector('.description')?.textContent?.trim(),
        images: Array.from(document.querySelectorAll('img')).map(img => img.src)
      }
    })
    
    return productData
  } finally {
    await browser.close()
  }
}
```

## 📊 监控和日志

### 性能监控

```typescript
// 任务执行时间监控
GET /metrics/tasks
{
  "averageExecutionTime": 2.5,
  "successRate": 0.95,
  "queueLength": 12,
  "activeWorkers": 3
}

// AI服务调用统计
GET /metrics/ai
{
  "openaiCalls": 1250,
  "fastgptCalls": 890,
  "averageResponseTime": 1.8,
  "errorRate": 0.02
}
```

### 日志记录

```typescript
// 结构化日志
logger.info('Task started', {
  taskId: 'task-123',
  type: 'product_analysis',
  userId: 'user-456',
  timestamp: new Date().toISOString()
})

logger.error('AI service error', {
  service: 'openai',
  error: error.message,
  taskId: 'task-123',
  retryCount: 2
})
```

## 🧪 测试

### 单元测试

```bash
pnpm test
pnpm test:watch
pnpm test:coverage
```

### AI服务测试

```bash
# 测试OpenAI集成
pnpm test:ai:openai

# 测试FastGPT集成
pnpm test:ai:fastgpt

# 测试推荐算法
pnpm test:recommendations
```

### 爬虫测试

```bash
# 测试爬虫功能
pnpm test:crawler

# 测试特定网站
pnpm test:crawler:site -- --url="https://example.com"
```

## 🚀 部署

### Docker部署

```bash
# 构建镜像
docker build -t ecommerce-scripts .

# 运行容器
docker run -p 3002:3002 --env-file .env ecommerce-scripts
```

### 环境变量检查

```bash
# 验证AI服务连接
GET /health/ai
{
  "openai": "connected",
  "fastgpt": "connected",
  "status": "healthy"
}

# 验证爬虫环境
GET /health/crawler
{
  "browser": "available",
  "proxy": "connected",
  "status": "healthy"
}
```

## 🔐 安全考虑

### API密钥管理

```typescript
// 密钥轮换
export class ApiKeyManager {
  private keys: Map<string, string> = new Map()
  
  async rotateKey(service: string) {
    const newKey = await this.generateNewKey(service)
    this.keys.set(service, newKey)
    await this.updateEnvironment(service, newKey)
  }
}
```

### 请求限流

```typescript
// AI服务限流
app.use('/ai/*', rateLimiter({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 最多100次请求
  message: 'Too many AI requests'
}))

// 爬虫限流
app.use('/crawler/*', rateLimiter({
  windowMs: 60 * 60 * 1000, // 1小时
  max: 50, // 最多50次请求
  message: 'Too many crawler requests'
}))
```

## 📚 学习资源

- [OpenAI API 文档](https://platform.openai.com/docs)
- [FastGPT 文档](https://doc.fastgpt.in/)
- [Puppeteer 文档](https://pptr.dev/)
- [Hono 文档](https://hono.dev)
- [Redis 任务队列](https://redis.io/docs/manual/patterns/distributed-locks/)

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开 Pull Request

---

**AI-Powered E-commerce! 🤖🛒**