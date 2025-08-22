import { QueryClient } from '@tanstack/react-query';

// API基础配置
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const SCRIPTS_API_URL = process.env.NEXT_PUBLIC_SCRIPTS_API_URL || 'http://localhost:3002';

// 创建Query Client实例
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5分钟
      gcTime: 10 * 60 * 1000, // 10分钟
      retry: 3,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// API请求封装
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: response.statusText,
      }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// 创建API客户端实例
export const apiClient = new ApiClient(API_BASE_URL);
export const scriptsApiClient = new ApiClient(SCRIPTS_API_URL);

// API端点常量
export const API_ENDPOINTS = {
  // 任务管理
  TASKS: '/api/tasks',
  TASK_BY_ID: (id: string) => `/api/tasks/${id}`,
  TASK_START: (id: string) => `/api/tasks/${id}/start`,
  TASK_STOP: (id: string) => `/api/tasks/${id}/stop`,
  TASK_STATUS: (id: string) => `/api/tasks/${id}/status`,

  // 商品管理
  PRODUCTS: '/api/products',
  PRODUCT_BY_ID: (id: string) => `/api/products/${id}`,
  PRODUCT_ANALYSIS: '/api/products/analysis',

  // 脚本管理
  SCRIPTS: '/api/scripts',
  SCRIPT_BY_ID: (id: string) => `/api/scripts/${id}`,
  SCRIPT_EXECUTE: (id: string) => `/api/scripts/${id}/execute`,

  // 数据分析
  ANALYTICS: '/api/analytics',
  ANALYTICS_DASHBOARD: '/api/analytics/dashboard',
  ANALYTICS_REPORTS: '/api/analytics/reports',

  // 系统监控
  SYSTEM_STATUS: '/api/system/status',
  SYSTEM_HEALTH: '/api/system/health',
  SYSTEM_METRICS: '/api/system/metrics',

  // 用户认证
  AUTH_LOGIN: '/api/auth/login',
  AUTH_LOGOUT: '/api/auth/logout',
  AUTH_PROFILE: '/api/auth/profile',
} as const;

// 脚本服务API端点
export const SCRIPTS_API_ENDPOINTS = {
  // 爬虫任务
  CRAWLER_TASKS: '/api/crawler/tasks',
  CRAWLER_TASK_BY_ID: (id: string) => `/api/crawler/tasks/${id}`,
  CRAWLER_START: (id: string) => `/api/crawler/tasks/${id}/start`,
  CRAWLER_STOP: (id: string) => `/api/crawler/tasks/${id}/stop`,

  // 上品任务
  PUBLISHER_TASKS: '/api/publisher/tasks',
  PUBLISHER_TASK_BY_ID: (id: string) => `/api/publisher/tasks/${id}`,
  PUBLISHER_START: (id: string) => `/api/publisher/tasks/${id}/start`,
  PUBLISHER_STOP: (id: string) => `/api/publisher/tasks/${id}/stop`,

  // 健康检查
  HEALTH: '/api/health',
  STATUS: '/api/status',
} as const;

// WebSocket连接管理
export class WebSocketManager {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(url: string) {
    this.url = url;
  }

  connect(onMessage?: (data: unknown) => void, onError?: (error: Event) => void) {
    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('WebSocket连接已建立');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage?.(data);
        } catch (error) {
          console.error('WebSocket消息解析错误:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket连接已关闭');
        this.attemptReconnect(onMessage, onError);
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket错误:', error);
        onError?.(error);
      };
    } catch (error) {
      console.error('WebSocket连接失败:', error);
      onError?.(error as Event);
    }
  }

  private attemptReconnect(onMessage?: (data: unknown) => void, onError?: (error: Event) => void) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`尝试重连WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect(onMessage, onError);
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('WebSocket重连失败，已达到最大重试次数');
    }
  }

  send(data: unknown) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket未连接，无法发送消息');
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// 创建WebSocket管理器实例
export const wsManager = new WebSocketManager(
  `ws://${typeof window !== 'undefined' ? window.location.host : 'localhost:3001'}/ws`
);