import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import * as jwt from 'jsonwebtoken'
import type { SignOptions } from 'jsonwebtoken'
import { hash, compare } from 'bcryptjs'
import { config } from '../lib/config'
import { createValidationError, createAuthError, createConflictError } from '../middleware/error'

const authRoutes = new Hono()

// 登录请求验证模式
const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6位')
})

// 注册请求验证模式
const registerSchema = z.object({
  username: z.string().min(2, '用户名至少2位').max(50, '用户名最多50位'),
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6位').max(100, '密码最多100位'),
  role: z.enum(['admin', 'user']).optional().default('user')
})

// 刷新令牌验证模式
const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, '刷新令牌不能为空')
})

// 模拟用户数据库（实际项目中应该使用真实数据库）
const users: Array<{
  id: string
  username: string
  email: string
  password: string
  role: 'admin' | 'user'
  createdAt: Date
}> = []

// 生成JWT令牌
const generateTokens = (userId: string, email: string, role: string) => {
  const payload = { userId, email, role }
  const refreshPayload = { userId, type: 'refresh' }
  const secret = config.jwt.secret
  const accessOptions: SignOptions = { expiresIn: config.jwt.expiresIn as any }
  const refreshOptions: SignOptions = { expiresIn: config.jwt.refreshExpiresIn as any }
  
  const accessToken = jwt.sign(payload, secret, accessOptions)
  const refreshToken = jwt.sign(refreshPayload, secret, refreshOptions)
  
  return { accessToken, refreshToken }
}

// 用户注册
authRoutes.post('/register', zValidator('json', registerSchema), async (c) => {
  const { username, email, password, role } = c.req.valid('json')
  
  // 检查用户是否已存在
  const existingUser = users.find(u => u.email === email || u.username === username)
  if (existingUser) {
    throw createConflictError('用户名或邮箱已存在')
  }
  
  // 密码加密
  const hashedPassword = await hash(password, 12)
  
  // 创建新用户
  const newUser = {
    id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    username,
    email,
    password: hashedPassword,
    role,
    createdAt: new Date()
  }
  
  users.push(newUser)
  
  // 生成令牌
  const tokens = generateTokens(newUser.id, newUser.email, newUser.role)
  
  return c.json({
    message: '注册成功',
    user: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt
    },
    ...tokens
  }, 201)
})

// 用户登录
authRoutes.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json')
  
  // 查找用户
  const user = users.find(u => u.email === email)
  if (!user) {
    throw createAuthError('邮箱或密码错误')
  }
  
  // 验证密码
  const isValidPassword = await compare(password, user.password)
  if (!isValidPassword) {
    throw createAuthError('邮箱或密码错误')
  }
  
  // 生成令牌
  const tokens = generateTokens(user.id, user.email, user.role)
  
  return c.json({
    message: '登录成功',
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    },
    ...tokens
  })
})

// 刷新令牌
authRoutes.post('/refresh', zValidator('json', refreshTokenSchema), async (c) => {
  const { refreshToken } = c.req.valid('json')
  
  try {
    const decoded = jwt.verify(refreshToken, config.jwt.secret as string) as any
    
    if (decoded.type !== 'refresh') {
      throw createAuthError('无效的刷新令牌')
    }
    
    // 查找用户
    const user = users.find(u => u.id === decoded.userId)
    if (!user) {
      throw createAuthError('用户不存在')
    }
    
    // 生成新的令牌
    const tokens = generateTokens(user.id, user.email, user.role)
    
    return c.json({
      message: '令牌刷新成功',
      ...tokens
    })
  } catch (error) {
    throw createAuthError('无效的刷新令牌')
  }
})

// 用户登出
authRoutes.post('/logout', async (c) => {
  // 在实际项目中，这里应该将令牌加入黑名单
  return c.json({ message: '登出成功' })
})

// 验证令牌
authRoutes.get('/verify', async (c) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createAuthError('缺少认证令牌')
  }
  
  const token = authHeader.substring(7)
  
  try {
    const decoded = jwt.verify(token, config.jwt.secret as string) as any
    
    // 查找用户
    const user = users.find(u => u.id === decoded.userId)
    if (!user) {
      throw createAuthError('用户不存在')
    }
    
    return c.json({
      valid: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      }
    })
  } catch (error) {
    throw createAuthError('无效的认证令牌')
  }
})

export { authRoutes }