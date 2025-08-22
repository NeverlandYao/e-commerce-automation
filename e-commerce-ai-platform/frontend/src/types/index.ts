// 用户相关类型
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'operator';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// 任务相关类型
export interface Task {
  id: string;
  name: string;
  description?: string;
  type: 'crawler' | 'publisher' | 'analysis' | 'automation';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  progress: number;
  config: Record<string, unknown>;
  result?: Record<string, unknown>;
  error?: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  userId: string;
}

// 产品相关类型
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  currency: string;
  category: string;
  brand?: string;
  images: string[];
  attributes: Record<string, unknown>;
  stock: number;
  sku: string;
  url: string;
  platform: string;
  status: 'active' | 'inactive' | 'out_of_stock';
  createdAt: string;
  updatedAt: string;
}

// 脚本相关类型
export interface Script {
  id: string;
  name: string;
  description?: string;
  type: 'crawler' | 'publisher' | 'analyzer' | 'automation';
  language: 'javascript' | 'python' | 'typescript';
  code: string;
  config: Record<string, unknown>;
  version: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

// 系统状态类型
export interface SystemStatus {
  cpu: number;
  memory: number;
  disk: number;
  network: {
    upload: number;
    download: number;
  };
  services: {
    backend: boolean;
    scriptsService: boolean;
    database: boolean;
    redis: boolean;
  };
  uptime: number;
  timestamp: string;
}

// 通知类型
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  userId?: string;
  actionUrl?: string;
}

// API响应类型
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: number;
}

// 分页类型
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 表单类型
export interface LoginForm {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface TaskForm {
  name: string;
  description?: string;
  type: Task['type'];
  config: Record<string, unknown>;
}

export interface ScriptForm {
  name: string;
  description?: string;
  type: Script['type'];
  language: Script['language'];
  code: string;
  config: Record<string, unknown>;
}

// 图表数据类型
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

// 统计数据类型
export interface Analytics {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  runningTasks: number;
  totalProducts: number;
  activeProducts: number;
  totalScripts: number;
  activeScripts: number;
  systemUptime: number;
  averageTaskDuration: number;
  successRate: number;
  errorRate: number;
}

// WebSocket消息类型
export interface WebSocketMessage {
  type: 'task_update' | 'system_status' | 'notification' | 'script_output';
  data: Record<string, unknown>;
  timestamp: string;
}

// 配置类型
export interface AppConfig {
  apiUrl: string;
  scriptsApiUrl: string;
  wsUrl: string;
  maxFileSize: number;
  supportedFileTypes: string[];
  theme: 'light' | 'dark';
  language: 'zh' | 'en';
}

// 错误类型
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

// 导出所有类型
export type * from './index';