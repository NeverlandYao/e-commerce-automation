#!/usr/bin/env node

const http = require('http');
const { CrawlerEngine } = require('./crawler/CrawlerEngine');
const { PlatformManager } = require('./platforms/PlatformManager');
const Logger = require('./utils/Logger');

class CrawlerSidecar {
  constructor() {
    this.engine = new CrawlerEngine();
    this.platformManager = new PlatformManager();
    this.logger = new Logger('CrawlerSidecar');
    this.server = null;
    this.port = null;
  }

  async start() {
    try {
      // 初始化爬虫引擎
      await this.engine.initialize();
      
      // 启动HTTP服务器用于接收任务
      this.server = http.createServer(this.handleRequest.bind(this));
      
      // 监听随机端口
      this.server.listen(0, '127.0.0.1', () => {
        this.port = this.server.address().port;
        // 输出端口号供主应用获取
        console.log(`SIDECAR_PORT:${this.port}`);
        this.logger.info(`Crawler sidecar started on port ${this.port}`);
      });

      // 处理进程退出
      process.on('SIGINT', this.shutdown.bind(this));
      process.on('SIGTERM', this.shutdown.bind(this));
      
    } catch (error) {
      this.logger.error('Failed to start sidecar:', error);
      process.exit(1);
    }
  }

  async handleRequest(req, res) {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    try {
      if (req.method === 'POST' && req.url === '/crawl') {
        await this.handleCrawlRequest(req, res);
      } else if (req.method === 'GET' && req.url === '/health') {
        await this.handleHealthCheck(req, res);
      } else if (req.method === 'GET' && req.url === '/status') {
        await this.handleStatusRequest(req, res);
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
      }
    } catch (error) {
      this.logger.error('Request handling error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal Server Error' }));
    }
  }

  async handleCrawlRequest(req, res) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const task = JSON.parse(body);
        this.logger.info('Received crawl task:', task.id || 'unknown');
        
        const result = await this.engine.executeCrawlTask(task);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          data: result,
          timestamp: new Date().toISOString()
        }));
        
        this.logger.info('Crawl task completed:', task.id || 'unknown');
      } catch (error) {
        this.logger.error('Crawl task failed:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        }));
      }
    });
  }

  async handleHealthCheck(req, res) {
    const health = {
      status: 'healthy',
      port: this.port,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    };
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(health));
  }

  async handleStatusRequest(req, res) {
    const status = await this.engine.getStatus();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(status));
  }

  async shutdown() {
    this.logger.info('Shutting down crawler sidecar...');
    
    if (this.server) {
      this.server.close();
    }
    
    if (this.engine) {
      await this.engine.cleanup();
    }
    
    process.exit(0);
  }
}

// 启动侧车进程
if (require.main === module) {
  const sidecar = new CrawlerSidecar();
  sidecar.start().catch(error => {
    console.error('Failed to start sidecar:', error);
    process.exit(1);
  });
}

module.exports = { CrawlerSidecar };