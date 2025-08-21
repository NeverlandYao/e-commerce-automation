const Logger = require('../utils/Logger');

class AmazonAdapter {
  constructor() {
    this.logger = new Logger('AmazonAdapter');
    this.name = 'amazon';
    this.baseUrl = 'https://www.amazon.com';
    this.searchUrl = 'https://www.amazon.com/s';
  }

  getSelectors() {
    return {
      // 商品详情页选择器
      product: {
        title: '#productTitle, .product-title',
        price: '.a-price-whole, .a-offscreen, .a-price .a-offscreen',
        originalPrice: '.a-price.a-text-price .a-offscreen, .priceBlockStrikePriceString',
        image: '#landingImage, .a-dynamic-image',
        description: '#feature-bullets ul, .a-unordered-list',
        shop: '#bylineInfo, .a-link-normal',
        rating: '.a-icon-alt, .reviewCountTextLinkedHistogram',
        sales: '.social-proofing-faceout-title-tk_bought',
        attributes: '.a-unordered-list .a-list-item'
      },
      // 商品列表页选择器
      list: {
        items: '[data-component-type="s-search-result"], .s-result-item',
        title: 'h2 a span, .s-size-mini .s-link-style a',
        price: '.a-price .a-offscreen, .a-price-whole',
        image: '.s-image, .a-dynamic-image',
        link: 'h2 a, .s-link-style a',
        shop: '.a-size-base-plus, .s-link-style',
        sales: '.a-size-base'
      },
      // 搜索结果页选择器
      search: {
        items: '[data-component-type="s-search-result"], .s-result-item',
        title: 'h2 a span, .s-size-mini .s-link-style a',
        price: '.a-price .a-offscreen, .a-price-whole',
        image: '.s-image, .a-dynamic-image',
        link: 'h2 a, .s-link-style a',
        shop: '.a-size-base-plus, .s-link-style',
        nextPage: '.s-pagination-next, .a-last a'
      }
    };
  }

  getBrowserOptions() {
    return {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'en-US',
      timezoneId: 'America/New_York',
      extraHTTPHeaders: {
        'Accept-Language': 'en-US,en;q=0.9'
      }
    };
  }

  getSearchUrl(keyword) {
    return `${this.searchUrl}?k=${encodeURIComponent(keyword)}&ref=sr_pg_1`;
  }

  async extractProductData(page) {
    try {
      const selectors = this.getSelectors().product;
      
      // 等待关键元素加载
      await page.waitForSelector(selectors.title, { timeout: 10000 }).catch(() => {});
      
      const productData = await page.evaluate((sel) => {
        const getTextContent = (selector) => {
          const element = document.querySelector(selector);
          return element ? element.textContent.trim() : null;
        };
        
        const getAttribute = (selector, attr) => {
          const element = document.querySelector(selector);
          return element ? element.getAttribute(attr) : null;
        };
        
        const getAllTextContent = (selector) => {
          const elements = document.querySelectorAll(selector);
          return Array.from(elements).map(el => el.textContent.trim()).filter(text => text.length > 0);
        };
        
        return {
          title: getTextContent(sel.title),
          price: getTextContent(sel.price),
          originalPrice: getTextContent(sel.originalPrice),
          image: getAttribute(sel.image, 'src') || getAttribute(sel.image, 'data-old-hires'),
          description: getAllTextContent(sel.description).join(' '),
          shop: getTextContent(sel.shop),
          rating: getTextContent(sel.rating),
          sales: getTextContent(sel.sales),
          attributes: getAllTextContent(sel.attributes)
        };
      }, selectors);
      
      // 清理和格式化数据
      return this.formatProductData(productData, page.url());
      
    } catch (error) {
      this.logger.error('Failed to extract Amazon product data:', error);
      throw error;
    }
  }

  async extractProductList(page) {
    try {
      const selectors = this.getSelectors().list;
      
      // 等待商品列表加载
      await page.waitForSelector(selectors.items, { timeout: 10000 }).catch(() => {});
      
      const products = await page.evaluate((sel) => {
        const items = document.querySelectorAll(sel.items);
        const results = [];
        
        items.forEach(item => {
          const getTextFromItem = (selector) => {
            const element = item.querySelector(selector);
            return element ? element.textContent.trim() : null;
          };
          
          const getAttrFromItem = (selector, attr) => {
            const element = item.querySelector(selector);
            return element ? element.getAttribute(attr) : null;
          };
          
          const title = getTextFromItem(sel.title);
          if (title) {
            results.push({
              title,
              price: getTextFromItem(sel.price),
              image: getAttrFromItem(sel.image, 'src') || getAttrFromItem(sel.image, 'data-src'),
              link: getAttrFromItem(sel.link, 'href'),
              shop: getTextFromItem(sel.shop),
              sales: getTextFromItem(sel.sales)
            });
          }
        });
        
        return results;
      }, selectors);
      
      return products.map(product => this.formatProductData(product));
      
    } catch (error) {
      this.logger.error('Failed to extract Amazon product list:', error);
      return [];
    }
  }

  async extractSearchResults(page) {
    try {
      const selectors = this.getSelectors().search;
      
      // 等待搜索结果加载
      await page.waitForSelector(selectors.items, { timeout: 10000 }).catch(() => {});
      
      const results = await page.evaluate((sel) => {
        const items = document.querySelectorAll(sel.items);
        const products = [];
        
        items.forEach(item => {
          const getTextFromItem = (selector) => {
            const element = item.querySelector(selector);
            return element ? element.textContent.trim() : null;
          };
          
          const getAttrFromItem = (selector, attr) => {
            const element = item.querySelector(selector);
            return element ? element.getAttribute(attr) : null;
          };
          
          const title = getTextFromItem(sel.title);
          if (title) {
            products.push({
              title,
              price: getTextFromItem(sel.price),
              image: getAttrFromItem(sel.image, 'src') || getAttrFromItem(sel.image, 'data-src'),
              link: getAttrFromItem(sel.link, 'href'),
              shop: getTextFromItem(sel.shop)
            });
          }
        });
        
        return products;
      }, selectors);
      
      return results.map(product => this.formatProductData(product));
      
    } catch (error) {
      this.logger.error('Failed to extract Amazon search results:', error);
      return [];
    }
  }

  formatProductData(rawData, url = null) {
    const formatted = {
      platform: this.name,
      url: url || this.normalizeUrl(rawData.link),
      title: rawData.title,
      price: this.parsePrice(rawData.price),
      originalPrice: this.parsePrice(rawData.originalPrice),
      image: this.normalizeImageUrl(rawData.image),
      shop: rawData.shop,
      rating: this.parseRating(rawData.rating),
      sales: this.parseSales(rawData.sales),
      description: rawData.description,
      attributes: rawData.attributes || [],
      extractedAt: new Date().toISOString()
    };
    
    // 移除空值
    Object.keys(formatted).forEach(key => {
      if (formatted[key] === null || formatted[key] === undefined || formatted[key] === '') {
        delete formatted[key];
      }
    });
    
    return formatted;
  }

  parsePrice(priceText) {
    if (!priceText) return null;
    
    // 移除$符号和其他非数字字符
    const cleanText = priceText.replace(/[$,]/g, '');
    const match = cleanText.match(/([\d.]+)/);
    return match ? parseFloat(match[1]) : null;
  }

  parseRating(ratingText) {
    if (!ratingText) return null;
    
    // Amazon rating format: "4.5 out of 5 stars"
    const match = ratingText.match(/([\d.]+)\s*out\s*of\s*5/);
    return match ? parseFloat(match[1]) : null;
  }

  parseSales(salesText) {
    if (!salesText) return null;
    
    // Amazon sales format varies, try to extract numbers
    const match = salesText.match(/([\d,]+)/);
    return match ? parseInt(match[1].replace(/,/g, '')) : null;
  }

  normalizeUrl(url) {
    if (!url) return null;
    
    // 处理相对URL
    if (url.startsWith('/')) {
      return this.baseUrl + url;
    }
    
    return url;
  }

  normalizeImageUrl(imageUrl) {
    if (!imageUrl) return null;
    
    // 处理相对URL
    if (imageUrl.startsWith('/')) {
      return this.baseUrl + imageUrl;
    }
    
    return imageUrl;
  }

  async checkNextPage(page) {
    const selectors = this.getSelectors().search;
    
    try {
      const nextButton = await page.$(selectors.nextPage);
      if (!nextButton) return false;
      
      const isDisabled = await page.evaluate(el => {
        return el.classList.contains('a-disabled') || el.getAttribute('aria-disabled') === 'true';
      }, nextButton);
      
      return !isDisabled;
    } catch (error) {
      return false;
    }
  }

  async clickNextPage(page) {
    const selectors = this.getSelectors().search;
    
    try {
      await page.click(selectors.nextPage);
      await page.waitForNavigation({ waitUntil: 'networkidle' });
      return true;
    } catch (error) {
      this.logger.error('Failed to navigate to next page:', error);
      return false;
    }
  }
}

module.exports = AmazonAdapter;