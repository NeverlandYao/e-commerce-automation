const { chromium, firefox, webkit } = require('playwright');
const Logger = require('../utils/Logger');
const ProxyManager = require('../utils/ProxyManager');
const AntiDetection = require('../utils/AntiDetection');

class CrawlerEngine {
  constructor() {
    this.logger = new Logger('CrawlerEngine');
    this.proxyManager = new ProxyManager();
    this.antiDetection = new AntiDetection();
    this.browsers = new Map(); // 浏览器实例池
    this.contexts = new Map(); // 浏览器上下文池
    this.activeTasks = new Map(); // 活跃任务
    this.taskQueue = [];
    this.maxConcurrentTasks = 3;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      this.logger.info('Initializing crawler engine...');
      
      // 初始化代理管理器
      this.proxyManager.initialize();
      
      // 反检测模块无需初始化
      
      this.isInitialized = true;
      this.logger.info('Crawler engine initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize crawler engine:', error);
      throw error;
    }
  }

  async executeCrawlTask(task) {
    if (!this.isInitialized) {
      throw new Error('Crawler engine not initialized');
    }

    const taskId = task.id || `task_${Date.now()}`;
    
    try {
      this.logger.info(`Starting crawl task: ${taskId}`);
      this.activeTasks.set(taskId, { ...task, startTime: Date.now() });
      
      // 根据任务类型选择执行策略
      let result;
      switch (task.type) {
        case 'single_product':
          result = await this.crawlSingleProduct(task);
          break;
        case 'product_list':
          result = await this.crawlProductList(task);
          break;
        case 'search_products':
          result = await this.searchProducts(task);
          break;
        case 'batch_crawl':
          result = await this.batchCrawl(task);
          break;
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }
      
      this.activeTasks.delete(taskId);
      this.logger.info(`Crawl task completed: ${taskId}`);
      
      return {
        taskId,
        success: true,
        data: result,
        executionTime: Date.now() - this.activeTasks.get(taskId)?.startTime || 0
      };
      
    } catch (error) {
      this.activeTasks.delete(taskId);
      this.logger.error(`Crawl task failed: ${taskId}`, error);
      throw error;
    }
  }

  async crawlSingleProduct(task) {
    const { url, platform, options = {} } = task;
    
    const context = await this.createBrowserContext({
      platform,
      proxy: options.proxy,
      userAgent: options.userAgent
    });
    
    try {
      const page = await context.newPage();
      
      // 应用反检测策略
      await this.antiDetection.applyToPage(page, platform);
      
      // 导航到目标页面
      await page.goto(url, { waitUntil: 'networkidle' });
      
      // 等待页面加载完成
      await this.waitForPageLoad(page, platform);
      
      // 提取商品数据
      const productData = await this.extractProductData(page, platform);
      
      return productData;
      
    } finally {
      await context.close();
    }
  }

  async crawlProductList(task) {
    const { url, platform, options = {} } = task;
    const { maxPages = 1, itemsPerPage = 20 } = options;
    
    const context = await this.createBrowserContext({ platform });
    const results = [];
    
    try {
      const page = await context.newPage();
      await this.antiDetection.applyToPage(page, platform);
      
      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        const pageUrl = this.buildPageUrl(url, pageNum, platform);
        await page.goto(pageUrl, { waitUntil: 'networkidle' });
        
        await this.waitForPageLoad(page, platform);
        
        const pageResults = await this.extractProductList(page, platform);
        results.push(...pageResults);
        
        // 检查是否有下一页
        const hasNextPage = await this.checkNextPage(page, platform);
        if (!hasNextPage) break;
        
        // 随机延迟
        await this.randomDelay(1000, 3000);
      }
      
      return results;
      
    } finally {
      await context.close();
    }
  }

  async searchProducts(task) {
    const { keyword, platform, options = {} } = task;
    const { maxResults = 50 } = options;
    
    const context = await this.createBrowserContext({ platform });
    
    try {
      const page = await context.newPage();
      await this.antiDetection.applyToPage(page, platform);
      
      // 导航到搜索页面
      const searchUrl = this.buildSearchUrl(keyword, platform);
      await page.goto(searchUrl, { waitUntil: 'networkidle' });
      
      await this.waitForPageLoad(page, platform);
      
      // 提取搜索结果
      const searchResults = await this.extractSearchResults(page, platform, maxResults);
      
      return searchResults;
      
    } finally {
      await context.close();
    }
  }

  async batchCrawl(task) {
    const { urls, platform, options = {} } = task;
    const { concurrency = 2 } = options;
    
    const results = [];
    const chunks = this.chunkArray(urls, concurrency);
    
    for (const chunk of chunks) {
      const chunkPromises = chunk.map(url => 
        this.crawlSingleProduct({ url, platform, options })
          .catch(error => ({ error: error.message, url }))
      );
      
      const chunkResults = await Promise.all(chunkPromises);
      results.push(...chunkResults);
      
      // 批次间延迟
      if (chunks.indexOf(chunk) < chunks.length - 1) {
        await this.randomDelay(2000, 5000);
      }
    }
    
    return results;
  }

  async createBrowserContext(options = {}) {
    const { platform, proxy, userAgent } = options;
    
    // 选择浏览器类型
    const browserType = this.selectBrowserType(platform);
    
    // 获取或创建浏览器实例
    let browser = this.browsers.get(browserType);
    if (!browser) {
      browser = await this.launchBrowser(browserType);
      this.browsers.set(browserType, browser);
    }
    
    // 创建浏览器上下文
    const contextOptions = {
      viewport: { width: 1920, height: 1080 },
      userAgent: userAgent || await this.antiDetection.getRandomUserAgent(),
      ...await this.antiDetection.getBrowserOptions(platform)
    };
    
    if (proxy) {
      contextOptions.proxy = await this.proxyManager.getProxy();
    }
    
    const context = await browser.newContext(contextOptions);
    
    return context;
  }

  async launchBrowser(browserType) {
    const launchOptions = {
      headless: process.env.NODE_ENV === 'production',
      args: [
        '--disable-blink-features=AutomationControlled',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    };
    
    let browser;
    switch (browserType) {
      case 'chromium':
        browser = await chromium.launch(launchOptions);
        break;
      case 'firefox':
        browser = await firefox.launch(launchOptions);
        break;
      case 'webkit':
        browser = await webkit.launch(launchOptions);
        break;
      default:
        browser = await chromium.launch(launchOptions);
    }
    
    return browser;
  }

  selectBrowserType(platform) {
    // 根据平台选择最适合的浏览器
    const browserMap = {
      'taobao': 'chromium',
      'jd': 'chromium',
      'amazon': 'firefox',
      'default': 'chromium'
    };
    
    return browserMap[platform] || browserMap.default;
  }

  async waitForPageLoad(page, platform) {
    // 平台特定的页面加载等待逻辑
    const selectors = {
      'taobao': '.tb-detail-hd',
      'jd': '.sku-name',
      'amazon': '#productTitle'
    };
    
    const selector = selectors[platform];
    if (selector) {
      await page.waitForSelector(selector, { timeout: 10000 }).catch(() => {});
    }
    
    // 通用等待
    await page.waitForTimeout(2000);
  }

  async extractProductData(page, platform) {
    // 这里应该调用平台特定的数据提取逻辑
    // 暂时返回基本信息
    return {
      title: await page.title(),
      url: page.url(),
      timestamp: new Date().toISOString(),
      platform
    };
  }

  async extractProductList(page, platform) {
    // 平台特定的商品列表提取逻辑
    return [];
  }

  async extractSearchResults(page, platform, maxResults) {
    // 平台特定的搜索结果提取逻辑
    return [];
  }

  buildPageUrl(baseUrl, pageNum, platform) {
    // 构建分页URL
    return `${baseUrl}&page=${pageNum}`;
  }

  buildSearchUrl(keyword, platform) {
    // 构建搜索URL
    const searchUrls = {
      'taobao': `https://s.taobao.com/search?q=${encodeURIComponent(keyword)}`,
      'jd': `https://search.jd.com/Search?keyword=${encodeURIComponent(keyword)}`,
      'amazon': `https://www.amazon.com/s?k=${encodeURIComponent(keyword)}`
    };
    
    return searchUrls[platform] || searchUrls.taobao;
  }

  async checkNextPage(page, platform) {
    // 检查是否有下一页
    return false;
  }

  async randomDelay(min, max) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  async getStatus() {
    return {
      isInitialized: this.isInitialized,
      activeTasks: this.activeTasks.size,
      queuedTasks: this.taskQueue.length,
      browsers: this.browsers.size,
      contexts: this.contexts.size,
      uptime: process.uptime(),
      memory: process.memoryUsage()
    };
  }

  async cleanup() {
    this.logger.info('Cleaning up crawler engine...');
    
    // 关闭所有浏览器实例
    for (const [type, browser] of this.browsers) {
      try {
        await browser.close();
        this.logger.info(`Closed ${type} browser`);
      } catch (error) {
        this.logger.error(`Error closing ${type} browser:`, error);
      }
    }
    
    this.browsers.clear();
    this.contexts.clear();
    this.activeTasks.clear();
    this.taskQueue = [];
    
    this.logger.info('Crawler engine cleanup completed');
  }
}

module.exports = { CrawlerEngine };