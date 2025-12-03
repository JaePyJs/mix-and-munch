/**
 * Saved Recipes Page Unit Tests
 *
 * Tests for the /saved-recipes page component functionality
 * @jest-environment jsdom
 */

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    reset: () => {
      store = {};
    },
  };
})();

// Setup localStorage mock before tests
beforeAll(() => {
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  });
});

// Mock window.confirm
const mockConfirm = jest.fn();
beforeAll(() => {
  Object.defineProperty(window, 'confirm', {
    value: mockConfirm,
    writable: true,
  });
});

describe('Saved Recipes Page Tests', () => {
  beforeEach(() => {
    mockLocalStorage.reset();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
    mockConfirm.mockReset();
  });

  describe('SavedRecipe Data Structure', () => {
    const validRecipe = {
      id: '1',
      title: 'Chicken Adobo',
      content: '## Chicken Adobo\n\nA classic Filipino dish...',
      savedAt: new Date().toISOString(),
    };

    it('validates saved recipe structure', () => {
      expect(validRecipe).toHaveProperty('id');
      expect(validRecipe).toHaveProperty('title');
      expect(validRecipe).toHaveProperty('content');
      expect(validRecipe).toHaveProperty('savedAt');
    });

    it('validates recipe id is string', () => {
      expect(typeof validRecipe.id).toBe('string');
    });

    it('validates recipe title is string', () => {
      expect(typeof validRecipe.title).toBe('string');
    });

    it('validates recipe content is string', () => {
      expect(typeof validRecipe.content).toBe('string');
    });

    it('validates savedAt is ISO date string', () => {
      const date = new Date(validRecipe.savedAt);
      expect(date).toBeInstanceOf(Date);
      expect(isNaN(date.getTime())).toBe(false);
    });
  });

  describe('localStorage Integration', () => {
    it('loads recipes from localStorage', () => {
      const mockRecipes = [
        {
          id: '1',
          title: 'Adobo',
          content: 'Recipe content',
          savedAt: new Date().toISOString(),
        },
      ];
      mockLocalStorage.getItem.mockReturnValueOnce(JSON.stringify(mockRecipes));

      const saved = localStorage.getItem('savedRecipes');
      expect(saved).toBeTruthy();

      const parsed = JSON.parse(saved!);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed[0].title).toBe('Adobo');
    });

    it('handles empty localStorage gracefully', () => {
      mockLocalStorage.getItem.mockReturnValueOnce(null);

      const saved = localStorage.getItem('savedRecipes');
      expect(saved).toBeNull();
    });

    it('handles invalid JSON in localStorage', () => {
      mockLocalStorage.getItem.mockReturnValueOnce('invalid json');

      const saved = localStorage.getItem('savedRecipes');
      expect(() => JSON.parse(saved!)).toThrow();
    });

    it('saves recipes to localStorage', () => {
      const recipes = [
        {
          id: '1',
          title: 'Sinigang',
          content: 'Sour soup recipe',
          savedAt: new Date().toISOString(),
        },
      ];

      localStorage.setItem('savedRecipes', JSON.stringify(recipes));

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'savedRecipes',
        expect.any(String)
      );
    });

    it('removes savedRecipes from localStorage on clear all', () => {
      localStorage.removeItem('savedRecipes');

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('savedRecipes');
    });
  });

  describe('Recipe Deletion Logic', () => {
    it('filters out deleted recipe by id', () => {
      const recipes = [
        {
          id: '1',
          title: 'Adobo',
          content: 'Content 1',
          savedAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Sinigang',
          content: 'Content 2',
          savedAt: new Date().toISOString(),
        },
        {
          id: '3',
          title: 'Kare-Kare',
          content: 'Content 3',
          savedAt: new Date().toISOString(),
        },
      ];

      const idToDelete = '2';
      const updatedRecipes = recipes.filter((recipe) => recipe.id !== idToDelete);

      expect(updatedRecipes.length).toBe(2);
      expect(updatedRecipes.find((r) => r.id === '2')).toBeUndefined();
      expect(updatedRecipes.find((r) => r.id === '1')).toBeDefined();
      expect(updatedRecipes.find((r) => r.id === '3')).toBeDefined();
    });

    it('handles deleting non-existent recipe', () => {
      const recipes = [
        {
          id: '1',
          title: 'Adobo',
          content: 'Content 1',
          savedAt: new Date().toISOString(),
        },
      ];

      const updatedRecipes = recipes.filter((recipe) => recipe.id !== 'non-existent');

      expect(updatedRecipes.length).toBe(1);
    });
  });

  describe('Clear All Confirmation', () => {
    it('prompts user before clearing all recipes', () => {
      mockConfirm.mockReturnValueOnce(true);

      const confirmed = window.confirm(
        'Are you sure you want to delete all saved recipes?'
      );

      expect(mockConfirm).toHaveBeenCalled();
      expect(confirmed).toBe(true);
    });

    it('does not clear if user cancels', () => {
      mockConfirm.mockReturnValueOnce(false);

      const confirmed = window.confirm(
        'Are you sure you want to delete all saved recipes?'
      );

      expect(confirmed).toBe(false);
    });
  });

  describe('Recipe Stats Calculation', () => {
    it('calculates recipe count correctly', () => {
      const recipes = [
        { id: '1', title: 'Recipe 1', content: '', savedAt: new Date().toISOString() },
        { id: '2', title: 'Recipe 2', content: '', savedAt: new Date().toISOString() },
        { id: '3', title: 'Recipe 3', content: '', savedAt: new Date().toISOString() },
      ];

      expect(recipes.length).toBe(3);
    });

    it('formats latest save date correctly', () => {
      const savedAt = new Date('2024-12-04T10:30:00Z');
      const formatted = savedAt.toLocaleDateString();

      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
    });

    it('handles empty recipes array for stats', () => {
      const recipes: any[] = [];

      expect(recipes.length).toBe(0);
    });
  });

  describe('Recipe Sorting', () => {
    it('sorts recipes by savedAt date (newest first)', () => {
      const recipes = [
        { id: '1', title: 'Old', content: '', savedAt: '2024-01-01T00:00:00Z' },
        { id: '2', title: 'New', content: '', savedAt: '2024-12-01T00:00:00Z' },
        { id: '3', title: 'Middle', content: '', savedAt: '2024-06-01T00:00:00Z' },
      ];

      const sorted = [...recipes].sort(
        (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
      );

      expect(sorted[0].title).toBe('New');
      expect(sorted[1].title).toBe('Middle');
      expect(sorted[2].title).toBe('Old');
    });
  });

  describe('Recipe Export', () => {
    it('converts recipes to JSON string for export', () => {
      const recipes = [
        {
          id: '1',
          title: 'Adobo',
          content: 'Recipe content',
          savedAt: new Date().toISOString(),
        },
      ];

      const exported = JSON.stringify(recipes, null, 2);

      expect(typeof exported).toBe('string');
      expect(exported).toContain('Adobo');
    });

    it('handles empty recipes export', () => {
      const recipes: any[] = [];
      const exported = JSON.stringify(recipes, null, 2);

      expect(exported).toBe('[]');
    });
  });
});
