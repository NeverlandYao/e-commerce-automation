# 电商AI自动化平台 - API接口设计文档

## 📋 概述

本文档详细描述了电商AI自动化平台各微服务间的API接口设计，基于Docker容器化微服务架构，实现前端服务、后端服务和脚本服务之间的高效通信。

## 🏗️ 架构概览

系统采用三层微服务架构：
- **前端服务层**: Next.js + TypeScript + shadcn/ui
- **后端服务层**: Hono + Node.js + TypeScript  
- **脚本服务层**: Hono + Crawlee + Playwright + 有头浏览器

## 📡 API接口设计

### 1. 前端 ↔ 后端服务 API

#### 1.1 任务管理 API (`/api/tasks`)

**任务CRUD操作**
```http
GET    /api/tasks                    # 获取任务列表
POST   /api/tasks                    # 创建新任务
GET    /api/tasks/:id                # 获取任务详情
PUT    /api/tasks/:id                # 更新任务
DELETE /api/tasks/:id                # 删除任务
POST   /api/tasks/:id/start          # 启动任务
POST   /api/tasks/:id/stop           # 停止任务
POST   /api/tasks/:id/restart        # 重启任务
```

**任务状态和监控**
```http
GET    /api/tasks/:id/status         # 获取任务状态
GET    /api/tasks/:id/logs           # 获取任务日志
GET    /api/tasks/:id/progress       # 获取任务进度
GET    /api/tasks/statistics         # 获取任务统计
```

**请求/响应示例**
```typescript
// POST /api/tasks - 创建任务
interface CreateTaskRequest {
  name: string
  type: 'crawler' | 'publisher' | 'analyzer'
  config: {
    platform: string
    target: string
    options: Record<string, any>
  }
  schedule?: {
    type: 'once' | 'recurring'
    cron?: string
    startTime?: string
  }
}

interface TaskResponse {
  id: string
  name: string
  type: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  config: Record<string, any>
  createdAt: string
  updatedAt: string
  progress?: {
    current: number
    total: number
    percentage: number
  }
}
```

#### 1.2 商品管理 API (`/api/products`)

**商品数据管理**
```http
GET    /api/products                 # 获取商品列表
POST   /api/products                 # 创建商品
GET    /api/products/:id             # 获取商品详情
PUT    /api/products/:id             # 更新商品
DELETE /api/products/:id             # 删除商品
```

**商品分析和处理**
```http
POST   /api/products/analyze         # 批量分析商品
POST   /api/products/import          # 导入商品数据
GET    /api/products/export          # 导出商品数据
POST   /api/products/:id/publish     # 发布商品到平台
```

**请求/响应示例**
```typescript
// GET /api/products - 获取商品列表
interface ProductListRequest {
  page?: number
  limit?: number
  category?: string
  status?: 'active' | 'inactive' | 'draft'
  search?: string
  sortBy?: 'createdAt' | 'updatedAt' | 'price' | 'name'
  sortOrder?: 'asc' | 'desc'
}

interface Product {
  id: string
  title: string
  description: string
  price: number
  originalPrice?: number
  currency: string
  category: string
  tags: string[]
  images: string[]
  variants?: ProductVariant[]
  source: {
    platform: string
    url: string
    productId: string
  }
  analysis?: {
    trend: 'rising' | 'stable' | 'falling'
    competition: 'low' | 'medium' | 'high'
    profitability: number
    recommendation: string
  }
  status: 'active' | 'inactive' | 'draft'
  createdAt: string
  updatedAt: string
}
```

#### 1.3 脚本管理 API (`/api/scripts`)

**脚本配置管理**
```http
GET    /api/scripts                  # 获取脚本列表
POST   /api/scripts                  # 创建脚本配置
GET    /api/scripts/:id              # 获取脚本详情
PUT    /api/scripts/:id              # 更新脚本配置
DELETE /api/scripts/:id              # 删除脚本
```

**脚本执行和测试**
```http
POST   /api/scripts/:id/test         # 测试脚本
POST   /api/scripts/:id/deploy       # 部署脚本
GET    /api/scripts/:id/logs         # 获取脚本日志
```

#### 1.4 数据分析 API (`/api/analytics`)

**数据分析和报告**
```http
GET    /api/analytics/dashboard      # 仪表板数据
GET    /api/analytics/trends         # 趋势分析
GET    /api/analytics/performance    # 性能分析
GET    /api/analytics/reports        # 生成报告
POST   /api/analytics/custom         # 自定义分析
```

**请求/响应示例**
```typescript
// GET /api/analytics/dashboard - 仪表板数据
interface DashboardData {
  summary: {
    totalTasks: number
    activeTasks: number
    completedTasks: number
    failedTasks: number
    totalProducts: number
    publishedProducts: number
  }
  charts: {
    taskTrends: ChartData[]
    productTrends: ChartData[]
    performanceMetrics: ChartData[]
  }
  recentActivity: Activity[]
}
```

#### 1.5 系统监控 API (`/api/system`)

**系统状态监控**
```http
GET    /api/system/health            # 系统健康检查
GET    /api/system/status            # 服务状态
GET    /api/system/metrics           # 系统指标
GET    /api/system/resources         # 资源使用情况
GET    /api/system/services          # 服务列表和状态
```

### 2. 后端服务 ↔ 脚本服务 API

#### 2.1 爬虫服务 API (`/api/crawler`)

**爬虫任务管理**
```http
POST   /api/crawler/tasks            # 创建爬虫任务
GET    /api/crawler/tasks            # 获取任务列表
GET    /api/crawler/tasks/:id        # 获取任务详情
PUT    /api/crawler/tasks/:id        # 更新任务配置
DELETE /api/crawler/tasks/:id        # 取消/删除任务
```

**爬虫任务控制**
```http
POST   /api/crawler/tasks/:id/start  # 启动爬虫任务
POST   /api/crawler/tasks/:id/pause  # 暂停爬虫任务
POST   /api/crawler/tasks/:id/resume # 恢复爬虫任务
POST   /api/crawler/tasks/:id/stop   # 停止爬虫任务
```

**爬虫数据和状态**
```http
GET    /api/crawler/tasks/:id/data   # 获取爬取数据
GET    /api/crawler/tasks/:id/status # 获取任务状态
GET    /api/crawler/tasks/:id/logs   # 获取任务日志
GET    /api/crawler/tasks/:id/stats  # 获取任务统计
```

**平台特定接口**
```http
POST   /api/crawler/taobao/search    # 淘宝搜索爬取
POST   /api/crawler/taobao/product   # 淘宝商品爬取
POST   /api/crawler/jd/search        # 京东搜索爬取
POST   /api/crawler/jd/product       # 京东商品爬取
POST   /api/crawler/amazon/search    # 亚马逊搜索爬取
POST   /api/crawler/amazon/product   # 亚马逊商品爬取
```

**请求/响应示例**
```typescript
// POST /api/crawler/tasks - 创建爬虫任务
interface CrawlerTaskRequest {
  name: string
  platform: 'taobao' | 'jd' | 'amazon'
  type: 'search' | 'product' | 'category'
  config: {
    keywords?: string[]
    urls?: string[]
    filters?: Record<string, any>
    limits?: {
      maxPages?: number
      maxItems?: number
      timeout?: number
    }
    proxy?: {
      enabled: boolean
      rotation: boolean
    }
    antiDetection?: {
      enabled: boolean
      strategy: 'basic' | 'advanced'
    }
  }
  schedule?: {
    immediate: boolean
    delay?: number
    retry?: {
      maxAttempts: number
      backoff: 'linear' | 'exponential'
    }
  }
}

interface CrawlerTaskResponse {
  id: string
  name: string
  platform: string
  type: string
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed'
  config: Record<string, any>
  progress: {
    current: number
    total: number
    percentage: number
    rate: number // items per minute
  }
  stats: {
    itemsFound: number
    itemsProcessed: number
    errors: number
    warnings: number
  }
  createdAt: string
  startedAt?: string
  completedAt?: string
}
```

#### 2.2 上品服务 API (`/api/publisher`)

**上品任务管理**
```http
POST   /api/publisher/tasks          # 创建上品任务
GET    /api/publisher/tasks          # 获取任务列表
GET    /api/publisher/tasks/:id      # 获取任务详情
PUT    /api/publisher/tasks/:id      # 更新任务配置
DELETE /api/publisher/tasks/:id      # 取消/删除任务
```

**上品任务控制**
```http
POST   /api/publisher/tasks/:id/start   # 启动上品任务
POST   /api/publisher/tasks/:id/pause   # 暂停上品任务
POST   /api/publisher/tasks/:id/resume  # 恢复上品任务
POST   /api/publisher/tasks/:id/stop    # 停止上品任务
```

**上品数据和状态**
```http
GET    /api/publisher/tasks/:id/status  # 获取任务状态
GET    /api/publisher/tasks/:id/logs    # 获取任务日志
GET    /api/publisher/tasks/:id/results # 获取上品结果
```

**平台特定接口**
```http
POST   /api/publisher/shopify/product   # Shopify商品上传
POST   /api/publisher/shopify/inventory # Shopify库存管理
POST   /api/publisher/woocommerce/product # WooCommerce商品上传
POST   /api/publisher/magento/product   # Magento商品上传
```

#### 2.3 AI分析服务 API (`/api/ai`)

**AI分析任务**
```http
POST   /api/ai/analyze/product       # 商品分析
POST   /api/ai/analyze/market        # 市场分析
POST   /api/ai/analyze/trend         # 趋势分析
POST   /api/ai/analyze/price         # 价格分析
```

**AI生成内容**
```http
POST   /api/ai/generate/title        # 生成商品标题
POST   /api/ai/generate/description  # 生成商品描述
POST   /api/ai/generate/tags         # 生成商品标签
POST   /api/ai/generate/seo          # 生成SEO内容
```

### 3. 脚本服务内部 API

#### 3.1 浏览器池管理 API (`/api/browser`)

**浏览器实例管理**
```http
GET    /api/browser/pool/status      # 浏览器池状态
POST   /api/browser/pool/create      # 创建浏览器实例
DELETE /api/browser/pool/:id         # 销毁浏览器实例
POST   /api/browser/pool/cleanup     # 清理无效实例
```

**会话管理**
```http
POST   /api/browser/session/create   # 创建浏览器会话
GET    /api/browser/session/:id      # 获取会话信息
DELETE /api/browser/session/:id      # 销毁会话
```

#### 3.2 代理管理 API (`/api/proxy`)

**代理池管理**
```http
GET    /api/proxy/pool               # 获取代理池状态
POST   /api/proxy/pool/add           # 添加代理
DELETE /api/proxy/pool/:id           # 删除代理
POST   /api/proxy/pool/test          # 测试代理可用性
POST   /api/proxy/pool/rotate        # 轮换代理
```

#### 3.3 任务队列 API (`/api/queue`)

**队列管理**
```http
GET    /api/queue/status             # 队列状态
GET    /api/queue/jobs               # 获取任务列表
POST   /api/queue/jobs               # 添加任务到队列
DELETE /api/queue/jobs/:id           # 从队列删除任务
POST   /api/queue/jobs/:id/retry     # 重试失败任务
```

### 4. 系统监控和健康检查 API

#### 4.1 健康检查 API

**各服务健康检查**
```http
GET    /health                       # 服务健康状态
GET    /health/detailed              # 详细健康信息
GET    /ready                        # 服务就绪状态
GET    /metrics                      # Prometheus指标
```

**响应示例**
```typescript
// GET /health - 健康检查响应
interface HealthResponse {
  status: 'healthy' | 'unhealthy' | 'degraded'
  timestamp: string
  uptime: number
  version: string
  services: {
    database: {
      status: 'up' | 'down'
      responseTime: number
    }
    redis: {
      status: 'up' | 'down'
      responseTime: number
    }
    browser: {
      status: 'up' | 'down'
      activeInstances: number
      maxInstances: number
    }
  }
  resources: {
    cpu: {
      usage: number
      limit: number
    }
    memory: {
      usage: number
      limit: number
    }
    disk: {
      usage: number
      limit: number
    }
  }
}
```

#### 4.2 服务发现 API

**服务注册和发现**
```http
POST   /api/registry/register        # 注册服务
DELETE /api/registry/unregister      # 注销服务
GET    /api/registry/services        # 获取服务列表
GET    /api/registry/services/:name  # 获取特定服务信息
```

## 🔄 WebSocket 实时通信

### 实时状态更新

**WebSocket连接端点**
```typescript
ws://backend-service/ws/tasks         # 任务状态更新
ws://backend-service/ws/system        # 系统状态更新
ws://backend-service/ws/logs          # 实时日志推送
ws://backend-service/ws/notifications # 通知推送
```

**消息格式**
```typescript
interface WebSocketMessage {
  type: 'task_status' | 'system_status' | 'log' | 'notification'
  data: any
  timestamp: string
  source: string
}

// 任务状态更新消息
interface TaskStatusMessage extends WebSocketMessage {
  type: 'task_status'
  data: {
    taskId: string
    status: string
    progress?: {
      current: number
      total: number
      percentage: number
    }
    error?: string
  }
}

// 系统状态更新消息
interface SystemStatusMessage extends WebSocketMessage {
  type: 'system_status'
  data: {
    service: string
    status: 'up' | 'down' | 'degraded'
    metrics: Record<string, number>
  }
}

// 日志消息
interface LogMessage extends WebSocketMessage {
  type: 'log'
  data: {
    level: 'info' | 'warn' | 'error' | 'debug'
    message: string
    context?: Record<string, any>
  }
}
```

## 🔐 认证和授权

### JWT Token 认证

**认证相关API**
```http
POST   /api/auth/login               # 用户登录
POST   /api/auth/logout              # 用户登出
POST   /api/auth/refresh             # 刷新Token
GET    /api/auth/profile             # 获取用户信息
```

**请求头格式**
```http
# JWT Token 认证
Authorization: Bearer <jwt_token>

# API Key 认证（服务间通信）
X-API-Key: <api_key>

# 请求ID（用于追踪）
X-Request-ID: <uuid>
```

**JWT Token 结构**
```typescript
interface JWTPayload {
  sub: string        // 用户ID
  email: string      // 用户邮箱
  role: string       // 用户角色
  permissions: string[] // 权限列表
  iat: number        // 签发时间
  exp: number        // 过期时间
}
```

## 📊 API响应格式标准

### 统一响应格式

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  meta?: {
    pagination?: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
    timestamp: string
    requestId: string
    version: string
  }
}
```

### 成功响应示例

```json
{
  "success": true,
  "data": {
    "id": "task_123",
    "name": "淘宝商品爬取任务",
    "status": "running",
    "progress": {
      "current": 150,
      "total": 500,
      "percentage": 30
    }
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_456",
    "version": "1.0.0"
  }
}
```

### 错误响应示例

```json
{
  "success": false,
  "error": {
    "code": "TASK_NOT_FOUND",
    "message": "指定的任务不存在",
    "details": {
      "taskId": "task_123",
      "suggestion": "请检查任务ID是否正确"
    }
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_456",
    "version": "1.0.0"
  }
}
```

### HTTP状态码规范

| 状态码 | 含义 | 使用场景 |
|--------|------|----------|
| 200 OK | 请求成功 | 成功获取数据或执行操作 |
| 201 Created | 资源创建成功 | 成功创建任务、商品等资源 |
| 202 Accepted | 请求已接受 | 异步任务已提交，正在处理 |
| 400 Bad Request | 请求参数错误 | 参数验证失败、格式错误 |
| 401 Unauthorized | 未授权 | Token无效或已过期 |
| 403 Forbidden | 权限不足 | 用户无权限访问资源 |
| 404 Not Found | 资源不存在 | 任务、商品等资源不存在 |
| 409 Conflict | 资源冲突 | 重复创建、状态冲突 |
| 422 Unprocessable Entity | 实体无法处理 | 业务逻辑验证失败 |
| 429 Too Many Requests | 请求频率限制 | 超出API调用限制 |
| 500 Internal Server Error | 服务器内部错误 | 系统异常、未处理错误 |
| 502 Bad Gateway | 网关错误 | 上游服务不可用 |
| 503 Service Unavailable | 服务不可用 | 服务维护、过载 |
| 504 Gateway Timeout | 网关超时 | 上游服务响应超时 |

## 🚀 部署和扩展

### 负载均衡配置

**前端服务**
- Nginx反向代理 + 静态资源缓存
- CDN加速静态资源
- Gzip压缩优化传输

**后端服务**
- 多实例部署 + 负载均衡
- 会话粘性（如需要）
- 健康检查和故障转移

**脚本服务**
- 水平扩展 + 任务分发
- 基于负载的自动扩缩容
- 资源隔离和限制

### 服务发现

**Docker Compose**
```yaml
services:
  frontend:
    image: ecommerce-ai/frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
  
  backend:
    image: ecommerce-ai/backend
    ports:
      - "8000:8000"
    depends_on:
      - postgres
      - redis
  
  scripts:
    image: ecommerce-ai/scripts
    ports:
      - "8001:8001"
    deploy:
      replicas: 3
```

**Kubernetes**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: backend-service
spec:
  selector:
    app: backend
  ports:
    - port: 8000
      targetPort: 8000
  type: LoadBalancer
```

### API版本管理

**版本策略**
- URL路径版本: `/api/v1/tasks`
- 请求头版本: `Accept: application/vnd.api+json;version=1`
- 向后兼容性保证
- 废弃API的迁移计划

**版本生命周期**
```typescript
// API版本定义
interface ApiVersion {
  version: string
  status: 'active' | 'deprecated' | 'sunset'
  releaseDate: string
  sunsetDate?: string
  changes: string[]
}
```

## 📝 API文档生成

### OpenAPI规范

使用OpenAPI 3.0规范生成API文档：

```yaml
openapi: 3.0.0
info:
  title: 电商AI自动化平台API
  version: 1.0.0
  description: 电商AI自动化平台的RESTful API接口文档
servers:
  - url: http://localhost:8000/api/v1
    description: 开发环境
  - url: https://api.ecommerce-ai.com/v1
    description: 生产环境
```

### 自动化文档

- Swagger UI集成
- 代码注释自动生成
- 示例代码生成
- 客户端SDK生成

## 🔍 监控和日志

### API监控指标

- 请求量（QPS）
- 响应时间（P50, P95, P99）
- 错误率
- 可用性
- 并发连接数

### 日志格式

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "info",
  "service": "backend",
  "requestId": "req_456",
  "method": "POST",
  "path": "/api/v1/tasks",
  "statusCode": 201,
  "responseTime": 150,
  "userAgent": "Mozilla/5.0...",
  "ip": "192.168.1.100",
  "userId": "user_123",
  "message": "Task created successfully"
}
```

## 🛡️ 安全最佳实践

### API安全

1. **认证和授权**
   - JWT Token有效期控制
   - 权限最小化原则
   - API Key轮换机制

2. **输入验证**
   - 参数类型验证
   - 长度和格式限制
   - SQL注入防护
   - XSS防护

3. **传输安全**
   - HTTPS强制使用
   - 敏感数据加密
   - 请求签名验证

4. **访问控制**
   - IP白名单
   - 请求频率限制
   - 熔断器机制

### 错误处理

```typescript
// 错误处理中间件
interface ApiError {
  code: string
  message: string
  statusCode: number
  details?: any
}

class ApiErrorHandler {
  static handle(error: Error): ApiError {
    // 错误分类和处理逻辑
    if (error instanceof ValidationError) {
      return {
        code: 'VALIDATION_ERROR',
        message: '请求参数验证失败',
        statusCode: 400,
        details: error.details
      }
    }
    // 其他错误类型处理...
  }
}
```

---

本API设计文档确保了各微服务间的高效通信，支持系统的水平扩展和高可用部署。所有接口遵循RESTful设计原则，提供统一的响应格式和错误处理机制。