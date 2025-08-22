import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { appConfig } from './lib/config.js';
import { errorHandler } from './middleware/error.js';
import aiRoutes from './routes/ai.js';

// Create Hono app
const app = new Hono();

// Global middleware
app.use('*', logger());
app.use('*', secureHeaders());
app.use('*', cors({
  origin: appConfig.cors.origin,
  credentials: appConfig.cors.credentials,
}));

// Error handling
app.onError(errorHandler);

// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    success: true,
    data: {
      status: 'healthy',
      service: 'AI Script Service',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    },
  });
});

// API routes
app.route('/api/ai', aiRoutes);

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      success: false,
      error: {
        message: 'Endpoint not found',
        status: 404,
      },
    },
    404
  );
});

// Start server
const port = appConfig.port;
console.log(`🤖 AI Script Service is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});