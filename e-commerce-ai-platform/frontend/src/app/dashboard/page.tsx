'use client';

import { useSystemStore, useTaskStore } from '@/store';
import { useAnalytics } from '@/hooks';

export default function DashboardPage() {
  const { systemStatus } = useSystemStore();
  const { tasks, activeTasks } = useTaskStore();
  const { data: analytics, isLoading } = useAnalytics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          仪表板
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          欢迎使用电商AI自动化平台
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <span className="text-blue-600 dark:text-blue-400 text-xl">📋</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                总任务数
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics?.totalTasks || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <span className="text-green-600 dark:text-green-400 text-xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                已完成任务
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics?.completedTasks || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <span className="text-yellow-600 dark:text-yellow-400 text-xl">⏳</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                运行中任务
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics?.runningTasks || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <span className="text-purple-600 dark:text-purple-400 text-xl">📦</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                产品总数
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics?.totalProducts || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 系统状态 */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          系统状态
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {systemStatus?.cpu || 0}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">CPU使用率</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {systemStatus?.memory || 0}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">内存使用率</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {systemStatus?.disk || 0}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">磁盘使用率</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              24h
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">运行时间</div>
          </div>
        </div>
      </div>

      {/* 最近任务 */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          最近任务
        </h2>
        <div className="space-y-3">
          {activeTasks.slice(0, 5).map((task) => (
            <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  task.status === 'running' ? 'bg-green-500' :
                  task.status === 'pending' ? 'bg-yellow-500' :
                  task.status === 'completed' ? 'bg-blue-500' :
                  'bg-red-500'
                }`}></div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {task.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {task.type} • {task.status}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {task.progress}%
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {new Date(task.updatedAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {activeTasks.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              暂无活动任务
            </div>
          )}
        </div>
      </div>
    </div>
  );
}