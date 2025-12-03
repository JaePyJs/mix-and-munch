/**
 * Fuzzy Search Utility for Mix & Munch
 * Implements Levenshtein Distance algorithm for typo correction
 * Supports bilingual search (English + Filipino)
 */

import type { Ingredient, SearchMatch } from '@/lib/types';

/**
 * Calculate Levenshtein Distance between two strings
 * Uses dynamic programming approach - O(n×m) complexity
 * @param a First string
 * @param b Second string
 * @returns Number of edits needed to transform a into b
 */
export function levenshteinDistance(a: string, b: string): number {
  const aLower = a.toLowerCase();
  const bLower = b.toLowerCase();

  if (aLower === bLower) return 0;
  if (aLower.length === 0) return bLower.length;
  if (bLower.length === 0) return aLower.length;

  // Create matrix
  const matrix: number[][] = [];

  // Initialize first column
  for (let i = 0; i <= bLower.length; i++) {
    matrix[i] = [i];
  }

  // Initialize first row
  for (let j = 0; j <= aLower.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (let i = 1; i <= bLower.length; i++) {
    for (let j = 1; j <= aLower.length; j++) {
      if (bLower.charAt(i - 1) === aLower.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        );
      }
    }
  }

  return matrix[bLower.length][aLower.length];
}

/**
 * Calculate similarity score based on Levenshtein distance
 * @param a First string
 * @param b Second string
 * @returns Score between 0 (no match) and 1 (exact match)
 */
export function similarityScore(a: string, b: string): number {
  const maxLength = Math.max(a.length, b.length);
  if (maxLength === 0) return 1;
  const distance = levenshteinDistance(a, b);
  return 1 - distance / maxLength;
}

/**
 * Check if a string is a fuzzy match (within acceptable edit distance)
 * @param input User input
 * @param target Target string to match against
 * @param maxDistance Maximum allowed edit distance (default: 2)
 * @returns true if within acceptable distance
 */
export function isFuzzyMatch(
  input: string,
  target: string,
  maxDistance: number = 2
): boolean {
  // For short strings, be more strict
  const adjustedMax = target.length <= 3 ? 1 : maxDistance;
  return levenshteinDistance(input, target) <= adjustedMax;
}

/**
 * Find all fuzzy matches for a search term in ingredients list
 * Searches both English and Filipino names
 * @param searchTerm User's search input
 * @param ingredients List of ingredients to search
 * @param threshold Minimum similarity score (0-1, default: 0.6)
 * @returns Array of matching ingredients with scores
 */
export function fuzzySearchIngredients(
  searchTerm: string,
  ingredients: Ingredient[],
  threshold: number = 0.5
): SearchMatch[] {
  const term = searchTerm.toLowerCase().trim();
  if (!term) return [];

  const matches: SearchMatch[] = [];

  for (const ingredient of ingredients) {
    // Check exact match first (highest priority)
    if (
      ingredient.name.toLowerCase() === term ||
      ingredient.filipinoName.toLowerCase() === term
    ) {
      matches.push({
        ingredient,
        score: 1,
        matchedOn: ingredient.name.toLowerCase() === term ? 'name' : 'filipinoName',
      });
      continue;
    }

    // Check if search term is contained in the name
    if (
      ingredient.name.toLowerCase().includes(term) ||
      ingredient.filipinoName.toLowerCase().includes(term)
    ) {
      const containsScore = 0.9; // High score for substring match
      matches.push({
        ingredient,
        score: containsScore,
        matchedOn: ingredient.name.toLowerCase().includes(term) ? 'name' : 'filipinoName',
      });
      continue;
    }

    // Check fuzzy match on English name
    const englishScore = similarityScore(term, ingredient.name.toLowerCase());

    // Check fuzzy match on Filipino name
    const filipinoScore = similarityScore(term, ingredient.filipinoName.toLowerCase());

    // Take the best score
    const bestScore = Math.max(englishScore, filipinoScore);

    if (bestScore >= threshold) {
      matches.push({
        ingredient,
        score: bestScore,
        matchedOn: englishScore >= filipinoScore ? 'name' : 'filipinoName',
      });
    }
  }

  // Sort by score (highest first), then by name
  return matches.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.ingredient.name.localeCompare(b.ingredient.name);
  });
}

/**
 * Auto-correct a typo to the closest matching ingredient
 * @param input User input with potential typo
 * @param ingredients List of valid ingredients
 * @returns Corrected ingredient ID or null if no good match
 */
export function autoCorrectIngredient(
  input: string,
  ingredients: Ingredient[]
): Ingredient | null {
  const matches = fuzzySearchIngredients(input, ingredients, 0.6);

  // Only return if we have a reasonably confident match
  if (matches.length > 0 && matches[0].score >= 0.7) {
    return matches[0].ingredient;
  }

  return null;
}

/**
 * Parse natural language ingredient input
 * Handles phrases like "I have chicken, tomatoes, and garlic"
 * @param input Natural language input
 * @param ingredients Available ingredients
 * @returns Array of matched ingredient IDs
 */
export function parseIngredientInput(input: string, ingredients: Ingredient[]): string[] {
  // Remove common phrases
  const cleaned = input
    .toLowerCase()
    .replace(/i have|i've got|there's|there is|my|some|a few|lots of/gi, '')
    .replace(/and|,|;|\.|!/g, ' ')
    .trim();

  // Split into potential ingredient terms
  const terms = cleaned.split(/\s+/).filter((term) => term.length > 2);

  const matchedIds = new Set<string>();

  for (const term of terms) {
    const matches = fuzzySearchIngredients(term, ingredients, 0.7);
    if (matches.length > 0 && matches[0].score >= 0.7) {
      matchedIds.add(matches[0].ingredient.id);
    }
  }

  // Also try multi-word combinations (e.g., "soy sauce", "fish sauce")
  const words = cleaned.split(/\s+/);
  for (let i = 0; i < words.length - 1; i++) {
    const twoWord = `${words[i]} ${words[i + 1]}`;
    const matches = fuzzySearchIngredients(twoWord, ingredients, 0.8);
    if (matches.length > 0 && matches[0].score >= 0.8) {
      matchedIds.add(matches[0].ingredient.id);
    }
  }

  return Array.from(matchedIds);
}

/**
 * Get ingredient suggestions for a partial search
 * @param partial Partial search term
 * @param ingredients All ingredients
 * @param limit Maximum suggestions to return
 * @returns Array of suggested ingredients
 */
export function getIngredientSuggestions(
  partial: string,
  ingredients: Ingredient[],
  limit: number = 5
): Ingredient[] {
  if (!partial.trim()) return [];

  const matches = fuzzySearchIngredients(partial, ingredients, 0.4);
  return matches.slice(0, limit).map((m) => m.ingredient);
}
