'use client';

import clsx from 'clsx';
import type { Ingredient } from '@/lib/types';

interface IngredientToggleProps {
  ingredient: Ingredient;
  active: boolean;
  onToggle: (id: string) => void;
}

export function IngredientToggle({ ingredient, active, onToggle }: IngredientToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(ingredient.id)}
      className={clsx(
        'flex items-center gap-3 rounded-2xl border px-4 py-3 transition',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime/60 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-gray-950',
        active
          ? 'border-brand-lime/60 bg-brand-lime/10 text-brand-lime'
          : 'border-brand-gray-800 bg-brand-gray-900/50 text-brand-gray-300 hover:border-brand-gray-700'
      )}
    >
      <span className="text-xl" aria-hidden>
        {ingredient.emoji}
      </span>
      <div className="text-left">
        <div className="text-sm font-semibold">{ingredient.name}</div>
        <div className="text-xs uppercase tracking-widest text-brand-gray-500">{ingredient.category}</div>
      </div>
      <span
        className={clsx(
          'ml-auto inline-flex h-6 w-10 items-center rounded-full border px-1 transition',
          active ? 'border-brand-lime/80 bg-brand-lime/30' : 'border-brand-gray-700 bg-brand-gray-900'
        )}
        aria-hidden
      >
        <span
          className={clsx(
            'h-4 w-4 rounded-full bg-white shadow transition',
            active ? 'translate-x-4 bg-brand-lime' : 'translate-x-0'
          )}
        />
      </span>
    </button>
  );
}
