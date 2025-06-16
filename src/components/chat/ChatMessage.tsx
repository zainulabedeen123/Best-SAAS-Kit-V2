'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, User, Bot, ThumbsUp, ThumbsDown } from 'lucide-react';

interface ChatMessageProps {
  message: {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    tokens_used?: number;
    created_at: Date;
  };
  isLast?: boolean;
}

export function ChatMessage({ message, isLast }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [reaction, setReaction] = useState<'like' | 'dislike' | null>(null);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleReaction = (type: 'like' | 'dislike') => {
    setReaction(reaction === type ? null : type);
    // TODO: Send reaction to backend
  };

  if (message.role === 'system') return null;

  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`group relative mb-6 ${isLast ? 'mb-8' : ''}`}>
      <div className="flex items-start space-x-4">
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
        }`}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {isUser ? 'You' : 'AI Assistant'}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {message.created_at.toLocaleTimeString()}
            </span>
            {message.tokens_used && message.tokens_used > 0 && (
              <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                {message.tokens_used} tokens
              </span>
            )}
          </div>

          {/* Message Text */}
          <div className={`${
            isUser
              ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3'
              : 'text-gray-900 dark:text-gray-100'
          }`}>
            {isUser ? (
              <p className="text-blue-900 dark:text-blue-100 m-0 whitespace-pre-wrap">
                {message.content}
              </p>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <div className="relative">
                        <SyntaxHighlighter
                          style={oneDark}
                          language={match[1]}
                          PreTag="div"
                          className="rounded-md"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                        <button
                          onClick={() => copyToClipboard(String(children))}
                          className="absolute top-2 right-2 p-1 bg-gray-700 hover:bg-gray-600 rounded text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {copied ? <Check size={12} /> : <Copy size={12} />}
                        </button>
                      </div>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {isAssistant && (
            <div className="flex items-center space-x-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => copyToClipboard(message.content)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
                title="Copy message"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
              <button
                onClick={() => handleReaction('like')}
                className={`p-1 rounded ${
                  reaction === 'like' 
                    ? 'text-green-600 bg-green-100 dark:bg-green-900/20' 
                    : 'text-gray-400 hover:text-green-600'
                }`}
                title="Good response"
              >
                <ThumbsUp size={14} />
              </button>
              <button
                onClick={() => handleReaction('dislike')}
                className={`p-1 rounded ${
                  reaction === 'dislike' 
                    ? 'text-red-600 bg-red-100 dark:bg-red-900/20' 
                    : 'text-gray-400 hover:text-red-600'
                }`}
                title="Poor response"
              >
                <ThumbsDown size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
