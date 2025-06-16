'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Plus, 
  MessageSquare, 
  Search, 
  MoreHorizontal, 
  Trash2, 
  Edit3,
  Settings,
  User,
  BarChart3
} from 'lucide-react';

interface Conversation {
  id: string;
  title: string;
  updated_at: Date;
  model: string;
}

interface ConversationSidebarProps {
  conversations: Conversation[];
  currentConversationId?: string;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  userStats: {
    dailyTokens: number;
    dailyLimit: number;
    monthlyTokens: number;
    monthlyLimit: number;
  };
}

export function ConversationSidebar({ 
  conversations, 
  currentConversationId,
  onNewConversation,
  onDeleteConversation,
  userStats
}: ConversationSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const pathname = usePathname();

  const filteredConversations = conversations.filter(conv =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (showDeleteConfirm === id) {
      onDeleteConversation(id);
      setShowDeleteConfirm(null);
    } else {
      setShowDeleteConfirm(id);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const dailyUsagePercent = (userStats.dailyTokens / userStats.dailyLimit) * 100;
  const monthlyUsagePercent = (userStats.monthlyTokens / userStats.monthlyLimit) * 100;

  return (
    <div className="w-80 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={onNewConversation}
          className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 px-4 transition-colors"
        >
          <Plus size={20} />
          <span className="font-medium">New Chat</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Usage Stats */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
              <span>Daily Usage</span>
              <span>{userStats.dailyTokens.toLocaleString()} / {userStats.dailyLimit.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(dailyUsagePercent, 100)}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
              <span>Monthly Usage</span>
              <span>{userStats.monthlyTokens.toLocaleString()} / {userStats.monthlyLimit.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(monthlyUsagePercent, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length > 0 ? (
          <div className="p-2">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`group relative mb-1 rounded-lg transition-colors ${
                  currentConversationId === conversation.id
                    ? 'bg-blue-100 dark:bg-blue-900/30'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Link
                  href={`/ai/${conversation.id}`}
                  className="block p-3 pr-10"
                >
                  <div className="flex items-start space-x-3">
                    <MessageSquare size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {conversation.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatDate(conversation.updated_at)}
                      </p>
                    </div>
                  </div>
                </Link>

                {/* Action Menu */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleDelete(conversation.id)}
                    className={`p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
                      showDeleteConfirm === conversation.id
                        ? 'text-red-600 bg-red-100 dark:bg-red-900/20'
                        : 'text-gray-400 hover:text-red-600'
                    }`}
                    title={showDeleteConfirm === conversation.id ? 'Click again to confirm' : 'Delete conversation'}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <MessageSquare className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </p>
            {!searchQuery && (
              <button
                onClick={onNewConversation}
                className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Start your first chat
              </button>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <Link
            href="/profile"
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <User size={16} />
            <span className="text-sm">Profile</span>
          </Link>
          
          <Link
            href="/dashboard"
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <BarChart3 size={16} />
            <span className="text-sm">Dashboard</span>
          </Link>
          
          <Link
            href="/pricing"
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <Settings size={16} />
            <span className="text-sm">Upgrade</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
