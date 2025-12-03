/**
 * Script to clean HTML entities from recipe ingredients
 * Fixes: &#x25a2; (checkbox), &#32; (space), and other HTML entities
 */

const fs = require('fs');
const path = require('path');

const RECIPES_PATH = path.join(__dirname, '../data/recipes.json');

// HTML entity decoder
function decodeHtmlEntities(text) {
  if (!text || typeof text !== 'string') return text;

  return (
    text
      // Common HTML entities
      .replace(/&#x25a2;/g, '') // checkbox character
      .replace(/&#32;/g, ' ') // space
      .replace(/&#38;/g, '&') // ampersand
      .replace(/&#39;/g, "'") // apostrophe
      .replace(/&#039;/g, "'") // apostrophe (alternative format)
      .replace(/&#34;/g, '"') // quote
      .replace(/&#60;/g, '<') // less than
      .replace(/&#62;/g, '>') // greater than
      .replace(/&nbsp;/g, ' ') // non-breaking space
      .replace(/&amp;/g, '&') // ampersand
      .replace(/&quot;/g, '"') // quote
      .replace(/&apos;/g, "'") // apostrophe
      .replace(/&lt;/g, '<') // less than
      .replace(/&gt;/g, '>') // greater than
      // Clean up multiple spaces and trim
      .replace(/\s+/g, ' ')
      .trim()
  );
}

// Clean ingredient object
function cleanIngredient(ing) {
  return {
    name: decodeHtmlEntities(ing.name),
    amount: decodeHtmlEntities(ing.amount),
    unit: ing.unit ? decodeHtmlEntities(ing.unit) : undefined,
  };
}

// Read recipes
let recipes = [];
try {
  const data = fs.readFileSync(RECIPES_PATH, 'utf8');
  recipes = JSON.parse(data);
} catch (err) {
  console.error('Error reading recipes.json:', err);
  process.exit(1);
}

console.log(`Processing ${recipes.length} recipes...`);

let cleanedCount = 0;

// Clean each recipe
recipes = recipes.map((recipe) => {
  let wasModified = false;
  const originalJson = JSON.stringify(recipe);

  if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
    recipe.ingredients = recipe.ingredients.map(cleanIngredient);
  }

  // Also clean steps if they have HTML entities
  if (recipe.steps && Array.isArray(recipe.steps)) {
    recipe.steps = recipe.steps.map((step) => decodeHtmlEntities(step));
  }

  // Clean summary and description
  if (recipe.summary) {
    recipe.summary = decodeHtmlEntities(recipe.summary);
  }
  if (recipe.description) {
    recipe.description = decodeHtmlEntities(recipe.description);
  }

  // Check if anything changed
  if (originalJson !== JSON.stringify(recipe)) {
    cleanedCount++;
    console.log(`Cleaned: ${recipe.title}`);
  }

  return recipe;
});

// Write back
try {
  fs.writeFileSync(RECIPES_PATH, JSON.stringify(recipes, null, 2), 'utf8');
  console.log(`\n✓ Cleaned ${cleanedCount} recipes with HTML entities`);
  console.log(`Total recipes: ${recipes.length}`);
} catch (err) {
  console.error('Error writing recipes.json:', err);
}
