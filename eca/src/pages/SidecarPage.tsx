import React from 'react';
import { SidecarPanel } from '../components/sidecar/SidecarPanel';

export function SidecarPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">侧车进程管理</h1>
        <p className="text-muted-foreground mt-2">
          管理和控制Node.js爬虫侧车进程，执行电商平台数据爬取任务
        </p>
      </div>
      
      <SidecarPanel />
    </div>
  );
}