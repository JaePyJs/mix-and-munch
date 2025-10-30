/**
 * Database Service - Supabase Configuration
 * Handles all database operations
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Initialize Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Database Schema (run in Supabase SQL editor)
 * 
 CREATE TABLE IF NOT EXISTS users (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   email VARCHAR UNIQUE NOT NULL,
   name VARCHAR,
   avatar_url VARCHAR,
   created_at TIMESTAMP DEFAULT NOW()
 );

 CREATE TABLE IF NOT EXISTS recipes (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   user_id UUID REFERENCES users(id) ON DELETE CASCADE,
   title VARCHAR NOT NULL,
   ingredients JSONB,
   steps JSONB,
   image_url VARCHAR,
   source_url VARCHAR,
   ai_generated BOOLEAN DEFAULT true,
   created_at TIMESTAMP DEFAULT NOW(),
   updated_at TIMESTAMP DEFAULT NOW()
 );

 CREATE TABLE IF NOT EXISTS saved_recipes (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   user_id UUID REFERENCES users(id) ON DELETE CASCADE,
   recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
   saved_at TIMESTAMP DEFAULT NOW(),
   UNIQUE(user_id, recipe_id)
 );

 CREATE TABLE IF NOT EXISTS ratings (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   user_id UUID REFERENCES users(id) ON DELETE CASCADE,
   recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
   rating INTEGER CHECK (rating >= 1 AND rating <= 5),
   comment TEXT,
   created_at TIMESTAMP DEFAULT NOW(),
   UNIQUE(user_id, recipe_id)
 );

 CREATE TABLE IF NOT EXISTS shopping_lists (
   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
   user_id UUID REFERENCES users(id) ON DELETE CASCADE,
   name VARCHAR,
   items JSONB,
   created_at TIMESTAMP DEFAULT NOW()
 );

 -- Row Level Security (RLS)
 ALTER TABLE users ENABLE ROW LEVEL SECURITY;
 ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
 ALTER TABLE saved_recipes ENABLE ROW LEVEL SECURITY;
 ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
 ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;

 -- Policies (allow users to see only their data)
 CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
 CREATE POLICY "Users can view recipes" ON recipes FOR SELECT USING (true);
 CREATE POLICY "Users can create recipes" ON recipes FOR INSERT WITH CHECK (auth.uid() = user_id);
 CREATE POLICY "Users can update own recipes" ON recipes FOR UPDATE USING (auth.uid() = user_id);
 */

/**
 * Recipes API
 */
export async function saveRecipe(recipe) {
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user?.id) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('recipes')
    .insert([
      {
        user_id: user.user.id,
        title: recipe.title,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        image_url: recipe.image_url,
        ai_generated: true,
      },
    ])
    .select();

  if (error) throw error;
  return data?.[0];
}

export async function getRecipes(limit = 20) {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function searchRecipes(query) {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .ilike('title', `%${query}%`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Saved Recipes API
 */
export async function saveRecipeToLibrary(recipeId) {
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user?.id) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('saved_recipes')
    .insert([{ user_id: user.user.id, recipe_id: recipeId }])
    .select();

  if (error) throw error;
  return data?.[0];
}

export async function getSavedRecipes() {
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user?.id) return [];

  const { data, error } = await supabase
    .from('saved_recipes')
    .select('recipes(*)')
    .eq('user_id', user.user.id);

  if (error) return [];
  return data?.map(item => item.recipes) || [];
}

/**
 * Ratings API
 */
export async function rateRecipe(recipeId, rating, comment = '') {
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user?.id) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('ratings')
    .upsert(
      {
        user_id: user.user.id,
        recipe_id: recipeId,
        rating,
        comment,
      },
      { onConflict: 'user_id,recipe_id' }
    )
    .select();

  if (error) throw error;
  return data?.[0];
}

export async function getRecipeRating(recipeId) {
  const { data, error } = await supabase
    .from('ratings')
    .select('AVG(rating) as avg_rating, COUNT(*) as count')
    .eq('recipe_id', recipeId);

  if (error) return { avg_rating: 0, count: 0 };
  return data?.[0] || { avg_rating: 0, count: 0 };
}
