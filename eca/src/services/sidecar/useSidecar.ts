import { useState, useEffect, useCallback, useRef } from 'react';
import { sidecarManager, SidecarStatus, CrawlTask, CrawlResult } from './SidecarManager';

export interface UseSidecarReturn {
  // 状态
  status: SidecarStatus;
  isRunning: boolean;
  isStarting: boolean;
  error: string | null;
  
  // 操作
  start: () => Promise<void>;
  stop: () => Promise<void>;
  restart: () => Promise<void>;
  crawl: (task: Omit<CrawlTask, 'id'>) => Promise<CrawlResult>;
  
  // 数据
  activeTasks: CrawlTask[];
  supportedPlatforms: string[];
}

export function useSidecar(): UseSidecarReturn {
  const [status, setStatus] = useState<SidecarStatus>({
    status: 'stopped',
    activeTasks: 0,
    completedTasks: 0,
    failedTasks: 0,
    supportedPlatforms: []
  });
  const [error, setError] = useState<string | null>(null);
  const [activeTasks, setActiveTasks] = useState<CrawlTask[]>([]);
  const statusUpdateInterval = useRef<NodeJS.Timeout | null>(null);

  // 更新状态
  const updateStatus = useCallback(async () => {
    try {
      const newStatus = await sidecarManager.getStatus();
      setStatus(newStatus);
      setActiveTasks(sidecarManager.getActiveTasks());
      
      // 如果状态正常，清除错误
      if (newStatus.status === 'running') {
        setError(null);
      }
    } catch (err) {
      console.warn('Failed to update sidecar status:', err);
    }
  }, []);

  // 启动侧车进程
  const start = useCallback(async () => {
    try {
      setError(null);
      await sidecarManager.start();
      await updateStatus();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      throw err;
    }
  }, [updateStatus]);

  // 停止侧车进程
  const stop = useCallback(async () => {
    try {
      setError(null);
      await sidecarManager.stop();
      await updateStatus();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      throw err;
    }
  }, [updateStatus]);

  // 重启侧车进程
  const restart = useCallback(async () => {
    try {
      setError(null);
      await sidecarManager.restart();
      await updateStatus();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      throw err;
    }
  }, [updateStatus]);

  // 执行爬取任务
  const crawl = useCallback(async (task: Omit<CrawlTask, 'id'>) => {
    try {
      const result = await sidecarManager.crawl(task);
      await updateStatus(); // 更新任务计数
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      throw err;
    }
  }, [updateStatus]);

  // 设置事件监听器
  useEffect(() => {
    const handleStatusChange = (newStatus: SidecarStatus['status']) => {
      setStatus(prev => ({ ...prev, status: newStatus }));
    };

    const handleError = (err: Error) => {
      setError(err.message);
      setStatus(prev => ({ ...prev, status: 'error' }));
    };

    const handleTaskStarted = () => {
      updateStatus();
    };

    const handleTaskCompleted = () => {
      updateStatus();
    };

    const handleHealthCheckFailed = () => {
      setError('Sidecar health check failed');
    };

    // 注册事件监听器
    sidecarManager.on('status-change', handleStatusChange);
    sidecarManager.on('error', handleError);
    sidecarManager.on('task-started', handleTaskStarted);
    sidecarManager.on('task-completed', handleTaskCompleted);
    sidecarManager.on('health-check-failed', handleHealthCheckFailed);

    // 初始状态更新
    updateStatus();

    // 定期更新状态
    statusUpdateInterval.current = setInterval(updateStatus, 5000);

    return () => {
      // 清理事件监听器
      sidecarManager.off('status-change', handleStatusChange);
      sidecarManager.off('error', handleError);
      sidecarManager.off('task-started', handleTaskStarted);
      sidecarManager.off('task-completed', handleTaskCompleted);
      sidecarManager.off('health-check-failed', handleHealthCheckFailed);

      // 清理定时器
      if (statusUpdateInterval.current) {
        clearInterval(statusUpdateInterval.current);
      }
    };
  }, [updateStatus]);

  return {
    status,
    isRunning: status.status === 'running',
    isStarting: status.status === 'starting',
    error,
    start,
    stop,
    restart,
    crawl,
    activeTasks,
    supportedPlatforms: status.supportedPlatforms
  };
}

// 侧车进程状态Hook
export function useSidecarStatus() {
  const [status, setStatus] = useState<SidecarStatus['status']>('stopped');
  const [port, setPort] = useState<number | null>(null);
  const [uptime, setUptime] = useState<number | undefined>(undefined);

  useEffect(() => {
    const updateStatus = async () => {
      try {
        const sidecarStatus = await sidecarManager.getStatus();
        setStatus(sidecarStatus.status);
        setPort(sidecarStatus.port || null);
        setUptime(sidecarStatus.uptime);
      } catch (error) {
        console.warn('Failed to get sidecar status:', error);
      }
    };

    const handleStatusChange = (newStatus: SidecarStatus['status']) => {
      setStatus(newStatus);
    };

    sidecarManager.on('status-change', handleStatusChange);
    updateStatus();

    const interval = setInterval(updateStatus, 3000);

    return () => {
      sidecarManager.off('status-change', handleStatusChange);
      clearInterval(interval);
    };
  }, []);

  return {
    status,
    port,
    uptime,
    isRunning: status === 'running',
    isStarting: status === 'starting',
    isStopped: status === 'stopped',
    hasError: status === 'error'
  };
}

// 任务管理Hook
export function useSidecarTasks() {
  const [tasks, setTasks] = useState<CrawlTask[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);

  useEffect(() => {
    const updateTasks = async () => {
      try {
        const status = await sidecarManager.getStatus();
        setTasks(sidecarManager.getActiveTasks());
        setCompletedCount(status.completedTasks);
        setFailedCount(status.failedTasks);
      } catch (error) {
        console.warn('Failed to update tasks:', error);
      }
    };

    const handleTaskStarted = () => {
      updateTasks();
    };

    const handleTaskCompleted = () => {
      updateTasks();
    };

    sidecarManager.on('task-started', handleTaskStarted);
    sidecarManager.on('task-completed', handleTaskCompleted);
    updateTasks();

    const interval = setInterval(updateTasks, 2000);

    return () => {
      sidecarManager.off('task-started', handleTaskStarted);
      sidecarManager.off('task-completed', handleTaskCompleted);
      clearInterval(interval);
    };
  }, []);

  return {
    activeTasks: tasks,
    completedCount,
    failedCount,
    totalTasks: completedCount + failedCount + tasks.length
  };
}