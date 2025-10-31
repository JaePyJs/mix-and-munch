import ingredientsData from '@/data/ingredients.json';
import recipesData from '@/data/recipes.json';
import transcriptsData from '@/data/transcripts.json';

import type {
  Ingredient,
  MatchResult,
  PantrySelection,
  Recipe,
  RecipeSummary,
  TranscriptDemo,
} from './types';

export const ingredients = ingredientsData as Ingredient[];
export const recipes = recipesData as Recipe[];
export const transcripts = transcriptsData as TranscriptDemo[];

export function getAllIngredients(): Ingredient[] {
  return ingredients;
}

export function getAllRecipes(): RecipeSummary[] {
  return recipes.map((recipe) => ({
    id: recipe.id,
    slug: recipe.slug,
    title: recipe.title,
    summary: recipe.summary,
    heroImage: recipe.heroImage,
    imageAttribution: recipe.imageAttribution,
    rating: recipe.rating,
    reviews: recipe.reviews,
    matchIngredients: recipe.matchIngredients,
    dietaryTags: recipe.dietaryTags,
    difficulty: recipe.difficulty,
  }));
}

export function getRecipeBySlug(slug: string): Recipe | undefined {
  return recipes.find((recipe) => recipe.slug === slug);
}

export function getMatchResults(selection: PantrySelection): MatchResult[] {
  const selectedIds = Object.entries(selection)
    .filter(([, enabled]) => enabled)
    .map(([id]) => id);

  return recipes
    .map((recipe) => {
      const matched = recipe.matchIngredients.filter((id) => selectedIds.includes(id));
      const missing = recipe.matchIngredients.filter((id) => !selectedIds.includes(id));
      const matchPercentage = recipe.matchIngredients.length
        ? Math.round((matched.length / recipe.matchIngredients.length) * 100)
        : 0;

      return {
        ...recipe,
        matchPercentage,
        matchedIngredients: matched,
        missingIngredients: missing,
      } satisfies MatchResult;
    })
    .sort((a, b) => b.matchPercentage - a.matchPercentage || b.rating - a.rating);
}

export function getTranscriptDemo(): TranscriptDemo {
  return transcripts[0];
}
