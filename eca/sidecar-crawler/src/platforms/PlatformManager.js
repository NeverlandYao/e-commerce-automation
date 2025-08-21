const Logger = require('../utils/Logger');

class PlatformManager {
  constructor() {
    this.logger = new Logger('PlatformManager');
    this.platforms = new Map();
    this.loadPlatforms();
  }

  loadPlatforms() {
    try {
      // 动态加载平台适配器
      const TaobaoAdapter = require('./taobao');
      const JDAdapter = require('./jd');
      const AmazonAdapter = require('./amazon');
      
      this.platforms.set('taobao', new TaobaoAdapter());
      this.platforms.set('jd', new JDAdapter());
      this.platforms.set('amazon', new AmazonAdapter());
      
      this.logger.info(`Loaded ${this.platforms.size} platform adapters`);
    } catch (error) {
      this.logger.error('Failed to load platform adapters:', error);
    }
  }

  getPlatform(platformName) {
    const platform = this.platforms.get(platformName.toLowerCase());
    if (!platform) {
      throw new Error(`Unsupported platform: ${platformName}`);
    }
    return platform;
  }

  getSupportedPlatforms() {
    return Array.from(this.platforms.keys());
  }

  detectPlatform(url) {
    const urlLower = url.toLowerCase();
    
    if (urlLower.includes('taobao.com') || urlLower.includes('tmall.com')) {
      return 'taobao';
    }
    if (urlLower.includes('jd.com')) {
      return 'jd';
    }
    if (urlLower.includes('amazon.')) {
      return 'amazon';
    }
    
    return null;
  }

  async extractProductData(page, platform) {
    const adapter = this.getPlatform(platform);
    return await adapter.extractProductData(page);
  }

  async extractProductList(page, platform) {
    const adapter = this.getPlatform(platform);
    return await adapter.extractProductList(page);
  }

  async extractSearchResults(page, platform) {
    const adapter = this.getPlatform(platform);
    return await adapter.extractSearchResults(page);
  }

  getSearchUrl(keyword, platform) {
    const adapter = this.getPlatform(platform);
    return adapter.getSearchUrl(keyword);
  }

  getSelectors(platform) {
    const adapter = this.getPlatform(platform);
    return adapter.getSelectors();
  }

  getBrowserOptions(platform) {
    const adapter = this.getPlatform(platform);
    return adapter.getBrowserOptions();
  }
}

module.exports = { PlatformManager };