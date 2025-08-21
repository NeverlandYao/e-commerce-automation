const Logger = require('../utils/Logger');

class JDAdapter {
  constructor() {
    this.logger = new Logger('JDAdapter');
    this.name = 'jd';
    this.baseUrl = 'https://www.jd.com';
    this.searchUrl = 'https://search.jd.com/Search';
  }

  getSelectors() {
    return {
      // 商品详情页选择器
      product: {
        title: '.sku-name, .product-intro h1',
        price: '.price, .p-price .price',
        originalPrice: '.p-price .del, .origin-price',
        image: '.spec-list img, .preview img',
        description: '.detail-content, .product-detail',
        shop: '.shop-name, .seller-name',
        rating: '.comment-score, .score-average',
        sales: '.comment-count, .sales-amount',
        attributes: '.parameter2 li, .Ptable-item'
      },
      // 商品列表页选择器
      list: {
        items: '.gl-item, .goods-item',
        title: '.p-name a, .goods-name',
        price: '.p-price i, .goods-price',
        image: '.p-img img, .goods-img img',
        link: '.p-name a, .goods-item a',
        shop: '.p-shop, .shop-name',
        sales: '.p-commit, .sales-info'
      },
      // 搜索结果页选择器
      search: {
        items: '.gl-item, .goods-item',
        title: '.p-name a, .goods-name',
        price: '.p-price i, .goods-price',
        image: '.p-img img, .goods-img img',
        link: '.p-name a, .goods-item a',
        shop: '.p-shop, .shop-name',
        nextPage: '.pn-next, .next'
      }
    };
  }

  getBrowserOptions() {
    return {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'zh-CN',
      timezoneId: 'Asia/Shanghai',
      extraHTTPHeaders: {
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
      }
    };
  }

  getSearchUrl(keyword) {
    return `${this.searchUrl}?keyword=${encodeURIComponent(keyword)}&enc=utf-8`;
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
          return Array.from(elements).map(el => el.textContent.trim());
        };
        
        return {
          title: getTextContent(sel.title),
          price: getTextContent(sel.price),
          originalPrice: getTextContent(sel.originalPrice),
          image: getAttribute(sel.image, 'src') || getAttribute(sel.image, 'data-lazy-img'),
          description: getTextContent(sel.description),
          shop: getTextContent(sel.shop),
          rating: getTextContent(sel.rating),
          sales: getTextContent(sel.sales),
          attributes: getAllTextContent(sel.attributes)
        };
      }, selectors);
      
      // 清理和格式化数据
      return this.formatProductData(productData, page.url());
      
    } catch (error) {
      this.logger.error('Failed to extract JD product data:', error);
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
              image: getAttrFromItem(sel.image, 'src') || getAttrFromItem(sel.image, 'data-lazy-img'),
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
      this.logger.error('Failed to extract JD product list:', error);
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
              image: getAttrFromItem(sel.image, 'src') || getAttrFromItem(sel.image, 'data-lazy-img'),
              link: getAttrFromItem(sel.link, 'href'),
              shop: getTextFromItem(sel.shop)
            });
          }
        });
        
        return products;
      }, selectors);
      
      return results.map(product => this.formatProductData(product));
      
    } catch (error) {
      this.logger.error('Failed to extract JD search results:', error);
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
    
    // 移除￥符号和其他非数字字符
    const cleanText = priceText.replace(/[￥¥,]/g, '');
    const match = cleanText.match(/([\d.]+)/);
    return match ? parseFloat(match[1]) : null;
  }

  parseRating(ratingText) {
    if (!ratingText) return null;
    
    const match = ratingText.match(/([\d.]+)/);
    return match ? parseFloat(match[1]) : null;
  }

  parseSales(salesText) {
    if (!salesText) return null;
    
    // 处理万、千等单位
    const text = salesText.replace(/[+条评价]/g, '');
    const match = text.match(/([\d.]+)([万千]?)/);;
    
    if (match) {
      let number = parseFloat(match[1]);
      const unit = match[2];
      
      if (unit === '万') {
        number *= 10000;
      } else if (unit === '千') {
        number *= 1000;
      }
      
      return Math.floor(number);
    }
    
    return null;
  }

  normalizeUrl(url) {
    if (!url) return null;
    
    // 处理相对URL
    if (url.startsWith('//')) {
      return 'https:' + url;
    }
    
    if (url.startsWith('/')) {
      return this.baseUrl + url;
    }
    
    return url;
  }

  normalizeImageUrl(imageUrl) {
    if (!imageUrl) return null;
    
    // 处理相对URL
    if (imageUrl.startsWith('//')) {
      return 'https:' + imageUrl;
    }
    
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
        return el.classList.contains('disabled') || el.getAttribute('disabled') !== null;
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

module.exports = JDAdapter;