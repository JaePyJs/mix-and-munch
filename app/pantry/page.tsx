'use client';

import { useMemo, useState } from 'react';

import { IngredientToggle } from '@/components/pantry/IngredientToggle';
import { RecipeCard } from '@/components/recipes/RecipeCard';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { getAllIngredients, getMatchResults } from '@/lib/data';
import type { PantrySelection } from '@/lib/types';

const ingredients = getAllIngredients();

export default function PantryPage() {
  const [selection, setSelection] = useState<PantrySelection>(() => {
    const initial: PantrySelection = {};
    for (const item of ingredients) {
      initial[item.id] = false;
    }
    return initial;
  });

  const toggleIngredient = (id: string) => {
    setSelection((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const clearSelection = () => {
    const reset: PantrySelection = {};
    for (const item of ingredients) reset[item.id] = false;
    setSelection(reset);
  };

  const selectedCount = useMemo(
    () => Object.values(selection).filter(Boolean).length,
    [selection]
  );

  const matches = useMemo(() => getMatchResults(selection), [selection]);

  return (
    <div className="page-grid space-y-12">
      <header className="space-y-4">
        <Tag tone="lime" className="w-fit">Pantry checklist &amp; smart matching</Tag>
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">Toggle your pantry. Watch recipes bloom.</h1>
        <p className="max-w-2xl text-sm text-brand-gray-400">
          Pick the ingredients currently in your kitchen. Mix &amp; Munch highlights Filipino-forward dishes that make the most of your selection while suggesting what to shop for next.
        </p>
      </header>

      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr),minmax(0,2fr)] lg:items-start">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Pantry collection</h2>
            <Button variant="ghost" onClick={clearSelection} disabled={selectedCount === 0}>
              Clear ({selectedCount})
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {ingredients.map((ingredient) => (
              <IngredientToggle
                key={ingredient.id}
                ingredient={ingredient}
                active={selection[ingredient.id]}
                onToggle={toggleIngredient}
              />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Recipe matches</h2>
              <p className="text-xs text-brand-gray-500">
                Showing {matches.length} dishes ranked by pantry match and rating.
              </p>
            </div>
            <Tag tone="gray" className="text-xs">
              {selectedCount} ingredient{selectedCount !== 1 ? 's' : ''} selected
            </Tag>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {matches.map((recipe, index) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                index={index}
                ingredients={ingredients}
                showMatch
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
