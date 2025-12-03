import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export interface CommunityRecipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  steps: string[];
  author_name: string;
  author_avatar?: string;
  image_url?: string;
  prep_time?: string;
  cook_time?: string;
  servings?: number;
  difficulty?: string;
  tags: string[];
  likes: number;
  created_at: string;
}

export interface RecipeReview {
  id: string;
  recipe_slug: string;
  rating: number;
  comment: string;
  author_name: string;
  created_at: string;
}

// Community Recipes API
export const communityRecipesApi = {
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

  async getById(id: string): Promise<CommunityRecipe | null> {
    const { data, error } = await supabase
      .from('community_recipes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching recipe:', error);
      return null;
    }
    return data;
  },

  async create(
    recipe: Omit<CommunityRecipe, 'id' | 'created_at' | 'likes'>
  ): Promise<CommunityRecipe | null> {
    const { data, error } = await supabase
      .from('community_recipes')
      .insert([{ ...recipe, likes: 0 }])
      .select()
      .single();

    if (error) {
      console.error('Error creating recipe:', error);
      return null;
    }
    return data;
  },

  async like(id: string): Promise<boolean> {
    const { error } = await supabase.rpc('increment_likes', { recipe_id: id });
    if (error) {
      console.error('Error liking recipe:', error);
      return false;
    }
    return true;
  },
};

// Recipe Reviews API
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

  async getAverageRating(
    recipeSlug: string
  ): Promise<{ average: number; count: number }> {
    const { data, error } = await supabase
      .from('recipe_reviews')
      .select('rating')
      .eq('recipe_slug', recipeSlug);

    if (error || !data || data.length === 0) {
      return { average: 0, count: 0 };
    }

    const sum = data.reduce((acc, r) => acc + r.rating, 0);
    return { average: sum / data.length, count: data.length };
  },
};
