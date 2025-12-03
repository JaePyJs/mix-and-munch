'use client';

import { useMemo } from 'react';
import { getAllIngredients } from '@/lib/data';
import type { MatchResult, PantrySelection } from '@/lib/types';

interface SubstituteSuggestionsProps {
  recipe: MatchResult;
  selection: PantrySelection;
  onAddIngredient?: (ingredientId: string) => void;
}

const allIngredients = getAllIngredients();

export function SubstituteSuggestions({
  recipe,
  selection,
  onAddIngredient,
}: SubstituteSuggestionsProps) {
  // Use substituteSuggestions from MatchResult if available
  const suggestions = useMemo(() => {
    if (!recipe.substituteSuggestions || recipe.substituteSuggestions.length === 0) {
      return [];
    }

    // Transform suggestions to include substitute IDs for the "Add" button
    return recipe.substituteSuggestions.flatMap((suggestion) => {
      return suggestion.substitutes.map((substituteName) => {
        const substituteIngredient = allIngredients.find(
          (ing) => ing.name.toLowerCase() === substituteName.toLowerCase()
        );
        return {
          missingIngredient: suggestion.missing,
          substituteName,
          substituteId: substituteIngredient?.id || '',
        };
      });
    });
  }, [recipe.substituteSuggestions]);

  if (suggestions.length === 0) return null;

  return (
    <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
      <p className="text-xs font-medium text-amber-400 mb-2">
        💡 Ingredient Substitutes Available
      </p>
      <div className="space-y-2">
        {suggestions.slice(0, 3).map((suggestion, idx) => {
          const substituteIngredient = allIngredients.find(
            (ing) => ing.id === suggestion.substituteId
          );
          const substituteEmoji = substituteIngredient?.emoji || '🔄';

          return (
            <div
              key={`${suggestion.missingIngredient}-${suggestion.substituteId}-${idx}`}
              className="flex items-center justify-between gap-2 text-xs"
            >
              <span className="text-brand-gray-300">
                No <span className="text-red-400">{suggestion.missingIngredient}</span>?
                Try{' '}
                <span className="text-brand-lime">
                  {substituteEmoji} {suggestion.substituteName}
                </span>
              </span>
              {onAddIngredient &&
                suggestion.substituteId &&
                !selection[suggestion.substituteId] && (
                  <button
                    onClick={() => onAddIngredient(suggestion.substituteId)}
                    className="px-2 py-0.5 rounded-lg bg-brand-lime/20 text-brand-lime text-xs hover:bg-brand-lime/30 transition-colors"
                    title={`Add ${suggestion.substituteName} to selection`}
                  >
                    + Add
                  </button>
                )}
            </div>
          );
        })}
        {suggestions.length > 3 && (
          <p className="text-xs text-brand-gray-500 mt-1">
            +{suggestions.length - 3} more substitutes available
          </p>
        )}
      </div>
    </div>
  );
}
