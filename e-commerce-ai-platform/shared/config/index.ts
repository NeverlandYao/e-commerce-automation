// Shared configuration utilities

// Environment configuration
export interface EnvironmentConfig {
  nodeEnv: string;
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;
}

export const getEnvironmentConfig = (): EnvironmentConfig => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  
  return {
    nodeEnv,
    isDevelopment: nodeEnv === 'development',
    isProduction: nodeEnv === 'production',
    isTest: nodeEnv === 'test',
  };
};

// Database configuration
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  maxConnections: number;
  connectionTimeout: number;
}

export const getDatabaseConfig = (): DatabaseConfig => {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'ecommerce_ai',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: process.env.DB_SSL === 'true',
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20', 10),
    connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000', 10),
  };
};

// Redis configuration
export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  keyPrefix: string;
  maxRetriesPerRequest: number;
  retryDelayOnFailover: number;
}

export const getRedisConfig = (): RedisConfig => {
  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'ecommerce_ai:',
    maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES || '3', 10),
    retryDelayOnFailover: parseInt(process.env.REDIS_RETRY_DELAY || '100', 10),
  };
};

// JWT configuration
export interface JWTConfig {
  accessTokenSecret: string;
  refreshTokenSecret: string;
  accessTokenExpiry: string;
  refreshTokenExpiry: string;
  issuer: string;
  audience: string;
}

export const getJWTConfig = (): JWTConfig => {
  return {
    accessTokenSecret: process.env.JWT_ACCESS_SECRET || 'your-access-secret-key',
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
    issuer: process.env.JWT_ISSUER || 'ecommerce-ai-platform',
    audience: process.env.JWT_AUDIENCE || 'ecommerce-ai-users',
  };
};

// CORS configuration
export interface CORSConfig {
  origin: string[];
  credentials: boolean;
  methods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  maxAge: number;
}

export const getCORSConfig = (): CORSConfig => {
  const origins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'];
  
  return {
    origin: origins,
    credentials: process.env.CORS_CREDENTIALS === 'true',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-API-Key',
    ],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
    maxAge: parseInt(process.env.CORS_MAX_AGE || '86400', 10),
  };
};

// Logging configuration
export interface LoggingConfig {
  level: string;
  format: string;
  filename?: string;
  maxSize: string;
  maxFiles: string;
  datePattern: string;
  colorize: boolean;
  timestamp: boolean;
}

export const getLoggingConfig = (): LoggingConfig => {
  return {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined',
    filename: process.env.LOG_FILENAME,
    maxSize: process.env.LOG_MAX_SIZE || '20m',
    maxFiles: process.env.LOG_MAX_FILES || '14d',
    datePattern: process.env.LOG_DATE_PATTERN || 'YYYY-MM-DD',
    colorize: process.env.LOG_COLORIZE !== 'false',
    timestamp: process.env.LOG_TIMESTAMP !== 'false',
  };
};

// Rate limiting configuration
export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
  standardHeaders: boolean;
  legacyHeaders: boolean;
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
}

export const getRateLimitConfig = (): RateLimitConfig => {
  return {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
  };
};

// File upload configuration
export interface FileUploadConfig {
  maxSize: number;
  allowedTypes: string[];
  uploadPath: string;
  maxFiles: number;
  preserveExtension: boolean;
  generateUniqueFilename: boolean;
}

export const getFileUploadConfig = (): FileUploadConfig => {
  const allowedTypes = process.env.UPLOAD_ALLOWED_TYPES?.split(',') || [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ];
  
  return {
    maxSize: parseInt(process.env.UPLOAD_MAX_SIZE || '10485760', 10), // 10MB
    allowedTypes,
    uploadPath: process.env.UPLOAD_PATH || './uploads',
    maxFiles: parseInt(process.env.UPLOAD_MAX_FILES || '10', 10),
    preserveExtension: process.env.UPLOAD_PRESERVE_EXTENSION !== 'false',
    generateUniqueFilename: process.env.UPLOAD_UNIQUE_FILENAME !== 'false',
  };
};

// Email configuration
export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  from: string;
  replyTo?: string;
}

export const getEmailConfig = (): EmailConfig => {
  return {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true',
    username: process.env.EMAIL_USERNAME || '',
    password: process.env.EMAIL_PASSWORD || '',
    from: process.env.EMAIL_FROM || 'noreply@ecommerce-ai.com',
    replyTo: process.env.EMAIL_REPLY_TO,
  };
};

// Payment configuration
export interface PaymentConfig {
  stripe: {
    publicKey: string;
    secretKey: string;
    webhookSecret: string;
  };
  paypal: {
    clientId: string;
    clientSecret: string;
    mode: 'sandbox' | 'live';
  };
}

export const getPaymentConfig = (): PaymentConfig => {
  return {
    stripe: {
      publicKey: process.env.STRIPE_PUBLIC_KEY || '',
      secretKey: process.env.STRIPE_SECRET_KEY || '',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    },
    paypal: {
      clientId: process.env.PAYPAL_CLIENT_ID || '',
      clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
      mode: (process.env.PAYPAL_MODE as 'sandbox' | 'live') || 'sandbox',
    },
  };
};

// AI service configuration
export interface AIServiceConfig {
  openai: {
    apiKey: string;
    model: string;
    maxTokens: number;
    temperature: number;
    timeout: number;
  };
  rateLimit: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
}

export const getAIServiceConfig = (): AIServiceConfig => {
  return {
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: process.env.OPENAI_MODEL || 'gpt-4',
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2000', 10),
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
      timeout: parseInt(process.env.OPENAI_TIMEOUT || '30000', 10),
    },
    rateLimit: {
      requestsPerMinute: parseInt(process.env.AI_REQUESTS_PER_MINUTE || '10', 10),
      requestsPerHour: parseInt(process.env.AI_REQUESTS_PER_HOUR || '100', 10),
    },
  };
};

// Application configuration aggregator
export interface AppConfig {
  environment: EnvironmentConfig;
  database: DatabaseConfig;
  redis: RedisConfig;
  jwt: JWTConfig;
  cors: CORSConfig;
  logging: LoggingConfig;
  rateLimit: RateLimitConfig;
  fileUpload: FileUploadConfig;
  email: EmailConfig;
  payment: PaymentConfig;
  aiService: AIServiceConfig;
}

export const getAppConfig = (): AppConfig => {
  return {
    environment: getEnvironmentConfig(),
    database: getDatabaseConfig(),
    redis: getRedisConfig(),
    jwt: getJWTConfig(),
    cors: getCORSConfig(),
    logging: getLoggingConfig(),
    rateLimit: getRateLimitConfig(),
    fileUpload: getFileUploadConfig(),
    email: getEmailConfig(),
    payment: getPaymentConfig(),
    aiService: getAIServiceConfig(),
  };
};

// Configuration validation
export const validateConfig = (config: AppConfig): string[] => {
  const errors: string[] = [];
  
  // Validate required environment variables
  if (!config.database.password && config.environment.isProduction) {
    errors.push('Database password is required in production');
  }
  
  if (!config.jwt.accessTokenSecret || config.jwt.accessTokenSecret === 'your-access-secret-key') {
    errors.push('JWT access token secret must be set');
  }
  
  if (!config.jwt.refreshTokenSecret || config.jwt.refreshTokenSecret === 'your-refresh-secret-key') {
    errors.push('JWT refresh token secret must be set');
  }
  
  if (!config.aiService.openai.apiKey && config.environment.isProduction) {
    errors.push('OpenAI API key is required in production');
  }
  
  // Validate numeric values
  if (config.database.port < 1 || config.database.port > 65535) {
    errors.push('Database port must be between 1 and 65535');
  }
  
  if (config.redis.port < 1 || config.redis.port > 65535) {
    errors.push('Redis port must be between 1 and 65535');
  }
  
  return errors;
};