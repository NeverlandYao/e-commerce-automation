const Logger = require('../utils/Logger');

class TaobaoAdapter {
  constructor() {
    this.logger = new Logger('TaobaoAdapter');
    this.name = 'taobao';
    this.baseUrl = 'https://www.taobao.com';
    this.searchUrl = 'https://s.taobao.com/search';
  }

  getSelectors() {
    return {
      // 商品详情页选择器
      product: {
        title: '.tb-detail-hd h1, .ItemTitle--mainTitle--jCOPAJY',
        price: '.tb-rmb-num, .Price--priceText--jqbzVat',
        originalPrice: '.tb-rmb-num, .Price--lineThrough--1c7R8p2',
        image: '.tb-booth-phone img, .ItemPictures--mainPic--1Kpkx8s img',
        description: '.tb-detail-bd, .ItemDescription--description--3sF2z6y',
        shop: '.tb-seller-name, .ShopHeader--name--3KPQY9K',
        rating: '.tb-rate-score, .ItemRating--score--2vC8cQs',
        sales: '.tb-count, .ItemSales--text--1jEXf6I',
        attributes: '.tb-property-cont, .ItemAttributes--list--2v8VJ8K'
      },
      // 商品列表页选择器
      list: {
        items: '.item, .Card--doubleCardWrapper--L2XFE73',
        title: '.title a, .Title--title--jCOPAJY',
        price: '.price, .Price--priceText--jqbzVat',
        image: '.pic img, .MainPic--mainPic--rcLNaCv img',
        link: '.title a, .Card--doubleCardWrapper--L2XFE73 a',
        shop: '.shop, .ShopInfo--name--2s7gHjF',
        sales: '.deal-cnt, .SalesInfo--text--1jEXf6I'
      },
      // 搜索结果页选择器
      search: {
        items: '.item, .Card--doubleCardWrapper--L2XFE73',
        title: '.title a, .Title--title--jCOPAJY',
        price: '.price, .Price--priceText--jqbzVat',
        image: '.pic img, .MainPic--mainPic--rcLNaCv img',
        link: '.title a, .Card--doubleCardWrapper--L2XFE73 a',
        shop: '.shop, .ShopInfo--name--2s7gHjF',
        nextPage: '.next, .PageNext--next--3Oy4cJv'
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
    return `${this.searchUrl}?q=${encodeURIComponent(keyword)}&sort=default`;
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
          image: getAttribute(sel.image, 'src') || getAttribute(sel.image, 'data-src'),
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
      this.logger.error('Failed to extract Taobao product data:', error);
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
      this.logger.error('Failed to extract Taobao product list:', error);
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
      this.logger.error('Failed to extract Taobao search results:', error);
      return [];
    }
  }

  formatProductData(rawData, url = null) {
    const formatted = {
      platform: this.name,
      url: url || rawData.link,
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
    
    const match = priceText.match(/([\d,]+\.?\d*)/);;
    return match ? parseFloat(match[1].replace(/,/g, '')) : null;
  }

  parseRating(ratingText) {
    if (!ratingText) return null;
    
    const match = ratingText.match(/([\d.]+)/);
    return match ? parseFloat(match[1]) : null;
  }

  parseSales(salesText) {
    if (!salesText) return null;
    
    const match = salesText.match(/([\d,]+)/);
    return match ? parseInt(match[1].replace(/,/g, '')) : null;
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
      return nextButton !== null;
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

module.exports = TaobaoAdapter;