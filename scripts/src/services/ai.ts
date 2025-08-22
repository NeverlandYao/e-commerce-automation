import OpenAI from 'openai';
import { appConfig } from '../lib/config.js';
import { createValidationError } from '../middleware/error.js';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: appConfig.openai.apiKey,
});

export interface AIRequest {
  prompt: string;
  context?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// Generate AI response
export async function generateAIResponse(request: AIRequest): Promise<AIResponse> {
  if (!request.prompt) {
    throw createValidationError('Prompt is required');
  }

  if (!appConfig.openai.apiKey) {
    throw new Error('OpenAI API key is not configured');
  }

  try {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: request.context || 'You are a helpful AI assistant for an e-commerce platform.',
      },
      {
        role: 'user',
        content: request.prompt,
      },
    ];

    const completion = await openai.chat.completions.create({
      model: appConfig.openai.model,
      messages,
      max_tokens: request.maxTokens || appConfig.openai.maxTokens,
      temperature: request.temperature || 0.7,
    });

    const choice = completion.choices[0];
    if (!choice?.message?.content) {
      throw new Error('No response generated from AI');
    }

    return {
      content: choice.message.content,
      usage: completion.usage ? {
        promptTokens: completion.usage.prompt_tokens,
        completionTokens: completion.usage.completion_tokens,
        totalTokens: completion.usage.total_tokens,
      } : undefined,
    };
  } catch (error) {
    console.error('AI service error:', error);
    throw new Error(`AI service failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Generate product description
export async function generateProductDescription(productData: {
  name: string;
  category: string;
  features?: string[];
  specifications?: Record<string, any>;
}): Promise<string> {
  const prompt = `Generate a compelling product description for the following product:

Product Name: ${productData.name}
Category: ${productData.category}
${productData.features ? `Features: ${productData.features.join(', ')}` : ''}
${productData.specifications ? `Specifications: ${JSON.stringify(productData.specifications, null, 2)}` : ''}

Please create an engaging, SEO-friendly product description that highlights the key benefits and features.`;

  const response = await generateAIResponse({
    prompt,
    context: 'You are an expert copywriter specializing in e-commerce product descriptions. Create compelling, SEO-friendly content that converts browsers into buyers.',
  });

  return response.content;
}

// Generate marketing content
export async function generateMarketingContent(request: {
  type: 'email' | 'social' | 'blog' | 'ad';
  topic: string;
  targetAudience?: string;
  tone?: string;
  length?: 'short' | 'medium' | 'long';
}): Promise<string> {
  const lengthGuide = {
    short: '1-2 paragraphs',
    medium: '3-5 paragraphs',
    long: '6+ paragraphs',
  };

  const prompt = `Create ${request.type} content about: ${request.topic}

${request.targetAudience ? `Target Audience: ${request.targetAudience}` : ''}
${request.tone ? `Tone: ${request.tone}` : ''}
Length: ${lengthGuide[request.length || 'medium']}

Please create engaging, professional content that drives action.`;

  const response = await generateAIResponse({
    prompt,
    context: `You are a professional marketing content creator. Create compelling ${request.type} content that engages the audience and drives conversions.`,
  });

  return response.content;
}

// Analyze customer feedback
export async function analyzeCustomerFeedback(feedback: string[]): Promise<{
  sentiment: 'positive' | 'negative' | 'neutral';
  themes: string[];
  summary: string;
  recommendations: string[];
}> {
  const prompt = `Analyze the following customer feedback and provide insights:

${feedback.map((f, i) => `${i + 1}. ${f}`).join('\n')}

Please provide:
1. Overall sentiment (positive/negative/neutral)
2. Key themes mentioned
3. Summary of main points
4. Recommendations for improvement

Format your response as JSON with the following structure:
{
  "sentiment": "positive|negative|neutral",
  "themes": ["theme1", "theme2"],
  "summary": "Brief summary",
  "recommendations": ["recommendation1", "recommendation2"]
}`;

  const response = await generateAIResponse({
    prompt,
    context: 'You are a customer experience analyst. Analyze feedback objectively and provide actionable insights.',
  });

  try {
    return JSON.parse(response.content);
  } catch (error) {
    throw new Error('Failed to parse AI analysis response');
  }
}