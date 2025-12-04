'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface RecipeIngredient {
  name: string;
  amount: string;
}

interface SaveRecipeButtonProps {
  recipeSlug: string;
  recipeTitle: string;
  recipeDescription: string;
  recipeImage?: string;
  prepTime?: string;
  cookTime?: string;
  difficulty?: string;
  servings?: number;
  ingredients?: RecipeIngredient[];
  steps?: string[];
  chef?: string;
}

export function SaveRecipeButton({
  recipeSlug,
  recipeTitle,
  recipeDescription,
  recipeImage,
  prepTime,
  cookTime,
  difficulty,
  servings,
  ingredients,
  steps,
  chef,
}: SaveRecipeButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Check if recipe is already saved
    const existingSaved = localStorage.getItem('savedRecipes');
    if (existingSaved) {
      const savedRecipes = JSON.parse(existingSaved);
      const isAlreadySaved = savedRecipes.some(
        (r: { id: string }) => r.id === recipeSlug
      );
      setIsSaved(isAlreadySaved);
    }
  }, [recipeSlug]);

  const handleSave = () => {
    const savedRecipe = {
      id: recipeSlug,
      title: recipeTitle,
      description: recipeDescription,
      image: recipeImage || '/images/placeholder-recipe.jpg',
      prepTime: prepTime || '',
      cookTime: cookTime || '',
      difficulty: difficulty || 'Medium',
      servings: servings || 4,
      ingredients: ingredients || [],
      steps: steps || [],
      chef: chef || '',
      savedAt: new Date().toISOString(),
      type: 'database' as const,
    };

    const existingSaved = localStorage.getItem('savedRecipes');
    const savedRecipes = existingSaved ? JSON.parse(existingSaved) : [];

    if (isSaved) {
      // Remove from saved
      const filtered = savedRecipes.filter((r: { id: string }) => r.id !== recipeSlug);
      localStorage.setItem('savedRecipes', JSON.stringify(filtered));
      setIsSaved(false);
    } else {
      // Add to saved
      savedRecipes.unshift(savedRecipe);
      localStorage.setItem('savedRecipes', JSON.stringify(savedRecipes));
      setIsSaved(true);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 2000);
    }
  };

  return (
    <div className="relative">
      <Button
        onClick={handleSave}
        variant={isSaved ? 'secondary' : 'primary'}
        className="flex items-center gap-2"
      >
        {isSaved ? '❤️ Saved' : '🤍 Save Recipe'}
      </Button>

      {showNotification && (
        <div className="absolute top-full left-0 mt-2 px-3 py-2 bg-brand-lime text-brand-gray-900 text-sm rounded-lg whitespace-nowrap z-10">
          ✅ Recipe saved!
        </div>
      )}
    </div>
  );
}
