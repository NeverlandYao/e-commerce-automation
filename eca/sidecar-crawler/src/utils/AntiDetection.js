const UserAgent = require('user-agents');
const Logger = require('./Logger');

/**
 * 反检测工具类
 * 提供浏览器指纹伪装和反爬虫检测功能
 */
class AntiDetection {
  constructor() {
    this.logger = new Logger('AntiDetection');
    this.userAgentGenerator = new UserAgent();
  }

  /**
   * 获取随机User-Agent
   * @param {string} deviceCategory - 设备类型 (desktop, mobile)
   * @returns {string} User-Agent字符串
   */
  getRandomUserAgent(deviceCategory = 'desktop') {
    const userAgent = new UserAgent({ deviceCategory });
    return userAgent.toString();
  }

  /**
   * 获取浏览器启动参数（反检测）
   * @param {Object} options - 配置选项
   * @returns {Array} 启动参数数组
   */
  getBrowserArgs(options = {}) {
    const args = [
      // 基础反检测参数
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      
      // WebGL和Canvas指纹伪装
      '--disable-webgl',
      '--disable-webgl2',
      '--disable-canvas-aa',
      '--disable-2d-canvas-clip-aa',
      
      // 字体指纹伪装
      '--disable-font-subpixel-positioning',
      '--disable-features=TranslateUI',
      
      // 音频指纹伪装
      '--disable-audio-output',
      
      // 其他反检测
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-features=VizDisplayCompositor',
      '--disable-ipc-flooding-protection',
      
      // 禁用自动化检测
      '--disable-blink-features=AutomationControlled',
      '--disable-features=VizDisplayCompositor',
      
      // 内存和性能优化
      '--memory-pressure-off',
      '--max_old_space_size=4096'
    ];

    // 添加代理参数
    if (options.proxy) {
      args.push(`--proxy-server=${options.proxy}`);
    }

    // 无头模式
    if (options.headless !== false) {
      args.push('--headless=new');
    }

    // 窗口大小
    if (options.viewport) {
      args.push(`--window-size=${options.viewport.width},${options.viewport.height}`);
    }

    return args;
  }

  /**
   * 设置页面反检测脚本
   * @param {Page} page - Playwright页面对象
   * @param {Object} options - 配置选项
   */
  async setupPageAntiDetection(page, options = {}) {
    try {
      // 移除webdriver属性
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', {
          get: () => undefined,
        });
      });

      // 伪装Chrome运行时
      await page.addInitScript(() => {
        window.chrome = {
          runtime: {},
          loadTimes: function() {},
          csi: function() {},
          app: {}
        };
      });

      // 伪装权限API
      await page.addInitScript(() => {
        const originalQuery = window.navigator.permissions.query;
        return window.navigator.permissions.query = (parameters) => (
          parameters.name === 'notifications' ?
            Promise.resolve({ state: Notification.permission }) :
            originalQuery(parameters)
        );
      });

      // 伪装插件信息
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'plugins', {
          get: () => [
            {
              0: {
                type: "application/x-google-chrome-pdf",
                suffixes: "pdf",
                description: "Portable Document Format",
                enabledPlugin: Plugin
              },
              description: "Portable Document Format",
              filename: "internal-pdf-viewer",
              length: 1,
              name: "Chrome PDF Plugin"
            }
          ],
        });
      });

      // 伪装语言
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'languages', {
          get: () => ['zh-CN', 'zh', 'en'],
        });
      });

      // 设置随机User-Agent
      const userAgent = options.userAgent || this.getRandomUserAgent();
      await page.setUserAgent(userAgent);

      // 设置视口
      if (options.viewport) {
        await page.setViewportSize(options.viewport);
      } else {
        // 随机视口大小
        const viewports = [
          { width: 1920, height: 1080 },
          { width: 1366, height: 768 },
          { width: 1440, height: 900 },
          { width: 1536, height: 864 }
        ];
        const randomViewport = viewports[Math.floor(Math.random() * viewports.length)];
        await page.setViewportSize(randomViewport);
      }

      // 设置额外的HTTP头
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0'
      });

      this.logger.debug('Anti-detection setup completed for page');
    } catch (error) {
      this.logger.error('Failed to setup anti-detection:', error);
      throw error;
    }
  }

  /**
   * 随机延迟
   * @param {number} min - 最小延迟（毫秒）
   * @param {number} max - 最大延迟（毫秒）
   * @returns {Promise} 延迟Promise
   */
  async randomDelay(min = 1000, max = 3000) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    this.logger.debug(`Random delay: ${delay}ms`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * 模拟人类鼠标移动
   * @param {Page} page - Playwright页面对象
   * @param {Object} target - 目标位置 {x, y}
   */
  async humanMouseMove(page, target) {
    try {
      const current = await page.evaluate(() => ({
        x: window.mouseX || 0,
        y: window.mouseY || 0
      }));

      const steps = Math.floor(Math.random() * 10) + 5;
      const stepX = (target.x - current.x) / steps;
      const stepY = (target.y - current.y) / steps;

      for (let i = 0; i < steps; i++) {
        const x = current.x + stepX * i + (Math.random() - 0.5) * 2;
        const y = current.y + stepY * i + (Math.random() - 0.5) * 2;
        
        await page.mouse.move(x, y);
        await this.randomDelay(10, 50);
      }

      await page.mouse.move(target.x, target.y);
      
      // 记录鼠标位置
      await page.evaluate((pos) => {
        window.mouseX = pos.x;
        window.mouseY = pos.y;
      }, target);

      this.logger.debug(`Human mouse move to (${target.x}, ${target.y})`);
    } catch (error) {
      this.logger.error('Failed to perform human mouse move:', error);
    }
  }

  /**
   * 模拟人类打字
   * @param {Page} page - Playwright页面对象
   * @param {string} selector - 输入框选择器
   * @param {string} text - 要输入的文本
   */
  async humanType(page, selector, text) {
    try {
      await page.click(selector);
      await this.randomDelay(100, 300);

      for (const char of text) {
        await page.keyboard.type(char);
        await this.randomDelay(50, 150);
      }

      this.logger.debug(`Human typed text into ${selector}`);
    } catch (error) {
      this.logger.error('Failed to perform human typing:', error);
    }
  }

  /**
   * 检测页面是否被反爬虫系统拦截
   * @param {Page} page - Playwright页面对象
   * @returns {Promise<boolean>} 是否被拦截
   */
  async detectBlocking(page) {
    try {
      const content = await page.content();
      const title = await page.title();
      const url = page.url();

      // 常见的反爬虫拦截特征
      const blockingPatterns = [
        /验证码/i,
        /captcha/i,
        /robot/i,
        /blocked/i,
        /access denied/i,
        /请稍后再试/i,
        /too many requests/i,
        /rate limit/i,
        /cloudflare/i,
        /请开启javascript/i
      ];

      const isBlocked = blockingPatterns.some(pattern => 
        pattern.test(content) || pattern.test(title)
      );

      if (isBlocked) {
        this.logger.warn(`Blocking detected on ${url}`);
      }

      return isBlocked;
    } catch (error) {
      this.logger.error('Failed to detect blocking:', error);
      return false;
    }
  }

  /**
   * 获取随机设备指纹
   * @returns {Object} 设备指纹信息
   */
  getRandomFingerprint() {
    const screens = [
      { width: 1920, height: 1080, colorDepth: 24 },
      { width: 1366, height: 768, colorDepth: 24 },
      { width: 1440, height: 900, colorDepth: 24 },
      { width: 1536, height: 864, colorDepth: 24 }
    ];

    const timezones = [
      'Asia/Shanghai',
      'Asia/Beijing',
      'Asia/Chongqing'
    ];

    const languages = [
      ['zh-CN', 'zh', 'en'],
      ['zh-CN', 'en-US', 'en'],
      ['zh-CN', 'zh-TW', 'en']
    ];

    const screen = screens[Math.floor(Math.random() * screens.length)];
    const timezone = timezones[Math.floor(Math.random() * timezones.length)];
    const language = languages[Math.floor(Math.random() * languages.length)];

    return {
      screen,
      timezone,
      language,
      userAgent: this.getRandomUserAgent(),
      platform: 'Win32',
      hardwareConcurrency: Math.floor(Math.random() * 8) + 4
    };
  }
}

module.exports = AntiDetection;