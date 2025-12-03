import {
  cleanHtmlEntities,
  standardizeMeasurements,
  formatQuantity,
  formatIngredient,
  formatIngredientList,
  categorizeIngredient,
  validateIngredientFormat,
  formatRecipeSteps
} from '../../lib/utils/ingredient-formatter';

describe('Ingredient Formatter Utils', () => {
  describe('cleanHtmlEntities', () => {
    it('should remove HTML-encoded square symbols', () => {
      expect(cleanHtmlEntities('&#x25a2; 2 cups flour')).toBe('2 cups flour');
      expect(cleanHtmlEntities('■ 1 tsp salt')).toBe('1 tsp salt');
      expect(cleanHtmlEntities('□ 3 eggs')).toBe('3 eggs');
    });

    it('should remove HTML-encoded spaces', () => {
      expect(cleanHtmlEntities('2&#32;cups&#32;flour')).toBe('2 cups flour');
      expect(cleanHtmlEntities('1&nbsp;tsp&nbsp;salt')).toBe('1 tsp salt');
    });

    it('should handle multiple HTML entities', () => {
      expect(cleanHtmlEntities('&#x25a2;&#32;2&#32;cups&#32;flour')).toBe('2 cups flour');
    });

    it('should clean up extra whitespace', () => {
      expect(cleanHtmlEntities('  2   cups   flour  ')).toBe('2 cups flour');
    });
  });

  describe('standardizeMeasurements', () => {
    it('should convert full measurement names to abbreviations', () => {
      expect(standardizeMeasurements('2 teaspoons salt')).toBe('2 tsp salt');
      expect(standardizeMeasurements('1 tablespoon oil')).toBe('1 tbsp oil');
      expect(standardizeMeasurements('32 ounces cheese')).toBe('32 oz cheese');
      expect(standardizeMeasurements('2 pounds chicken')).toBe('2 lb chicken');
    });

    it('should handle plural forms', () => {
      expect(standardizeMeasurements('3 cups flour')).toBe('3 cup flour');
      expect(standardizeMeasurements('2 cloves garlic')).toBe('2 clove garlic');
    });

    it('should handle fractions', () => {
      expect(standardizeMeasurements('1 / 2 cup milk')).toBe('1/2 cup milk');
      expect(standardizeMeasurements('2 1/2 pounds beef')).toBe('2 1/2 lb beef');
    });
  });

  describe('formatQuantity', () => {
    it('should format fractions consistently', () => {
      expect(formatQuantity('1 / 2')).toBe('½');
      expect(formatQuantity('2  /  3')).toBe('⅔');
    });

    it('should format fractions', () => {
      expect(formatQuantity('1 / 2')).toBe('½');
      expect(formatQuantity('1/4 cup')).toBe('¼ cup');
      expect(formatQuantity('3 / 4 teaspoon')).toBe('¾ teaspoon');
    });

    it('should handle number-unit combinations', () => {
      expect(formatQuantity('2oz')).toBe('2oz');
      expect(formatQuantity('1lb')).toBe('1lb');
      expect(formatQuantity('3pieces')).toBe('3 pieces');
    });
  });

  describe('formatIngredient', () => {
    it('should clean HTML entities and standardize measurements', () => {
      const input = '&#x25a2;&#32;2&#32;tablespoons&#32;olive&#32;oil';
      const expected = '2 tbsp olive oil';
      expect(formatIngredient(input)).toBe(expected);
    });

    it('should handle multiple formatting issues', () => {
      const input = '■  2   tablespoons   olive   oil  ';
      const expected = '2 tbsp olive oil';
      expect(formatIngredient(input)).toBe(expected);
    });

    it('should preserve ingredient names while formatting measurements', () => {
      const input = '1 pound ground beef (80/20 lean)';
      const expected = '1 lb ground beef (80/20 lean)';
      expect(formatIngredient(input)).toBe(expected);
    });
  });

  describe('categorizeIngredient', () => {
    it('should categorize dairy products', () => {
      expect(categorizeIngredient('mozzarella cheese')).toBe('DAIRY');
      expect(categorizeIngredient('whole milk')).toBe('DAIRY');
      expect(categorizeIngredient('unsalted butter')).toBe('DAIRY');
    });

    it('should categorize meat products', () => {
      expect(categorizeIngredient('ground beef')).toBe('MEAT');
      expect(categorizeIngredient('chicken breast')).toBe('MEAT');
      expect(categorizeIngredient('bacon strips')).toBe('MEAT');
    });

    it('should categorize vegetables', () => {
      expect(categorizeIngredient('yellow onion')).toBe('VEGETABLES');
      expect(categorizeIngredient('minced garlic')).toBe('VEGETABLES');
      expect(categorizeIngredient('bell pepper')).toBe('VEGETABLES');
    });

    it('should return OTHER for unrecognized ingredients', () => {
      expect(categorizeIngredient('exotic spice blend')).toBe('OTHER');
      expect(categorizeIngredient('unknown ingredient')).toBe('OTHER');
    });
  });

  describe('formatIngredientList', () => {
    const testIngredients = [
      '&#x25a2; 32 ounces mozzarella cheese',
      '■ 1 pound ground beef',
      '□ 2 tablespoons olive oil',
      '&#32;1&#32;large&#32;onion'
    ];

    it('should format all ingredients in a list', () => {
      const result = formatIngredientList(testIngredients) as string[];
      expect(result).toEqual([
        '32 oz mozzarella cheese',
        '1 lb ground beef',
        '2 tbsp olive oil',
        '1 large onion'
      ]);
    });

    it('should group ingredients by category when requested', () => {
      const result = formatIngredientList(testIngredients, true) as Record<string, string[]>;
      expect(result.DAIRY).toContain('32 oz mozzarella cheese');
      expect(result.MEAT).toContain('1 lb ground beef');
      expect(result.PANTRY).toContain('2 tbsp olive oil');
      expect(result.VEGETABLES).toContain('1 large onion');
    });
  });

  describe('validateIngredientFormat', () => {
    it('should validate clean ingredients', () => {
      const result = validateIngredientFormat('2oz mozzarella cheese');
      expect(result.isValid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should detect HTML entities', () => {
      const result = validateIngredientFormat('&#x25a2; 2 cups flour');
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Contains square symbols');
    });

    it('should detect excessive whitespace', () => {
      const result = validateIngredientFormat('  2 cups flour  ');
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Contains excessive whitespace');
    });

    it('should detect empty ingredients', () => {
      const result = validateIngredientFormat('');
      expect(result.isValid).toBe(false);
      expect(result.issues).toContain('Ingredient is empty');
    });
  });

  describe('formatRecipeSteps', () => {
    it('should clean HTML entities from recipe steps', () => {
      const steps = [
        '&#x25a2; Heat oil in a large pan',
        'Add&#32;onions&#32;and&#32;cook&#32;until&#32;soft',
        '■ Season with salt and pepper'
      ];
      
      const result = formatRecipeSteps(steps);
      expect(result).toEqual([
        'Heat oil in a large pan',
        'Add onions and cook until soft',
        'Season with salt and pepper'
      ]);
    });

    it('should handle empty or invalid steps', () => {
      const steps = ['', null as any, 'Valid step'];
      const result = formatRecipeSteps(steps);
      expect(result).toEqual(['', null, 'Valid step']);
    });
  });
});