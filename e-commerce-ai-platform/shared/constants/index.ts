// Common constants shared across all services

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REFRESH: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout',
    VERIFY: '/api/auth/verify',
  },
  USERS: {
    LIST: '/api/users',
    DETAIL: '/api/users/:id',
    UPDATE: '/api/users/:id',
    DELETE: '/api/users/:id',
  },
  PRODUCTS: {
    LIST: '/api/products',
    DETAIL: '/api/products/:id',
    CREATE: '/api/products',
    UPDATE: '/api/products/:id',
    DELETE: '/api/products/:id',
    CATEGORIES: '/api/products/categories',
  },
  ORDERS: {
    LIST: '/api/orders',
    DETAIL: '/api/orders/:id',
    CREATE: '/api/orders',
    UPDATE: '/api/orders/:id',
    CANCEL: '/api/orders/:id/cancel',
  },
  AI: {
    CHAT: '/api/ai/chat',
    PRODUCT_DESCRIPTION: '/api/ai/product-description',
    MARKETING_CONTENT: '/api/ai/marketing-content',
    ANALYZE_FEEDBACK: '/api/ai/analyze-feedback',
    STATUS: '/api/ai/status',
  },
  TASKS: {
    LIST: '/api/tasks',
    DETAIL: '/api/tasks/:id',
    CREATE: '/api/tasks',
    UPDATE: '/api/tasks/:id',
    DELETE: '/api/tasks/:id',
  },
  SYSTEM: {
    HEALTH: '/health',
    STATUS: '/api/system/status',
    INFO: '/api/system/info',
  },
} as const;

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Error codes
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  CONFLICT_ERROR: 'CONFLICT_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
} as const;

// Validation rules
export const VALIDATION = {
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SYMBOLS: false,
  },
  EMAIL: {
    MAX_LENGTH: 254,
  },
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 30,
    PATTERN: /^[a-zA-Z0-9_-]+$/,
  },
  PRODUCT: {
    NAME: {
      MIN_LENGTH: 1,
      MAX_LENGTH: 200,
    },
    DESCRIPTION: {
      MAX_LENGTH: 5000,
    },
    PRICE: {
      MIN: 0,
      MAX: 999999.99,
    },
  },
} as const;

// File upload limits
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: {
    IMAGES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    DOCUMENTS: ['application/pdf', 'text/plain', 'application/msword'],
  },
  MAX_FILES: 10,
} as const;

// Cache keys
export const CACHE_KEYS = {
  USER: (id: string) => `user:${id}`,
  PRODUCT: (id: string) => `product:${id}`,
  PRODUCTS_LIST: (params: string) => `products:list:${params}`,
  ORDER: (id: string) => `order:${id}`,
  SESSION: (token: string) => `session:${token}`,
} as const;

// Cache TTL (in seconds)
export const CACHE_TTL = {
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
} as const;

// Rate limiting
export const RATE_LIMITS = {
  AUTH: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_ATTEMPTS: 5,
  },
  API: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100,
  },
  AI: {
    WINDOW_MS: 60 * 1000, // 1 minute
    MAX_REQUESTS: 10,
  },
} as const;

// Service ports
export const SERVICE_PORTS = {
  FRONTEND: 3000,
  BACKEND: 3001,
  SCRIPTS: 3002,
  DATABASE: 5432,
  REDIS: 6379,
} as const;

// Environment names
export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test',
  STAGING: 'staging',
} as const;

// Default values
export const DEFAULTS = {
  CURRENCY: 'USD',
  LOCALE: 'en-US',
  TIMEZONE: 'UTC',
  THEME: 'light',
  LANGUAGE: 'en',
} as const;

// Regular expressions
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[+]?[1-9]?[0-9]{7,15}$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
} as const;

// AI service constants
export const AI_CONSTANTS = {
  MODELS: {
    GPT_4: 'gpt-4',
    GPT_3_5_TURBO: 'gpt-3.5-turbo',
  },
  MAX_TOKENS: {
    DEFAULT: 2000,
    SHORT: 500,
    MEDIUM: 1000,
    LONG: 3000,
  },
  TEMPERATURE: {
    CREATIVE: 0.9,
    BALANCED: 0.7,
    FOCUSED: 0.3,
    DETERMINISTIC: 0.1,
  },
} as const;