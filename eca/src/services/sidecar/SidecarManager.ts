import { Command } from '@tauri-apps/plugin-shell';
import { EventEmitter } from 'events';

export interface CrawlTask {
  id: string;
  type: 'product' | 'search' | 'list' | 'batch';
  url?: string;
  urls?: string[];
  keyword?: string;
  platform?: string;
  options?: {
    timeout?: number;
    retries?: number;
    delay?: number;
    concurrency?: number;
    maxPages?: number;
    maxResults?: number;
    userAgent?: string;
    proxy?: string;
  };
}

export interface CrawlResult {
  success: boolean;
  data?: any;
  error?: string;
  taskId: string;
  timestamp: string;
}

export interface SidecarStatus {
  status: 'stopped' | 'starting' | 'running' | 'error';
  port?: number;
  pid?: number;
  activeTasks: number;
  completedTasks: number;
  failedTasks: number;
  supportedPlatforms: string[];
  uptime?: number;
}

export class SidecarManager extends EventEmitter {
  private command: Command | null = null;
  private port: number | null = null;
  private status: SidecarStatus['status'] = 'stopped';
  private activeTasks = new Map<string, CrawlTask>();
  private completedTasks = 0;
  private failedTasks = 0;
  private supportedPlatforms: string[] = [];
  private startTime: number | null = null;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.on('status-change', (status: SidecarStatus['status']) => {
      console.log(`[SidecarManager] Status changed to: ${status}`);
    });

    this.on('task-completed', (result: CrawlResult) => {
      this.activeTasks.delete(result.taskId);
      if (result.success) {
        this.completedTasks++;
      } else {
        this.failedTasks++;
      }
    });
  }

  /**
   * 启动侧车进程
   */
  async start(): Promise<void> {
    if (this.status === 'running' || this.status === 'starting') {
      throw new Error('Sidecar is already running or starting');
    }

    try {
      this.setStatus('starting');
      
      // 创建命令
      this.command = Command.sidecar('crawler-sidecar');
      
      // 监听输出以获取端口号
      this.command.stdout.on('data', (data: string) => {
        console.log(`[Sidecar] ${data}`);
        
        // 解析端口号
        const portMatch = data.match(/Server listening on port (\d+)/);
        if (portMatch && !this.port) {
          this.port = parseInt(portMatch[1]);
          this.onSidecarReady();
        }
      });

      this.command.stderr.on('data', (data: string) => {
        console.error(`[Sidecar Error] ${data}`);
        this.emit('error', new Error(data));
      });

      // 启动进程
      const child = await this.command.spawn();
      
      // 等待进程启动
      await this.waitForReady();
      
      this.emit('started', { port: this.port, pid: child.pid });
      
    } catch (error) {
      this.setStatus('error');
      throw new Error(`Failed to start sidecar: ${error}`);
    }
  }

  /**
   * 停止侧车进程
   */
  async stop(): Promise<void> {
    if (this.status === 'stopped') {
      return;
    }

    try {
      // 停止健康检查
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
        this.healthCheckInterval = null;
      }

      // 终止进程
      if (this.command) {
        await this.command.kill();
        this.command = null;
      }

      this.port = null;
      this.startTime = null;
      this.activeTasks.clear();
      this.setStatus('stopped');
      
      this.emit('stopped');
      
    } catch (error) {
      console.error('Failed to stop sidecar:', error);
      throw error;
    }
  }

  /**
   * 重启侧车进程
   */
  async restart(): Promise<void> {
    await this.stop();
    await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒
    await this.start();
  }

  /**
   * 执行爬取任务
   */
  async crawl(task: Omit<CrawlTask, 'id'>): Promise<CrawlResult> {
    if (this.status !== 'running') {
      throw new Error('Sidecar is not running');
    }

    const taskWithId: CrawlTask = {
      ...task,
      id: this.generateTaskId()
    };

    this.activeTasks.set(taskWithId.id, taskWithId);
    this.emit('task-started', taskWithId);

    try {
      const response = await fetch(`http://localhost:${this.port}/crawl`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskWithId)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      const result: CrawlResult = {
        success: true,
        data,
        taskId: taskWithId.id,
        timestamp: new Date().toISOString()
      };

      this.emit('task-completed', result);
      return result;
      
    } catch (error) {
      const result: CrawlResult = {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        taskId: taskWithId.id,
        timestamp: new Date().toISOString()
      };

      this.emit('task-completed', result);
      return result;
    }
  }

  /**
   * 获取侧车进程状态
   */
  async getStatus(): Promise<SidecarStatus> {
    const baseStatus: SidecarStatus = {
      status: this.status,
      port: this.port || undefined,
      activeTasks: this.activeTasks.size,
      completedTasks: this.completedTasks,
      failedTasks: this.failedTasks,
      supportedPlatforms: this.supportedPlatforms,
      uptime: this.startTime ? Date.now() - this.startTime : undefined
    };

    if (this.status === 'running' && this.port) {
      try {
        const response = await fetch(`http://localhost:${this.port}/status`);
        if (response.ok) {
          const remoteStatus = await response.json();
          return {
            ...baseStatus,
            ...remoteStatus
          };
        }
      } catch (error) {
        console.warn('Failed to get remote status:', error);
      }
    }

    return baseStatus;
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<boolean> {
    if (this.status !== 'running' || !this.port) {
      return false;
    }

    try {
      const response = await fetch(`http://localhost:${this.port}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5秒超时
      });
      
      return response.ok;
    } catch (error) {
      console.warn('Health check failed:', error);
      return false;
    }
  }

  /**
   * 获取支持的平台列表
   */
  getSupportedPlatforms(): string[] {
    return [...this.supportedPlatforms];
  }

  /**
   * 检查是否正在运行
   */
  isRunning(): boolean {
    return this.status === 'running';
  }

  /**
   * 获取当前端口
   */
  getPort(): number | null {
    return this.port;
  }

  /**
   * 获取活跃任务列表
   */
  getActiveTasks(): CrawlTask[] {
    return Array.from(this.activeTasks.values());
  }

  private setStatus(status: SidecarStatus['status']) {
    if (this.status !== status) {
      this.status = status;
      this.emit('status-change', status);
    }
  }

  private async onSidecarReady() {
    this.startTime = Date.now();
    this.setStatus('running');
    
    // 获取支持的平台
    try {
      const status = await this.getStatus();
      this.supportedPlatforms = status.supportedPlatforms;
    } catch (error) {
      console.warn('Failed to get supported platforms:', error);
    }

    // 启动健康检查
    this.startHealthCheck();
  }

  private async waitForReady(timeout = 30000): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (this.port && this.status === 'running') {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    throw new Error('Sidecar failed to start within timeout');
  }

  private startHealthCheck() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(async () => {
      const isHealthy = await this.healthCheck();
      if (!isHealthy && this.status === 'running') {
        console.warn('Sidecar health check failed');
        this.setStatus('error');
        this.emit('health-check-failed');
      }
    }, 10000); // 每10秒检查一次
  }

  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 清理资源
   */
  async dispose(): Promise<void> {
    await this.stop();
    this.removeAllListeners();
  }
}

// 单例实例
export const sidecarManager = new SidecarManager();