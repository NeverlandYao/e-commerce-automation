'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/store';
import { cn } from '@/lib/utils';

// 导航菜单项
const menuItems = [
  {
    name: '仪表板',
    href: '/dashboard',
    icon: '📊',
  },
  {
    name: '任务管理',
    href: '/tasks',
    icon: '📋',
  },
  {
    name: '产品管理',
    href: '/products',
    icon: '📦',
  },
  {
    name: '脚本管理',
    href: '/scripts',
    icon: '⚙️',
  },
  {
    name: '数据分析',
    href: '/analytics',
    icon: '📈',
  },
  {
    name: '系统设置',
    href: '/settings',
    icon: '⚙️',
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <div className={cn(
      "fixed left-0 top-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-40",
      sidebarCollapsed ? "w-16" : "w-64"
    )}>
      {/* Logo区域 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className={cn(
          "flex items-center space-x-2",
          sidebarCollapsed && "justify-center"
        )}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          {!sidebarCollapsed && (
            <span className="font-semibold text-gray-900 dark:text-white">
              电商AI平台
            </span>
          )}
        </div>
        
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <span className="text-gray-500 dark:text-gray-400">
            {sidebarCollapsed ? '→' : '←'}
          </span>
        </button>
      </div>

      {/* 导航菜单 */}
      <nav className="mt-4">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700",
                    sidebarCollapsed && "justify-center"
                  )}
                >
                  <span className="text-lg">{item.icon}</span>
                  {!sidebarCollapsed && (
                    <span className="ml-3">{item.name}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 底部用户信息 */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
        <div className={cn(
          "flex items-center",
          sidebarCollapsed ? "justify-center" : "space-x-3"
        )}>
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-600 text-sm">👤</span>
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                管理员
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                admin@example.com
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}