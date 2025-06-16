'use server';

import { currentUser } from '@clerk/nextjs/server';
import { db, AiConversations, AiMessages, AiUsage } from '@/db';
import { eq, desc, and, gte, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import AIService from './ai-service';
import { logUserActivity } from './actions';

// Create a new AI conversation
export async function createAiConversation(formData: FormData) {
  const user = await currentUser();
  if (!user) throw new Error('User not found');

  const title = formData.get('title') as string;
  const systemPrompt = formData.get('systemPrompt') as string;

  const conversationId = `conv_${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    await db.insert(AiConversations).values({
      id: conversationId,
      user_id: user.id,
      title: title || 'New Conversation',
      model: 'deepseek/deepseek-r1-0528',
    });

    // Add system message if provided
    if (systemPrompt) {
      const systemMessageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await db.insert(AiMessages).values({
        id: systemMessageId,
        conversation_id: conversationId,
        role: 'system',
        content: systemPrompt,
        tokens_used: 0,
      });
    }

    await logUserActivity(user.id, 'ai_conversation_created', { conversationId });

    revalidatePath('/ai');
    redirect(`/ai/${conversationId}`);
  } catch (error) {
    console.error('Error creating AI conversation:', error);
    throw new Error('Failed to create conversation');
  }
}

// Create new conversation and redirect
export async function createNewConversation() {
  const user = await currentUser();
  if (!user) throw new Error('User not found');

  const conversationId = `conv_${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    await db.insert(AiConversations).values({
      id: conversationId,
      user_id: user.id,
      title: 'New Conversation',
      model: 'deepseek/deepseek-r1-0528',
    });

    await logUserActivity(user.id, 'ai_conversation_created', { conversationId });

    revalidatePath('/ai');
    redirect(`/ai/${conversationId}`);
  } catch (error) {
    console.error('Error creating AI conversation:', error);
    throw new Error('Failed to create conversation');
  }
}

// Send a message and get AI response
export async function sendAiMessage(formData: FormData) {
  const user = await currentUser();
  if (!user) throw new Error('User not found');

  const message = formData.get('message') as string;
  const conversationId = formData.get('conversationId') as string;
  const systemPrompt = formData.get('systemPrompt') as string;

  if (!message || message.trim().length === 0) {
    throw new Error('Message cannot be empty');
  }

  try {
    // Check usage limits (implement based on user plan)
    const dailyUsage = await getDailyTokenUsage(user.id);
    const userPlan = 'free'; // TODO: Get from user subscription
    const limits = AIService.getUsageLimits(userPlan);

    if (dailyUsage >= limits.dailyTokens) {
      throw new Error('Daily token limit exceeded. Please upgrade your plan.');
    }

    // Get conversation history
    const conversationHistory = await db.query.AiMessages.findMany({
      where: eq(AiMessages.conversation_id, conversationId),
      orderBy: [AiMessages.created_at],
      limit: 20, // Limit context to last 20 messages
    });

    // Convert to OpenRouter format
    const messages = conversationHistory.map(msg => ({
      role: msg.role as 'user' | 'assistant' | 'system',
      content: msg.content,
    }));

    // Initialize AI service
    const aiService = new AIService();

    // Generate AI response
    const aiResponse = await aiService.generateResponse(
      message,
      messages,
      systemPrompt || AIService.getSystemPrompts().general
    );

    // Save user message
    const userMessageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await db.insert(AiMessages).values({
      id: userMessageId,
      conversation_id: conversationId,
      role: 'user',
      content: message,
      tokens_used: 0, // User messages don't consume tokens
    });

    // Save AI response
    const aiMessageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await db.insert(AiMessages).values({
      id: aiMessageId,
      conversation_id: conversationId,
      role: 'assistant',
      content: aiResponse.response,
      tokens_used: aiResponse.tokensUsed,
    });

    // Track usage
    await db.insert(AiUsage).values({
      id: `usage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: user.id,
      model: aiResponse.model,
      tokens_used: aiResponse.tokensUsed,
      request_type: 'chat',
    });

    // Update conversation title if it's the first message
    if (conversationHistory.length === 0) {
      const title = await aiService.generateTitle(message);
      await db
        .update(AiConversations)
        .set({ 
          title,
          updated_at: new Date(),
        })
        .where(eq(AiConversations.id, conversationId));
    } else {
      // Just update the timestamp
      await db
        .update(AiConversations)
        .set({ updated_at: new Date() })
        .where(eq(AiConversations.id, conversationId));
    }

    // Log activity
    await logUserActivity(user.id, 'ai_message_sent', {
      conversationId,
      tokensUsed: aiResponse.tokensUsed,
      model: aiResponse.model,
    });

    revalidatePath('/ai');
    revalidatePath(`/ai/${conversationId}`);
  } catch (error) {
    console.error('Error sending AI message:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to send message');
  }
}

// Delete a conversation
export async function deleteAiConversation(conversationId: string) {
  const user = await currentUser();
  if (!user) throw new Error('User not found');

  try {
    // Delete messages first
    await db.delete(AiMessages).where(eq(AiMessages.conversation_id, conversationId));
    
    // Delete conversation
    await db
      .delete(AiConversations)
      .where(
        and(
          eq(AiConversations.id, conversationId),
          eq(AiConversations.user_id, user.id)
        )
      );

    await logUserActivity(user.id, 'ai_conversation_deleted', { conversationId });

    revalidatePath('/ai');
  } catch (error) {
    console.error('Error deleting AI conversation:', error);
    throw new Error('Failed to delete conversation');
  }
}

// Get daily token usage
export async function getDailyTokenUsage(userId: string): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const result = await db
      .select({
        total: sql<number>`sum(${AiUsage.tokens_used})`,
      })
      .from(AiUsage)
      .where(
        and(
          eq(AiUsage.user_id, userId),
          gte(AiUsage.created_at, today)
        )
      );

    return Number(result[0]?.total) || 0;
  } catch (error) {
    console.error('Error getting daily token usage:', error);
    return 0;
  }
}

// Get monthly token usage
export async function getMonthlyTokenUsage(userId: string): Promise<number> {
  const firstDayOfMonth = new Date();
  firstDayOfMonth.setDate(1);
  firstDayOfMonth.setHours(0, 0, 0, 0);

  try {
    const result = await db
      .select({
        total: sql<number>`sum(${AiUsage.tokens_used})`,
      })
      .from(AiUsage)
      .where(
        and(
          eq(AiUsage.user_id, userId),
          gte(AiUsage.created_at, firstDayOfMonth)
        )
      );

    return Number(result[0]?.total) || 0;
  } catch (error) {
    console.error('Error getting monthly token usage:', error);
    return 0;
  }
}
