import { currentUser } from '@clerk/nextjs/server';
import { db, AiConversations, AiMessages, AiUsage } from '@/db';
import { eq, desc, and, gte, sql } from 'drizzle-orm';

// Get user's AI conversations
export async function getUserAiConversations(limit: number = 20) {
  const user = await currentUser();
  if (!user) throw new Error('User not found');

  return db.query.AiConversations.findMany({
    where: eq(AiConversations.user_id, user.id),
    orderBy: [desc(AiConversations.updated_at)],
    limit,
  });
}

// Get a specific conversation with messages
export async function getAiConversation(conversationId: string) {
  const user = await currentUser();
  if (!user) {
    console.error('No user found in getAiConversation');
    throw new Error('User not found');
  }

  try {
    console.log('Fetching conversation:', conversationId, 'for user:', user.id);

    const conversation = await db.query.AiConversations.findFirst({
      where: and(
        eq(AiConversations.id, conversationId),
        eq(AiConversations.user_id, user.id)
      ),
    });

    if (!conversation) {
      console.error('Conversation not found:', conversationId);
      throw new Error('Conversation not found');
    }

    console.log('Found conversation:', conversation.title);

    const messages = await db.query.AiMessages.findMany({
      where: eq(AiMessages.conversation_id, conversationId),
      orderBy: [AiMessages.created_at],
    });

    console.log('Found messages:', messages.length);

    return {
      conversation,
      messages,
    };
  } catch (error) {
    console.error('Error fetching conversation:', error);
    console.error('Conversation ID:', conversationId);
    console.error('User ID:', user.id);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

// Get AI usage statistics
export async function getAiUsageStats() {
  const user = await currentUser();
  if (!user) throw new Error('User not found');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstDayOfMonth = new Date();
  firstDayOfMonth.setDate(1);
  firstDayOfMonth.setHours(0, 0, 0, 0);

  try {
    // Get daily usage
    const dailyUsage = await db
      .select({
        total: sql<number>`sum(${AiUsage.tokens_used})`,
      })
      .from(AiUsage)
      .where(
        and(
          eq(AiUsage.user_id, user.id),
          gte(AiUsage.created_at, today)
        )
      );

    // Get monthly usage
    const monthlyUsage = await db
      .select({
        total: sql<number>`sum(${AiUsage.tokens_used})`,
      })
      .from(AiUsage)
      .where(
        and(
          eq(AiUsage.user_id, user.id),
          gte(AiUsage.created_at, firstDayOfMonth)
        )
      );

    // Get total conversations
    const conversationCount = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(AiConversations)
      .where(eq(AiConversations.user_id, user.id));

    // Get total messages
    const messageCount = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(AiMessages)
      .innerJoin(AiConversations, eq(AiMessages.conversation_id, AiConversations.id))
      .where(eq(AiConversations.user_id, user.id));

    return {
      dailyTokens: Number(dailyUsage[0]?.total) || 0,
      monthlyTokens: Number(monthlyUsage[0]?.total) || 0,
      totalConversations: Number(conversationCount[0]?.count) || 0,
      totalMessages: Number(messageCount[0]?.count) || 0,
    };
  } catch (error) {
    console.error('Error getting AI usage stats:', error);
    return {
      dailyTokens: 0,
      monthlyTokens: 0,
      totalConversations: 0,
      totalMessages: 0,
    };
  }
}

// Get recent AI activity
export async function getRecentAiActivity(limit: number = 10) {
  const user = await currentUser();
  if (!user) throw new Error('User not found');

  return db.query.AiUsage.findMany({
    where: eq(AiUsage.user_id, user.id),
    orderBy: [desc(AiUsage.created_at)],
    limit,
  });
}

// Check if user can make AI request based on limits
export async function checkAiUsageLimits(userPlan: string = 'free') {
  const user = await currentUser();
  if (!user) throw new Error('User not found');

  const stats = await getAiUsageStats();
  
  // Import limits from AI service
  const { AIService } = await import('./ai-service');
  const limits = AIService.getUsageLimits(userPlan);

  const canUseDaily = stats.dailyTokens < limits.dailyTokens;
  const canUseMonthly = stats.monthlyTokens < limits.monthlyTokens;

  return {
    canMakeRequest: canUseDaily && canUseMonthly,
    dailyUsage: stats.dailyTokens,
    dailyLimit: limits.dailyTokens,
    monthlyUsage: stats.monthlyTokens,
    monthlyLimit: limits.monthlyTokens,
    remainingDaily: Math.max(0, limits.dailyTokens - stats.dailyTokens),
    remainingMonthly: Math.max(0, limits.monthlyTokens - stats.monthlyTokens),
  };
}

// Get AI models available to user based on plan
export async function getAvailableAiModels(userPlan: string = 'free') {
  const models = {
    free: [
      {
        id: 'deepseek/deepseek-r1-0528',
        name: 'DeepSeek R1',
        description: 'Advanced reasoning model',
        tokensPerRequest: 1000,
      },
    ],
    pro: [
      {
        id: 'deepseek/deepseek-r1-0528',
        name: 'DeepSeek R1',
        description: 'Advanced reasoning model',
        tokensPerRequest: 4000,
      },
    ],
    premium: [
      {
        id: 'deepseek/deepseek-r1-0528',
        name: 'DeepSeek R1',
        description: 'Advanced reasoning model',
        tokensPerRequest: 8000,
      },
    ],
  };

  return models[userPlan as keyof typeof models] || models.free;
}
