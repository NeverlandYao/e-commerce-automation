import React, { useState } from 'react';
import { useSidecar, useSidecarStatus, useSidecarTasks } from '../../services/sidecar/useSidecar';
import { CrawlTask } from '../../services/sidecar/SidecarManager';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Play, 
  Square, 
  RotateCcw, 
  Activity, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Globe,
  Search,
  ShoppingCart,
  List
} from 'lucide-react';

interface SidecarPanelProps {
  className?: string;
}

export function SidecarPanel({ className }: SidecarPanelProps) {
  const sidecar = useSidecar();
  const { status, port, uptime, isRunning, isStarting } = useSidecarStatus();
  const { activeTasks, completedCount, failedCount, totalTasks } = useSidecarTasks();
  
  const [crawlForm, setCrawlForm] = useState({
    type: 'product' as CrawlTask['type'],
    url: '',
    keyword: '',
    platform: 'taobao',
    options: {
      timeout: 30000,
      retries: 3,
      maxResults: 20
    }
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const handleStart = async () => {
    try {
      await sidecar.start();
    } catch (error) {
      console.error('Failed to start sidecar:', error);
    }
  };

  const handleStop = async () => {
    try {
      await sidecar.stop();
    } catch (error) {
      console.error('Failed to stop sidecar:', error);
    }
  };

  const handleRestart = async () => {
    try {
      await sidecar.restart();
    } catch (error) {
      console.error('Failed to restart sidecar:', error);
    }
  };

  const handleCrawl = async () => {
    if (!isRunning) {
      alert('请先启动侧车进程');
      return;
    }

    setIsSubmitting(true);
    try {
      const task: Omit<CrawlTask, 'id'> = {
        type: crawlForm.type,
        platform: crawlForm.platform,
        options: crawlForm.options
      };

      if (crawlForm.type === 'search') {
        task.keyword = crawlForm.keyword;
      } else {
        task.url = crawlForm.url;
      }

      const result = await sidecar.crawl(task);
      setLastResult(result);
      
      if (result.success) {
        alert('爬取任务完成！');
      } else {
        alert(`爬取任务失败: ${result.error}`);
      }
    } catch (error) {
      console.error('Crawl failed:', error);
      alert(`爬取失败: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500';
      case 'starting': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <CheckCircle className="h-4 w-4" />;
      case 'starting': return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'error': return <XCircle className="h-4 w-4" />;
      default: return <Square className="h-4 w-4" />;
    }
  };

  const formatUptime = (uptime?: number) => {
    if (!uptime) return 'N/A';
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 状态卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            侧车进程状态
          </CardTitle>
          <CardDescription>
            Node.js 爬虫侧车进程管理
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 状态指示器 */}
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`} />
              <div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(status)}
                  <span className="font-medium capitalize">{status}</span>
                </div>
                {port && (
                  <div className="text-sm text-muted-foreground">
                    端口: {port}
                  </div>
                )}
              </div>
            </div>

            {/* 运行时间 */}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">运行时间</div>
                <div className="text-sm text-muted-foreground">
                  {formatUptime(uptime)}
                </div>
              </div>
            </div>

            {/* 任务统计 */}
            <div className="flex items-center gap-2">
              <List className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="font-medium">任务统计</div>
                <div className="text-sm text-muted-foreground">
                  活跃: {activeTasks.length} | 完成: {completedCount} | 失败: {failedCount}
                </div>
              </div>
            </div>
          </div>

          {/* 控制按钮 */}
          <div className="flex gap-2 mt-4">
            <Button 
              onClick={handleStart} 
              disabled={isRunning || isStarting}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              启动
            </Button>
            <Button 
              onClick={handleStop} 
              disabled={!isRunning && !isStarting}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Square className="h-4 w-4" />
              停止
            </Button>
            <Button 
              onClick={handleRestart} 
              disabled={isStarting}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              重启
            </Button>
          </div>

          {/* 错误提示 */}
          {sidecar.error && (
            <Alert className="mt-4">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                {sidecar.error}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* 爬取任务 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            爬取任务
          </CardTitle>
          <CardDescription>
            配置和执行爬取任务
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="single" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single">单个任务</TabsTrigger>
              <TabsTrigger value="batch">批量任务</TabsTrigger>
            </TabsList>
            
            <TabsContent value="single" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 任务类型 */}
                <div className="space-y-2">
                  <Label htmlFor="task-type">任务类型</Label>
                  <Select 
                    value={crawlForm.type} 
                    onValueChange={(value: CrawlTask['type']) => 
                      setCrawlForm(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product">
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="h-4 w-4" />
                          商品详情
                        </div>
                      </SelectItem>
                      <SelectItem value="search">
                        <div className="flex items-center gap-2">
                          <Search className="h-4 w-4" />
                          搜索结果
                        </div>
                      </SelectItem>
                      <SelectItem value="list">
                        <div className="flex items-center gap-2">
                          <List className="h-4 w-4" />
                          商品列表
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 平台选择 */}
                <div className="space-y-2">
                  <Label htmlFor="platform">平台</Label>
                  <Select 
                    value={crawlForm.platform} 
                    onValueChange={(value: string) => 
                      setCrawlForm(prev => ({ ...prev, platform: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sidecar.supportedPlatforms.map(platform => (
                        <SelectItem key={platform} value={platform}>
                          {platform.toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* URL或关键词输入 */}
              {crawlForm.type === 'search' ? (
                <div className="space-y-2">
                  <Label htmlFor="keyword">搜索关键词</Label>
                  <Input
                    id="keyword"
                    placeholder="输入搜索关键词..."
                    value={crawlForm.keyword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCrawlForm(prev => ({ ...prev, keyword: e.target.value }))}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="url">目标URL</Label>
                  <Input
                    id="url"
                    placeholder="输入要爬取的URL..."
                    value={crawlForm.url}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCrawlForm(prev => ({ ...prev, url: e.target.value }))}
                  />
                </div>
              )}

              {/* 高级选项 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timeout">超时时间 (ms)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    value={crawlForm.options.timeout}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCrawlForm(prev => ({
                      ...prev,
                      options: { ...prev.options, timeout: parseInt(e.target.value) }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retries">重试次数</Label>
                  <Input
                    id="retries"
                    type="number"
                    value={crawlForm.options.retries}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCrawlForm(prev => ({
                      ...prev,
                      options: { ...prev.options, retries: parseInt(e.target.value) }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxResults">最大结果数</Label>
                  <Input
                    id="maxResults"
                    type="number"
                    value={crawlForm.options.maxResults}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCrawlForm(prev => ({
                      ...prev,
                      options: { ...prev.options, maxResults: parseInt(e.target.value) }
                    }))}
                  />
                </div>
              </div>

              {/* 执行按钮 */}
              <Button 
                onClick={handleCrawl} 
                disabled={!isRunning || isSubmitting || (!crawlForm.url && !crawlForm.keyword)}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    执行中...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    执行爬取
                  </>
                )}
              </Button>
            </TabsContent>
            
            <TabsContent value="batch">
              <div className="text-center py-8 text-muted-foreground">
                批量任务功能开发中...
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 活跃任务 */}
      {activeTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>活跃任务</CardTitle>
            <CardDescription>
              当前正在执行的爬取任务
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activeTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{task.type}</Badge>
                    <span className="font-medium">{task.platform}</span>
                    <span className="text-sm text-muted-foreground truncate max-w-xs">
                      {task.url || task.keyword}
                    </span>
                  </div>
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 最后结果 */}
      {lastResult && (
        <Card>
          <CardHeader>
            <CardTitle>最后执行结果</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={JSON.stringify(lastResult, null, 2)}
              readOnly
              className="min-h-[200px] font-mono text-sm"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}