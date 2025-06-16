import { currentUser } from '@clerk/nextjs/server';
import { db, UserMessages, UserProfiles, UserActivityLog, UserSubscriptions } from '@/db';
import { eq, desc } from 'drizzle-orm';

// User Message Queries
export async function getUserMessage() {
  const user = await currentUser();
  if (!user) throw new Error('User not found');

  return db.query.UserMessages.findFirst({
    where: (messages, { eq }) => eq(messages.user_id, user.id),
  });
}

// User Profile Queries
export async function getUserProfile() {
  const user = await currentUser();
  if (!user) throw new Error('User not found');

  return db.query.UserProfiles.findFirst({
    where: (profiles, { eq }) => eq(profiles.user_id, user.id),
  });
}

export async function getUserProfileWithDefaults() {
  const user = await currentUser();
  if (!user) throw new Error('User not found');

  const profile = await getUserProfile();
  
  // Return profile with defaults if not found
  return profile || {
    user_id: user.id,
    email: user.emailAddresses[0]?.emailAddress || '',
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    imageUrl: user.imageUrl || '',
    createdAt: new Date(),
    updatedAt: new Date(),
    preferences: {
      theme: 'light' as const,
      notifications: true,
      newsletter: false,
    },
  };
}

// User Activity Queries
export async function getUserActivity(limit: number = 10) {
  const user = await currentUser();
  if (!user) throw new Error('User not found');

  return db.query.UserActivityLog.findMany({
    where: (logs, { eq }) => eq(logs.user_id, user.id),
    orderBy: [desc(UserActivityLog.created_at)],
    limit,
  });
}

// User Subscription Queries
export async function getUserSubscription() {
  const user = await currentUser();
  if (!user) throw new Error('User not found');

  return db.query.UserSubscriptions.findFirst({
    where: (subscriptions, { eq }) => eq(subscriptions.user_id, user.id),
    orderBy: [desc(UserSubscriptions.created_at)],
  });
}

export async function getUserSubscriptionStatus() {
  const subscription = await getUserSubscription();
  
  if (!subscription) {
    return {
      plan: 'free',
      status: 'none',
      isActive: false,
    };
  }

  const isActive = subscription.status === 'active' && 
    subscription.current_period_end && 
    new Date(subscription.current_period_end) > new Date();

  return {
    plan: subscription.plan_name,
    status: subscription.status,
    isActive,
    currentPeriodEnd: subscription.current_period_end,
  };
}

// Database Statistics
export async function getDatabaseStats() {
  const user = await currentUser();
  if (!user) throw new Error('User not found');

  try {
    const [messageCount, activityCount] = await Promise.all([
      db.query.UserMessages.findMany({
        where: (messages, { eq }) => eq(messages.user_id, user.id),
      }).then(results => results.length),
      
      db.query.UserActivityLog.findMany({
        where: (logs, { eq }) => eq(logs.user_id, user.id),
      }).then(results => results.length),
    ]);

    return {
      messageCount,
      activityCount,
    };
  } catch (error) {
    console.error('Error getting database stats:', error);
    return {
      messageCount: 0,
      activityCount: 0,
    };
  }
}

// Test Database Connection
export async function testDatabaseConnection() {
  try {
    const result = await db.execute('SELECT version()');
    return {
      success: true,
      version: result.rows[0]?.version || 'Unknown',
    };
  } catch (error) {
    console.error('Database connection test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
