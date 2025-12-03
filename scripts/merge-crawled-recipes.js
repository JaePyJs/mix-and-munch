/**
 * Merge Crawled Recipes Script
 * Merges recipes from data/crawled-recipes/ into data/recipes.json
 * 
 * Usage: node scripts/merge-crawled-recipes.js
 */

const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const CRAWLED_DIR = path.join(DATA_DIR, 'crawled-recipes');
const RECIPES_FILE = path.join(DATA_DIR, 'recipes.json');

/**
 * Convert crawled recipe format to application format
 */
function convertCrawledRecipe(crawledRecipe, index) {
  // Generate a slug from the title
  const slug = crawledRecipe.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  // Convert ingredients array to structured format
  const ingredients = crawledRecipe.ingredients.map(ingredient => ({
    name: ingredient,
    amount: "", // Crawled recipes don't have structured amounts
    unit: ""
  }));

  // Convert instructions array to structured format
  const steps = crawledRecipe.instructions.map((instruction, stepIndex) => ({
    step: stepIndex + 1,
    instruction: instruction
  }));

  return {
    id: `crawled-${index + 1}`,
    slug: slug,
    title: crawledRecipe.title,
    summary: crawledRecipe.description || "Delicious Filipino recipe",
    description: crawledRecipe.description || crawledRecipe.title,
    images: {
      hero: crawledRecipe.image_url || "/images/recipes/default-recipe.jpg",
      gallery: crawledRecipe.image_url ? [crawledRecipe.image_url] : []
    },
    servingSize: crawledRecipe.servings || "4-6 servings",
    prepTime: crawledRecipe.prep_time || "30 minutes",
    cookTime: crawledRecipe.cook_time || "45 minutes",
    totalTime: "1 hour 15 minutes", // Default total time
    difficulty: "Medium",
    rating: 4.5,
    dietaryTags: ["Filipino", "Traditional"],
    ingredients: ingredients,
    steps: steps,
    tips: [
      "Adjust seasoning to taste",
      "Serve hot with steamed rice"
    ],
    sourceUrl: crawledRecipe.source_url,
    sourceSite: crawledRecipe.source_site,
    crawledAt: crawledRecipe.crawled_at
  };
}

/**
 * Load existing recipes from recipes.json
 */
async function loadExistingRecipes() {
  try {
    const data = await fs.readFile(RECIPES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.log('No existing recipes.json found, starting with empty array');
    return [];
  }
}

/**
 * Load all crawled recipes from JSON files
 */
async function loadCrawledRecipes() {
  const crawledRecipes = [];
  
  try {
    const files = await fs.readdir(CRAWLED_DIR);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    console.log(`Found ${jsonFiles.length} crawled recipe files`);
    
    for (const file of jsonFiles) {
      const filePath = path.join(CRAWLED_DIR, file);
      const data = await fs.readFile(filePath, 'utf8');
      const crawledData = JSON.parse(data);
      
      console.log(`Processing ${file}: ${crawledData.total_recipes} recipes`);
      
      if (crawledData.recipes && crawledData.recipes.length > 0) {
        crawledRecipes.push(...crawledData.recipes);
      }
    }
    
    console.log(`Total crawled recipes loaded: ${crawledRecipes.length}`);
    return crawledRecipes;
  } catch (error) {
    console.error('Error loading crawled recipes:', error.message);
    return [];
  }
}

/**
 * Check for duplicate recipes based on title similarity
 */
function isDuplicate(newRecipe, existingRecipes) {
  const newTitle = newRecipe.title.toLowerCase().trim();
  
  return existingRecipes.some(existing => {
    const existingTitle = existing.title.toLowerCase().trim();
    
    // Check for exact match or very similar titles
    if (existingTitle === newTitle) return true;
    
    // Check if one title contains the other (for variations)
    if (existingTitle.includes(newTitle) || newTitle.includes(existingTitle)) {
      return true;
    }
    
    return false;
  });
}

/**
 * Main merge function
 */
async function mergeCrawledRecipes() {
  console.log('🍲 Mix & Munch Recipe Merger');
  console.log('================================');
  
  try {
    // Load existing recipes
    const existingRecipes = await loadExistingRecipes();
    console.log(`Existing recipes: ${existingRecipes.length}`);
    
    // Load crawled recipes
    const crawledRecipes = await loadCrawledRecipes();
    
    if (crawledRecipes.length === 0) {
      console.log('No crawled recipes found to merge');
      return;
    }
    
    // Convert and filter crawled recipes
    const convertedRecipes = [];
    let duplicatesSkipped = 0;
    
    crawledRecipes.forEach((crawledRecipe, index) => {
      const converted = convertCrawledRecipe(crawledRecipe, existingRecipes.length + convertedRecipes.length);
      
      // Check for duplicates
      if (isDuplicate(converted, [...existingRecipes, ...convertedRecipes])) {
        duplicatesSkipped++;
        console.log(`⚠️  Skipping duplicate: ${converted.title}`);
        return;
      }
      
      convertedRecipes.push(converted);
      console.log(`✅ Converted: ${converted.title}`);
    });
    
    // Merge recipes
    const mergedRecipes = [...existingRecipes, ...convertedRecipes];
    
    // Save merged recipes
    await fs.writeFile(RECIPES_FILE, JSON.stringify(mergedRecipes, null, 2));
    
    console.log('\n📊 Merge Summary:');
    console.log(`  Existing recipes: ${existingRecipes.length}`);
    console.log(`  New recipes added: ${convertedRecipes.length}`);
    console.log(`  Duplicates skipped: ${duplicatesSkipped}`);
    console.log(`  Total recipes: ${mergedRecipes.length}`);
    console.log(`\n💾 Recipes saved to: ${RECIPES_FILE}`);
    console.log('\n🎉 Merge completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Refresh your app (http://localhost:3000/recipes)');
    console.log('2. Check that crawled recipes now appear on the recipes page');
    
  } catch (error) {
    console.error('❌ Merge failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  mergeCrawledRecipes().catch(console.error);
}

module.exports = { mergeCrawledRecipes, convertCrawledRecipe };