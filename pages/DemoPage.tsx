import React, { useState, useEffect, useMemo, useRef } from 'react';
import { categorizedIngredients } from '../data/mockData';
import { Recipe, ChatMessage } from '../types';
import { streamChatResponse } from '../services/geminiService';
import { useBackendRecipes, useRecipeTransform } from '../services/useRecipes';

interface DemoPageProps {
  onAddToMealPlan: (recipe: Recipe, day: string) => Promise<void>;
}

const RecipeCard: React.FC<{ recipe: Recipe; onClick: () => void; }> = ({ recipe, onClick }) => {
    return (
        <div 
            className="bg-brand-gray-900 rounded-lg overflow-hidden shadow-lg group cursor-pointer transform transition-transform hover:-translate-y-1" 
            onClick={onClick}
        >
            <div 
                className="relative w-full h-48 bg-cover bg-center bg-brand-gray-800"
                style={{ 
                    backgroundImage: `url(${recipe.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                {recipe.matchScore !== undefined && recipe.matchScore > 0 && (
                    <div className="absolute top-2 right-2 bg-brand-lime text-brand-gray-900 text-xs font-bold px-2 py-1 rounded-full shadow z-10">
                        {recipe.matchScore}% Match
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent opacity-80"></div>
                <h3 className="text-xl font-bold text-white absolute bottom-0 left-0 p-4">{recipe.name}</h3>
            </div>
            <div className="p-4">
                <p className="text-sm text-brand-gray-200 line-clamp-1">{recipe.source || 'Unknown Source'}</p>
                <p className="text-xs text-brand-gray-300">🏷️ {recipe.category || 'General'}</p>
            </div>
        </div>
    );
};

const RecipeCardSkeleton: React.FC = () => {
    return (
        <div className="bg-brand-gray-900 rounded-lg overflow-hidden shadow-lg animate-pulse">
            <div className="w-full h-48 bg-brand-gray-800"></div>
            <div className="p-4 space-y-3">
                <div className="h-5 bg-brand-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-brand-gray-700 rounded w-full"></div>
                <div className="h-3 bg-brand-gray-700 rounded w-5/6"></div>
            </div>
        </div>
    );
};

const RecipeDetailModal: React.FC<{ recipe: Recipe; onClose: () => void; onAddToPlan: (recipe: Recipe, day: string) => Promise<void>; }> = ({ recipe, onClose, onAddToPlan }) => {
    const [selectedDay, setSelectedDay] = useState('Monday');
    const [isAdding, setIsAdding] = useState(false);
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const handleAddClick = async () => {
        setIsAdding(true);
        try {
            await onAddToPlan(recipe, selectedDay);
            alert(`${recipe.name} added to ${selectedDay}!`);
            onClose();
        } catch (error) {
            console.error('Error adding to meal plan:', error);
        } finally {
            setIsAdding(false);
        }
    };

    const ingredients = Array.isArray(recipe.ingredients) 
        ? recipe.ingredients 
        : typeof recipe.ingredients === 'string' 
            ? JSON.parse(recipe.ingredients)
            : [];

    const instructions = Array.isArray(recipe.instructions)
        ? recipe.instructions
        : typeof recipe.instructions === 'string'
            ? JSON.parse(recipe.instructions)
            : [];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-brand-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <img 
                    src={recipe.imageUrl} 
                    alt={recipe.name} 
                    className="w-full h-64 object-cover rounded-t-xl bg-brand-gray-800"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23333" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="20"%3EImage not available%3C/text%3E%3C/svg%3E';
                    }}
                />
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-3xl font-bold text-brand-lime mb-2">{recipe.name}</h2>
                            <p className="text-sm text-brand-gray-300">
                                From <strong>{recipe.source || 'Unknown'}</strong> by <strong>{recipe.author || 'Unknown'}</strong>
                            </p>
                            {recipe.imageAttribution && (
                                <p className="text-xs text-brand-gray-400 mt-1">
                                    Image courtesy of {recipe.imageAttribution}
                                </p>
                            )}
                        </div>
                        <button onClick={onClose} className="text-brand-gray-200 hover:text-white text-3xl leading-none">&times;</button>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-2 text-center text-sm mb-6">
                        <div className="bg-brand-gray-800 p-2 rounded">
                            <p className="text-brand-gray-400 text-xs">Prep</p>
                            <p className="text-brand-lime font-bold text-sm">{recipe.prepTime}</p>
                        </div>
                        <div className="bg-brand-gray-800 p-2 rounded">
                            <p className="text-brand-gray-400 text-xs">Cook</p>
                            <p className="text-brand-lime font-bold text-sm">{recipe.cookTime}</p>
                        </div>
                        <div className="bg-brand-gray-800 p-2 rounded">
                            <p className="text-brand-gray-400 text-xs">Total</p>
                            <p className="text-brand-lime font-bold text-sm">{recipe.totalTime}</p>
                        </div>
                        <div className="bg-brand-gray-800 p-2 rounded">
                            <p className="text-brand-gray-400 text-xs">Servings</p>
                            <p className="text-brand-lime font-bold text-sm">{recipe.servings}</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <h3 className="text-xl font-semibold mb-3 border-b border-brand-gray-700 pb-2">Ingredients</h3>
                            <ul className="space-y-2 text-brand-gray-200 list-disc list-inside text-sm">
                                {Array.isArray(ingredients) && ingredients.length > 0 ? (
                                    ingredients.map((ing, i) => {
                                        const ingText = typeof ing === 'string' 
                                            ? ing 
                                            : `${ing.quantity || ''} ${ing.unit || ''} ${ing.name || ''}`.trim();
                                        return <li key={i}>{ingText}</li>;
                                    })
                                ) : (
                                    <li>No ingredients listed</li>
                                )}
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-xl font-semibold mb-3 border-b border-brand-gray-700 pb-2">Instructions</h3>
                            <ol className="space-y-3 text-brand-gray-200 list-decimal list-inside text-sm">
                                {Array.isArray(instructions) && instructions.length > 0 ? (
                                    instructions.map((step, i) => {
                                        const stepText = typeof step === 'string' ? step : step.instruction || '';
                                        return <li key={i}>{stepText}</li>;
                                    })
                                ) : (
                                    <li>No instructions available</li>
                                )}
                            </ol>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4 bg-brand-gray-800 p-4 rounded-lg">
                        <select 
                            value={selectedDay} 
                            onChange={(e) => setSelectedDay(e.target.value)}
                            className="bg-brand-gray-700 border border-brand-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-brand-lime flex-grow"
                            disabled={isAdding}
                        >
                            {daysOfWeek.map(day => <option key={day} value={day}>{day}</option>)}
                        </select>
                        <button 
                          onClick={handleAddClick} 
                          className="bg-brand-lime text-brand-gray-900 font-bold py-3 px-6 rounded-lg transition-transform hover:scale-105 disabled:bg-brand-gray-700 disabled:scale-100 disabled:cursor-not-allowed whitespace-nowrap"
                          disabled={isAdding}
                        >
                            {isAdding ? 'Adding...' : 'Add to Meal Plan'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DemoPage: React.FC<DemoPageProps> = ({ onAddToMealPlan }) => {
  const { recipes: backendRecipes, loading: loadingRecipes, error: recipesError } = useBackendRecipes(30);
  const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const allRecipes = useRecipeTransform(backendRecipes, Array.from(selectedIngredients));

  const categories = useMemo(() => {
    const cats = [...new Set(allRecipes.map(r => r.category).filter(Boolean))] as string[];
    return ['All', ...cats];
  }, [allRecipes]);

  const filteredRecipes = useMemo(() => {
    let filtered = allRecipes;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(r => r.category === selectedCategory);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r =>
        r.name.toLowerCase().includes(term) ||
        r.description.toLowerCase().includes(term) ||
        r.source.toLowerCase().includes(term)
      );
    }

    return filtered.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  }, [allRecipes, selectedCategory, searchTerm]);

  const handleIngredientToggle = (ingredient: string) => {
    const newSelected = new Set(selectedIngredients);
    if (newSelected.has(ingredient)) {
      newSelected.delete(ingredient);
    } else {
      newSelected.add(ingredient);
    }
    setSelectedIngredients(newSelected);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left sidebar - Ingredients */}
      <div className="lg:col-span-1 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
        <div>
          <h2 className="text-2xl font-bold mb-4">Your Pantry</h2>
          <p className="text-sm text-brand-gray-400 mb-4">Select ingredients you have to see matching recipes</p>
        </div>

        {Object.entries(categorizedIngredients).map(([category, ingredients]) => (
          <div key={category}>
            <h3 className="text-sm font-bold text-brand-lime uppercase mb-2">{category}</h3>
            <div className="space-y-2">
              {ingredients.map(ing => (
                <label key={ing} className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedIngredients.has(ing)}
                    onChange={() => handleIngredientToggle(ing)}
                    className="w-4 h-4 accent-brand-lime rounded"
                  />
                  <span className="ml-2 text-sm text-brand-gray-200 group-hover:text-brand-lime transition-colors">{ing}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Right section - Recipes */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-brand-gray-800 border border-brand-gray-700 rounded-lg px-4 py-2 text-white placeholder-brand-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-lime"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-brand-gray-800 border border-brand-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand-lime min-w-max"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {loadingRecipes ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => <RecipeCardSkeleton key={i} />)}
          </div>
        ) : recipesError ? (
          <div className="bg-red-900 bg-opacity-30 border border-red-700 rounded-lg p-4 text-red-200">
            Error loading recipes: {recipesError}. Is the backend server running on port 5000?
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="bg-brand-gray-800 rounded-lg p-8 text-center text-brand-gray-300">
            <p className="mb-2">🤔 No recipes found</p>
            <p className="text-sm">Try selecting different ingredients or searching for something else.</p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-brand-gray-400 mb-4">Found <strong className="text-brand-lime">{filteredRecipes.length}</strong> recipes</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[calc(100vh-400px)] overflow-y-auto">
              {filteredRecipes.map(recipe => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onClick={() => setSelectedRecipe(recipe)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          onAddToPlan={onAddToMealPlan}
        />
      )}
    </div>
  );
};

export default DemoPage;
