import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const AI_CACHE_PATH = path.join(process.cwd(), 'data', 'ai-recipe-cache.json');
const COMMUNITY_PATH = path.join(process.cwd(), 'data', 'community-recipes.json');

interface CachedRecipe {
  id: string;
  ingredientHash: string;
  ingredients: string[];
  recipe: any;
  createdAt: string;
  usageCount: number;
  lastUsed?: string;
}

interface AICache {
  recipes: CachedRecipe[];
  metadata: {
    lastUpdated?: string;
  };
}

// Create ingredient hash for caching
function createIngredientHash(ingredients: string[]): string {
  // Normalize and sort ingredients for consistent hashing
  const normalized = ingredients
    .map((i) => i.toLowerCase().trim())
    .filter((i) => i.length > 0)
    .sort()
    .join('|');

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

// GET - Check if recipe exists for ingredients
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ingredientsParam = searchParams.get('ingredients');

    if (!ingredientsParam) {
      return NextResponse.json(
        {
          success: false,
          message: 'Ingredients parameter required',
        },
        { status: 400 }
      );
    }

    const ingredients = ingredientsParam
      .split(',')
      .map((i) => i.trim())
      .filter((i) => i);
    const hash = createIngredientHash(ingredients);

    // Read cache
    const data = await fs.readFile(AI_CACHE_PATH, 'utf-8');
    const cache = JSON.parse(data);

    // Find matching recipe
    const cachedRecipe = cache.recipes.find((r: any) => r.ingredientHash === hash);

    if (cachedRecipe) {
      return NextResponse.json({
        success: true,
        cached: true,
        recipe: cachedRecipe.recipe,
        message: 'Recipe found in cache! Using saved recipe.',
        cachedAt: cachedRecipe.createdAt,
        usageCount: cachedRecipe.usageCount || 1,
      });
    }

    return NextResponse.json({
      success: true,
      cached: false,
      message: 'No cached recipe found for these ingredients',
    });
  } catch (error) {
    console.error('AI cache GET error:', error);
    return NextResponse.json(
      {
        success: false,
        cached: false,
        message: 'Cache not available',
      },
      { status: 200 }
    ); // Return 200 so it doesn't break the flow
  }
}

// POST - Save AI-generated recipe
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ingredients, recipe, addToCommunity = false, chefName, avatar } = body;

    if (!ingredients || !Array.isArray(ingredients) || !recipe) {
      return NextResponse.json(
        {
          success: false,
          message: 'Ingredients array and recipe object required',
        },
        { status: 400 }
      );
    }

    const hash = createIngredientHash(ingredients);
    const recipeId = `ai-${hash}-${Date.now()}`;

    // Read current cache
    let cache: AICache = { recipes: [], metadata: {} };
    try {
      const data = await fs.readFile(AI_CACHE_PATH, 'utf-8');
      cache = JSON.parse(data) as AICache;
    } catch {
      // File doesn't exist yet
    }

    // Check if this hash already exists
    const existingIndex = cache.recipes.findIndex((r: any) => r.ingredientHash === hash);

    const cacheEntry = {
      id: recipeId,
      ingredientHash: hash,
      ingredients: ingredients.map((i: string) => i.toLowerCase().trim()).sort(),
      recipe: {
        ...recipe,
        id: recipeId,
        source: 'ai-generated',
      },
      createdAt: new Date().toISOString(),
      usageCount: 1,
    };

    if (existingIndex >= 0) {
      // Update existing entry (increment usage count)
      cache.recipes[existingIndex].usageCount =
        (cache.recipes[existingIndex].usageCount || 0) + 1;
      cache.recipes[existingIndex].lastUsed = new Date().toISOString();
    } else {
      // Add new entry
      cache.recipes.push(cacheEntry);
    }

    cache.metadata.lastUpdated = new Date().toISOString();
    await fs.writeFile(AI_CACHE_PATH, JSON.stringify(cache, null, 2));

    // Optionally add to community recipes
    if (addToCommunity && chefName) {
      try {
        const communityData = await fs.readFile(COMMUNITY_PATH, 'utf-8');
        const communityRecipes = JSON.parse(communityData);

        const communityRecipe = {
          id: `community-ai-${Date.now()}`,
          ...recipe,
          source: 'ai-generated',
          sharedBy: {
            name: chefName,
            avatar: avatar || '🤖',
            location: 'AI Kitchen',
          },
          sharedAt: new Date().toISOString(),
          likes: 0,
          saves: 0,
          tags: [...(recipe.tags || []), 'ai-generated'],
        };

        communityRecipes.push(communityRecipe);
        await fs.writeFile(COMMUNITY_PATH, JSON.stringify(communityRecipes, null, 2));
      } catch (error) {
        console.error('Failed to add to community:', error);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Recipe saved to cache',
      recipeId,
      hash,
    });
  } catch (error) {
    console.error('AI cache POST error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to save recipe',
      },
      { status: 500 }
    );
  }
}
