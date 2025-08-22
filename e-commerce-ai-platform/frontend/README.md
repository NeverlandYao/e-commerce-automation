# Frontend - E-commerce AI Platform

基于Next.js 15构建的现代化电商前端应用，集成shadcn/ui组件库和Tailwind CSS。

## 🚀 技术栈

- **Next.js 15**: React框架，支持App Router
- **TypeScript**: 类型安全的JavaScript超集
- **Tailwind CSS**: 实用优先的CSS框架
- **shadcn/ui**: 现代化UI组件库
- **React Hook Form**: 高性能表单处理
- **Zustand**: 轻量级状态管理

## 🛠️ 开发指南

### 环境要求

- Node.js 18+
- pnpm 8+

### 安装依赖

```bash
cd frontend
pnpm install
```

### 开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000

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

## 📁 项目结构

```
frontend/
├── src/
│   ├── app/                 # App Router页面
│   ├── components/          # 可复用组件
│   │   ├── ui/             # shadcn/ui组件
│   │   └── common/         # 通用组件
│   ├── lib/                # 工具库
│   ├── hooks/              # 自定义Hooks
│   ├── store/              # 状态管理
│   └── types/              # TypeScript类型定义
├── public/                 # 静态资源
└── package.json           # 依赖配置
```

## 🎨 UI组件

项目使用shadcn/ui作为基础UI组件库，提供现代化的React组件。

### 添加新组件

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add form
npx shadcn-ui@latest add table
```

## 🌐 API集成

前端通过HTTP客户端与后端API和AI脚本服务进行通信：

- 后端API: http://localhost:3001
- AI脚本服务: http://localhost:3002

## 📱 响应式设计

使用Tailwind CSS实现响应式设计，支持移动端、平板和桌面端。

## 🔐 认证

集成JWT认证系统，支持用户登录、注册和权限管理。

## 📚 学习资源

- [Next.js 文档](https://nextjs.org/docs)
- [shadcn/ui 文档](https://ui.shadcn.com)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)

---

**Happy Coding! 🎉**
