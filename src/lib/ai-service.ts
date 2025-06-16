interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface OpenRouterResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class AIService {
  private apiKey: string;
  private baseUrl: string = 'https://openrouter.ai/api/v1';
  private model: string = 'deepseek/deepseek-r1-0528';

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
    if (!this.apiKey) {
      throw new Error('OPENROUTER_API_KEY is required');
    }
  }

  async chatCompletion(
    messages: OpenRouterMessage[],
    options: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      stream?: boolean;
    } = {}
  ): Promise<OpenRouterResponse> {
    const {
      model = this.model,
      temperature = 0.7,
      maxTokens = 4000,
      stream = false
    } = options;

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || '',
        'X-Title': process.env.NEXT_PUBLIC_SITE_NAME || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${errorData}`);
    }

    return response.json();
  }

  async generateResponse(
    userMessage: string,
    conversationHistory: OpenRouterMessage[] = [],
    systemPrompt?: string
  ): Promise<{
    response: string;
    tokensUsed: number;
    model: string;
  }> {
    const messages: OpenRouterMessage[] = [];

    // Add system prompt if provided
    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt,
      });
    }

    // Add conversation history
    messages.push(...conversationHistory);

    // Add current user message
    messages.push({
      role: 'user',
      content: userMessage,
    });

    try {
      const result = await this.chatCompletion(messages);
      
      return {
        response: result.choices[0]?.message?.content || 'No response generated',
        tokensUsed: result.usage?.total_tokens || 0,
        model: result.model,
      };
    } catch (error) {
      console.error('AI Service Error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  async generateTitle(conversation: string): Promise<string> {
    const messages: OpenRouterMessage[] = [
      {
        role: 'system',
        content: 'Generate a short, descriptive title (max 50 characters) for this conversation. Return only the title, no quotes or extra text.',
      },
      {
        role: 'user',
        content: `Generate a title for this conversation:\n\n${conversation.slice(0, 500)}...`,
      },
    ];

    try {
      const result = await this.chatCompletion(messages, {
        maxTokens: 50,
        temperature: 0.3,
      });
      
      return result.choices[0]?.message?.content?.trim() || 'New Conversation';
    } catch (error) {
      console.error('Title generation error:', error);
      return 'New Conversation';
    }
  }

  // Predefined system prompts for different use cases
  static getSystemPrompts() {
    return {
      general: 'You are a helpful AI assistant. Provide clear, accurate, and helpful responses.',
      
      coding: 'You are an expert software developer. Help with coding questions, provide clean code examples, and explain programming concepts clearly.',
      
      business: 'You are a business consultant. Provide strategic advice, help with business planning, and offer insights on entrepreneurship and growth.',
      
      creative: 'You are a creative writing assistant. Help with storytelling, content creation, and creative projects. Be imaginative and inspiring.',
      
      academic: 'You are an academic tutor. Explain concepts clearly, help with research, and provide educational guidance across various subjects.',
      
      saas: 'You are a SaaS expert. Help with software-as-a-service business models, product development, user experience, and scaling strategies.',
    };
  }

  // Get usage limits based on user plan
  static getUsageLimits(plan: string = 'free') {
    const limits = {
      free: {
        dailyTokens: 10000,
        monthlyTokens: 100000,
        conversationsPerDay: 10,
        maxTokensPerRequest: 1000,
      },
      pro: {
        dailyTokens: 100000,
        monthlyTokens: 1000000,
        conversationsPerDay: 100,
        maxTokensPerRequest: 4000,
      },
      premium: {
        dailyTokens: 500000,
        monthlyTokens: 5000000,
        conversationsPerDay: 500,
        maxTokensPerRequest: 8000,
      },
    };

    return limits[plan as keyof typeof limits] || limits.free;
  }
}

export default AIService;
