/**
 * Service to fetch recipe images
 * Strategy: Spoonacular API for async lookup + null fallback
 */

import { searchRecipesByQuery } from './spoonacularService';

const imageCache = new Map<string, string | null>();

/**
 * Synchronous fallback - returns null for initial render
 * Client components can use async fetchRecipeImage for updates
 */
export function getRecipeImage(recipeName: string): string | null {
  // For now, return null and let components handle async loading
  return null;
}

/**
 * Async version - fetches from Spoonacular API  
 * Call this from useEffect in components to update images
 */
export async function fetchRecipeImage(recipeName: string): Promise<string | null> {
  if (imageCache.has(recipeName)) {
    return imageCache.get(recipeName) || null;
  }

  try {
    const results = await searchRecipesByQuery(recipeName, 1);
    
    if (results.length > 0 && results[0].image) {
      const imageUrl = results[0].image;
      imageCache.set(recipeName, imageUrl);
      return imageUrl;
    }
  } catch (error) {
    console.error(`Error fetching image for "${recipeName}":`, error);
  }

  imageCache.set(recipeName, null);
  return null;
}