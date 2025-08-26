// 任务相关类型定义

export interface CreateTaskRequest {
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

export interface TaskResponse {
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

export interface TaskProgress {
  current: number
  total: number
  percentage: number
  estimatedTimeRemaining?: string
  startTime?: string
}

export interface TaskLog {
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
}

export interface TaskStatistics {
  total: number
  running: number
  completed: number
  failed: number
  pending: number
  todayCreated: number
  todayCompleted: number
}

export interface TaskStatusResponse {
  taskId: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  progress?: TaskProgress
}

export interface TaskLogsResponse {
  taskId: string
  logs: TaskLog[]
}

export interface TaskProgressResponse {
  taskId: string
  progress: TaskProgress
}