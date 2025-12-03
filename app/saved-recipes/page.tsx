'use client';

import { useState, useEffect } from 'react';
import { RecipeCard } from '@/components/chat/RecipeCard';
import { Button } from '@/components/ui/Button';

interface SavedRecipe {
  id: string;
  title: string;
  content: string;
  savedAt: string;
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
                Start chatting with our AI to get personalized recipe suggestions, then save your favorites here!
              </p>
              <Button
                onClick={() => window.location.href = '/chat'}
                className="bg-brand-lime text-brand-gray-900 hover:bg-brand-lime/90"
              >
                <span className="mr-2">👨‍🍳</span>
                Get Recipe Suggestions
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {savedRecipes.map((recipe) => (
                <div key={recipe.id} className="relative group">
                  {/* Delete button */}
                  <Button
                    onClick={() => deleteRecipe(recipe.id)}
                    variant="secondary"
                    className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                  >
                    <span className="mr-1">🗑️</span>
                    Delete
                  </Button>

                  {/* Recipe metadata */}
                  <div className="mb-3 text-xs text-brand-gray-400">
                    Saved on {new Date(recipe.savedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>

                  {/* Recipe card */}
                  <RecipeCard content={recipe.content} />
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