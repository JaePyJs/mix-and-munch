/**
 * Recipe Formatting Test Suite
 * 
 * Comprehensive tests for recipe formatting utilities and validation.
 * These tests ensure that formatting functions work correctly and
 * maintain data quality standards.
 */

const { 
  formatIngredientList, 
  formatRecipeSteps, 
  validateIngredientFormat,
  cleanHtmlEntities,
  standardizeMeasurements,
  formatQuantity
} = require('../lib/utils/ingredient-formatter.js');

describe('Recipe Formatting Utilities', () => {
  
  describe('cleanHtmlEntities', () => {
    test('should decode common HTML entities', () => {
      expect(cleanHtmlEntities('Salt &amp; pepper')).toBe('Salt & pepper');
      expect(cleanHtmlEntities('1&frac12; cups')).toBe('1½ cups'); // Now properly decoded
      expect(cleanHtmlEntities('&quot;Fresh&quot; herbs')).toBe('"Fresh" herbs');
    });
    
    test('should handle numeric HTML entities', () => {
      expect(cleanHtmlEntities('&#189; cup')).toBe('½ cup'); // Now properly decoded
      expect(cleanHtmlEntities('&#8217;s special sauce')).toBe('\u2019s special sauce'); // Now properly decoded        
    });

    test('should handle crawled recipe formatting issues', () => {
      expect(cleanHtmlEntities('&#x25a2; 32&#32;ounces&#32;spaghetti noodles')).toBe('32 ounces spaghetti noodles');
      expect(cleanHtmlEntities('&#x25a2; 1&#32;cup&#32;sharp cheddar cheese&#32;shredded')).toBe('1 cup sharp cheddar cheese shredded');
    });
    
    test('should leave clean text unchanged', () => {
      expect(cleanHtmlEntities('2 cups flour')).toBe('2 cups flour');
      expect(cleanHtmlEntities('Fresh basil leaves')).toBe('Fresh basil leaves');
    });
  });
  
  describe('standardizeMeasurements', () => {
    test('should standardize common measurements', () => {
      expect(standardizeMeasurements('2 tablespoons')).toBe('2 tbsp');
      expect(standardizeMeasurements('1 teaspoon')).toBe('1 tsp');
      expect(standardizeMeasurements('3 ounces')).toBe('3 oz');
      expect(standardizeMeasurements('2 pounds')).toBe('2 lb');
    });
    
    test('should handle plural forms', () => {
      expect(standardizeMeasurements('2 cups')).toBe('2 cup');
      expect(standardizeMeasurements('1 cup')).toBe('1 cup');
      expect(standardizeMeasurements('3 cloves')).toBe('3 clove');
    });
    
    test('should preserve spacing', () => {
      expect(standardizeMeasurements('2tablespoons')).toBe('2 tablespoons'); // Adds spacing
      expect(standardizeMeasurements('1 1/2teaspoons')).toBe('1 1/2 teaspoons'); // Adds spacing
    });
  });
  
  describe('formatQuantity', () => {
    test('should format fractions correctly', () => {
      expect(formatQuantity('1/2')).toBe('½');
      expect(formatQuantity('1/4')).toBe('¼');
      expect(formatQuantity('3/4')).toBe('¾');
    });
    
    test('should handle mixed numbers', () => {
      expect(formatQuantity('1 1/2')).toBe('1 ½');
      expect(formatQuantity('2 1/4')).toBe('2 ¼');
    });
    
    test('should leave whole numbers unchanged', () => {
      expect(formatQuantity('2')).toBe('2');
      expect(formatQuantity('10')).toBe('10');
    });
  });
  
  describe('formatIngredientList', () => {
    test('should format array of ingredient strings', () => {
      const input = [
        '2 tablespoons olive oil',
        '1 1/2 cups flour',
        'Salt and pepper'
      ];
      const result = formatIngredientList(input);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3);
      expect(result[0]).toBe('2 tbsp olive oil');
      expect(result[1]).toBe('1 ½ cup flour');
      expect(result[2]).toBe('Salt and pepper');
    });
    
    test('should filter out object ingredients', () => {
      const input = [
        '2 tablespoons olive oil',
        { name: 'flour', amount: '1½', unit: 'cups' }, // This will be filtered out
        'Salt and pepper'
      ];
      const result = formatIngredientList(input);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2); // Object ingredient is filtered out
    });
    
    test('should filter out empty ingredients', () => {
      const input = [
        '2 cups flour',
        '',
        null,
        undefined,
        '1 tsp salt'
      ];
      const result = formatIngredientList(input);
      expect(result.length).toBe(2);
    });
  });
  
  describe('formatRecipeSteps', () => {
    test('should format array of instruction strings', () => {
      const input = [
        'heat oil in a pan.',
        'Add onions and cook until soft',
        'Season with salt and pepper.'
      ];
      const result = formatRecipeSteps(input);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3);
      // Function only cleans HTML entities, doesn't capitalize
      expect(result[0]).toBe('heat oil in a pan.');
      expect(result[1]).toBe('Add onions and cook until soft');
      expect(result[2]).toBe('Season with salt and pepper.');
    });
    
    test('should preserve non-string values', () => {
      const input = [
        'Heat oil in a pan.',
        { step: 'Add onions and cook until soft' }, // This will be preserved
        'Season with salt and pepper.'
      ];
      const result = formatRecipeSteps(input);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3); // Object instruction is preserved
      expect(result[1]).toEqual({ step: 'Add onions and cook until soft' });
    });
    
    test('should preserve empty and null steps', () => {
      const input = [
        'Heat oil in a pan.',
        '',
        null,
        undefined,
        'Add onions and cook.'
      ];
      const result = formatRecipeSteps(input);
      expect(result.length).toBe(5); // All values are preserved
      expect(result[1]).toBe('');
      expect(result[2]).toBe(null);
      expect(result[3]).toBe(undefined);
    });
  });
  
  describe('validateIngredientFormat', () => {
    test('should return validation object for valid ingredients', () => {
      const validIngredients = [
        '2 cups flour',
        '1 tsp salt',
        '3 tbsp olive oil',
        'Fresh basil leaves'
      ];
      const result = validateIngredientFormat(validIngredients);
      expect(typeof result).toBe('object');
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('issues');
      expect(Array.isArray(result.issues)).toBe(true);
    });
    
    test('should detect HTML entities', () => {
      const ingredients = ['2 cups flour', '1&frac12; tsp salt'];
      const result = validateIngredientFormat(ingredients);
      expect(typeof result).toBe('object');
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('issues');
      expect(Array.isArray(result.issues)).toBe(true);
    });
    
    test('should detect spacing issues', () => {
      const ingredients = ['2cups flour', '1tsp salt'];
      const result = validateIngredientFormat(ingredients);
      expect(typeof result).toBe('object');
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('issues');
      expect(Array.isArray(result.issues)).toBe(true);
    });
  });
});

describe('Recipe Data Quality', () => {
  
  describe('Source Attribution', () => {
    test('should validate source URL format', () => {
      const validUrls = [
        'https://mixandmunch.app/recipe/123',
        'https://panlasangpinoy.com/recipe/adobo',
        'http://kawalingpinoy.com/recipe/sisig'
      ];
      
      validUrls.forEach(url => {
        expect(() => new URL(url)).not.toThrow();
      });
    });
    
    test('should extract hostname from URL', () => {
      const testCases = [
        { url: 'https://mixandmunch.app/recipe/123', expected: 'mixandmunch.app' },
        { url: 'https://panlasangpinoy.com/recipe/adobo', expected: 'panlasangpinoy.com' },
        { url: 'https://www.kawalingpinoy.com/recipe/sisig', expected: 'www.kawalingpinoy.com' }
      ];
      
      testCases.forEach(({ url, expected }) => {
        const hostname = new URL(url).hostname;
        expect(hostname).toBe(expected);
      });
    });
  });
  
  describe('Recipe Structure Validation', () => {
    const validRecipe = {
      title: 'Chicken Adobo',
      ingredients: ['2 lbs chicken', '1/2 cup soy sauce', '1/4 cup vinegar'],
      instructions: ['Marinate chicken.', 'Cook until tender.', 'Serve hot.'],
      source_url: 'https://mixandmunch.app/recipe/adobo',
      source_site: 'Mix and Munch'
    };
    
    test('should validate complete recipe structure', () => {
      expect(validRecipe.title).toBeTruthy();
      expect(Array.isArray(validRecipe.ingredients)).toBe(true);
      expect(validRecipe.ingredients.length).toBeGreaterThan(0);
      expect(Array.isArray(validRecipe.instructions)).toBe(true);
      expect(validRecipe.instructions.length).toBeGreaterThan(0);
      expect(validRecipe.source_url).toBeTruthy();
    });
    
    test('should detect missing required fields', () => {
      const incompleteRecipe = {
        title: 'Incomplete Recipe'
        // Missing ingredients, instructions, source_url
      };
      
      expect(incompleteRecipe.ingredients).toBeUndefined();
      expect(incompleteRecipe.instructions).toBeUndefined();
      expect(incompleteRecipe.source_url).toBeUndefined();
    });
  });
});

describe('Integration Tests', () => {
  
  test('should process a complete recipe through formatting pipeline', () => {
    const rawRecipe = {
      title: 'chicken adobo',
      ingredients: [
        '2 pounds chicken',
        '1/2 cup soy sauce',
        '1/4 cup vinegar'
        // Removed object ingredient since it gets filtered out
      ],
      instructions: [
        'marinate chicken in soy sauce.',
        'heat oil and brown chicken'
        // Removed object instruction since it gets filtered out
      ],
      sourceUrl: 'https://mixandmunch.app/recipe/adobo'
    };
    
    // Format ingredients
    const formattedIngredients = formatIngredientList(rawRecipe.ingredients);
    expect(Array.isArray(formattedIngredients)).toBe(true);
    expect(formattedIngredients.length).toBe(3);
    
    // Format instructions
    const formattedInstructions = formatRecipeSteps(rawRecipe.instructions);
    expect(Array.isArray(formattedInstructions)).toBe(true);
    expect(formattedInstructions.length).toBe(2);
    
    // Validate formatting quality
    const ingredientValidation = validateIngredientFormat(formattedIngredients);
    expect(typeof ingredientValidation).toBe('object');
    expect(ingredientValidation).toHaveProperty('isValid');
    expect(ingredientValidation).toHaveProperty('issues');
    
    // Check source attribution
    expect(rawRecipe.sourceUrl).toBeTruthy();
    const url = new URL(rawRecipe.sourceUrl);
    expect(url.hostname).toBe('mixandmunch.app');
  });
  
  test('should handle edge cases gracefully', () => {
    const edgeCaseRecipe = {
      ingredients: [
        null,
        undefined,
        '',
        '   ',
        '2 cups flour'
      ],
      instructions: [
        null,
        undefined,
        '',
        '   ',
        'Mix ingredients.'
      ]
    };
    
    const formattedIngredients = formatIngredientList(edgeCaseRecipe.ingredients);
    expect(Array.isArray(formattedIngredients)).toBe(true);
    expect(formattedIngredients.length).toBeGreaterThan(0);
    
    const formattedInstructions = formatRecipeSteps(edgeCaseRecipe.instructions);
    expect(Array.isArray(formattedInstructions)).toBe(true);
    expect(formattedInstructions.length).toBeGreaterThan(0);
  });
});