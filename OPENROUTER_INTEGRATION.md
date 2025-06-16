# OpenRouter + DeepSeek R1 Integration

This document outlines the complete integration of OpenRouter AI with DeepSeek R1 model into your Clerk + Neon.tech SaaS application.

## 🤖 Features Implemented

### AI Service Integration
- ✅ **OpenRouter API** integration with DeepSeek R1 model
- ✅ **Chat completions** with conversation history
- ✅ **System prompts** for different use cases
- ✅ **Token usage tracking** and limits
- ✅ **Error handling** and rate limiting

### Database Schema
- ✅ **AI Conversations** table for chat sessions
- ✅ **AI Messages** table for individual messages
- ✅ **AI Usage** table for token tracking and analytics
- ✅ **User-based isolation** with Clerk user IDs

### User Interface
- ✅ **AI Chat Interface** (`/ai`) with conversation management
- ✅ **Individual Conversation** pages (`/ai/[conversationId]`)
- ✅ **Usage statistics** and limits display
- ✅ **Plan-based restrictions** (free, pro, premium)

## 🔧 Environment Variables

Add these to your `.env.local` and Vercel environment variables:

```bash
# OpenRouter AI
OPENROUTER_API_KEY=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
NEXT_PUBLIC_SITE_URL=http://localhost:3002
NEXT_PUBLIC_SITE_NAME=SaaS AI Platform
```

## 📊 Database Tables

### ai_conversations
```sql
CREATE TABLE ai_conversations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  model TEXT NOT NULL DEFAULT 'deepseek/deepseek-r1-0528',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### ai_messages
```sql
CREATE TABLE ai_messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  role TEXT NOT NULL, -- 'user', 'assistant', 'system'
  content TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### ai_usage
```sql
CREATE TABLE ai_usage (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  model TEXT NOT NULL,
  tokens_used INTEGER NOT NULL,
  cost TEXT, -- Stored as string to avoid floating point issues
  request_type TEXT NOT NULL, -- 'chat', 'completion', etc.
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🎯 Usage Limits by Plan

### Free Plan
- **Daily Tokens**: 10,000
- **Monthly Tokens**: 100,000
- **Conversations/Day**: 10
- **Max Tokens/Request**: 1,000

### Pro Plan
- **Daily Tokens**: 100,000
- **Monthly Tokens**: 1,000,000
- **Conversations/Day**: 100
- **Max Tokens/Request**: 4,000

### Premium Plan
- **Daily Tokens**: 500,000
- **Monthly Tokens**: 5,000,000
- **Conversations/Day**: 500
- **Max Tokens/Request**: 8,000

## 🔄 API Integration

### OpenRouter Service
```typescript
// src/lib/ai-service.ts
export class AIService {
  async chatCompletion(messages, options) {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL,
        'X-Title': process.env.NEXT_PUBLIC_SITE_NAME,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1-0528',
        messages,
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });
    
    return response.json();
  }
}
```

## 📱 Pages and Features

### `/ai` - AI Assistant Hub
- **Usage Statistics**: Daily/monthly token usage
- **Quick Start**: Predefined system prompts
- **Conversation List**: Recent AI conversations
- **Usage Limits**: Plan-based restrictions
- **New Conversation**: Create new chat sessions

### `/ai/[conversationId]` - Individual Chat
- **Message History**: Full conversation display
- **Real-time Chat**: Send messages and get AI responses
- **Token Tracking**: Per-message token usage
- **Conversation Management**: Delete conversations
- **Usage Monitoring**: Real-time limit checking

### Dashboard Integration
- **AI Statistics**: Conversation and token counts
- **Quick Access**: Direct links to AI features
- **Usage Overview**: Daily token consumption

## 🎨 System Prompts

Pre-configured prompts for different use cases:

- **General**: Helpful AI assistant
- **Coding**: Expert software developer
- **Business**: Business consultant
- **Creative**: Creative writing assistant
- **Academic**: Academic tutor
- **SaaS**: SaaS expert

## 🔐 Security Features

### Access Control
- **User Isolation**: All data filtered by Clerk user ID
- **Plan-based Limits**: Automatic usage enforcement
- **Rate Limiting**: Token-based request limiting
- **Error Handling**: Graceful failure handling

### Data Protection
- **Encrypted Storage**: All data stored securely in Neon
- **Activity Logging**: All AI interactions tracked
- **Usage Analytics**: Detailed usage statistics
- **Audit Trail**: Complete conversation history

## 🚀 Usage Examples

### Creating a Conversation
```typescript
// Server Action
export async function createAiConversation(formData: FormData) {
  const user = await currentUser();
  const conversationId = `conv_${user.id}_${Date.now()}`;
  
  await db.insert(AiConversations).values({
    id: conversationId,
    user_id: user.id,
    title: 'New Conversation',
    model: 'deepseek/deepseek-r1-0528',
  });
  
  return { success: true, conversationId };
}
```

### Sending a Message
```typescript
// Server Action with AI Response
export async function sendAiMessage(formData: FormData) {
  const user = await currentUser();
  const message = formData.get('message') as string;
  
  // Check usage limits
  const dailyUsage = await getDailyTokenUsage(user.id);
  if (dailyUsage >= limits.dailyTokens) {
    throw new Error('Daily token limit exceeded');
  }
  
  // Generate AI response
  const aiService = new AIService();
  const response = await aiService.generateResponse(message);
  
  // Save to database
  await db.insert(AiMessages).values([
    { role: 'user', content: message },
    { role: 'assistant', content: response.response, tokens_used: response.tokensUsed }
  ]);
  
  return { success: true };
}
```

## 📈 Analytics and Monitoring

### Usage Tracking
- **Token Consumption**: Real-time tracking
- **Conversation Metrics**: Count and frequency
- **Model Performance**: Response times and success rates
- **User Behavior**: Usage patterns and preferences

### Plan Optimization
- **Usage Alerts**: Approaching limits notifications
- **Upgrade Prompts**: Automatic upgrade suggestions
- **Cost Analysis**: Token cost calculations
- **Performance Metrics**: Response quality tracking

## 🔧 Troubleshooting

### Common Issues

1. **API Key Errors**
   - Verify `OPENROUTER_API_KEY` is set correctly
   - Check API key permissions and quotas

2. **Token Limit Errors**
   - Check user's daily/monthly usage
   - Verify plan-based limits are correct

3. **Database Connection Issues**
   - Ensure Neon database is accessible
   - Check database schema is up to date

4. **Form Nesting Errors**
   - Ensure no forms are nested inside other forms
   - Use separate form elements for different actions

## 🚀 Deployment Notes

### Vercel Environment Variables
Add these to your Vercel project settings:

```bash
OPENROUTER_API_KEY=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
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
NEXT_PUBLIC_SITE_NAME=Your SaaS Platform
```

### Database Migration
```bash
# Generate migration
npx drizzle-kit generate

# Apply to database
npx drizzle-kit push
```

## 🎯 Next Steps

1. **Enhanced Features**
   - File upload support
   - Image generation
   - Voice chat integration
   - Custom model fine-tuning

2. **Analytics Dashboard**
   - Advanced usage analytics
   - Cost optimization insights
   - Performance monitoring
   - User behavior analysis

3. **Enterprise Features**
   - Team collaboration
   - Admin controls
   - Custom models
   - API access for integrations

The OpenRouter + DeepSeek R1 integration is now fully functional and ready for production use!
