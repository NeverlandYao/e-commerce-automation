import { config } from 'dotenv';

// Load environment variables
config();

export const appConfig = {
  // Server configuration
  port: parseInt(process.env.PORT || '3002', 10),
  env: process.env.NODE_ENV || 'development',
  
  // AI Service configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4',
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2000', 10),
  },
  
  // External services
  backend: {
    url: process.env.BACKEND_URL || 'http://localhost:3001',
    apiKey: process.env.BACKEND_API_KEY || '',
  },
  
  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },
  
  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined',
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // limit each IP to 100 requests per windowMs
  },
};

export default appConfig;