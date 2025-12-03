'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { IngredientToggle } from '@/components/pantry/IngredientToggle';
import { RecipeCard } from '@/components/recipes/RecipeCard';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { getAllIngredients, getMatchResults } from '@/lib/data';
import type { PantrySelection } from '@/lib/types';
import { useTranslation } from '@/lib/hooks/useTranslation';

const ingredients = getAllIngredients();

export default function PantryPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [selection, setSelection] = useState<PantrySelection>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [minMatchPercentage, setMinMatchPercentage] = useState<number>(30);

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(ingredients.map((ing) => ing.category)));
    return ['All', ...uniqueCategories.sort()];
  }, []);

  // Filter ingredients based on search and category
  const filteredIngredients = useMemo(() => {
    return ingredients.filter((ingredient) => {
      const matchesSearch =
        ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ingredient.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === 'All' || ingredient.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const matches = useMemo(
    () => getMatchResults(selection, minMatchPercentage),
    [selection, minMatchPercentage]
  );
  const selectedCount = Object.values(selection).filter(Boolean).length;

  // Get selected ingredient names for AI Chef
  const selectedIngredientNames = useMemo(() => {
    return ingredients.filter((ing) => selection[ing.id]).map((ing) => ing.name);
  }, [selection]);

  function toggleIngredient(id: string) {
    setSelection((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function clearSelection() {
    setSelection({});
  }

  // Navigate to chat with selected ingredients
  function askAIChef() {
    const ingredientList = selectedIngredientNames.join(', ');
    const prompt =
      selectedCount > 0
        ? `I have these ingredients: ${ingredientList}. What Filipino dishes can I make?`
        : `Surprise me with a creative Filipino recipe!`;

    // Store the prompt in sessionStorage to be picked up by chat page
    sessionStorage.setItem('pendingChatPrompt', prompt);
    router.push('/chat');
  }

  // Get random recipe suggestion
  function getRandomRecipe() {
    const randomIngredients = ingredients.sort(() => Math.random() - 0.5).slice(0, 3);

    randomIngredients.forEach((ing) => {
      setSelection((prev) => ({ ...prev, [ing.id]: true }));
    });
  }

  return (
    <div className="page-grid space-y-10">
      <header className="space-y-4">
        <Tag tone="lime" className="w-fit">
          {t('pantry.tag')}
        </Tag>
        <h1 className="text-3xl font-semibold text-white sm:text-4xl">
          {t('pantry.title')}
        </h1>
        <p className="max-w-2xl text-sm text-brand-gray-400">{t('pantry.description')}</p>
      </header>

      <section className="space-y-8">
        <div className="space-y-6">
          {/* Search and Filter Controls */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder={t('pantry.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-brand-gray-800 bg-brand-gray-900/50 px-4 py-3 text-sm text-white placeholder-brand-gray-500 focus:border-brand-lime/60 focus:outline-none focus:ring-2 focus:ring-brand-lime/60 focus:ring-offset-2 focus:ring-offset-brand-gray-950"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-brand-gray-400">
                {t('pantry.categoryLabel')}:
              </span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="rounded-xl border border-brand-gray-800 bg-brand-gray-900/50 px-3 py-2 text-sm text-white focus:border-brand-lime/60 focus:outline-none focus:ring-2 focus:ring-brand-lime/60 focus:ring-offset-2 focus:ring-offset-brand-gray-950"
              >
                {categories.map((category) => (
                  <option key={category} value={category} className="bg-brand-gray-900">
                    {category === 'All' ? t('pantry.allCategories') : category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                {t('pantry.availableIngredients')}
              </h2>
              <p className="text-xs text-brand-gray-500">
                {t('pantry.showingResults', {
                  filtered: filteredIngredients.length,
                  total: ingredients.length,
                  searchTerm: searchTerm
                    ? ` ${t('pantry.matching')} "${searchTerm}"`
                    : '',
                  category:
                    selectedCategory !== 'All'
                      ? ` ${t('pantry.inCategory')} ${selectedCategory}`
                      : '',
                })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Tag tone="gray" className="text-xs">
                {t('pantry.selectedCount', { count: selectedCount })}
              </Tag>
              {selectedCount > 0 && (
                <Button variant="ghost" onClick={clearSelection}>
                  {t('pantry.clearAll')}
                </Button>
              )}
            </div>
          </div>

          {/* AI Chef Action Bar */}
          <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-brand-lime/10 to-brand-green/10 border border-brand-lime/20">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">
                {selectedCount > 0
                  ? `🧑‍🍳 Ready to cook with ${selectedCount} ingredient${selectedCount > 1 ? 's' : ''}!`
                  : '🎲 Need inspiration? Let AI Chef surprise you!'}
              </p>
              <p className="text-xs text-brand-gray-400 truncate">
                {selectedCount > 0
                  ? selectedIngredientNames.slice(0, 5).join(', ') +
                    (selectedIngredientNames.length > 5 ? '...' : '')
                  : 'Select ingredients or ask for a random recipe'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={getRandomRecipe} className="text-sm">
                🎲 Random
              </Button>
              <Button
                variant="primary"
                onClick={askAIChef}
                className="text-sm bg-brand-lime text-brand-gray-950 hover:bg-brand-lime/90"
              >
                ✨ Ask AI Chef
              </Button>
            </div>
          </div>

          {/* Ingredients Grid - Organized by Category */}
          <div className="space-y-6">
            {selectedCategory === 'All' ? (
              // Group by category when showing all
              categories.slice(1).map((category) => {
                const categoryIngredients = filteredIngredients.filter(
                  (ing) => ing.category === category
                );
                if (categoryIngredients.length === 0) return null;

                return (
                  <div key={category} className="space-y-3">
                    <h3 className="text-sm font-semibold text-brand-gray-300 uppercase tracking-wider">
                      {category} ({categoryIngredients.length})
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {categoryIngredients.map((ingredient) => (
                        <IngredientToggle
                          key={ingredient.id}
                          ingredient={ingredient}
                          active={!!selection[ingredient.id]}
                          onToggle={toggleIngredient}
                        />
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              // Simple grid when filtering by specific category
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredIngredients.map((ingredient) => (
                  <IngredientToggle
                    key={ingredient.id}
                    ingredient={ingredient}
                    active={!!selection[ingredient.id]}
                    onToggle={toggleIngredient}
                  />
                ))}
              </div>
            )}
          </div>

          {/* No Results Message */}
          {filteredIngredients.length === 0 && (
            <div className="text-center py-12">
              <p className="text-brand-gray-400">{t('pantry.noResults')}</p>
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                }}
                className="mt-2"
              >
                {t('pantry.clearFilters')}
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                {t('pantry.recipeMatches')}
              </h2>
              <p className="text-xs text-brand-gray-500">
                {t('pantry.recipeMatchesDescription', { count: matches.length })}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="minMatch"
                  className="text-xs text-brand-gray-400 whitespace-nowrap"
                >
                  {t('pantry.minMatch')}:
                </label>
                <select
                  id="minMatch"
                  value={minMatchPercentage}
                  onChange={(e) => setMinMatchPercentage(Number(e.target.value))}
                  className="bg-brand-gray-800 border border-brand-gray-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-orange-500"
                >
                  <option value={0}>0%</option>
                  <option value={10}>10%</option>
                  <option value={20}>20%</option>
                  <option value={30}>30%</option>
                  <option value={40}>40%</option>
                  <option value={50}>50%</option>
                  <option value={60}>60%</option>
                  <option value={70}>70%</option>
                  <option value={80}>80%</option>
                  <option value={90}>90%</option>
                  <option value={100}>100%</option>
                </select>
              </div>
              <Tag tone="gray" className="text-xs">
                {t('pantry.ingredientsSelected', {
                  count: selectedCount,
                  plural: selectedCount !== 1 ? 's' : '',
                })}
              </Tag>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {matches.map((recipe, index) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                index={index}
                ingredients={ingredients}
                showMatch
                selection={selection}
                onAddIngredient={toggleIngredient}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
