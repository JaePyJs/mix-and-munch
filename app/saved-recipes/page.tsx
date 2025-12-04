'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';

interface SavedRecipe {
  id: string;
  title: string;
  description?: string;
  content?: string; // Legacy field for AI recipes
  image?: string;
  prepTime?: string;
  cookTime?: string;
  difficulty?: string;
  servings?: number;
  savedAt: string;
  type?: 'database' | 'ai-generated';
}

export default function SavedRecipesPage() {
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      const updatedRecipes = savedRecipes.filter(recipe => recipe.id !== id);
      setSavedRecipes(updatedRecipes);
      localStorage.setItem('savedRecipes', JSON.stringify(updatedRecipes));
    } catch (error) {
      console.error('Error deleting recipe:', error);
    }
  };

  const clearAllRecipes = () => {
    if (window.confirm('Are you sure you want to delete all saved recipes? This action cannot be undone.')) {
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
                <div className="text-2xl font-bold text-brand-lime">{savedRecipes.length}</div>
                <div className="text-sm text-brand-gray-400">Saved Recipes</div>
              </div>
              <div className="bg-brand-gray-800/50 rounded-lg p-4 text-center border border-brand-gray-700/50">
                <span className="text-2xl block mb-2">⏰</span>
                <div className="text-2xl font-bold text-brand-lime">
                  {savedRecipes.length > 0 ? new Date(savedRecipes[0].savedAt).toLocaleDateString() : '-'}
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
                Browse our recipes or chat with our AI to discover delicious Filipino dishes!
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/recipes">
                  <Button className="bg-brand-lime text-brand-gray-900 hover:bg-brand-lime/90">
                    <span className="mr-2">📖</span>
                    Browse Recipes
                  </Button>
                </Link>
                <Link href="/chat">
                  <Button variant="secondary" className="border-brand-lime/30 text-brand-lime">
                    <span className="mr-2">🤖</span>
                    AI Chef
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedRecipes.map((recipe) => (
                <div 
                  key={recipe.id} 
                  className="group relative rounded-2xl border border-brand-gray-800/70 bg-brand-gray-900/40 overflow-hidden hover:border-brand-lime/50 transition-all duration-300 hover:shadow-lg hover:shadow-brand-lime/10"
                >
                  {/* Recipe Image */}
                  <div className="relative h-48 w-full overflow-hidden">
                    {recipe.type === 'database' && recipe.image ? (
                      <Image
                        src={recipe.image}
                        alt={recipe.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-brand-lime/20 to-brand-green/20 flex items-center justify-center">
                        <span className="text-6xl">🍳</span>
                      </div>
                    )}
                    {/* Type Badge */}
                    <div className="absolute top-3 left-3">
                      <Tag tone={recipe.type === 'ai-generated' ? 'lime' : 'gray'} className="text-xs">
                        {recipe.type === 'ai-generated' ? '🤖 AI Recipe' : '📖 Recipe'}
                      </Tag>
                    </div>
                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        deleteRecipe(recipe.id);
                      }}
                      className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                      aria-label="Delete recipe"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  
                  {/* Recipe Content */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1 group-hover:text-brand-lime transition-colors">
                      {recipe.title}
                    </h3>
                    <p className="text-sm text-brand-gray-400 mb-3 line-clamp-2">
                      {recipe.description || recipe.content?.substring(0, 100) || 'Delicious Filipino recipe'}
                    </p>
                    
                    {/* Recipe Meta */}
                    {recipe.type === 'database' && (recipe.prepTime || recipe.cookTime) && (
                      <div className="flex flex-wrap gap-2 mb-3 text-xs text-brand-gray-500">
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
                            <span>👥</span> {recipe.servings} servings
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Saved Date */}
                    <div className="text-xs text-brand-gray-500 mb-3">
                      Saved {new Date(recipe.savedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    
                    {/* View Button */}
                    {recipe.type === 'database' ? (
                      <Link href={`/recipes/${recipe.id}`} className="block">
                        <Button className="w-full bg-brand-lime text-brand-gray-900 hover:bg-brand-lime/90">
                          View Recipe
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/chat" className="block">
                        <Button variant="secondary" className="w-full border-brand-lime/30 text-brand-lime hover:bg-brand-lime/10">
                          View in AI Chat
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Back to Chat */}
          <div className="text-center mt-12">
            <Button
              onClick={() => window.location.href = '/chat'}
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