import clsx from 'clsx';
import type { Message } from 'ai';
import { Markdown } from '@/components/ui/Markdown';
import { useState } from 'react';

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
  const isRecipe = isAssistant && (message.content.includes('🥘') || message.content.includes('📋'));
  const [saved, setSaved] = useState(false);

  const handleSaveRecipe = () => {
    // Extract recipe title from content
    const titleMatch = message.content.match(/📋 \*\*([^*]+)\*\*/);
    const title = titleMatch ? titleMatch[1] : 'Saved Recipe';
    
    const savedRecipe = {
      id: message.id,
      title: title,
      content: message.content,
      savedAt: new Date().toISOString(),
    };

    // Save to localStorage
    const existing = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
    existing.push(savedRecipe);
    localStorage.setItem('savedRecipes', JSON.stringify(existing));
    
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex w-full flex-col gap-2 sm:gap-3">
      {/* Header with role and model badge */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-between">
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
        {isRecipe && !isLoading && (
          <button
            onClick={handleSaveRecipe}
            className={clsx(
              'text-xs px-2 sm:px-3 py-1 rounded-full font-semibold transition-all',
              saved 
                ? 'bg-green-500/30 text-green-300 border border-green-500/50' 
                : 'bg-brand-lime/20 text-brand-lime border border-brand-lime/50 hover:bg-brand-lime/30'
            )}
          >
            {saved ? '✅ Saved!' : '💾 Save'}
          </button>
        )}
      </div>

      {/* Message content */}
      {isRecipe ? (
        <RecipeCard content={message.content} isLoading={isLoading} />
      ) : (
        <div className={clsx('flex w-full flex-col gap-1.5 sm:gap-2 rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-md', meta.tone)}>
          <Markdown content={message.content} />
        </div>
      )}
    </div>
  );
}
