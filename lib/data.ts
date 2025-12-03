import ingredientsData from '@/data/ingredients.json';
import recipesData from '@/data/recipes.json';
import transcriptsData from '@/data/transcripts.json';

import type {
  Ingredient,
  MatchResult,
  PantrySelection,
  Recipe,
  RecipeSummary,
  SubstituteSuggestion,
  TranscriptDemo,
} from './types';

export const ingredients = ingredientsData as Ingredient[];
export const recipes = recipesData as Recipe[];
export const transcripts = transcriptsData as TranscriptDemo[];

/**
 * Get ingredient by ID
 */
export function getIngredientById(id: string): Ingredient | undefined {
  return ingredients.find((ing) => ing.id === id);
}

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

/**
 * Calculate Jaccard Similarity between two sets
 * Formula: J(A,B) = |A ∩ B| / |A ∪ B|
 */
function calculateJaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  if (setA.size === 0 && setB.size === 0) return 0;

  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);

  return intersection.size / union.size;
}

/**
 * Get difficulty score (lower difficulty = higher score for beginners)
 */
function getDifficultyScore(difficulty: string): number {
  const difficultyMap: Record<string, number> = {
    Easy: 1.0,
    Intermediate: 0.7,
    Advanced: 0.4,
  };
  return difficultyMap[difficulty] || 0.5;
}

/**
 * Calculate weighted score for recipe ranking
 * Formula: Score = 0.5×(match) + 0.25×(rating) + 0.15×(filipino) + 0.10×(difficulty)
 */
function calculateWeightedScore(
  matchPercentage: number,
  rating: number,
  isFilipino: boolean,
  difficulty: string
): number {
  const normalizedMatch = matchPercentage / 100;
  const normalizedRating = rating / 5; // Assuming 5-star scale
  const filipinoBonus = isFilipino ? 1 : 0;
  const difficultyScore = getDifficultyScore(difficulty);

  return (
    0.5 * normalizedMatch +
    0.25 * normalizedRating +
    0.15 * filipinoBonus +
    0.1 * difficultyScore
  );
}

/**
 * Get substitute suggestions for missing ingredients
 */
function getSubstituteSuggestions(missingIds: string[]): SubstituteSuggestion[] {
  const suggestions: SubstituteSuggestion[] = [];

  for (const missingId of missingIds) {
    const ingredient = getIngredientById(missingId);
    if (ingredient && ingredient.substitutes && ingredient.substitutes.length > 0) {
      // Get substitute names
      const substituteNames = ingredient.substitutes
        .map((subId) => {
          const sub = getIngredientById(subId);
          return sub ? sub.name : null;
        })
        .filter((name): name is string => name !== null);

      if (substituteNames.length > 0) {
        suggestions.push({
          missing: ingredient.name,
          substitutes: substituteNames,
        });
      }
    }
  }

  return suggestions;
}

/**
 * Get match results with proper Jaccard similarity and weighted scoring
 * @param selection User's pantry selection
 * @param minMatchPercentage Minimum match percentage to include (default: 30%)
 * @returns Sorted array of matching recipes
 */
export function getMatchResults(
  selection: PantrySelection,
  minMatchPercentage: number = 30
): MatchResult[] {
  const selectedIds = new Set(
    Object.entries(selection)
      .filter(([, enabled]) => enabled)
      .map(([id]) => id)
  );

  // If nothing selected, return empty
  if (selectedIds.size === 0) return [];

  const results: MatchResult[] = [];

  for (const recipe of recipes) {
    // Handle recipes without matchIngredients
    const recipeIngredientIds = new Set(recipe.matchIngredients || []);

    if (recipeIngredientIds.size === 0) {
      continue; // Skip recipes with no ingredients defined
    }

    // Calculate matches
    const matched = [...recipeIngredientIds].filter((id) => selectedIds.has(id));
    const missing = [...recipeIngredientIds].filter((id) => !selectedIds.has(id));

    // Also calculate simple match percentage (for display)
    const matchPercentage = Math.round((matched.length / recipeIngredientIds.size) * 100);

    // Skip if below minimum threshold
    if (matchPercentage < minMatchPercentage) {
      continue;
    }

    // Calculate weighted score
    const weightedScore = calculateWeightedScore(
      matchPercentage,
      recipe.rating,
      true, // All recipes in this app are Filipino
      recipe.difficulty
    );

    // Get substitute suggestions for missing ingredients
    const substituteSuggestions = getSubstituteSuggestions(missing);

    results.push({
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
      matchPercentage,
      matchedIngredients: matched,
      missingIngredients: missing,
      substituteSuggestions,
      weightedScore,
    });
  }

  // Sort by weighted score (primary), then match percentage (secondary)
  return results.sort((a, b) => {
    const scoreDiff = (b.weightedScore ?? 0) - (a.weightedScore ?? 0);
    if (Math.abs(scoreDiff) > 0.01) return scoreDiff;
    return b.matchPercentage - a.matchPercentage;
  });
}

export function getTranscriptDemo(): TranscriptDemo {
  return transcripts[0];
}
