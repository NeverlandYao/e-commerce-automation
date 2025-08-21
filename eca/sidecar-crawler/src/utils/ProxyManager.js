const { ProxyAgent } = require('proxy-agent');
const Logger = require('./Logger');

/**
 * 代理管理器
 * 负责管理和轮换代理服务器
 */
class ProxyManager {
  constructor() {
    this.proxies = [];
    this.currentIndex = 0;
    this.failedProxies = new Set();
    this.logger = new Logger('ProxyManager');
  }

  /**
   * 初始化代理列表
   * @param {Array} proxies - 代理配置列表
   */
  initialize(proxies = []) {
    this.proxies = proxies.filter(proxy => proxy && proxy.url);
    this.currentIndex = 0;
    this.failedProxies.clear();
    
    this.logger.info(`Initialized with ${this.proxies.length} proxies`);
  }

  /**
   * 获取下一个可用代理
   * @returns {Object|null} 代理配置或null
   */
  getNextProxy() {
    if (this.proxies.length === 0) {
      return null;
    }

    const availableProxies = this.proxies.filter(
      (_, index) => !this.failedProxies.has(index)
    );

    if (availableProxies.length === 0) {
      this.logger.warn('All proxies failed, resetting failed list');
      this.failedProxies.clear();
      return this.proxies[0];
    }

    const proxy = this.proxies[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.proxies.length;

    // 跳过失败的代理
    if (this.failedProxies.has(this.currentIndex - 1)) {
      return this.getNextProxy();
    }

    return proxy;
  }

  /**
   * 创建代理Agent
   * @param {Object} proxy - 代理配置
   * @returns {ProxyAgent|null} 代理Agent或null
   */
  createProxyAgent(proxy) {
    if (!proxy || !proxy.url) {
      return null;
    }

    try {
      const agent = new ProxyAgent({
        uri: proxy.url,
        timeout: proxy.timeout || 10000,
        ...(proxy.auth && {
          auth: proxy.auth
        })
      });

      this.logger.debug(`Created proxy agent for ${proxy.url}`);
      return agent;
    } catch (error) {
      this.logger.error(`Failed to create proxy agent for ${proxy.url}:`, error);
      return null;
    }
  }

  /**
   * 标记代理为失败
   * @param {Object} proxy - 失败的代理配置
   */
  markProxyFailed(proxy) {
    const index = this.proxies.findIndex(p => p.url === proxy.url);
    if (index !== -1) {
      this.failedProxies.add(index);
      this.logger.warn(`Marked proxy as failed: ${proxy.url}`);
    }
  }

  /**
   * 测试代理连接
   * @param {Object} proxy - 代理配置
   * @returns {Promise<boolean>} 是否连接成功
   */
  async testProxy(proxy) {
    try {
      const agent = this.createProxyAgent(proxy);
      if (!agent) {
        return false;
      }

      // 这里可以添加实际的连接测试逻辑
      // 例如通过代理访问一个测试URL
      
      this.logger.debug(`Proxy test passed: ${proxy.url}`);
      return true;
    } catch (error) {
      this.logger.error(`Proxy test failed for ${proxy.url}:`, error);
      return false;
    }
  }

  /**
   * 获取代理统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    return {
      total: this.proxies.length,
      failed: this.failedProxies.size,
      available: this.proxies.length - this.failedProxies.size,
      currentIndex: this.currentIndex
    };
  }

  /**
   * 重置失败的代理列表
   */
  resetFailedProxies() {
    this.failedProxies.clear();
    this.logger.info('Reset failed proxies list');
  }
}

module.exports = ProxyManager;