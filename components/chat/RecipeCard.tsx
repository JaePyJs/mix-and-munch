'use client';

import clsx from 'clsx';
import { Markdown } from '@/components/ui/Markdown';
import { useTranslation } from '@/lib/hooks/useTranslation';

interface RecipeCardProps {
  content: string;
  isLoading?: boolean;
}

// Recipe placeholder icon component
const RecipePlaceholderIcon = ({ className }: { className?: string }) => (
  <div className={clsx('flex items-center justify-center bg-brand-lime/20 rounded-lg', className)}>
    <svg 
      width="48" 
      height="48" 
      viewBox="0 0 24 24" 
      fill="none" 
      className="text-brand-lime"
    >
      <path 
        d="M8.1 13.34l2.83-2.83L12.93 12l2.83-2.83L17.86 11l2.83-2.83L22 9.34l-1.51-1.51L18.69 6l-1.51 1.51L15.34 6l-1.51 1.51L12 9.34l-1.83-1.83L8.34 6l-1.51 1.51L5 9.34l1.51 1.51L8.1 13.34z" 
        fill="currentColor"
      />
      <path 
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" 
        fill="currentColor" 
        opacity="0.3"
      />
      <circle cx="12" cy="12" r="3" fill="currentColor"/>
    </svg>
  </div>
);

export function RecipeCard({ content, isLoading }: RecipeCardProps) {
  const { t } = useTranslation();
  
  // Parse recipe sections from content - simplified approach
  const parseSection = (text: string, header: string) => {
    const regex = new RegExp(`${header}[:\\s]*(.+?)(?=(?:📋|⏱️|🥘|👨‍🍳|💡|🇵🇭|✨|$))`, 's');
    const match = text.match(regex);
    return match ? match[1].trim() : null;
  };

  // Extract title - remove emoji and clean up
  let title = null;
  const titleMatch = content.match(/📋 \*\*(.+?)\*\*/);
  if (titleMatch) {
    title = titleMatch[1];
  }

  const time = parseSection(content, '⏱️');
  const ingredients = parseSection(content, '🥘');
  const instructions = parseSection(content, '👨‍🍳');
  const proTip = parseSection(content, '💡');
  const cultural = parseSection(content, '🇵🇭');
  const plating = parseSection(content, '✨');

  // Check if this looks like a recipe card
  const isRecipeCard = !!(time || ingredients || instructions);

  if (isLoading) {
    return (
      <div className="rounded-2xl sm:rounded-3xl border border-brand-gray-800/70 bg-gradient-to-br from-brand-lime/5 to-brand-gray-900/50 p-4 sm:p-6 space-y-3">
        <div className="flex gap-4">
          <div className="w-20 h-20 bg-brand-gray-800/50 rounded-lg animate-pulse flex-shrink-0"></div>
          <div className="flex-1 space-y-2">
            <div className="h-6 w-3/4 bg-brand-gray-800/50 rounded animate-pulse"></div>
            <div className="h-4 w-full bg-brand-gray-800/50 rounded animate-pulse"></div>
            <div className="h-4 w-5/6 bg-brand-gray-800/50 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isRecipeCard) {
    // Regular message display for non-recipe responses
    return (
      <div className="rounded-2xl sm:rounded-3xl border border-brand-lime/30 bg-brand-lime/10 p-4 sm:p-5 text-brand-gray-100">
        <p className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed break-words">{content}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-brand-lime/40 bg-gradient-to-br from-brand-lime/8 via-brand-gray-900/40 to-brand-gray-900/50 overflow-hidden shadow-lg">
      {/* Header with image placeholder */}
      {title && (
        <div className="border-b border-brand-lime/20 bg-brand-lime/10">
          <div className="flex gap-4 px-4 sm:px-6 py-3 sm:py-4">
            {/* Recipe placeholder image */}
            <RecipePlaceholderIcon className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0" />
            
            {/* Title and basic info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl font-bold text-brand-lime flex items-center gap-2 mb-2">
                🍛 {title}
              </h3>
              {time && (
                <div className="text-xs sm:text-sm text-brand-gray-300 bg-brand-gray-900/30 rounded px-2 py-1 inline-block">
                  ⏱️ {time.replace(/\*/g, '').trim()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
        {/* Ingredients */}
        {ingredients && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🥘</span>
              <h4 className="text-xs uppercase tracking-widest text-brand-gray-400 font-semibold">{t('chat.recipeCard.ingredients')}</h4>
            </div>
            <div className="bg-brand-gray-900/50 rounded-lg p-3 sm:p-4 border border-brand-gray-800/50 space-y-1">
              <Markdown content={ingredients} />
            </div>
          </div>
        )}

        {/* Instructions */}
        {instructions && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">👨‍🍳</span>
              <h4 className="text-xs uppercase tracking-widest text-brand-gray-400 font-semibold">{t('chat.recipeCard.stepByStep')}</h4>
            </div>
            <div className="bg-brand-gray-900/50 rounded-lg p-3 sm:p-4 border border-brand-gray-800/50">
              <Markdown content={instructions} />
            </div>
          </div>
        )}

        {/* Pro Tip */}
        {proTip && (
          <div className="bg-brand-lime/15 border border-brand-lime/30 rounded-lg p-3 sm:p-4">
            <div className="flex items-start gap-2">
              <span className="text-lg flex-shrink-0">💡</span>
              <div className="flex-1">
                <p className="text-xs uppercase tracking-widest text-brand-lime font-semibold mb-2">{t('chat.recipeCard.proTip')}</p>
                <Markdown content={proTip} />
              </div>
            </div>
          </div>
        )}

        {/* Cultural Insight */}
        {cultural && (
          <div className="bg-brand-gray-800/40 border border-brand-gray-700/40 rounded-lg p-3 sm:p-4">
            <div className="flex items-start gap-2">
              <span className="text-lg flex-shrink-0">🇵🇭</span>
              <div className="flex-1">
                <p className="text-xs uppercase tracking-widest text-brand-gray-300 font-semibold mb-2">{t('chat.recipeCard.culturalInsight')}</p>
                <Markdown content={cultural} />
              </div>
            </div>
          </div>
        )}

        {/* Plating Suggestion */}
        {plating && (
          <div className="bg-brand-gray-800/40 border border-brand-gray-700/40 rounded-lg p-3 sm:p-4">
            <div className="flex items-start gap-2">
              <span className="text-lg flex-shrink-0">✨</span>
              <div className="flex-1">
                <p className="text-xs uppercase tracking-widest text-brand-gray-300 font-semibold mb-2">{t('chat.recipeCard.platingSuggestion')}</p>
                <Markdown content={plating} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
