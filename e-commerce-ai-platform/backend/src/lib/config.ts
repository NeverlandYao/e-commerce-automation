import { config as dotenvConfig } from 'dotenv'

// 加载环境变量
dotenvConfig()

interface Config {
  port: number
  nodeEnv: string
  database: {
    url: string
    host: string
    port: number
    name: string
    user: string
    password: string
  }
  redis: {
    url: string
    host: string
    port: number
    password?: string
  }
  jwt: {
    secret: string
    expiresIn: string
    refreshExpiresIn: string
  }
  cors: {
    origins: string[]
    credentials: boolean
  }
  scriptsService: {
    url: string
    apiKey: string
  }
  upload: {
    maxSize: number
    allowedTypes: string[]
  }
  logging: {
    level: string
    format: string
  }
}

export const config: Config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // 数据库配置
  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/ecommerce_ai',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'ecommerce_ai',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password'
  },
  
  // Redis配置
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD
  },
  
  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  },
  
  // CORS配置
  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true
  },
  
  // 脚本服务配置
  scriptsService: {
    url: process.env.SCRIPTS_SERVICE_URL || 'http://localhost:3002',
    apiKey: process.env.SCRIPTS_API_KEY || 'scripts-api-key'
  },
  
  // 文件上传配置
  upload: {
    maxSize: parseInt(process.env.UPLOAD_MAX_SIZE || '10485760', 10), // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  },
  
  // 日志配置
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined'
  }
}

export default config