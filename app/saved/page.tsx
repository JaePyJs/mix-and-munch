'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Markdown } from '@/components/ui/Markdown';
import clsx from 'clsx';

interface SavedRecipe {
  id: string;
  title: string;
  content: string;
  savedAt: string;
}

export default function SavedRecipesPage() {
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<SavedRecipe | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = JSON.parse(localStorage.getItem('savedRecipes') || '[]');
      setRecipes(saved);
    } catch (error) {
      console.error('Error loading saved recipes:', error);
    }
  }, []);

  const deleteRecipe = (id: string) => {
    const updated = recipes.filter(r => r.id !== id);
    setRecipes(updated);
    localStorage.setItem('savedRecipes', JSON.stringify(updated));
    setSelectedRecipe(null);
  };

  const exportRecipes = () => {
    const data = JSON.stringify(recipes, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mix-munch-recipes-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  if (!mounted) return null;

  return (
    <div className="page-grid grid gap-4 pb-6 lg:gap-10 lg:grid-cols-[minmax(0,1.2fr),minmax(0,1.8fr)] lg:items-start">
      {/* Sidebar - Recipes List */}
      <aside className="flex flex-col gap-4 order-2 lg:order-1">
        <section className="space-y-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">💾 Saved Recipes</h1>
            <p className="text-xs sm:text-sm text-brand-gray-400">
              {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} saved
            </p>
          </div>

          {recipes.length > 0 && (
            <button
              onClick={exportRecipes}
              className="w-full px-4 py-2 bg-brand-lime/20 text-brand-lime border border-brand-lime/50 rounded-lg hover:bg-brand-lime/30 transition text-sm font-semibold"
            >
              📥 Export All as JSON
            </button>
          )}

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {recipes.length === 0 ? (
              <div className="text-center py-8 text-brand-gray-500">
                <p className="text-sm">No recipes saved yet</p>
                <p className="text-xs mt-2">Click the Save button on any AI-generated recipe</p>
                <Link
                  href="/chat"
                  className="text-brand-lime hover:underline text-xs mt-3 block"
                >
                  → Go to Chat
                </Link>
              </div>
            ) : (
              recipes.map((recipe) => (
                <button
                  key={recipe.id}
                  onClick={() => setSelectedRecipe(recipe)}
                  className={clsx(
                    'w-full text-left p-3 rounded-lg border transition',
                    selectedRecipe?.id === recipe.id
                      ? 'bg-brand-lime/20 border-brand-lime/50'
                      : 'bg-brand-gray-900/50 border-brand-gray-800/50 hover:border-brand-gray-700'
                  )}
                >
                  <p className="text-sm font-semibold text-brand-gray-100 truncate">
                    {recipe.title}
                  </p>
                  <p className="text-xs text-brand-gray-500 mt-1">
                    {new Date(recipe.savedAt).toLocaleDateString()}
                  </p>
                </button>
              ))
            )}
          </div>
        </section>
      </aside>

      {/* Main - Recipe View */}
      <section className="order-1 lg:order-2">
        {selectedRecipe ? (
          <div className="rounded-2xl sm:rounded-3xl border border-brand-lime/40 bg-gradient-to-br from-brand-lime/8 via-brand-gray-900/40 to-brand-gray-900/50 overflow-hidden shadow-lg">
            <div className="bg-brand-lime/10 border-b border-brand-lime/20 px-4 sm:px-6 py-4 flex justify-between items-start gap-4">
              <h2 className="text-lg sm:text-xl font-bold text-brand-lime">
                📋 {selectedRecipe.title}
              </h2>
              <button
                onClick={() => deleteRecipe(selectedRecipe.id)}
                className="px-3 py-1 bg-red-500/20 text-red-300 border border-red-500/50 rounded text-xs font-semibold hover:bg-red-500/30 transition"
              >
                🗑️ Delete
              </button>
            </div>

            <div className="p-4 sm:p-6 max-h-[700px] overflow-y-auto">
              <Markdown content={selectedRecipe.content} />
            </div>

            <div className="border-t border-brand-gray-800/50 px-4 sm:px-6 py-4 flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedRecipe.content);
                  alert('Recipe copied to clipboard!');
                }}
                className="flex-1 px-4 py-2 bg-brand-lime/20 text-brand-lime border border-brand-lime/50 rounded-lg hover:bg-brand-lime/30 transition text-sm font-semibold"
              >
                📋 Copy
              </button>
              <button
                onClick={() => {
                  const element = document.createElement('a');
                  const file = new Blob([selectedRecipe.content], { type: 'text/plain' });
                  element.href = URL.createObjectURL(file);
                  element.download = `${selectedRecipe.title.replace(/\s+/g, '-').toLowerCase()}.txt`;
                  element.click();
                }}
                className="flex-1 px-4 py-2 bg-brand-lime/20 text-brand-lime border border-brand-lime/50 rounded-lg hover:bg-brand-lime/30 transition text-sm font-semibold"
              >
                💾 Download
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl sm:rounded-3xl border border-brand-gray-800/70 bg-brand-gray-900/40 p-6 sm:p-8 text-center">
            <p className="text-brand-gray-400 text-sm">
              Select a recipe from the list to view details
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
