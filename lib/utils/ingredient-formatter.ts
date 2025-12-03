/**
 * Utility functions for standardizing recipe ingredient formatting
 * Removes HTML entities, square symbols, and standardizes measurements
 */

// Measurement conversion mappings
const MEASUREMENT_CONVERSIONS: Record<string, string> = {
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
export const INGREDIENT_CATEGORIES = {
  DAIRY: ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'sour cream', 'cottage cheese', 'ricotta', 'mozzarella', 'cheddar', 'parmesan'],
  MEAT: ['chicken', 'beef', 'pork', 'turkey', 'lamb', 'fish', 'salmon', 'tuna', 'shrimp', 'bacon', 'ham', 'sausage'],
  VEGETABLES: ['onion', 'garlic', 'tomato', 'carrot', 'celery', 'bell pepper', 'mushroom', 'spinach', 'lettuce', 'broccoli', 'potato'],
  HERBS_SPICES: ['salt', 'pepper', 'oregano', 'basil', 'thyme', 'rosemary', 'paprika', 'cumin', 'cinnamon', 'vanilla'],
  GRAINS: ['rice', 'pasta', 'bread', 'flour', 'oats', 'quinoa', 'barley', 'wheat'],
  PANTRY: ['oil', 'vinegar', 'sugar', 'honey', 'soy sauce', 'olive oil', 'baking powder', 'baking soda', 'stock', 'broth']
};

/**
 * Removes HTML entities and square symbols from ingredient text
 */
export function cleanHtmlEntities(text: string): string {
  if (!text) return '';
  
  return text
    // Remove HTML-encoded square symbols
    .replace(/&#x25a2;/g, '')
    .replace(/&#9634;/g, '')
    .replace(/■/g, '')
    .replace(/□/g, '')
    
    // Remove HTML-encoded spaces and other entities
    .replace(/&#32;/g, ' ')
    .replace(/&#160;/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    
    // Clean up extra whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Standardizes measurement units in ingredient text
 */
export function standardizeMeasurements(text: string): string {
  if (!text) return '';
  
  let result = text;
  
  // Replace measurement units with standardized abbreviations
  Object.entries(MEASUREMENT_CONVERSIONS).forEach(([full, abbrev]) => {
    // Match whole words only, case insensitive
    const regex = new RegExp(`\\b${full}\\b`, 'gi');
    result = result.replace(regex, abbrev);
  });
  
  // Standardize number + unit format (ensure space between number and unit)
  result = result.replace(/(\d+)\s*(oz|lb|lbs|g|kg|ml|l|tsp|tbsp|cup|cups|fl oz|pt|pts|qt|qts|gal|gals|pc|pcs|clove|cloves|slice|slices|can|cans|pkg|pkgs|bottle|bottles|in|cm)\b/gi, '$1 $2');
  
  // Handle fractions better
  result = result.replace(/(\d+)\s*\/\s*(\d+)\s*(oz|lb|lbs|g|kg|ml|l|tsp|tbsp|cup|cups|fl oz|pt|pts|qt|qts|gal|gals|pc|pcs|clove|cloves|slice|slices|can|cans|pkg|pkgs|bottle|bottles|in|cm)\b/gi, '$1/$2 $3');
  
  // Remove periods from abbreviations
  result = result.replace(/\b(tsp|tbsp|oz|lb|lbs|fl oz|pt|pts|qt|qts|gal|gals|pc|pcs|pkg|pkgs|in|cm)\./gi, '$1');
  
  return result;
}

/**
 * Formats quantity text for consistency
 */
export function formatQuantity(text: string): string {
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
    
    // Selectively add space between number and unit (only for full words, not abbreviations)
    .replace(/(\d+)(pieces|slices|cans|bottles|packages)/g, '$1 $2')
    
    // Clean up multiple spaces
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Determines the category of an ingredient based on its name
 */
export function categorizeIngredient(ingredientName: string): string {
  if (!ingredientName) return 'OTHER';
  
  const name = ingredientName.toLowerCase();
  
  for (const [category, keywords] of Object.entries(INGREDIENT_CATEGORIES)) {
    if (keywords.some(keyword => name.includes(keyword))) {
      return category;
    }
  }
  
  return 'OTHER';
}

/**
 * Main function to format a single ingredient
 */
export function formatIngredient(ingredient: string): string {
  if (!ingredient) return '';
  
  let formatted = ingredient;
  
  // Step 1: Clean HTML entities and symbols
  formatted = cleanHtmlEntities(formatted);
  
  // Step 2: Standardize measurements
  formatted = standardizeMeasurements(formatted);
  
  // Step 3: Format quantities
  formatted = formatQuantity(formatted);
  
  return formatted;
}

/**
 * Formats an array of ingredients and optionally groups them by category
 */
export function formatIngredientList(ingredients: string[], groupByCategory = false): string[] | Record<string, string[]> {
  if (!ingredients || ingredients.length === 0) return groupByCategory ? {} : [];
  
  const formatted = ingredients.map(formatIngredient).filter(Boolean);
  
  if (!groupByCategory) {
    return formatted;
  }
  
  // Group by category
  const grouped: Record<string, string[]> = {};
  
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
 * Formats recipe steps/instructions by cleaning HTML entities
 */
export function formatRecipeSteps(steps: string[]): string[] {
  if (!steps || steps.length === 0) return [];
  
  return steps.map(step => {
    if (step === null || step === undefined) {
      return step;
    }
    if (typeof step === 'string') {
      if (step.trim() === '') {
        return step;
      }
      return cleanHtmlEntities(step);
    }
    return step;
  });
}

/**
 * Validates that an ingredient is properly formatted
 */
export function validateIngredientFormat(ingredient: string): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  if (!ingredient || ingredient.trim() === '') {
    issues.push('Ingredient is empty');
    return { isValid: false, issues };
  }
  
  // Check for HTML entities
  if (ingredient.includes('&#') || ingredient.includes('&amp;') || ingredient.includes('&lt;')) {
    issues.push('Contains HTML entities');
  }
  
  // Check for square symbols
  if (ingredient.includes('■') || ingredient.includes('□') || ingredient.includes('&#x25a2;')) {
    issues.push('Contains square symbols');
  }
  
  // Check for excessive whitespace
  if (ingredient.includes('  ') || ingredient.startsWith(' ') || ingredient.endsWith(' ')) {
    issues.push('Contains excessive whitespace');
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
}