/**
 * Seed Recipes Database with Filipino Recipes
 * Uses Spoonacular API to fetch recipes with images
 * Inserts into Supabase
 * 
 * Usage: node scripts/seed-recipes.js
 */

import fetch from 'node-fetch';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env.local');

// Load environment variables
function loadEnv() {
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local not found');
    process.exit(1);
  }

  const content = fs.readFileSync(envPath, 'utf-8');
  const env = {};
  content.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
    }
  });
  return env;
}

const ENV = loadEnv();

// Filipino dish keywords
const FILIPINO_DISHES = [
  'adobo',
  'sinigang',
  'kare-kare',
  'lumpia',
  'fried rice',
  'bibimbap',
  'tocino',
  'tinola',
  'pancit',
  'sisig',
  'nilaga',
  'lapu-lapu',
  'kaldereta',
  'bulalo',
  'empanada'
];

/**
 * Fetch recipes from Spoonacular API
 */
async function fetchRecipesFromSpoonacular() {
  console.log('📡 Fetching recipes from Spoonacular...\n');

  const recipes = [];

  for (const dish of FILIPINO_DISHES.slice(0, 10)) {
    try {
      console.log(`  🔍 Searching for: ${dish}`);
      
      const response = await fetch(
        `https://api.spoonacular.com/recipes/search?query=${encodeURIComponent(dish)}&number=1&addRecipeInformation=true&fillIngredients=true`
      );

      if (!response.ok) {
        console.warn(`  ⚠️  API returned ${response.status}, skipping...`);
        continue;
      }

      const data = await response.json();
      if (!data.results || data.results.length === 0) {
        console.warn(`  ⚠️  No recipes found for ${dish}`);
        continue;
      }

      const recipe = data.results[0];
      
      // Skip if no image
      if (!recipe.image) {
        console.warn(`  ⚠️  No image for ${recipe.title}, skipping...`);
        continue;
      }

      recipes.push({
        name: recipe.title,
        description: recipe.summary?.replace(/<[^>]*>/g, '') || `Delicious Filipino dish: ${recipe.title}`,
        category: 'Main Dish',
        image_url: recipe.image,
        prep_time: Math.round((recipe.preparationMinutes || 15) / 60) * 60,
        cook_time: Math.round((recipe.cookingMinutes || 30) / 60) * 60,
        servings: recipe.servings || 4,
        difficulty: recipe.servings > 6 ? 'hard' : 'medium',
        ingredients: (recipe.extendedIngredients || []).map(ing => ({
          name: ing.name,
          quantity: ing.measures?.metric?.amount || 0,
          unit: ing.measures?.metric?.unitShort || ''
        })),
        instructions: parseInstructions(recipe.instructions)
      });

      console.log(`  ✅ Added: ${recipe.title}`);
    } catch (error) {
      console.error(`  ❌ Error fetching ${dish}:`, error.message);
    }
  }

  console.log(`\n✅ Fetched ${recipes.length} recipes\n`);
  return recipes;
}

/**
 * Parse instructions from HTML
 */
function parseInstructions(html) {
  if (!html) {
    return ['Mix all ingredients', 'Cook until done', 'Serve hot'];
  }
  
  // Remove HTML tags
  const text = html.replace(/<[^>]*>/g, '');
  
  // Split by period or numbers
  const steps = text
    .split(/\d+\.\s+|(?<=[.!?])\s+/)
    .filter(s => s.trim().length > 5)
    .map(s => s.trim());
  
  return steps.length > 0 ? steps : ['Mix all ingredients', 'Cook until done'];
}

/**
 * Insert recipes into Supabase
 */
async function insertRecipesIntoSupabase(recipes) {
  const SUPABASE_URL = ENV.VITE_SUPABASE_URL;
  const SUPABASE_KEY = ENV.VITE_SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
  }

  console.log('💾 Inserting into Supabase...\n');

  for (const recipe of recipes) {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/recipes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'apikey': SUPABASE_KEY,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(recipe)
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.warn(`  ⚠️  Failed to insert ${recipe.name}:`, error);
        continue;
      }

      console.log(`  ✅ Inserted: ${recipe.name}`);
    } catch (error) {
      console.error(`  ❌ Error inserting ${recipe.name}:`, error.message);
    }
  }

  console.log('\n✅ Insert complete\n');
}

/**
 * Verify recipes in Supabase
 */
async function verifyRecipes() {
  const SUPABASE_URL = ENV.VITE_SUPABASE_URL;
  const SUPABASE_KEY = ENV.VITE_SUPABASE_ANON_KEY;

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/recipes?select=id,name,image_url&limit=20`,
      {
        headers: {
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'apikey': SUPABASE_KEY
        }
      }
    );

    if (!response.ok) {
      console.warn('⚠️  Could not verify recipes');
      return;
    }

    const recipes = await response.json();
    console.log(`📊 Database now contains ${recipes.length} recipes:\n`);
    
    recipes.forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.name}`);
      if (r.image_url) {
        console.log(`     📸 Image: ${r.image_url.substring(0, 50)}...`);
      }
    });
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🍲 MIX & MUNCH RECIPE DATABASE SEEDER');
  console.log('='.repeat(60) + '\n');

  try {
    // Step 1: Fetch recipes
    const recipes = await fetchRecipesFromSpoonacular();

    if (recipes.length === 0) {
      console.error('❌ No recipes fetched, aborting');
      process.exit(1);
    }

    // Step 2: Insert into Supabase
    await insertRecipesIntoSupabase(recipes);

    // Step 3: Verify
    await verifyRecipes();

    console.log('='.repeat(60));
    console.log('✅ SEEDING COMPLETE!');
    console.log('='.repeat(60) + '\n');
    console.log('Next steps:');
    console.log('1. Refresh your app (http://localhost:3000)');
    console.log('2. Select ingredients');
    console.log('3. Send a message');
    console.log('4. AI should generate a recipe with image!\n');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run if called directly
main().catch(console.error);
