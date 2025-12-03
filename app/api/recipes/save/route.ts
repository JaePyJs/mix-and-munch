import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import type { Recipe } from '@/lib/types';

// Helper to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Helper to generate unique ID
function generateId(): string {
  return `recipe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Map ingredient names to ingredient IDs from our database
async function mapIngredientsToIds(ingredientNames: string[]): Promise<string[]> {
  const ingredientsPath = path.join(process.cwd(), 'data', 'ingredients.json');
  const ingredientsData = await fs.readFile(ingredientsPath, 'utf-8');
  const ingredients = JSON.parse(ingredientsData);

  const matchedIds: string[] = [];

  for (const name of ingredientNames) {
    const normalizedName = name.toLowerCase();

    // Try to find a matching ingredient
    const match = ingredients.find((ing: { id: string; name: string }) => {
      const ingName = ing.name.toLowerCase();
      const ingId = ing.id.toLowerCase();

      return (
        ingName.includes(normalizedName) ||
        normalizedName.includes(ingName) ||
        ingId.includes(normalizedName) ||
        normalizedName.includes(ingId)
      );
    });

    if (match) {
      matchedIds.push(match.id);
    }
  }

  return [...new Set(matchedIds)]; // Remove duplicates
}

// Convert extracted recipe to our Recipe format
async function convertToRecipeFormat(
  extractedRecipe: any,
  videoId: string
): Promise<Recipe> {
  const id = generateId();
  const slug = generateSlug(extractedRecipe.title || 'untitled-recipe');

  // Extract ingredient names for matching
  const ingredientNames = (extractedRecipe.ingredients || []).map((ing: any) =>
    typeof ing === 'string' ? ing : ing.item || ''
  );

  // Map to our ingredient IDs
  const matchIngredients = await mapIngredientsToIds(ingredientNames);

  // Convert ingredients to our format
  const ingredients = (extractedRecipe.ingredients || []).map((ing: any) => ({
    name: typeof ing === 'string' ? ing : ing.item || '',
    amount: typeof ing === 'string' ? '' : ing.amount || '',
  }));

  // Convert steps to our format (just strings)
  const steps = (extractedRecipe.instructions || []).map((step: any) =>
    typeof step === 'string' ? step : step.action || step.text || ''
  );

  // Map difficulty
  const difficultyMap: Record<string, string> = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
  };
  const difficulty = difficultyMap[extractedRecipe.difficulty?.toLowerCase()] || 'Medium';

  // Generate dietary tags from the recipe tags
  const dietaryTags = (extractedRecipe.tags || []).map((tag: string) =>
    tag.toLowerCase().replace(/\s+/g, '-')
  );

  return {
    id,
    slug,
    title: extractedRecipe.title || 'Untitled Recipe',
    summary: extractedRecipe.description || '',
    description: extractedRecipe.description || '',
    heroImage: extractedRecipe.thumbnail || `/images/recipes/${slug}.jpg`,
    imageAttribution: `Extracted from YouTube video ${videoId}`,
    rating: 0,
    reviews: 0,
    matchIngredients,
    dietaryTags,
    difficulty,
    servings: extractedRecipe.servings || 4,
    prepTime: extractedRecipe.prep_time || '15 mins',
    cookTime: extractedRecipe.cook_time || '30 mins',
    totalTime: extractedRecipe.total_time || '45 mins',
    ingredients,
    steps,
    chef: extractedRecipe.channel || 'AI Extracted',
    sourceUrl: extractedRecipe.video_url || `https://youtube.com/watch?v=${videoId}`,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipe: extractedRecipe, videoId } = body;

    if (!extractedRecipe) {
      return NextResponse.json(
        { success: false, message: 'Recipe data is required' },
        { status: 400 }
      );
    }

    // Convert to our format
    const recipe = await convertToRecipeFormat(extractedRecipe, videoId || 'unknown');

    // Read existing recipes
    const recipesPath = path.join(process.cwd(), 'data', 'recipes.json');
    const existingData = await fs.readFile(recipesPath, 'utf-8');
    const recipes: Recipe[] = JSON.parse(existingData);

    // Check for duplicates by title or video URL
    const isDuplicate = recipes.some(
      (r) =>
        r.title.toLowerCase() === recipe.title.toLowerCase() ||
        r.sourceUrl === recipe.sourceUrl
    );

    if (isDuplicate) {
      return NextResponse.json(
        { success: false, message: 'Recipe already exists in database' },
        { status: 409 }
      );
    }

    // Add new recipe
    recipes.push(recipe);

    // Save back to file
    await fs.writeFile(recipesPath, JSON.stringify(recipes, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'Recipe saved successfully',
      recipe: {
        id: recipe.id,
        slug: recipe.slug,
        title: recipe.title,
      },
    });
  } catch (error: any) {
    console.error('[save-recipe] Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to save recipe',
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// GET endpoint to list all recipes (for debugging)
export async function GET() {
  try {
    const recipesPath = path.join(process.cwd(), 'data', 'recipes.json');
    const data = await fs.readFile(recipesPath, 'utf-8');
    const recipes: Recipe[] = JSON.parse(data);

    return NextResponse.json({
      success: true,
      count: recipes.length,
      recipes: recipes.map((r) => ({
        id: r.id,
        slug: r.slug,
        title: r.title,
        sourceUrl: r.sourceUrl,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
