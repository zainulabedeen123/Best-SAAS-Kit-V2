import { currentUser } from '@clerk/nextjs/server';
import { getAiConversation, checkAiUsageLimits, getUserAiConversations, getAiUsageStats } from '@/lib/ai-queries';
import { sendAiMessage, deleteAiConversation, createNewConversation } from '@/lib/ai-actions';
import { redirect } from 'next/navigation';
import { ConversationSidebar } from '@/components/chat/ConversationSidebar';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import Link from 'next/link';

interface Props {
  params: Promise<{
    conversationId: string;
  }>;
}

export default async function ConversationPage({ params }: Props) {
  const user = await currentUser();

  if (!user) {
    redirect('/');
  }

  const { conversationId } = await params;

  try {
    const [{ conversation, messages }, usageLimits, conversations, usageStats] = await Promise.all([
      getAiConversation(conversationId),
      checkAiUsageLimits('free'), // TODO: Get actual user plan
      getUserAiConversations(20),
      getAiUsageStats(),
    ]);

    return (
      <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
        {/* Sidebar */}
        <ConversationSidebar
          conversations={conversations}
          currentConversationId={conversationId}
          onNewConversation={createNewConversation}
          onDeleteConversation={async (id: string) => {
            'use server';
            await deleteAiConversation(id);
            redirect('/ai');
          }}
          userStats={{
            dailyTokens: usageStats.dailyTokens,
            dailyLimit: usageLimits.dailyLimit,
            monthlyTokens: usageStats.monthlyTokens,
            monthlyLimit: usageLimits.monthlyLimit,
          }}
        />

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
          {/* Chat Header */}
          <div className="border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {conversation.title}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {conversation.model} • {messages.filter(m => m.role !== 'system').length} messages
                </p>
              </div>

              {/* Usage Warning */}
              {!usageLimits.canMakeRequest && (
                <div className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 px-3 py-1 rounded-full text-sm">
                  Limit reached
                </div>
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length > 0 ? (
              messages
                .filter(msg => msg.role !== 'system')
                .map((message, index) => (
                  <ChatMessage
                    key={message.id}
                    message={{
                      ...message,
                      role: message.role as 'user' | 'assistant' | 'system',
                      tokens_used: message.tokens_used || 0,
                    }}
                    isLast={index === messages.filter(m => m.role !== 'system').length - 1}
                  />
                ))
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Start the conversation
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Send a message to begin chatting with the AI assistant.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <form action={sendAiMessage} className="p-4">
              <input type="hidden" name="conversationId" value={conversationId} />
              <div className="flex items-end space-x-3">
                <div className="flex-1 relative">
                  <textarea
                    name="message"
                    rows={1}
                    className="w-full resize-none border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed max-h-32"
                    placeholder={
                      !usageLimits.canMakeRequest
                        ? "Usage limit reached. Please upgrade your plan."
                        : "Type your message..."
                    }
                    disabled={!usageLimits.canMakeRequest}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={!usageLimits.canMakeRequest}
                  className="flex-shrink-0 p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
              <div className="flex justify-between items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span>Press Enter to send, Shift+Enter for new line</span>
                <span>Remaining: {usageLimits.remainingDaily.toLocaleString()} tokens</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error loading conversation:', error);
    console.error('Conversation ID:', conversationId);
    console.error('User ID:', user?.id);

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Something went wrong
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            We couldn't load this conversation. It might not exist or you don't have access to it.
          </p>
          <div className="space-y-3">
            <Link
              href="/ai"
              className="block w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Back to AI Chat
            </Link>
            <Link
              href="/dashboard"
              className="block w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
