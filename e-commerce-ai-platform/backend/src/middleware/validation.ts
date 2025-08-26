import { Context, Next } from 'hono'
import { z, ZodError, ZodSchema } from 'zod'
import { createValidationError } from './error'

// 通用验证中间件
export const validate = (schema: ZodSchema, target: 'json' | 'query' | 'param' | 'header' = 'json') => {
  return async (c: Context, next: Next) => {
    try {
      let data: any
      
      switch (target) {
        case 'json':
          data = await c.req.json()
          break
        case 'query':
          data = c.req.query()
          break
        case 'param':
          data = c.req.param()
          break
        case 'header':
          data = Object.fromEntries(
            Object.entries(c.req.header()).map(([key, value]) => [key.toLowerCase(), value])
          )
          break
        default:
          throw new Error(`不支持的验证目标: ${target}`)
      }
      
      const validatedData = schema.parse(data)
      
      // 将验证后的数据添加到上下文中
      c.set(`validated_${target}`, validatedData)
      
      await next()
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
        
        throw createValidationError('请求参数验证失败', {
          target,
          errors: errorMessages
        })
      }
      throw error
    }
  }
}

// 常用验证模式
export const commonSchemas = {
  // 分页参数
  pagination: z.object({
    page: z.string().optional().default('1').transform(val => {
      const num = parseInt(val, 10)
      return isNaN(num) || num < 1 ? 1 : num
    }),
    limit: z.string().optional().default('20').transform(val => {
      const num = parseInt(val, 10)
      return isNaN(num) || num < 1 ? 20 : Math.min(num, 100)
    }),
    sort: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional().default('desc')
  }),
  
  // ID参数
  id: z.object({
    id: z.string().min(1, 'ID不能为空')
  }),
  
  // 用户ID参数
  userId: z.object({
    userId: z.string().min(1, '用户ID不能为空')
  }),
  
  // 任务ID参数
  taskId: z.object({
    taskId: z.string().min(1, '任务ID不能为空')
  }),
  
  // 搜索参数
  search: z.object({
    q: z.string().optional(),
    category: z.string().optional(),
    status: z.string().optional(),
    startDate: z.string().optional().refine(val => {
      if (!val) return true
      return !isNaN(Date.parse(val))
    }, '开始日期格式无效'),
    endDate: z.string().optional().refine(val => {
      if (!val) return true
      return !isNaN(Date.parse(val))
    }, '结束日期格式无效')
  }),
  
  // 爬虫任务创建
  crawlerTask: z.object({
    name: z.string().min(1, '任务名称不能为空').max(100, '任务名称最多100字符'),
    platform: z.enum(['taobao', 'jd', 'amazon'], {
      errorMap: () => ({ message: '平台必须是 taobao, jd 或 amazon 之一' })
    }),
    keywords: z.array(z.string().min(1)).min(1, '至少需要一个关键词'),
    config: z.object({
      max_pages: z.number().min(1).max(100).optional().default(10),
      delay: z.number().min(100).max(10000).optional().default(1000),
      proxy_enabled: z.boolean().optional().default(true),
      headless: z.boolean().optional().default(true)
    }).optional().default({}),
    schedule: z.object({
      enabled: z.boolean().optional().default(false),
      cron: z.string().optional(),
      timezone: z.string().optional().default('Asia/Shanghai')
    }).optional()
  }),
  
  // 上品任务创建
  publisherTask: z.object({
    name: z.string().min(1, '任务名称不能为空').max(100, '任务名称最多100字符'),
    platform: z.enum(['shopify', 'woocommerce', 'magento'], {
      errorMap: () => ({ message: '平台必须是 shopify, woocommerce 或 magento 之一' })
    }),
    products: z.array(z.object({
      title: z.string().min(1, '商品标题不能为空'),
      description: z.string().optional(),
      price: z.number().min(0, '价格不能为负数'),
      images: z.array(z.string().url('图片URL格式无效')).optional(),
      category: z.string().optional(),
      tags: z.array(z.string()).optional()
    })).min(1, '至少需要一个商品'),
    config: z.object({
      auto_publish: z.boolean().optional().default(false),
      draft_mode: z.boolean().optional().default(true),
      seo_optimization: z.boolean().optional().default(true)
    }).optional().default({})
  }),
  
  // AI分析请求
  aiAnalysis: z.object({
    type: z.enum(['product', 'market', 'trend', 'price'], {
      errorMap: () => ({ message: '分析类型必须是 product, market, trend 或 price 之一' })
    }),
    data: z.object({
      product_ids: z.array(z.string()).optional(),
      keywords: z.array(z.string()).optional(),
      category: z.string().optional(),
      date_range: z.object({
        start: z.string().refine(val => !isNaN(Date.parse(val)), '开始日期格式无效'),
        end: z.string().refine(val => !isNaN(Date.parse(val)), '结束日期格式无效')
      }).optional(),
      platforms: z.array(z.enum(['taobao', 'jd', 'amazon'])).optional()
    }),
    options: z.object({
      detailed: z.boolean().optional().default(false),
      include_charts: z.boolean().optional().default(true),
      export_format: z.enum(['json', 'pdf', 'excel']).optional().default('json')
    }).optional().default({})
  }),
  
  // AI内容生成请求
  aiGeneration: z.object({
    type: z.enum(['title', 'description', 'tags', 'seo'], {
      errorMap: () => ({ message: '生成类型必须是 title, description, tags 或 seo 之一' })
    }),
    input: z.object({
      product_info: z.object({
        name: z.string().optional(),
        category: z.string().optional(),
        features: z.array(z.string()).optional(),
        price: z.number().optional(),
        brand: z.string().optional()
      }).optional(),
      target_audience: z.string().optional(),
      keywords: z.array(z.string()).optional(),
      tone: z.enum(['professional', 'casual', 'persuasive', 'informative']).optional().default('professional'),
      language: z.enum(['zh-CN', 'en-US']).optional().default('zh-CN')
    }),
    options: z.object({
      max_length: z.number().min(10).max(5000).optional(),
      include_emojis: z.boolean().optional().default(false),
      seo_optimized: z.boolean().optional().default(true)
    }).optional().default({})
  }),
  
  // 系统配置更新
  systemConfig: z.object({
    crawler: z.object({
      max_concurrent_tasks: z.number().min(1).max(50).optional(),
      default_delay: z.number().min(100).max(10000).optional(),
      proxy_rotation_interval: z.number().min(30).max(3600).optional()
    }).optional(),
    publisher: z.object({
      max_batch_size: z.number().min(1).max(100).optional(),
      auto_retry_failed: z.boolean().optional(),
      notification_enabled: z.boolean().optional()
    }).optional(),
    ai: z.object({
      model_provider: z.enum(['openai', 'anthropic', 'local']).optional(),
      max_tokens: z.number().min(100).max(4000).optional(),
      temperature: z.number().min(0).max(2).optional()
    }).optional(),
    system: z.object({
      log_level: z.enum(['debug', 'info', 'warn', 'error']).optional(),
      metrics_retention_days: z.number().min(1).max(365).optional(),
      backup_enabled: z.boolean().optional()
    }).optional()
  })
}

// 便捷的验证中间件函数
export const validateJson = (schema: ZodSchema) => validate(schema, 'json')
export const validateQuery = (schema: ZodSchema) => validate(schema, 'query')
export const validateParams = (schema: ZodSchema) => validate(schema, 'param')
export const validateHeaders = (schema: ZodSchema) => validate(schema, 'header')

// 组合验证中间件
export const validatePagination = validateQuery(commonSchemas.pagination)
export const validateId = validateParams(commonSchemas.id)
export const validateUserId = validateParams(commonSchemas.userId)
export const validateTaskId = validateParams(commonSchemas.taskId)
export const validateSearch = validateQuery(commonSchemas.search)

// 获取验证后的数据的辅助函数
export const getValidatedData = (c: Context, target: 'json' | 'query' | 'param' | 'header') => {
  return c.get(`validated_${target}`)
}

export const getValidatedJson = (c: Context) => getValidatedData(c, 'json')
export const getValidatedQuery = (c: Context) => getValidatedData(c, 'query')
export const getValidatedParams = (c: Context) => getValidatedData(c, 'param')
export const getValidatedHeaders = (c: Context) => getValidatedData(c, 'header')