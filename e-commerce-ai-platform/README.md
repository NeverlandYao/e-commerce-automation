# E-commerce AI Platform

一个基于AI驱动的现代化电商平台，集成了智能产品描述生成、营销内容创作和客户反馈分析等功能。

## 🚀 项目特性

- **🤖 AI驱动**: 集成OpenAI API，提供智能内容生成和分析功能
- **🏗️ 微服务架构**: 前端、后端、AI脚本服务分离，易于扩展和维护
- **⚡ 现代技术栈**: Next.js 15、Hono、TypeScript、PostgreSQL、Redis
- **🐳 容器化部署**: 完整的Docker配置，支持一键部署
- **🎨 现代UI**: 基于shadcn/ui的美观用户界面
- **🔒 安全可靠**: JWT认证、CORS配置、输入验证
- **📊 数据分析**: 内置客户反馈分析和产品推荐功能

## 🏛️ 系统架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   AI Scripts    │
│   (Next.js)     │◄──►│    (Hono)       │◄──►│   (Hono)        │
│   Port: 3000    │    │   Port: 3001    │    │   Port: 3002    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Nginx       │    │   PostgreSQL    │    │     Redis       │
│  (Reverse Proxy)│    │   (Database)    │    │    (Cache)      │
│   Port: 80/443  │    │   Port: 5432    │    │   Port: 6379    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📦 服务组件

### Frontend (Next.js)
- 用户界面和交互
- 产品展示和购物车
- 用户认证和个人中心
- 管理后台界面

### Backend (Hono)
- RESTful API服务
- 用户认证和授权
- 产品和订单管理
- 数据库操作

### AI Scripts Service (Hono)
- AI内容生成服务
- 产品描述自动生成
- 营销内容创作
- 客户反馈分析

### Database (PostgreSQL)
- 用户数据存储
- 产品和订单信息
- AI任务记录

### Cache (Redis)
- 会话存储
- 数据缓存
- 限流控制

## 🛠️ 技术栈

### 前端
- **Next.js 15**: React框架，支持SSR和SSG
- **TypeScript**: 类型安全的JavaScript
- **Tailwind CSS**: 实用优先的CSS框架
- **shadcn/ui**: 现代化UI组件库
- **React Hook Form**: 表单处理
- **Zustand**: 状态管理

### 后端
- **Hono**: 轻量级Web框架
- **TypeScript**: 类型安全开发
- **PostgreSQL**: 关系型数据库
- **Redis**: 内存数据库
- **JWT**: 身份认证
- **Zod**: 数据验证

### AI服务
- **OpenAI API**: GPT模型集成
- **Hono**: 微服务框架
- **Winston**: 日志记录

### 基础设施
- **Docker**: 容器化部署
- **Nginx**: 反向代理和负载均衡
- **pnpm**: 包管理器

## 🚀 快速开始

### 环境要求

- Node.js 18+
- pnpm 8+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+

### 本地开发

1. **克隆项目**
```bash
git clone <repository-url>
cd e-commerce-ai-platform
```

2. **安装依赖**
```bash
pnpm install
```

3. **配置环境变量**
```bash
cp .env.example .env
# 编辑 .env 文件，填入必要的配置信息
```

4. **启动数据库服务**
```bash
docker-compose up postgres redis -d
```

5. **启动开发服务**
```bash
# 启动后端服务
cd backend && pnpm dev

# 启动AI脚本服务
cd scripts && pnpm dev

# 启动前端服务
cd frontend && pnpm dev
```

### Docker部署

1. **配置环境变量**
```bash
cp .env.example .env
# 编辑环境变量，特别是数据库和API密钥配置
```

2. **构建和启动所有服务**
```bash
docker-compose up --build -d
```

3. **访问应用**
- 前端: http://localhost:3000
- 后端API: http://localhost:3001
- AI脚本服务: http://localhost:3002
- Nginx代理: http://localhost

## 📝 API文档

### 后端API端点

- `GET /health` - 健康检查
- `POST /auth/login` - 用户登录
- `POST /auth/register` - 用户注册
- `GET /products` - 获取产品列表
- `POST /products` - 创建产品
- `GET /orders` - 获取订单列表
- `POST /orders` - 创建订单

### AI脚本服务端点

- `GET /health` - 健康检查
- `POST /ai/chat` - AI对话
- `POST /ai/product-description` - 生成产品描述
- `POST /ai/marketing-content` - 生成营销内容
- `POST /ai/analyze-feedback` - 分析客户反馈

## 🔧 开发指南

### 项目结构

```
e-commerce-ai-platform/
├── frontend/          # Next.js前端应用
├── backend/           # Hono后端API
├── scripts/           # AI脚本服务
├── shared/            # 共享代码和类型
├── docker/            # Docker配置文件
├── docs/              # 项目文档
└── docker-compose.yml # Docker编排文件
```

### 代码规范

- 使用TypeScript进行类型安全开发
- 遵循ESLint和Prettier配置
- 使用Conventional Commits规范
- 编写单元测试和集成测试

### 环境变量配置

关键环境变量说明：

- `DATABASE_URL`: PostgreSQL数据库连接字符串
- `REDIS_URL`: Redis连接字符串
- `JWT_SECRET`: JWT签名密钥
- `OPENAI_API_KEY`: OpenAI API密钥
- `CORS_ORIGIN`: 允许的跨域来源

## 🧪 测试

```bash
# 运行所有测试
pnpm test

# 运行特定服务测试
cd backend && pnpm test
cd frontend && pnpm test
cd scripts && pnpm test
```

## 📊 监控和日志

- 应用日志存储在 `./logs` 目录
- 使用Winston进行结构化日志记录
- 支持多种日志级别（error, warn, info, debug）
- 集成健康检查端点

## 🔒 安全特性

- JWT身份认证
- CORS跨域保护
- 输入数据验证
- SQL注入防护
- XSS攻击防护
- 速率限制
- HTTPS支持

## 🚀 部署

### 生产环境部署

1. **准备生产环境变量**
2. **构建Docker镜像**
3. **部署到云平台**（AWS、阿里云、腾讯云等）
4. **配置域名和SSL证书**
5. **设置监控和备份**

### 扩展性考虑

- 支持水平扩展
- 数据库读写分离
- CDN静态资源加速
- 负载均衡配置
- 微服务拆分

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 支持

如果您有任何问题或建议，请：

- 创建 [Issue](../../issues)
- 发送邮件到 support@example.com
- 查看 [文档](./docs/)

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和开源社区。

---

**Happy Coding! 🎉**