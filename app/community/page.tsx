'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { useTranslation } from '@/lib/hooks/useTranslation';
import Link from 'next/link';

interface CommunityRecipe {
  id: string;
  title: string;
  description: string;
  cuisine: string;
  difficulty: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  ingredients: { item: string; amount: string }[];
  instructions: string[];
  tips: string[];
  tags: string[];
  sharedBy: {
    name: string;
    avatar: string;
    location: string;
  };
  sharedAt: string;
  likes: number;
  dislikes: number;
  saves: number;
  source?: 'ai' | 'youtube' | 'manual';
  sourceUrl?: string;
}

interface NewRecipeForm {
  title: string;
  description: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  difficulty: string;
  ingredients: string;
  instructions: string;
  chefName: string;
  avatar: string;
}

export default function CommunityPage() {
  const { t } = useTranslation();
  const [recipes, setRecipes] = useState<CommunityRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<CommunityRecipe | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newRecipe, setNewRecipe] = useState<NewRecipeForm>({
    title: '',
    description: '',
    prepTime: '15 mins',
    cookTime: '30 mins',
    servings: 4,
    difficulty: 'Medium',
    ingredients: '',
    instructions: '',
    chefName: '',
    avatar: '👨‍🍳',
  });

  const avatars = ['👨‍🍳', '👩‍🍳', '🧑‍🍳', '👵', '👴', '🧑', '👩', '👨', '🍳', '🥘'];

  useEffect(() => {
    fetchRecipes();
  }, []);

  async function fetchRecipes() {
    try {
      const res = await fetch('/api/community');
      const data = await res.json();
      if (data.success) {
        setRecipes(data.recipes);
      }
    } catch (error) {
      console.error('Failed to fetch community recipes:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateRecipe() {
    if (!newRecipe.title.trim() || !newRecipe.chefName.trim()) {
      alert('Please enter a recipe title and your name');
      return;
    }

    setCreating(true);
    try {
      // Parse ingredients (one per line)
      const ingredients = newRecipe.ingredients
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => ({ item: line.trim(), amount: '' }));

      // Parse instructions (one per line)
      const instructions = newRecipe.instructions
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => line.trim());

      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipe: {
            title: newRecipe.title,
            description: newRecipe.description,
            prep_time: newRecipe.prepTime,
            cook_time: newRecipe.cookTime,
            servings: newRecipe.servings,
            difficulty: newRecipe.difficulty,
            ingredients,
            instructions,
            tags: ['community', 'homemade'],
          },
          sharedBy: {
            name: newRecipe.chefName,
            avatar: newRecipe.avatar,
            location: 'Philippines',
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Refresh recipes list
        fetchRecipes();
        setShowCreateModal(false);
        // Reset form
        setNewRecipe({
          title: '',
          description: '',
          prepTime: '15 mins',
          cookTime: '30 mins',
          servings: 4,
          difficulty: 'Medium',
          ingredients: '',
          instructions: '',
          chefName: '',
          avatar: '👨‍🍳',
        });
        alert('🎉 Recipe shared successfully!');
      } else {
        alert('Failed to share recipe: ' + data.message);
      }
    } catch (error) {
      console.error('Create recipe error:', error);
      alert('Failed to share recipe');
    } finally {
      setCreating(false);
    }
  }

  async function handleLike(recipeId: string) {
    try {
      const res = await fetch('/api/community', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId, action: 'like' }),
      });
      const data = await res.json();
      if (data.success) {
        setRecipes((prev) =>
          prev.map((r) => (r.id === recipeId ? { ...r, likes: data.likes } : r))
        );
      }
    } catch (error) {
      console.error('Failed to like recipe:', error);
    }
  }

  async function handleDislike(recipeId: string) {
    try {
      const res = await fetch('/api/community', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId, action: 'dislike' }),
      });
      const data = await res.json();
      if (data.success) {
        setRecipes((prev) =>
          prev.map((r) => (r.id === recipeId ? { ...r, dislikes: data.dislikes } : r))
        );
      }
    } catch (error) {
      console.error('Failed to dislike recipe:', error);
    }
  }

  async function handleDelete(recipeId: string, recipeName: string) {
    if (
      !confirm(`Are you sure you want to delete "${recipeName}"? This cannot be undone.`)
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/community?id=${recipeId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
        setSelectedRecipe(null);
        alert('Recipe deleted successfully!');
      } else {
        alert('Failed to delete recipe: ' + data.message);
      }
    } catch (error) {
      console.error('Failed to delete recipe:', error);
      alert('Failed to delete recipe');
    }
  }

  async function handleSave(recipeId: string) {
    try {
      const res = await fetch('/api/community', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId, action: 'save' }),
      });
      const data = await res.json();
      if (data.success) {
        setRecipes((prev) =>
          prev.map((r) => (r.id === recipeId ? { ...r, saves: data.saves } : r))
        );
      }
    } catch (error) {
      console.error('Failed to save recipe:', error);
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
  }

  const filteredRecipes =
    filter === 'all'
      ? recipes
      : recipes.filter(
          (r) => r.tags.includes(filter) || r.difficulty.toLowerCase() === filter
        );

  const allTags = [...new Set(recipes.flatMap((r) => r.tags))].slice(0, 8);

  if (loading) {
    return (
      <div className="page-grid min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl animate-bounce mb-4">🍳</div>
          <p className="text-brand-gray-400">Loading community recipes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-grid space-y-8">
      {/* Header */}
      <header className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-4">
            <Tag tone="lime" className="w-fit">
              👨‍👩‍👧‍👦 Community Kitchen
            </Tag>
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">
              Shared Recipes
            </h1>
            <p className="max-w-2xl text-sm text-brand-gray-400">
              Recipes shared by our community of home cooks. Try them out and share your
              own!
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-brand-lime text-brand-gray-900 hover:bg-brand-lime/90"
            >
              <span className="mr-2">➕</span>
              Share Recipe
            </Button>
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
      </header>

      {/* Stats Bar */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-gray-800/50 border border-brand-gray-700">
          <span className="text-2xl">📖</span>
          <div>
            <p className="text-lg font-semibold text-white">{recipes.length}</p>
            <p className="text-xs text-brand-gray-400">Recipes</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-gray-800/50 border border-brand-gray-700">
          <span className="text-2xl">👨‍🍳</span>
          <div>
            <p className="text-lg font-semibold text-white">
              {new Set(recipes.map((r) => r.sharedBy.name)).size}
            </p>
            <p className="text-xs text-brand-gray-400">Contributors</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-gray-800/50 border border-brand-gray-700">
          <span className="text-2xl">❤️</span>
          <div>
            <p className="text-lg font-semibold text-white">
              {recipes.reduce((sum, r) => sum + r.likes, 0)}
            </p>
            <p className="text-xs text-brand-gray-400">Total Likes</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-full text-sm transition-all ${
            filter === 'all'
              ? 'bg-brand-lime text-brand-gray-950'
              : 'bg-brand-gray-800 text-brand-gray-300 hover:bg-brand-gray-700'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('easy')}
          className={`px-4 py-2 rounded-full text-sm transition-all ${
            filter === 'easy'
              ? 'bg-green-500 text-white'
              : 'bg-brand-gray-800 text-brand-gray-300 hover:bg-brand-gray-700'
          }`}
        >
          🟢 Easy
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setFilter(tag)}
            className={`px-4 py-2 rounded-full text-sm transition-all ${
              filter === tag
                ? 'bg-brand-lime text-brand-gray-950'
                : 'bg-brand-gray-800 text-brand-gray-300 hover:bg-brand-gray-700'
            }`}
          >
            #{tag}
          </button>
        ))}
      </div>

      {/* Recipe Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredRecipes.map((recipe) => (
          <div
            key={recipe.id}
            className="rounded-2xl border border-brand-gray-800 bg-brand-gray-900/50 p-5 hover:border-brand-lime/30 transition-all cursor-pointer"
            onClick={() => setSelectedRecipe(recipe)}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{recipe.sharedBy.avatar}</span>
                <div>
                  <p className="text-sm font-medium text-white">{recipe.sharedBy.name}</p>
                  <p className="text-xs text-brand-gray-500">
                    {recipe.sharedBy.location}
                  </p>
                </div>
              </div>
              <span className="text-xs text-brand-gray-500">
                {formatDate(recipe.sharedAt)}
              </span>
            </div>

            {/* Content */}
            <h3 className="text-lg font-semibold text-white mb-2">{recipe.title}</h3>
            <p className="text-sm text-brand-gray-400 line-clamp-2 mb-3">
              {recipe.description}
            </p>

            {/* Meta */}
            <div className="flex items-center gap-3 text-xs text-brand-gray-500 mb-3">
              <span>⏱️ {recipe.cookTime}</span>
              <span>👥 {recipe.servings} servings</span>
              <span
                className={`px-2 py-0.5 rounded-full ${
                  recipe.difficulty === 'Easy'
                    ? 'bg-green-500/20 text-green-400'
                    : recipe.difficulty === 'Medium'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-red-500/20 text-red-400'
                }`}
              >
                {recipe.difficulty}
              </span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-4">
              {recipe.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full bg-brand-gray-800 text-brand-gray-400"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-3 border-t border-brand-gray-800">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLike(recipe.id);
                }}
                className="flex items-center gap-1 text-sm text-brand-gray-400 hover:text-green-400 transition-colors"
              >
                👍 {recipe.likes}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDislike(recipe.id);
                }}
                className="flex items-center gap-1 text-sm text-brand-gray-400 hover:text-red-400 transition-colors"
              >
                👎 {recipe.dislikes || 0}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSave(recipe.id);
                }}
                className="flex items-center gap-1 text-sm text-brand-gray-400 hover:text-brand-lime transition-colors"
              >
                📌 {recipe.saves}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(recipe.id, recipe.title);
                }}
                className="flex items-center gap-1 text-sm text-brand-gray-400 hover:text-red-500 transition-colors ml-auto"
                title="Delete recipe"
              >
                🗑️
              </button>
              {recipe.source === 'youtube' && recipe.sourceUrl && (
                <a
                  href={recipe.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-sm text-brand-gray-400 hover:text-red-500 transition-colors"
                >
                  ▶️ Video
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedRecipe(null)}
        >
          <div
            className="bg-brand-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-brand-gray-900 p-6 border-b border-brand-gray-800">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedRecipe.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xl">{selectedRecipe.sharedBy.avatar}</span>
                    <span className="text-sm text-brand-gray-400">
                      Shared by {selectedRecipe.sharedBy.name} from{' '}
                      {selectedRecipe.sharedBy.location}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRecipe(null)}
                  className="text-brand-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              <p className="text-brand-gray-300">{selectedRecipe.description}</p>

              {/* Quick Info */}
              <div className="flex flex-wrap gap-4">
                <div className="px-4 py-2 rounded-xl bg-brand-gray-800">
                  <p className="text-xs text-brand-gray-500">Prep Time</p>
                  <p className="font-semibold text-white">{selectedRecipe.prepTime}</p>
                </div>
                <div className="px-4 py-2 rounded-xl bg-brand-gray-800">
                  <p className="text-xs text-brand-gray-500">Cook Time</p>
                  <p className="font-semibold text-white">{selectedRecipe.cookTime}</p>
                </div>
                <div className="px-4 py-2 rounded-xl bg-brand-gray-800">
                  <p className="text-xs text-brand-gray-500">Servings</p>
                  <p className="font-semibold text-white">{selectedRecipe.servings}</p>
                </div>
                <div className="px-4 py-2 rounded-xl bg-brand-gray-800">
                  <p className="text-xs text-brand-gray-500">Difficulty</p>
                  <p className="font-semibold text-white">{selectedRecipe.difficulty}</p>
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">🥘 Ingredients</h3>
                <ul className="space-y-2">
                  {selectedRecipe.ingredients.map((ing, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-brand-gray-300">
                      <span className="w-2 h-2 rounded-full bg-brand-lime"></span>
                      <span className="font-medium">{ing.amount}</span>
                      <span>{ing.item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Instructions */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">📝 Instructions</h3>
                <ol className="space-y-3">
                  {selectedRecipe.instructions.map((step, idx) => (
                    <li key={idx} className="flex gap-3 text-brand-gray-300">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-lime text-brand-gray-950 text-sm font-semibold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Tips */}
              {selectedRecipe.tips.length > 0 && (
                <div className="p-4 rounded-xl bg-brand-lime/10 border border-brand-lime/20">
                  <h3 className="text-lg font-semibold text-brand-lime mb-2">💡 Tips</h3>
                  <ul className="space-y-1">
                    {selectedRecipe.tips.map((tip, idx) => (
                      <li key={idx} className="text-sm text-brand-gray-300">
                        • {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-brand-gray-800">
                <Button
                  variant="primary"
                  onClick={() => handleLike(selectedRecipe.id)}
                  className="flex-1 min-w-[100px]"
                >
                  👍 Like ({selectedRecipe.likes})
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleDislike(selectedRecipe.id)}
                  className="flex-1 min-w-[100px] border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  👎 Dislike ({selectedRecipe.dislikes || 0})
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleSave(selectedRecipe.id)}
                  className="flex-1 min-w-[100px]"
                >
                  📌 Save ({selectedRecipe.saves})
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => handleDelete(selectedRecipe.id, selectedRecipe.title)}
                  className="flex-1 min-w-[100px] border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  🗑️ Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Recipe Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="bg-brand-gray-900 rounded-2xl max-w-2xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Share Your Recipe</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-brand-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {/* Recipe Title */}
              <div>
                <label className="block text-sm text-brand-gray-400 mb-2">
                  Recipe Title *
                </label>
                <input
                  type="text"
                  value={newRecipe.title}
                  onChange={(e) => setNewRecipe({ ...newRecipe, title: e.target.value })}
                  placeholder="e.g., Chicken Adobo"
                  className="w-full px-4 py-3 rounded-xl bg-brand-gray-800 border border-brand-gray-700 text-white placeholder-brand-gray-500 focus:border-brand-lime focus:outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm text-brand-gray-400 mb-2">
                  Description
                </label>
                <textarea
                  value={newRecipe.description}
                  onChange={(e) =>
                    setNewRecipe({ ...newRecipe, description: e.target.value })
                  }
                  placeholder="A brief description of your dish..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl bg-brand-gray-800 border border-brand-gray-700 text-white placeholder-brand-gray-500 focus:border-brand-lime focus:outline-none resize-none"
                />
              </div>

              {/* Time & Servings */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm text-brand-gray-400 mb-2">
                    Prep Time
                  </label>
                  <input
                    type="text"
                    value={newRecipe.prepTime}
                    onChange={(e) =>
                      setNewRecipe({ ...newRecipe, prepTime: e.target.value })
                    }
                    placeholder="15 mins"
                    className="w-full px-3 py-2 rounded-lg bg-brand-gray-800 border border-brand-gray-700 text-white text-sm focus:border-brand-lime focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-brand-gray-400 mb-2">
                    Cook Time
                  </label>
                  <input
                    type="text"
                    value={newRecipe.cookTime}
                    onChange={(e) =>
                      setNewRecipe({ ...newRecipe, cookTime: e.target.value })
                    }
                    placeholder="30 mins"
                    className="w-full px-3 py-2 rounded-lg bg-brand-gray-800 border border-brand-gray-700 text-white text-sm focus:border-brand-lime focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-brand-gray-400 mb-2">
                    Servings
                  </label>
                  <input
                    type="number"
                    value={newRecipe.servings}
                    onChange={(e) =>
                      setNewRecipe({
                        ...newRecipe,
                        servings: parseInt(e.target.value) || 4,
                      })
                    }
                    min="1"
                    className="w-full px-3 py-2 rounded-lg bg-brand-gray-800 border border-brand-gray-700 text-white text-sm focus:border-brand-lime focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-brand-gray-400 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={newRecipe.difficulty}
                    onChange={(e) =>
                      setNewRecipe({ ...newRecipe, difficulty: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-brand-gray-800 border border-brand-gray-700 text-white text-sm focus:border-brand-lime focus:outline-none"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <label className="block text-sm text-brand-gray-400 mb-2">
                  Ingredients (one per line) *
                </label>
                <textarea
                  value={newRecipe.ingredients}
                  onChange={(e) =>
                    setNewRecipe({ ...newRecipe, ingredients: e.target.value })
                  }
                  placeholder="1 kg chicken&#10;1/2 cup soy sauce&#10;1/4 cup vinegar&#10;..."
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl bg-brand-gray-800 border border-brand-gray-700 text-white placeholder-brand-gray-500 focus:border-brand-lime focus:outline-none resize-none font-mono text-sm"
                />
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-sm text-brand-gray-400 mb-2">
                  Instructions (one step per line) *
                </label>
                <textarea
                  value={newRecipe.instructions}
                  onChange={(e) =>
                    setNewRecipe({ ...newRecipe, instructions: e.target.value })
                  }
                  placeholder="Marinate chicken in soy sauce and vinegar for 30 minutes&#10;Heat oil in a pan over medium heat&#10;..."
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl bg-brand-gray-800 border border-brand-gray-700 text-white placeholder-brand-gray-500 focus:border-brand-lime focus:outline-none resize-none font-mono text-sm"
                />
              </div>

              {/* Chef Info */}
              <div className="pt-4 border-t border-brand-gray-800">
                <h3 className="text-lg font-semibold text-white mb-4">About You</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-brand-gray-400 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      value={newRecipe.chefName}
                      onChange={(e) =>
                        setNewRecipe({ ...newRecipe, chefName: e.target.value })
                      }
                      placeholder="e.g., Tita Maria"
                      className="w-full px-4 py-3 rounded-xl bg-brand-gray-800 border border-brand-gray-700 text-white placeholder-brand-gray-500 focus:border-brand-lime focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-brand-gray-400 mb-2">
                      Choose Avatar
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {avatars.map((avatar) => (
                        <button
                          key={avatar}
                          type="button"
                          onClick={() => setNewRecipe({ ...newRecipe, avatar })}
                          className={`text-2xl p-2 rounded-lg transition-all ${
                            newRecipe.avatar === avatar
                              ? 'bg-brand-lime/20 ring-2 ring-brand-lime'
                              : 'bg-brand-gray-800 hover:bg-brand-gray-700'
                          }`}
                        >
                          {avatar}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="secondary"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateRecipe}
                  disabled={creating}
                  className="flex-1 bg-brand-lime text-brand-gray-900 hover:bg-brand-lime/90"
                >
                  {creating ? 'Sharing...' : '🚀 Share Recipe'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
