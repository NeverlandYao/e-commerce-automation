import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import {
  generateAIResponse,
  generateProductDescription,
  generateMarketingContent,
  analyzeCustomerFeedback,
} from '../services/ai.js';
import { createValidationError } from '../middleware/error.js';

const ai = new Hono();

// Validation schemas
const aiRequestSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  context: z.string().optional(),
  maxTokens: z.number().min(1).max(4000).optional(),
  temperature: z.number().min(0).max(2).optional(),
});

const productDescriptionSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  category: z.string().min(1, 'Category is required'),
  features: z.array(z.string()).optional(),
  specifications: z.record(z.any()).optional(),
});

const marketingContentSchema = z.object({
  type: z.enum(['email', 'social', 'blog', 'ad']),
  topic: z.string().min(1, 'Topic is required'),
  targetAudience: z.string().optional(),
  tone: z.string().optional(),
  length: z.enum(['short', 'medium', 'long']).optional(),
});

const feedbackAnalysisSchema = z.object({
  feedback: z.array(z.string().min(1)).min(1, 'At least one feedback is required'),
});

// Routes

// General AI chat endpoint
ai.post('/chat', zValidator('json', aiRequestSchema), async (c) => {
  try {
    const request = await c.req.json();
    const response = await generateAIResponse(request);
    
    return c.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('AI chat error:', error);
    throw error;
  }
});

// Generate product description
ai.post('/product-description', zValidator('json', productDescriptionSchema), async (c) => {
  try {
    const productData = await c.req.json();
    const description = await generateProductDescription(productData);
    
    return c.json({
      success: true,
      data: {
        description,
        productData,
      },
    });
  } catch (error) {
    console.error('Product description generation error:', error);
    throw error;
  }
});

// Generate marketing content
ai.post('/marketing-content', zValidator('json', marketingContentSchema), async (c) => {
  try {
    const request = await c.req.json();
    const content = await generateMarketingContent(request);
    
    return c.json({
      success: true,
      data: {
        content,
        request,
      },
    });
  } catch (error) {
    console.error('Marketing content generation error:', error);
    throw error;
  }
});

// Analyze customer feedback
ai.post('/analyze-feedback', zValidator('json', feedbackAnalysisSchema), async (c) => {
  try {
    const { feedback } = await c.req.json();
    const analysis = await analyzeCustomerFeedback(feedback);
    
    return c.json({
      success: true,
      data: {
        analysis,
        feedbackCount: feedback.length,
      },
    });
  } catch (error) {
    console.error('Feedback analysis error:', error);
    throw error;
  }
});

// Get AI service status
ai.get('/status', async (c) => {
  return c.json({
    success: true,
    data: {
      service: 'AI Script Service',
      status: 'operational',
      features: [
        'General AI Chat',
        'Product Description Generation',
        'Marketing Content Creation',
        'Customer Feedback Analysis',
      ],
      timestamp: new Date().toISOString(),
    },
  });
});

export default ai;