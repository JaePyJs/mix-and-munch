/**
 * Spoonacular Recipe API Service
 * Free tier: 150 requests/day (no API key required for basic search)
 * Returns recipes with built-in images
 */

export interface SpoonacularRecipe {
  id: number;
  title: string;
  image: string;
  usedIngredients?: { name: string; amount: number; unit: string }[];
}

/**
 * Search recipes by ingredients via Spoonacular API
 * No API key needed for basic search (searchRecipesByIngredients endpoint)
 */
export async function searchRecipesByIngredients(
  ingredients: string[],
  number: number = 4
): Promise<SpoonacularRecipe[]> {
  if (ingredients.length === 0) return [];

  try {
    const query = ingredients.join(',+');
    const response = await fetch(
      `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${query}&number=${number}&ranking=2`
    );

    if (!response.ok) {
      console.warn('Spoonacular API error:', response.status);
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching from Spoonacular:', error);
    return [];
  }
}

/**
 * Search recipes by query term
 * Returns recipes with images
 */
export async function searchRecipesByQuery(
  query: string,
  number: number = 4
): Promise<SpoonacularRecipe[]> {
  if (!query.trim()) return [];

  try {
    const response = await fetch(
      `https://api.spoonacular.com/recipes/search?query=${encodeURIComponent(query)}&number=${number}`
    );

    if (!response.ok) {
      console.warn('Spoonacular API error:', response.status);
      return [];
    }

    const data = await response.json();
    return data.results ? data.results : [];
  } catch (error) {
    console.error('Error fetching from Spoonacular:', error);
    return [];
  }
}

/**
 * Get detailed recipe information including instructions
 */
export async function getRecipeDetails(recipeId: number) {
  try {
    const response = await fetch(
      `https://api.spoonacular.com/recipes/${recipeId}/information`
    );

    if (!response.ok) {
      console.warn('Spoonacular API error:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching recipe details:', error);
    return null;
  }
}

/**
 * Convert Spoonacular recipe to our Recipe format
 * Returns null if image is missing
 */
export function convertSpoonacularRecipe(spoonRecipe: any): any {
  // Only return if image exists
  if (!spoonRecipe.image) {
    console.warn(`Recipe "${spoonRecipe.title}" has no image, skipping`);
    return null;
  }

  return {
    id: spoonRecipe.id,
    name: spoonRecipe.title,
    description: spoonRecipe.summary?.replace(/<[^>]*>/g, '') || 'Filipino-style recipe',
    imageUrl: spoonRecipe.image,
    category: spoonRecipe.cuisines?.[0] || 'Main Dish',
    ingredients: (spoonRecipe.extendedIngredients || []).map((ing: any) => ({
      name: ing.name,
      quantity: ing.measures?.metric?.amount || 0,
      unit: ing.measures?.metric?.unitShort || ''
    })),
    instructions: parseInstructions(spoonRecipe.instructions)
  };
}

/**
 * Parse instructions from Spoonacular format
 */
function parseInstructions(instructionText: string): string[] {
  if (!instructionText) return [];
  
  // Split by periods or step numbers
  return instructionText
    .split(/\d+\.\s+/)
    .filter(step => step.trim().length > 0)
    .map(step => step.trim().replace(/^\s*-\s*/, ''));
}
