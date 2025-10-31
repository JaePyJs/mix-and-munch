import clsx from 'clsx';
import type { Message } from 'ai';
import { Markdown } from '@/components/ui/Markdown';

import { RecipeCard } from './RecipeCard';
import { AIModelBadge } from './AIModelBadge';

interface MessageBubbleProps {
  message: Message;
  isLoading?: boolean;
  aiModel?: 'gemini-2.5-pro' | 'gemini-2.5-flash' | 'glm-4.6' | 'unknown';
}

const roleMeta: Record<string, { label: string; tone: string; accent: string }> = {
  user: {
    label: 'You',
    tone: 'bg-brand-gray-900/90 border border-brand-gray-800 text-brand-gray-200',
    accent: 'bg-brand-lime/80 text-brand-gray-950',
  },
  assistant: {
    label: 'Mix',
    tone: 'bg-brand-lime/10 border border-brand-lime/30 text-brand-gray-100',
    accent: 'bg-brand-lime text-brand-gray-950',
  },
  system: {
    label: 'System',
    tone: 'bg-brand-gray-800/70 border border-brand-gray-700 text-brand-gray-300',
    accent: 'bg-brand-gray-700 text-brand-gray-200',
  },
};

export function MessageBubble({ message, isLoading, aiModel }: MessageBubbleProps) {
  const meta = roleMeta[message.role] ?? roleMeta.assistant;
  const isAssistant = message.role === 'assistant';

  return (
    <div className="flex w-full flex-col gap-2 sm:gap-3">
      {/* Header with role and model badge */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        <span className={clsx('rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-semibold', meta.accent)}>
          {meta.label}
        </span>
        {isAssistant && <AIModelBadge model={aiModel} isLoading={isLoading} />}
        <span className="text-brand-gray-500 text-xs">
          {new Date(message.createdAt ?? Date.now()).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>

      {/* Message content */}
      {isAssistant && (message.content.includes('🥘') || message.content.includes('📋')) ? (
        <RecipeCard content={message.content} isLoading={isLoading} />
      ) : (
        <div className={clsx('flex w-full flex-col gap-1.5 sm:gap-2 rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-md', meta.tone)}>
          <Markdown content={message.content} />
        </div>
      )}
    </div>
  );
}
