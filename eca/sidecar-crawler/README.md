# Crawler Sidecar Process

这是一个基于 Node.js 的侧车进程，用于为 Tauri 应用提供电商网站爬虫功能。

## 功能特性

- 🚀 **多平台支持**: 支持淘宝、京东、亚马逊等主流电商平台
- 🎭 **反检测机制**: 使用 Playwright 和多种反检测策略
- 🔄 **并发控制**: 支持批量爬取和并发限制
- 📊 **数据标准化**: 统一的数据格式输出
- 🛡️ **错误处理**: 完善的错误处理和重试机制
- 📝 **日志记录**: 详细的日志记录和调试信息

## 项目结构

```
sidecar-crawler/
├── src/
│   ├── main.js              # 主入口文件
│   ├── crawler/
│   │   └── CrawlerEngine.js # 爬虫引擎
│   ├── platforms/
│   │   ├── PlatformManager.js # 平台管理器
│   │   ├── taobao.js        # 淘宝适配器
│   │   ├── jd.js            # 京东适配器
│   │   └── amazon.js        # 亚马逊适配器
│   └── utils/
│       └── Logger.js        # 日志工具
├── bin/                     # 编译后的二进制文件
├── package.json
├── build.js                 # 构建脚本
└── README.md
```

## 安装依赖

```bash
npm install
```

## 开发模式运行

```bash
npm run dev
```

## 构建二进制文件

### 构建所有平台

```bash
npm run build
```

### 构建特定平台

```bash
# macOS (x64)
npm run build:macos

# Windows (x64)
npm run build:windows

# Linux (x64)
npm run build:linux
```

### 使用构建脚本

```bash
# 构建所有平台
node build.js

# 构建特定平台
node build.js macos-x64
node build.js macos-x64 linux-x64

# 清理构建文件
node build.js clean

# 列出已构建的文件
node build.js list

# 显示帮助
node build.js help
```

## API 接口

侧车进程启动后会在随机端口上运行 HTTP 服务器，并将端口号输出到 stdout。

### 健康检查

```http
GET /health
```

响应:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 12345
}
```

### 爬取商品

```http
POST /crawl
Content-Type: application/json

{
  "type": "product",
  "url": "https://item.taobao.com/item.htm?id=123456789",
  "platform": "taobao",
  "options": {
    "timeout": 30000,
    "retries": 3
  }
}
```

### 搜索商品

```http
POST /crawl
Content-Type: application/json

{
  "type": "search",
  "keyword": "iPhone 15",
  "platform": "taobao",
  "options": {
    "maxPages": 3,
    "maxResults": 50
  }
}
```

### 批量爬取

```http
POST /crawl
Content-Type: application/json

{
  "type": "batch",
  "urls": [
    "https://item.taobao.com/item.htm?id=123456789",
    "https://item.jd.com/123456789.html"
  ],
  "options": {
    "concurrency": 3,
    "delay": 1000
  }
}
```

### 获取状态

```http
GET /status
```

响应:
```json
{
  "status": "running",
  "activeTasks": 2,
  "completedTasks": 15,
  "failedTasks": 1,
  "supportedPlatforms": ["taobao", "jd", "amazon"]
}
```

## 支持的平台

### 淘宝 (taobao)
- 商品详情页
- 搜索结果页
- 商品列表页

### 京东 (jd)
- 商品详情页
- 搜索结果页
- 商品列表页

### 亚马逊 (amazon)
- 商品详情页
- 搜索结果页
- 商品列表页

## 配置选项

### 环境变量

- `NODE_ENV`: 运行环境 (development/production)
- `DEBUG`: 启用调试日志
- `TRACE`: 启用跟踪日志
- `NO_COLOR`: 禁用彩色输出
- `PORT`: 指定服务器端口 (默认随机)

### 爬虫选项

- `timeout`: 请求超时时间 (毫秒)
- `retries`: 重试次数
- `delay`: 请求间隔 (毫秒)
- `concurrency`: 并发数
- `maxPages`: 最大页数
- `maxResults`: 最大结果数
- `userAgent`: 自定义 User-Agent
- `proxy`: 代理设置

## 错误处理

侧车进程包含完善的错误处理机制:

- 网络错误自动重试
- 页面加载超时处理
- 反爬虫检测应对
- 数据解析错误处理
- 资源清理和内存管理

## 日志记录

支持多级别日志记录:

- `INFO`: 一般信息
- `WARN`: 警告信息
- `ERROR`: 错误信息
- `DEBUG`: 调试信息 (开发模式)
- `TRACE`: 跟踪信息 (开发模式)

## 性能优化

- 浏览器实例复用
- 页面资源过滤
- 内存使用监控
- 并发控制
- 缓存机制

## 安全考虑

- CORS 配置
- 请求头安全
- 输入验证
- 错误信息过滤
- 资源限制

## 故障排除

### 常见问题

1. **端口被占用**: 侧车进程会自动选择可用端口
2. **浏览器启动失败**: 检查 Playwright 安装
3. **网络连接问题**: 检查网络和代理设置
4. **内存不足**: 调整并发数和超时设置

### 调试模式

```bash
DEBUG=1 npm run dev
```

### 查看日志

侧车进程的所有日志都会输出到 stdout/stderr，可以通过 Tauri 应用捕获和查看。

## 许可证

MIT License