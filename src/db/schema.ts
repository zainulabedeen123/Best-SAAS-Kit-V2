import { pgTable, text, timestamp, boolean, integer, jsonb } from 'drizzle-orm/pg-core';

// User messages table - for storing user quotes/messages
export const UserMessages = pgTable('user_messages', {
  user_id: text('user_id').primaryKey().notNull(),
  createTs: timestamp('create_ts').defaultNow().notNull(),
  message: text('message').notNull(),
});

// User profiles table - for storing additional user information
export const UserProfiles = pgTable('user_profiles', {
  user_id: text('user_id').primaryKey().notNull(),
  email: text('email').notNull(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  preferences: jsonb('preferences').$type<{
    theme?: 'light' | 'dark';
    notifications?: boolean;
    newsletter?: boolean;
  }>(),
});

// User subscriptions table - for tracking subscription status
export const UserSubscriptions = pgTable('user_subscriptions', {
  id: text('id').primaryKey().notNull(),
  user_id: text('user_id').notNull(),
  plan_name: text('plan_name').notNull(), // 'basic', 'pro', 'premium'
  status: text('status').notNull(), // 'active', 'cancelled', 'expired'
  stripe_subscription_id: text('stripe_subscription_id'),
  stripe_customer_id: text('stripe_customer_id'),
  current_period_start: timestamp('current_period_start'),
  current_period_end: timestamp('current_period_end'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// User activity log table - for tracking user actions
export const UserActivityLog = pgTable('user_activity_log', {
  id: text('id').primaryKey().notNull(),
  user_id: text('user_id').notNull(),
  action: text('action').notNull(), // 'login', 'logout', 'subscription_created', etc.
  details: jsonb('details').$type<Record<string, any>>(),
  ip_address: text('ip_address'),
  user_agent: text('user_agent'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// AI chat conversations table
export const AiConversations = pgTable('ai_conversations', {
  id: text('id').primaryKey().notNull(),
  user_id: text('user_id').notNull(),
  title: text('title').notNull(),
  model: text('model').notNull().default('deepseek/deepseek-r1-0528'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// AI chat messages table
export const AiMessages = pgTable('ai_messages', {
  id: text('id').primaryKey().notNull(),
  conversation_id: text('conversation_id').notNull(),
  role: text('role').notNull(), // 'user', 'assistant', 'system'
  content: text('content').notNull(),
  tokens_used: integer('tokens_used').default(0),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// AI usage tracking table
export const AiUsage = pgTable('ai_usage', {
  id: text('id').primaryKey().notNull(),
  user_id: text('user_id').notNull(),
  model: text('model').notNull(),
  tokens_used: integer('tokens_used').notNull(),
  cost: text('cost'), // Store as string to avoid floating point issues
  request_type: text('request_type').notNull(), // 'chat', 'completion', etc.
  created_at: timestamp('created_at').defaultNow().notNull(),
});
