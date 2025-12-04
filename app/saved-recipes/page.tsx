'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { Markdown } from '@/components/ui/Markdown';

interface RecipeIngredient {
  name: string;
  amount: string;
}

interface SavedRecipe {
  id: string;
  title: string;
  description?: string;
  content?: string; // For AI recipes
  image?: string;
  prepTime?: string;
  cookTime?: string;
  difficulty?: string;
  servings?: number;
  ingredients?: RecipeIngredient[];
  steps?: string[];
  chef?: string;
  savedAt: string;
  type?: 'database' | 'ai-generated';
}

export default function SavedRecipesPage() {
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);

  useEffect(() => {
    loadSavedRecipes();
  }, []);

  const loadSavedRecipes = () => {
    try {
      const saved = localStorage.getItem('savedRecipes');
      if (saved) {
        const recipes = JSON.parse(saved);
        setSavedRecipes(recipes);
      }
    } catch (error) {
      console.error('Error loading saved recipes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteRecipe = (id: string) => {
    try {
      const updatedRecipes = savedRecipes.filter((recipe) => recipe.id !== id);
      setSavedRecipes(updatedRecipes);
      localStorage.setItem('savedRecipes', JSON.stringify(updatedRecipes));
    } catch (error) {
      console.error('Error deleting recipe:', error);
    }
  };

  const clearAllRecipes = () => {
    if (
      window.confirm(
        'Are you sure you want to delete all saved recipes? This action cannot be undone.'
      )
    ) {
      setSavedRecipes([]);
      localStorage.removeItem('savedRecipes');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-gray-900 via-brand-gray-800 to-brand-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-lime mx-auto mb-4"></div>
              <p className="text-brand-gray-300">Loading your saved recipes...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-gray-900 via-brand-gray-800 to-brand-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="text-3xl">📚</span>
              <h1 className="text-3xl sm:text-4xl font-bold text-brand-lime">
                Saved Recipes
              </h1>
            </div>
            <p className="text-brand-gray-300 text-lg">
              Your collection of AI-generated recipe suggestions
            </p>
          </div>

          {/* Stats */}
          {savedRecipes.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-brand-gray-800/50 rounded-lg p-4 text-center border border-brand-gray-700/50">
                <span className="text-2xl block mb-2">👨‍🍳</span>
                <div className="text-2xl font-bold text-brand-lime">
                  {savedRecipes.length}
                </div>
                <div className="text-sm text-brand-gray-400">Saved Recipes</div>
              </div>
              <div className="bg-brand-gray-800/50 rounded-lg p-4 text-center border border-brand-gray-700/50">
                <span className="text-2xl block mb-2">⏰</span>
                <div className="text-2xl font-bold text-brand-lime">
                  {savedRecipes.length > 0
                    ? new Date(savedRecipes[0].savedAt).toLocaleDateString()
                    : '-'}
                </div>
                <div className="text-sm text-brand-gray-400">Latest Save</div>
              </div>
              <div className="bg-brand-gray-800/50 rounded-lg p-4 text-center border border-brand-gray-700/50">
                <span className="text-2xl block mb-2">📖</span>
                <div className="text-2xl font-bold text-brand-lime">
                  {Math.ceil(savedRecipes.length / 7)}
                </div>
                <div className="text-sm text-brand-gray-400">Weeks of Meals</div>
              </div>
            </div>
          )}

          {/* Actions */}
          {savedRecipes.length > 0 && (
            <div className="flex justify-between items-center mb-6">
              <div className="text-sm text-brand-gray-400">
                {savedRecipes.length} recipe{savedRecipes.length !== 1 ? 's' : ''} saved
              </div>
              <Button
                onClick={clearAllRecipes}
                variant="secondary"
                className="text-red-400 border-red-400/30 hover:bg-red-400/10"
              >
                <span className="mr-2">🗑️</span>
                Clear All
              </Button>
            </div>
          )}

          {/* Recipes List */}
          {savedRecipes.length === 0 ? (
            <div className="text-center py-16">
              <span className="text-6xl block mb-4">👨‍🍳</span>
              <h3 className="text-xl font-semibold text-brand-gray-300 mb-2">
                No saved recipes yet
              </h3>
              <p className="text-brand-gray-400 mb-6 max-w-md mx-auto">
                Browse our recipes or chat with our AI to discover delicious Filipino
                dishes!
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/recipes">
                  <Button className="bg-brand-lime text-brand-gray-900 hover:bg-brand-lime/90">
                    <span className="mr-2">📖</span>
                    Browse Recipes
                  </Button>
                </Link>
                <Link href="/chat">
                  <Button
                    variant="secondary"
                    className="border-brand-lime/30 text-brand-lime"
                  >
                    <span className="mr-2">🤖</span>
                    AI Chef
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {savedRecipes.map((recipe) => {
                const isExpanded = expandedRecipe === recipe.id;

                return (
                  <div
                    key={recipe.id}
                    className="rounded-2xl border border-brand-gray-800/70 bg-brand-gray-900/40 overflow-hidden hover:border-brand-lime/50 transition-all duration-300"
                  >
                    {/* Card Header - Always Visible */}
                    <div className="flex items-center gap-4 p-4">
                      {/* Image/Icon */}
                      <div className="relative h-20 w-20 flex-shrink-0 rounded-xl overflow-hidden">
                        {recipe.type === 'database' && recipe.image ? (
                          <Image
                            src={recipe.image}
                            alt={recipe.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-brand-lime/20 to-brand-green/20 flex items-center justify-center">
                            <span className="text-3xl">🍳</span>
                          </div>
                        )}
                      </div>

                      {/* Recipe Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Tag
                            tone={recipe.type === 'ai-generated' ? 'lime' : 'gray'}
                            className="text-xs"
                          >
                            {recipe.type === 'ai-generated' ? '🤖 AI' : '📖 Recipe'}
                          </Tag>
                          <span className="text-xs text-brand-gray-500">
                            Saved{' '}
                            {new Date(recipe.savedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-white truncate">
                          {recipe.title}
                        </h3>
                        <p className="text-sm text-brand-gray-400 line-clamp-1">
                          {recipe.description || 'Delicious Filipino recipe'}
                        </p>
                        {/* Meta info for database recipes */}
                        {recipe.type === 'database' &&
                          (recipe.prepTime || recipe.cookTime) && (
                            <div className="flex gap-3 mt-1 text-xs text-brand-gray-500">
                              {recipe.prepTime && <span>⏱️ {recipe.prepTime}</span>}
                              {recipe.cookTime && <span>🍳 {recipe.cookTime}</span>}
                              {recipe.servings && <span>👥 {recipe.servings}</span>}
                            </div>
                          )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          onClick={() => setExpandedRecipe(isExpanded ? null : recipe.id)}
                          className="bg-brand-lime text-brand-gray-900 hover:bg-brand-lime/90"
                        >
                          {isExpanded ? 'Close' : 'View'}
                        </Button>
                        <button
                          onClick={() => deleteRecipe(recipe.id)}
                          className="p-2 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                          aria-label="Delete recipe"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="border-t border-brand-gray-800/70 p-6 bg-brand-gray-900/60">
                        {/* Database Recipe - Show ingredients and steps */}
                        {recipe.type === 'database' &&
                        recipe.ingredients &&
                        recipe.steps ? (
                          <div className="space-y-6">
                            {/* Recipe Header */}
                            <div className="flex flex-wrap gap-4 text-sm text-brand-gray-400">
                              {recipe.prepTime && (
                                <span className="flex items-center gap-1">
                                  <span>⏱️</span> Prep: {recipe.prepTime}
                                </span>
                              )}
                              {recipe.cookTime && (
                                <span className="flex items-center gap-1">
                                  <span>🍳</span> Cook: {recipe.cookTime}
                                </span>
                              )}
                              {recipe.servings && (
                                <span className="flex items-center gap-1">
                                  <span>👥</span> Serves {recipe.servings}
                                </span>
                              )}
                              {recipe.difficulty && (
                                <span className="flex items-center gap-1">
                                  <span>📊</span> {recipe.difficulty}
                                </span>
                              )}
                              {recipe.chef && (
                                <span className="flex items-center gap-1">
                                  <span>👨‍🍳</span> Chef {recipe.chef}
                                </span>
                              )}
                            </div>

                            {/* Description */}
                            {recipe.description && (
                              <p className="text-brand-gray-300">{recipe.description}</p>
                            )}

                            <div className="grid md:grid-cols-2 gap-6">
                              {/* Ingredients */}
                              <div className="space-y-3">
                                <h4 className="text-lg font-semibold text-brand-lime flex items-center gap-2">
                                  <span>🥘</span> Ingredients
                                </h4>
                                <ul className="space-y-2">
                                  {recipe.ingredients.map((ing, idx) => (
                                    <li
                                      key={idx}
                                      className="flex items-start gap-2 text-brand-gray-200"
                                    >
                                      <span className="text-brand-lime mt-1.5">•</span>
                                      <span>
                                        <span className="text-brand-lime font-medium">
                                          {ing.amount}
                                        </span>{' '}
                                        {ing.name}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Instructions */}
                              <div className="space-y-3">
                                <h4 className="text-lg font-semibold text-brand-lime flex items-center gap-2">
                                  <span>👨‍🍳</span> Instructions
                                </h4>
                                <ol className="space-y-3">
                                  {recipe.steps.map((step, idx) => (
                                    <li
                                      key={idx}
                                      className="flex gap-3 text-brand-gray-200"
                                    >
                                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-lime/20 text-brand-lime text-sm flex items-center justify-center font-semibold">
                                        {idx + 1}
                                      </span>
                                      <span>
                                        {typeof step === 'string'
                                          ? step
                                          : (step as { instruction?: string })
                                              .instruction || ''}
                                      </span>
                                    </li>
                                  ))}
                                </ol>
                              </div>
                            </div>

                            {/* Link to full recipe page */}
                            <div className="pt-4 border-t border-brand-gray-800/50">
                              <Link href={`/recipes/${recipe.id}`}>
                                <Button
                                  variant="secondary"
                                  className="border-brand-lime/30 text-brand-lime hover:bg-brand-lime/10"
                                >
                                  View Full Recipe Page →
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ) : recipe.content ? (
                          /* AI Recipe - Show markdown content */
                          <div className="prose prose-invert prose-lime max-w-none">
                            <Markdown content={recipe.content} />
                          </div>
                        ) : (
                          <p className="text-brand-gray-400">
                            No recipe details available.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Back to Chat */}
          <div className="text-center mt-12">
            <Button
              onClick={() => (window.location.href = '/chat')}
              variant="secondary"
              className="border-brand-lime/30 text-brand-lime hover:bg-brand-lime/10"
            >
              <span className="mr-2">💬</span>
              Back to Chat
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
