import { currentUser } from '@clerk/nextjs/server';
import { getUserAiConversations, getAiUsageStats, checkAiUsageLimits } from '@/lib/ai-queries';
import { redirect } from 'next/navigation';
import { createAiConversation, createNewConversation } from '@/lib/ai-actions';
import { ConversationSidebar } from '@/components/chat/ConversationSidebar';
import { ChatInput } from '@/components/chat/ChatInput';
import { logEnvironmentInfo } from '@/lib/env-check';
import Link from 'next/link';
import AIService from '@/lib/ai-service';

export default async function AiPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/');
  }

  try {
    console.log('Loading AI page for user:', user.id);
    logEnvironmentInfo();

    const [conversations, usageStats, usageLimits] = await Promise.all([
      getUserAiConversations(20),
      getAiUsageStats(),
      checkAiUsageLimits('free'), // TODO: Get actual user plan
    ]);

    console.log('Loaded data - conversations:', conversations.length, 'usage:', usageStats);

    const systemPrompts = AIService.getSystemPrompts();

    // If user has conversations, redirect to the most recent one
    if (conversations.length > 0) {
      redirect(`/ai/${conversations[0].id}`);
    }

    // Show welcome screen for new users
    return (
      <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <div className="w-80 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <form action={createNewConversation}>
              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 px-4 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="font-medium">New Chat</span>
              </button>
            </form>
          </div>

          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <span>Daily Usage</span>
                  <span>{usageStats.dailyTokens.toLocaleString()} / {usageLimits.dailyLimit.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((usageStats.dailyTokens / usageLimits.dailyLimit) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 p-8 text-center">
            <svg className="mx-auto text-gray-300 dark:text-gray-600 mb-4" width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400 text-sm">No conversations yet</p>
            <form action={createNewConversation} className="mt-2">
              <button
                type="submit"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Start your first chat
              </button>
            </form>
          </div>
        </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Welcome Screen */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-2xl text-center">
            <div className="mb-8">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Welcome to AI Assistant
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Powered by DeepSeek R1 - Advanced reasoning AI model
              </p>
            </div>

            {/* Quick Start Options */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {Object.entries(systemPrompts).slice(0, 4).map(([key, prompt]) => (
                <form key={key} action={createAiConversation} className="block">
                  <input type="hidden" name="systemPrompt" value={prompt} />
                  <input type="hidden" name="title" value={`${key.charAt(0).toUpperCase() + key.slice(1)} Assistant`} />
                  <button
                    type="submit"
                    disabled={!usageLimits.canMakeRequest}
                    className="w-full p-6 text-left border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-white dark:hover:bg-gray-800 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 capitalize mb-2">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {prompt.slice(0, 100)}...
                    </p>
                  </button>
                </form>
              ))}
            </div>

            {/* Usage Limit Warning */}
            {!usageLimits.canMakeRequest && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <h3 className="text-red-800 dark:text-red-200 font-medium mb-2">
                  Usage Limit Reached
                </h3>
                <p className="text-red-700 dark:text-red-300 text-sm mb-3">
                  You've reached your daily or monthly token limit.
                </p>
                <Link
                  href="/pricing"
                  className="inline-block px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                >
                  Upgrade Plan
                </Link>
              </div>
            )}

            {/* Start Button */}
            <form action={createNewConversation}>
              <button
                type="submit"
                disabled={!usageLimits.canMakeRequest}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
              >
                Start New Conversation
              </button>
            </form>

            {/* Usage Stats */}
            <div className="mt-8 grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {usageStats.dailyTokens.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Daily tokens used
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {usageStats.totalConversations}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total conversations
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    );
  } catch (error) {
    console.error('Error loading AI page:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Service Temporarily Unavailable
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We're experiencing some technical difficulties. Please try again in a few moments.
          </p>
          <div className="space-y-3">
            <Link
              href="/dashboard"
              className="block w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/ai"
              className="block w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg transition-colors text-center"
            >
              Try Again
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
