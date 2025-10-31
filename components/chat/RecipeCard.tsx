import clsx from 'clsx';
import { Markdown } from '@/components/ui/Markdown';

interface RecipeCardProps {
  content: string;
  isLoading?: boolean;
}

export function RecipeCard({ content, isLoading }: RecipeCardProps) {
  // Parse recipe sections from content
  const parseSection = (text: string, header: string) => {
    const regex = new RegExp(`${header}[:\\s]*(.+?)(?=(?:📋|⏱️|🥘|👨‍🍳|💡|🇵🇭|✨|$))`, 's');
    const match = text.match(regex);
    return match ? match[1].trim() : null;
  };

  const title = parseSection(content, '📋 RECIPE TITLE|Recipe Title|Title');
  const time = parseSection(content, '⏱️ TIME & SERVINGS|Time & Servings|Time');
  const ingredients = parseSection(content, '🥘 INGREDIENTS|Ingredients');
  const instructions = parseSection(content, '👨‍🍳 STEP-BY-STEP INSTRUCTIONS|Step-by-Step Instructions|Instructions');
  const proTip = parseSection(content, '💡 PRO TIP|Pro Tip');
  const cultural = parseSection(content, '🇵🇭 CULTURAL INSIGHT|Cultural Insight');
  const plating = parseSection(content, '✨ PLATING SUGGESTION|Plating Suggestion');

  // Check if this looks like a recipe card
  const isRecipeCard = !!(title || ingredients || instructions);

  if (isLoading) {
    return (
      <div className="rounded-2xl sm:rounded-3xl border border-brand-gray-800/70 bg-gradient-to-br from-brand-lime/5 to-brand-gray-900/50 p-4 sm:p-6 space-y-3">
        <div className="h-6 w-3/4 bg-brand-gray-800/50 rounded animate-pulse"></div>
        <div className="h-4 w-full bg-brand-gray-800/50 rounded animate-pulse"></div>
        <div className="h-4 w-5/6 bg-brand-gray-800/50 rounded animate-pulse"></div>
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
      {/* Header */}
      {title && (
        <div className="border-b border-brand-lime/20 bg-brand-lime/10 px-4 sm:px-6 py-3 sm:py-4">
          <h3 className="text-lg sm:text-xl font-bold text-brand-lime flex items-center gap-2">
            🍛 {title}
          </h3>
        </div>
      )}

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
        {/* Time & Servings */}
        {time && (
          <div className="flex items-start gap-3">
            <span className="text-lg flex-shrink-0">⏱️</span>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-widest text-brand-gray-400 font-semibold mb-2">Prep & Cook Time</p>
              <Markdown content={time} />
            </div>
          </div>
        )}

        {/* Ingredients */}
        {ingredients && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🥘</span>
              <h4 className="text-xs uppercase tracking-widest text-brand-gray-400 font-semibold">Ingredients</h4>
            </div>
            <div className="bg-brand-gray-900/50 rounded-lg p-3 sm:p-4 border border-brand-gray-800/50">
              <Markdown content={ingredients} />
            </div>
          </div>
        )}

        {/* Instructions */}
        {instructions && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">👨‍🍳</span>
              <h4 className="text-xs uppercase tracking-widest text-brand-gray-400 font-semibold">Instructions</h4>
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
                <p className="text-xs uppercase tracking-widest text-brand-lime font-semibold mb-2">Pro Tip</p>
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
                <p className="text-xs uppercase tracking-widest text-brand-gray-400 font-semibold mb-2">Cultural Insight</p>
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
                <p className="text-xs uppercase tracking-widest text-brand-gray-400 font-semibold mb-2">Plating Suggestion</p>
                <Markdown content={plating} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
