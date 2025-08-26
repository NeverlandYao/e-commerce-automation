import { Hono } from 'hono'

const websocketRoutes = new Hono()

// WebSocket连接管理
const connections = new Map<string, any>()
const subscriptions = new Map<string, Set<string>>()

// ==================== WebSocket连接处理 ====================

// WebSocket连接信息端点
websocketRoutes.get('/info', async (c) => {
  return c.json({
    success: true,
    data: {
      websocket_endpoint: '/api/websocket/connect',
      supported_protocols: ['ws', 'wss'],
      supported_channels: [
        'task_updates',
        'system_status', 
        'crawler_logs',
        'publisher_logs',
        'ai_analysis_logs',
        'notifications',
        'system_alerts',
        'performance_metrics'
      ],
      connection_info: {
        heartbeat_interval: 30000,
        max_message_size: '1MB',
        max_connections: 1000,
        compression: 'gzip'
      },
      message_types: {
        client_to_server: ['subscribe', 'unsubscribe', 'ping', 'get_status'],
        server_to_client: ['connection_established', 'subscription_confirmed', 'task_status_update', 'system_status_update', 'log_message', 'notification', 'system_alert', 'performance_update', 'pong', 'error']
      },
      example_usage: {
        subscribe: {
          type: 'subscribe',
          data: {
            channels: ['task_updates', 'system_status']
          }
        },
        unsubscribe: {
          type: 'unsubscribe', 
          data: {
            channels: ['task_updates']
          }
        }
      }
    },
    message: 'WebSocket连接信息获取成功'
  })
})

// 处理WebSocket消息
function handleWebSocketMessage(ws: WebSocket, message: any) {
  const { type, data } = message
  
  switch (type) {
    case 'subscribe':
      handleSubscribe(ws, data)
      break
    case 'unsubscribe':
      handleUnsubscribe(ws, data)
      break
    case 'ping':
      handlePing(ws, data)
      break
    case 'get_status':
      handleGetStatus(ws, data)
      break
    default:
      ws.send(JSON.stringify({
        type: 'error',
        data: {
          error: 'unknown_message_type',
          message: `未知的消息类型: ${type}`
        },
        timestamp: new Date().toISOString()
      }))
  }
}

// 处理订阅
function handleSubscribe(ws: WebSocket, data: any) {
  const { channels } = data
  const connectionId = getConnectionId(ws)
  
  if (!connectionId) {
    ws.send(JSON.stringify({
      type: 'error',
      data: {
        error: 'connection_not_found',
        message: '连接未找到'
      },
      timestamp: new Date().toISOString()
    }))
    return
  }
  
  const subscribedChannels: string[] = []
  
  channels.forEach((channel: string) => {
    if (!subscriptions.has(channel)) {
      subscriptions.set(channel, new Set())
    }
    subscriptions.get(channel)!.add(connectionId)
    subscribedChannels.push(channel)
  })
  
  ws.send(JSON.stringify({
    type: 'subscription_confirmed',
    data: {
      subscribed_channels: subscribedChannels,
      total_subscriptions: subscribedChannels.length,
      connection_id: connectionId
    },
    timestamp: new Date().toISOString()
  }))
}

// 处理取消订阅
function handleUnsubscribe(ws: WebSocket, data: any) {
  const { channels } = data
  const connectionId = getConnectionId(ws)
  
  if (!connectionId) return
  
  const unsubscribedChannels: string[] = []
  
  channels.forEach((channel: string) => {
    if (subscriptions.has(channel)) {
      subscriptions.get(channel)!.delete(connectionId)
      if (subscriptions.get(channel)!.size === 0) {
        subscriptions.delete(channel)
      }
      unsubscribedChannels.push(channel)
    }
  })
  
  ws.send(JSON.stringify({
    type: 'unsubscription_confirmed',
    data: {
      unsubscribed_channels: unsubscribedChannels,
      connection_id: connectionId
    },
    timestamp: new Date().toISOString()
  }))
}

// 处理心跳
function handlePing(ws: WebSocket, data: any) {
  ws.send(JSON.stringify({
    type: 'pong',
    data: {
      server_time: new Date().toISOString(),
      client_timestamp: data?.timestamp
    },
    timestamp: new Date().toISOString()
  }))
}

// 处理状态查询
function handleGetStatus(ws: WebSocket, data: any) {
  const connectionId = getConnectionId(ws)
  const userSubscriptions = []
  
  for (const [channel, subscribers] of subscriptions.entries()) {
    if (connectionId && subscribers.has(connectionId)) {
      userSubscriptions.push(channel)
    }
  }
  
  ws.send(JSON.stringify({
    type: 'status_response',
    data: {
      connection_id: connectionId,
      subscribed_channels: userSubscriptions,
      total_connections: connections.size,
      server_uptime: process.uptime(),
      server_time: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  }))
}

// 获取连接ID
function getConnectionId(ws: WebSocket): string | null {
  for (const [connId, connection] of connections.entries()) {
    if (connection === ws) {
      return connId
    }
  }
  return null
}

// ==================== 广播函数 ====================

// 广播任务状态更新
export function broadcastTaskUpdate(taskData: any) {
  broadcast('task_updates', {
    type: 'task_status_update',
    data: {
      task_id: taskData.task_id,
      status: taskData.status,
      progress: taskData.progress,
      message: taskData.message,
      updated_at: new Date().toISOString(),
      details: taskData.details
    }
  })
}

// 广播系统状态
export function broadcastSystemStatus(systemData: any) {
  broadcast('system_status', {
    type: 'system_status_update',
    data: {
      cpu_usage: systemData.cpu_usage,
      memory_usage: systemData.memory_usage,
      disk_usage: systemData.disk_usage,
      active_connections: connections.size,
      active_tasks: systemData.active_tasks,
      system_health: systemData.health,
      timestamp: new Date().toISOString()
    }
  })
}

// 广播日志消息
export function broadcastLog(channel: string, logData: any) {
  broadcast(channel, {
    type: 'log_message',
    data: {
      level: logData.level,
      message: logData.message,
      source: logData.source,
      task_id: logData.task_id,
      timestamp: new Date().toISOString(),
      metadata: logData.metadata
    }
  })
}

// 广播通知
export function broadcastNotification(notificationData: any) {
  broadcast('notifications', {
    type: 'notification',
    data: {
      id: 'notif_' + Date.now(),
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type || 'info',
      priority: notificationData.priority || 'medium',
      actions: notificationData.actions || [],
      expires_at: notificationData.expires_at,
      created_at: new Date().toISOString()
    }
  })
}

// 广播系统警报
export function broadcastAlert(alertData: any) {
  broadcast('system_alerts', {
    type: 'system_alert',
    data: {
      id: 'alert_' + Date.now(),
      severity: alertData.severity,
      title: alertData.title,
      description: alertData.description,
      source: alertData.source,
      affected_services: alertData.affected_services || [],
      recommended_actions: alertData.recommended_actions || [],
      created_at: new Date().toISOString()
    }
  })
}

// 广播性能指标
export function broadcastPerformanceMetrics(metricsData: any) {
  broadcast('performance_metrics', {
    type: 'performance_update',
    data: {
      metrics: {
        response_time: metricsData.response_time,
        throughput: metricsData.throughput,
        error_rate: metricsData.error_rate,
        queue_length: metricsData.queue_length,
        active_workers: metricsData.active_workers
      },
      trends: metricsData.trends || {},
      timestamp: new Date().toISOString()
    }
  })
}

// 通用广播函数
function broadcast(channel: string, message: any) {
  const subscribers = subscriptions.get(channel)
  if (!subscribers || subscribers.size === 0) {
    return
  }
  
  const messageStr = JSON.stringify({
    ...message,
    channel,
    timestamp: new Date().toISOString()
  })
  
  subscribers.forEach(connectionId => {
    const ws = connections.get(connectionId)
    if (ws && ws.readyState === WebSocket.OPEN) {
      try {
        ws.send(messageStr)
      } catch (error) {
        console.error(`发送消息到连接 ${connectionId} 失败:`, error)
        // 清理无效连接
        connections.delete(connectionId)
        subscribers.delete(connectionId)
      }
    } else {
      // 清理无效连接
      connections.delete(connectionId)
      subscribers.delete(connectionId)
    }
  })
}

// ==================== REST API端点 ====================

// 获取WebSocket连接统计
websocketRoutes.get('/stats', async (c) => {
  const channelStats = Array.from(subscriptions.entries()).map(([channel, subscribers]) => ({
    channel,
    subscriber_count: subscribers.size,
    subscribers: Array.from(subscribers)
  }))
  
  return c.json({
    success: true,
    data: {
      total_connections: connections.size,
      total_channels: subscriptions.size,
      channels: channelStats,
      server_uptime: process.uptime(),
      memory_usage: process.memoryUsage(),
      last_updated: new Date().toISOString()
    },
    message: '获取WebSocket统计成功'
  })
})

// 发送广播消息（用于测试）
websocketRoutes.post('/broadcast', async (c) => {
  const body = await c.req.json()
  const { channel, message } = body
  
  broadcast(channel, {
    type: 'broadcast_message',
    data: message
  })
  
  return c.json({
    success: true,
    data: {
      channel,
      message,
      subscribers_notified: subscriptions.get(channel)?.size || 0,
      broadcast_at: new Date().toISOString()
    },
    message: '广播消息发送成功'
  })
})

export { websocketRoutes }