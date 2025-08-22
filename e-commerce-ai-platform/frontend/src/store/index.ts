import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// 用户状态接口
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

// 任务状态接口
interface Task {
  id: string;
  name: string;
  type: 'crawler' | 'publisher' | 'analysis';
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  createdAt: string;
  updatedAt: string;
}

// 系统状态接口
interface SystemStatus {
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
}

// 通知接口
interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

// 应用状态接口
interface AppState {
  // 用户状态
  user: User | null;
  isAuthenticated: boolean;
  
  // UI状态
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  
  // 任务状态
  tasks: Task[];
  activeTasks: Task[];
  
  // 系统状态
  systemStatus: SystemStatus | null;
  
  // 通知状态
  notifications: Notification[];
  
  // Actions
  setUser: (user: User | null) => void;
  setAuthenticated: (authenticated: boolean) => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setTasks: (tasks: Task[]) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  addTask: (task: Task) => void;
  removeTask: (taskId: string) => void;
  setSystemStatus: (status: SystemStatus) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
}

// 创建应用状态store
export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        // 初始状态
        user: null,
        isAuthenticated: false,
        sidebarCollapsed: false,
        theme: 'light',
        tasks: [],
        activeTasks: [],
        systemStatus: null,
        notifications: [],

        // Actions
        setUser: (user: User | null) => set({ user, isAuthenticated: !!user }),
        
        setAuthenticated: (authenticated: boolean) => set({ isAuthenticated: authenticated }),
        
        toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
        
        setTheme: (theme: 'light' | 'dark') => set({ theme }),
        
        setTasks: (tasks: Task[]) => {
          const activeTasks = tasks.filter(task => 
            task.status === 'running' || task.status === 'pending'
          );
          set({ tasks, activeTasks });
        },
        
        updateTask: (taskId: string, updates: Partial<Task>) => set((state) => {
          const tasks = state.tasks.map(task => 
            task.id === taskId ? { ...task, ...updates } : task
          );
          const activeTasks = tasks.filter(task => 
            task.status === 'running' || task.status === 'pending'
          );
          return { tasks, activeTasks };
        }),
        
        addTask: (task: Task) => set((state) => {
          const tasks = [...state.tasks, task];
          const activeTasks = tasks.filter(t => 
            t.status === 'running' || t.status === 'pending'
          );
          return { tasks, activeTasks };
        }),
        
        removeTask: (taskId: string) => set((state) => {
          const tasks = state.tasks.filter(task => task.id !== taskId);
          const activeTasks = tasks.filter(task => 
            task.status === 'running' || task.status === 'pending'
          );
          return { tasks, activeTasks };
        }),
        
        setSystemStatus: (systemStatus: SystemStatus) => set({ systemStatus }),
        
        addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => set((state) => ({
          notifications: [
            {
              ...notification,
              id: Date.now().toString(),
              timestamp: new Date().toISOString(),
              read: false,
            },
            ...state.notifications,
          ].slice(0, 50), // 最多保留50条通知
        })),
        
        markNotificationRead: (id: string) => set((state) => ({
          notifications: state.notifications.map(notification =>
            notification.id === id ? { ...notification, read: true } : notification
          ),
        })),
        
        clearNotifications: () => set({ notifications: [] }),
      }),
      {
        name: 'ecommerce-ai-store',
        partialize: (state) => ({
          theme: state.theme,
          sidebarCollapsed: state.sidebarCollapsed,
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: 'ecommerce-ai-store',
    }
  )
);

// 任务管理相关的hooks
export const useTaskStore = () => {
  const tasks = useAppStore((state) => state.tasks);
  const activeTasks = useAppStore((state) => state.activeTasks);
  const setTasks = useAppStore((state) => state.setTasks);
  const updateTask = useAppStore((state) => state.updateTask);
  const addTask = useAppStore((state) => state.addTask);
  const removeTask = useAppStore((state) => state.removeTask);
  
  return {
    tasks,
    activeTasks,
    setTasks,
    updateTask,
    addTask,
    removeTask,
  };
};

// 用户状态相关的hooks
export const useAuthStore = () => {
  const user = useAppStore((state) => state.user);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const setUser = useAppStore((state) => state.setUser);
  const setAuthenticated = useAppStore((state) => state.setAuthenticated);
  
  return {
    user,
    isAuthenticated,
    setUser,
    setAuthenticated,
  };
};

// UI状态相关的hooks
export const useUIStore = () => {
  const sidebarCollapsed = useAppStore((state) => state.sidebarCollapsed);
  const theme = useAppStore((state) => state.theme);
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);
  const setTheme = useAppStore((state) => state.setTheme);
  
  return {
    sidebarCollapsed,
    theme,
    toggleSidebar,
    setTheme,
  };
};

// 通知相关的hooks
export const useNotificationStore = () => {
  const notifications = useAppStore((state) => state.notifications);
  const addNotification = useAppStore((state) => state.addNotification);
  const markNotificationRead = useAppStore((state) => state.markNotificationRead);
  const clearNotifications = useAppStore((state) => state.clearNotifications);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return {
    notifications,
    unreadCount,
    addNotification,
    markNotificationRead,
    clearNotifications,
  };
};

// 系统状态相关的hooks
export const useSystemStore = () => {
  const systemStatus = useAppStore((state) => state.systemStatus);
  const setSystemStatus = useAppStore((state) => state.setSystemStatus);
  
  return {
    systemStatus,
    setSystemStatus,
  };
};