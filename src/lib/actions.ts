'use server';

import { currentUser } from '@clerk/nextjs/server';
import { db, UserMessages, UserProfiles, UserActivityLog } from '@/db';
import { redirect } from 'next/navigation';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// User Message Actions
export async function createUserMessage(formData: FormData) {
  const user = await currentUser();
  if (!user) throw new Error('User not found');

  const message = formData.get('message') as string;
  if (!message || message.trim().length === 0) {
    throw new Error('Message cannot be empty');
  }

  try {
    await db.insert(UserMessages).values({
      user_id: user.id,
      message: message.trim(),
    });

    // Log the activity
    await logUserActivity(user.id, 'message_created', { message: message.trim() });

    revalidatePath('/dashboard');
    redirect('/dashboard');
  } catch (error) {
    console.error('Error creating user message:', error);
    throw new Error('Failed to create message');
  }
}

export async function updateUserMessage(formData: FormData) {
  const user = await currentUser();
  if (!user) throw new Error('User not found');

  const message = formData.get('message') as string;
  if (!message || message.trim().length === 0) {
    throw new Error('Message cannot be empty');
  }

  try {
    await db
      .update(UserMessages)
      .set({ message: message.trim() })
      .where(eq(UserMessages.user_id, user.id));

    // Log the activity
    await logUserActivity(user.id, 'message_updated', { message: message.trim() });

    revalidatePath('/dashboard');
    redirect('/dashboard');
  } catch (error) {
    console.error('Error updating user message:', error);
    throw new Error('Failed to update message');
  }
}

export async function deleteUserMessage() {
  const user = await currentUser();
  if (!user) throw new Error('User not found');

  try {
    await db.delete(UserMessages).where(eq(UserMessages.user_id, user.id));

    // Log the activity
    await logUserActivity(user.id, 'message_deleted', {});

    revalidatePath('/dashboard');
    redirect('/dashboard');
  } catch (error) {
    console.error('Error deleting user message:', error);
    throw new Error('Failed to delete message');
  }
}

// User Profile Actions
export async function createOrUpdateUserProfile() {
  const user = await currentUser();
  if (!user) throw new Error('User not found');

  try {
    const existingProfile = await db.query.UserProfiles.findFirst({
      where: (profiles, { eq }) => eq(profiles.user_id, user.id),
    });

    const profileData = {
      user_id: user.id,
      email: user.emailAddresses[0]?.emailAddress || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      imageUrl: user.imageUrl || '',
      updatedAt: new Date(),
    };

    if (existingProfile) {
      await db
        .update(UserProfiles)
        .set(profileData)
        .where(eq(UserProfiles.user_id, user.id));
    } else {
      await db.insert(UserProfiles).values({
        ...profileData,
        preferences: {
          theme: 'light',
          notifications: true,
          newsletter: false,
        },
      });

      // Log the activity for new profile creation
      await logUserActivity(user.id, 'profile_created', {
        email: profileData.email,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
      });
    }
  } catch (error) {
    console.error('Error creating/updating user profile:', error);
    throw new Error('Failed to create/update profile');
  }
}

export async function updateUserPreferences(formData: FormData) {
  const user = await currentUser();
  if (!user) throw new Error('User not found');

  const theme = formData.get('theme') as 'light' | 'dark';
  const notifications = formData.get('notifications') === 'on';
  const newsletter = formData.get('newsletter') === 'on';

  try {
    await db
      .update(UserProfiles)
      .set({
        preferences: {
          theme,
          notifications,
          newsletter,
        },
        updatedAt: new Date(),
      })
      .where(eq(UserProfiles.user_id, user.id));

    // Log the activity
    await logUserActivity(user.id, 'preferences_updated', {
      theme,
      notifications,
      newsletter,
    });

    revalidatePath('/profile');
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw new Error('Failed to update preferences');
  }
}

// Activity Logging
export async function logUserActivity(
  userId: string,
  action: string,
  details: Record<string, any> = {},
  ipAddress?: string,
  userAgent?: string
) {
  try {
    await db.insert(UserActivityLog).values({
      id: `${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      action,
      details,
      ip_address: ipAddress,
      user_agent: userAgent,
    });
  } catch (error) {
    console.error('Error logging user activity:', error);
    // Don't throw error for logging failures
  }
}
