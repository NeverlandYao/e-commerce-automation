'use client';

import { useUIStore, useNotificationStore, useSystemStore } from '@/store';
import { cn } from '@/lib/utils';

export function Header() {
  const { theme, setTheme } = useUIStore();
  const { notifications, unreadCount } = useNotificationStore();
  const { systemStatus } = useSystemStore();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* 左侧：面包屑导航 */}
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            仪表板
          </h1>
        </div>

        {/* 右侧：操作按钮 */}
        <div className="flex items-center space-x-4">
          {/* 系统状态指示器 */}
          <div className="flex items-center space-x-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              systemStatus?.services.backend ? "bg-green-500" : "bg-red-500"
            )}></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {systemStatus?.services.backend ? '在线' : '离线'}
            </span>
          </div>

          {/* 通知按钮 */}
          <button className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
            <span className="text-lg">🔔</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* 主题切换按钮 */}
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <span className="text-lg">
              {theme === 'light' ? '🌙' : '☀️'}
            </span>
          </button>

          {/* 用户菜单 */}
          <div className="relative">
            <button className="flex items-center space-x-2 p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 text-sm">👤</span>
              </div>
              <span className="text-sm font-medium">管理员</span>
              <span className="text-xs">▼</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}