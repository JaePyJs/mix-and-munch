import { NextRequest, NextResponse } from 'next/server';
import { communityRecipesApi } from '@/lib/supabase';

// GET - Fetch all community recipes
export async function GET() {
  try {
    const recipes = await communityRecipesApi.getAll();

    // Transform to match the frontend expected format
    const transformedRecipes = recipes.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      cuisine: 'Filipino',
      difficulty: r.difficulty || 'Medium',
      prepTime: r.prep_time || '15 mins',
      cookTime: r.cook_time || '30 mins',
      servings: r.servings || 4,
      ingredients:
        r.ingredients?.map((ing: string) => ({
          item: ing,
          amount: '',
        })) || [],
      instructions: r.steps || [],
      tips: [],
      tags: r.tags || [],
      sharedBy: {
        name: r.author_name || 'Anonymous Chef',
        avatar: r.author_avatar || '👨‍🍳',
        location: 'Philippines',
      },
      sharedAt: r.created_at,
      likes: r.likes || 0,
      dislikes: r.dislikes || 0,
      saves: 0,
    }));

    return NextResponse.json({
      success: true,
      count: transformedRecipes.length,
      recipes: transformedRecipes,
    });
  } catch (error: any) {
    console.error('[community-recipes] GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST - Add a new community recipe
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipe, sharedBy } = body;

    if (!recipe || !recipe.title) {
      return NextResponse.json(
        { success: false, message: 'Recipe title is required' },
        { status: 400 }
      );
    }

    // Transform ingredients to string array
    const ingredients =
      recipe.ingredients?.map((ing: any) =>
        typeof ing === 'string'
          ? ing
          : `${ing.amount || ''} ${ing.item || ing.name || ''}`.trim()
      ) || [];

    // Transform instructions to string array
    const steps =
      recipe.instructions?.map((step: any) =>
        typeof step === 'string' ? step : step.action || step.text || ''
      ) ||
      recipe.steps ||
      [];

    const newRecipe = await communityRecipesApi.create({
      title: recipe.title,
      description: recipe.description || '',
      ingredients,
      steps,
      author_name: sharedBy?.name || 'Anonymous Chef',
      author_avatar: sharedBy?.avatar || '👨‍🍳',
      image_url: recipe.image_url || undefined,
      prep_time: recipe.prep_time || recipe.prepTime || '15 mins',
      cook_time: recipe.cook_time || recipe.cookTime || '30 mins',
      servings: recipe.servings || 4,
      difficulty: recipe.difficulty || 'Medium',
      tags: recipe.tags || [],
    });

    if (!newRecipe) {
      return NextResponse.json(
        { success: false, message: 'Failed to create recipe' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Recipe shared to community!',
      recipe: {
        id: newRecipe.id,
        title: newRecipe.title,
        description: newRecipe.description,
        cuisine: 'Filipino',
        difficulty: newRecipe.difficulty,
        prepTime: newRecipe.prep_time,
        cookTime: newRecipe.cook_time,
        servings: newRecipe.servings,
        ingredients: newRecipe.ingredients?.map((ing: string) => ({
          item: ing,
          amount: '',
        })),
        instructions: newRecipe.steps,
        tips: [],
        tags: newRecipe.tags,
        sharedBy: {
          name: newRecipe.author_name,
          avatar: newRecipe.author_avatar || '👨‍🍳',
          location: 'Philippines',
        },
        sharedAt: newRecipe.created_at,
        likes: 0,
        dislikes: 0,
        saves: 0,
      },
    });
  } catch (error: any) {
    console.error('[community-recipes] POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH - Like a recipe
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipeId, action } = body;

    if (!recipeId || !action) {
      return NextResponse.json(
        { success: false, message: 'recipeId and action required' },
        { status: 400 }
      );
    }

    if (action === 'like') {
      const success = await communityRecipesApi.like(recipeId);
      if (!success) {
        return NextResponse.json(
          { success: false, message: 'Failed to like recipe' },
          { status: 500 }
        );
      }

      // Get updated recipe to return likes count
      const recipe = await communityRecipesApi.getById(recipeId);
      return NextResponse.json({
        success: true,
        likes: recipe?.likes || 0,
        dislikes: recipe?.dislikes || 0,
        saves: 0,
      });
    }

    if (action === 'dislike') {
      const success = await communityRecipesApi.dislike(recipeId);
      if (!success) {
        return NextResponse.json(
          { success: false, message: 'Failed to dislike recipe' },
          { status: 500 }
        );
      }

      // Get updated recipe to return dislikes count
      const recipe = await communityRecipesApi.getById(recipeId);
      return NextResponse.json({
        success: true,
        likes: recipe?.likes || 0,
        dislikes: recipe?.dislikes || 0,
        saves: 0,
      });
    }

    // For 'save' action, just return success (saves are stored locally)
    return NextResponse.json({
      success: true,
      likes: 0,
      dislikes: 0,
      saves: 1,
    });
  } catch (error: any) {
    console.error('[community-recipes] PATCH error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE - Delete a recipe
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const recipeId = searchParams.get('id');

    if (!recipeId) {
      return NextResponse.json(
        { success: false, message: 'Recipe ID is required' },
        { status: 400 }
      );
    }

    const success = await communityRecipesApi.delete(recipeId);
    if (!success) {
      return NextResponse.json(
        { success: false, message: 'Failed to delete recipe' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Recipe deleted successfully',
    });
  } catch (error: any) {
    console.error('[community-recipes] DELETE error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
