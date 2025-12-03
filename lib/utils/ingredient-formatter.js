/**
 * Ingredient Formatting Utilities
 * 
 * This module provides utilities for standardizing and formatting recipe ingredients
 * and instructions to ensure consistency across the application.
 */

// Common measurement conversions and standardizations
const MEASUREMENT_CONVERSIONS = {
  // Volume measurements
  'teaspoon': 'tsp',
  'teaspoons': 'tsp',
  'tablespoon': 'tbsp',
  'tablespoons': 'tbsp',
  'fluid ounce': 'fl oz',
  'fluid ounces': 'fl oz',
  'cup': 'cup',
  'cups': 'cup',
  'pint': 'pt',
  'pints': 'pts',
  'quart': 'qt',
  'quarts': 'qts',
  'gallon': 'gal',
  'gallons': 'gals',
  'milliliter': 'ml',
  'milliliters': 'ml',
  'liter': 'l',
  'liters': 'l',
  
  // Weight measurements
  'ounce': 'oz',
  'ounces': 'oz',
  'pound': 'lb',
  'pounds': 'lb',
  'gram': 'g',
  'grams': 'g',
  'kilogram': 'kg',
  'kilograms': 'kg',
  
  // Length measurements
  'inch': 'in',
  'inches': 'in',
  'centimeter': 'cm',
  'centimeters': 'cm',
  
  // Common cooking terms
  'piece': 'pc',
  'pieces': 'pcs',
  'clove': 'clove',
  'cloves': 'clove',
  'slice': 'slice',
  'slices': 'slices',
  'can': 'can',
  'cans': 'cans',
  'package': 'pkg',
  'packages': 'pkgs',
  'bottle': 'bottle',
  'bottles': 'bottles'
};

// Ingredient categories for grouping
const INGREDIENT_CATEGORIES = {
  DAIRY: ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'sour cream', 'cottage cheese', 'ricotta', 'mozzarella', 'cheddar', 'parmesan'],
  MEAT: ['chicken', 'beef', 'pork', 'turkey', 'lamb', 'fish', 'salmon', 'tuna', 'shrimp', 'bacon', 'ham', 'sausage'],
  VEGETABLES: ['onion', 'garlic', 'tomato', 'carrot', 'celery', 'bell pepper', 'mushroom', 'spinach', 'lettuce', 'broccoli', 'potato'],
  HERBS_SPICES: ['salt', 'pepper', 'oregano', 'basil', 'thyme', 'rosemary', 'paprika', 'cumin', 'cinnamon', 'vanilla'],
  GRAINS: ['rice', 'pasta', 'bread', 'flour', 'oats', 'quinoa', 'barley', 'wheat'],
  PANTRY: ['oil', 'vinegar', 'sugar', 'honey', 'soy sauce', 'olive oil', 'baking powder', 'baking soda', 'stock', 'broth']
};

/**
 * Clean HTML entities and special characters from text
 */
function cleanHtmlEntities(text) {
  if (!text || typeof text !== 'string') return '';
  
  return text
    // First handle named HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&apos;/g, "'")
    
    // Handle numeric HTML entities (decimal)
    .replace(/&#(\d+);/g, (match, num) => String.fromCharCode(parseInt(num, 10)))
    
    // Handle hexadecimal HTML entities
    .replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
    
    // Handle common fraction entities
    .replace(/&frac12;/g, '½')
    .replace(/&frac14;/g, '¼')
    .replace(/&frac34;/g, '¾')
    .replace(/&frac13;/g, '⅓')
    .replace(/&frac23;/g, '⅔')
    
    // Remove bullet points and other unwanted characters
    .replace(/[■□▪▫●○◦‣⁃▢]/g, '') // Remove various bullet point characters including ▢
    .replace(/\[.*?\]/g, '') // Remove square brackets and content
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Standardize measurement units and formatting
 */
function standardizeMeasurements(text) {
  if (!text || typeof text !== 'string') return '';
  
  let result = text;
  
  // Replace measurement units with standardized abbreviations
  Object.entries(MEASUREMENT_CONVERSIONS).forEach(([full, abbrev]) => {
    // Match whole words only, case insensitive
    const regex = new RegExp(`\\b${full}\\b`, 'gi');
    result = result.replace(regex, abbrev);
  });
  
  // Standardize number + unit format (ensure space between number and unit)
  result = result.replace(/(\d+)\s*(oz|lb|lbs|g|kg|ml|l|tsp|teaspoons|tbsp|tablespoons|cup|cups|fl oz|pt|pts|qt|qts|gal|gals|pc|pcs|clove|cloves|slice|slices|can|cans|pkg|pkgs|bottle|bottles|in|cm)\b/gi, '$1 $2');
  
  // Handle fractions better
  result = result.replace(/(\d+)\s*\/\s*(\d+)\s*(oz|lb|lbs|g|kg|ml|l|tsp|teaspoons|tbsp|tablespoons|cup|cups|fl oz|pt|pts|qt|qts|gal|gals|pc|pcs|clove|cloves|slice|slices|can|cans|pkg|pkgs|bottle|bottles|in|cm)\b/gi, '$1/$2 $3');
  
  // Remove periods from abbreviations
  result = result.replace(/\b(tsp|tbsp|oz|lb|lbs|fl oz|pt|pts|qt|qts|gal|gals|pc|pcs|pkg|pkgs|in|cm)\./gi, '$1');
  
  return result;
}

/**
 * Format quantity to be more readable
 */
function formatQuantity(text) {
  if (!text) return '';
  
  return text
    // Standardize fraction format
    .replace(/(\d+)\s*\/\s*(\d+)/g, '$1/$2')
    
    // Convert common fractions to Unicode
    .replace(/\b1\/2\b/g, '½')
    .replace(/\b1\/4\b/g, '¼')
    .replace(/\b3\/4\b/g, '¾')
    .replace(/\b1\/3\b/g, '⅓')
    .replace(/\b2\/3\b/g, '⅔')
    .replace(/\b1\/8\b/g, '⅛')
    .replace(/\b3\/8\b/g, '⅜')
    .replace(/\b5\/8\b/g, '⅝')
    .replace(/\b7\/8\b/g, '⅞')
    
    // Ensure space between number and full words (not abbreviations)
    // Only add space for words longer than 3 characters or specific full words
    .replace(/(\d+)(pieces|slices|cans|bottles|packages)/g, '$1 $2')
    
    // Clean up multiple spaces
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Categorize an ingredient based on its name
 */
function categorizeIngredient(ingredientName) {
  if (!ingredientName || typeof ingredientName !== 'string') return 'OTHER';
  
  const lowerName = ingredientName.toLowerCase();
  
  for (const [category, keywords] of Object.entries(INGREDIENT_CATEGORIES)) {
    if (keywords.some(keyword => lowerName.includes(keyword))) {
      return category;
    }
  }
  
  return 'OTHER';
}

/**
 * Format a single ingredient string
 */
function formatIngredient(ingredient) {
  if (!ingredient || typeof ingredient !== 'string') return '';
  
  let formatted = cleanHtmlEntities(ingredient);
  formatted = standardizeMeasurements(formatted);
  formatted = formatQuantity(formatted);
  
  return formatted;
}

/**
 * Format a list of ingredients with optional grouping
 */
function formatIngredientList(ingredients, groupByCategory = false) {
  if (!ingredients || ingredients.length === 0) return groupByCategory ? {} : [];
  
  const formatted = ingredients
    .map(ingredient => formatIngredient(ingredient))
    .filter(Boolean);
  
  if (!groupByCategory) {
    return formatted;
  }
  
  // Group by category
  const grouped = {};
  formatted.forEach(ingredient => {
    const category = categorizeIngredient(ingredient);
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(ingredient);
  });
  
  return grouped;
}

/**
 * Format recipe steps/instructions
 */
function formatRecipeSteps(steps) {
  if (!Array.isArray(steps)) return [];
  
  return steps.map(step => {
    // Handle empty or null values by returning them directly
    if (step === null || step === undefined) {
      return step;
    }
    if (typeof step === 'string') {
      if (step.trim() === '') {
        return step;
      }
      // Only clean HTML entities, don't add periods or capitalize
      return cleanHtmlEntities(step);
    }
    return step;
  });
}

/**
 * Validate ingredient format and provide feedback
 */
function validateIngredientFormat(ingredient) {
  if (!ingredient || typeof ingredient !== 'string' || ingredient.trim() === '') {
    return { isValid: false, issues: ['Ingredient is empty'] };
  }
  
  const issues = [];
  
  // Check for HTML tags
  if (/<[^>]*>/.test(ingredient)) {
    issues.push('Contains HTML tags');
  }
  
  // Check for square symbols (HTML entities and Unicode)
  if (/&#x25a2;|&#9634;|■|□/.test(ingredient)) {
    issues.push('Contains square symbols');
  }
  
  // Check for square brackets
  if (/\[.*?\]/.test(ingredient)) {
    issues.push('Contains square brackets');
  }
  
  // Check for excessive whitespace
  if (/\s{2,}/.test(ingredient)) {
    issues.push('Contains excessive whitespace');
  }
  
  // Check for basic structure (should have some text)
  if (ingredient.trim().length < 2) {
    issues.push('Too short to be a valid ingredient');
  }
  
  return {
    isValid: issues.length === 0,
    issues: issues
  };
}

module.exports = {
  MEASUREMENT_CONVERSIONS,
  INGREDIENT_CATEGORIES,
  cleanHtmlEntities,
  standardizeMeasurements,
  formatQuantity,
  categorizeIngredient,
  formatIngredient,
  formatIngredientList,
  formatRecipeSteps,
  validateIngredientFormat
};