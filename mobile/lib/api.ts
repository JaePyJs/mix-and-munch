import { createClient } from '@supabase/supabase-js';
import {
  Recipe,
  RecipeSummary,
  Ingredient,
  MatchResult,
  RecipeReview,
  CommunityRecipe,
} from './types';

// API Configuration - exported for direct use in components
export const API_BASE_URL = 'https://mix-and-munch.vercel.app/api';

// Supabase client
const supabaseUrl = 'https://nohqzryswrmxlbprmonf.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vaHF6cnlzd3JteGxicHJtb25mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3ODkxNjgsImV4cCI6MjA4MDM2NTE2OH0.LT9hlkH7GGX4bgU-xEx0EY4BKdwKHj09EVkTmQJvMrs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

import { offlineCache } from './offlineCache';

// Recipe API with offline support
export const recipeApi = {
  async getAll(): Promise<RecipeSummary[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/recipes`);
      const data = await response.json();
      const recipes = data.recipes || [];

      // Cache for offline use
      if (recipes.length > 0) {
        offlineCache.saveRecipes(recipes);
      }

      return recipes;
    } catch (error) {
      console.error('Error fetching recipes, trying offline cache:', error);
      // Fallback to offline cache
      const cached = await offlineCache.getRecipes();
      return cached || [];
    }
  },

  async getBySlug(slug: string): Promise<Recipe | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/recipes/${slug}`);
      const data = await response.json();
      return data.recipe || null;
    } catch (error) {
      console.error('Error fetching recipe, trying offline cache:', error);
      // Try to find in offline cache
      const cached = await offlineCache.getRecipes();
      return cached?.find((r) => r.slug === slug) || null;
    }
  },

  async search(query: string): Promise<RecipeSummary[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/recipes?search=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      return data.recipes || [];
    } catch (error) {
      console.error('Error searching recipes, trying offline cache:', error);
      // Search in offline cache
      const cached = await offlineCache.getRecipes();
      if (!cached) return [];
      const q = query.toLowerCase();
      return cached.filter(
        (r) =>
          r.title.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q)
      );
    }
  },
};

// Ingredients API with offline support
export const ingredientApi = {
  async getAll(): Promise<Ingredient[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/ingredients`);
      const data = await response.json();
      const ingredients = data.ingredients || [];

      // Cache for offline use
      if (ingredients.length > 0) {
        offlineCache.saveIngredients(ingredients);
      }

      return ingredients;
    } catch (error) {
      console.error('Error fetching ingredients, trying offline cache:', error);
      // Fallback to offline cache
      const cached = await offlineCache.getIngredients();
      return cached || [];
    }
  },

  async getMatches(selectedIds: string[]): Promise<MatchResult[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/ingredients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedIngredients: selectedIds }),
      });
      const data = await response.json();
      return data.matches || [];
    } catch (error) {
      console.error('Error getting matches:', error);
      return [];
    }
  },
};

// Reviews API (Supabase)
export const reviewsApi = {
  async getByRecipe(recipeSlug: string): Promise<RecipeReview[]> {
    const { data, error } = await supabase
      .from('recipe_reviews')
      .select('*')
      .eq('recipe_slug', recipeSlug)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }
    return data || [];
  },

  async create(
    review: Omit<RecipeReview, 'id' | 'created_at'>
  ): Promise<RecipeReview | null> {
    const { data, error } = await supabase
      .from('recipe_reviews')
      .insert([review])
      .select()
      .single();

    if (error) {
      console.error('Error creating review:', error);
      return null;
    }
    return data;
  },
};

// Community Recipes API (Supabase)
export const communityApi = {
  async getAll(): Promise<CommunityRecipe[]> {
    const { data, error } = await supabase
      .from('community_recipes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching community recipes:', error);
      return [];
    }
    return data || [];
  },

  async like(id: string): Promise<boolean> {
    const { error } = await supabase.rpc('increment_likes', { recipe_id: id });
    return !error;
  },
};

// AI Chat API
export const chatApi = {
  async sendMessage(message: string): Promise<string> {
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: message }],
        }),
      });

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let result = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === 'text-delta' && data.delta) {
                  result += data.delta;
                }
              } catch {
                // Skip non-JSON lines
              }
            }
          }
        }
      }

      return result || 'Sorry, I could not generate a response.';
    } catch (error) {
      console.error('Error sending chat message:', error);
      return 'Sorry, there was an error connecting to the AI.';
    }
  },
};

// Convenience wrapper for components
export const api = {
  baseUrl: API_BASE_URL,
  getRecipes: recipeApi.getAll,
  getRecipeBySlug: recipeApi.getBySlug,
  searchRecipes: recipeApi.search,
  getIngredients: ingredientApi.getAll,
  getMatchResults: ingredientApi.getMatches,
  sendChatMessage: chatApi.sendMessage,
  getReviews: reviewsApi.getByRecipe,
  createReview: reviewsApi.create,
  getCommunityRecipes: communityApi.getAll,
  likeCommunityRecipe: communityApi.like,
  // Offline cache utilities
  offline: offlineCache,
};
