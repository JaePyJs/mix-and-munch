import { getMatchResults } from '@/lib/data';
import type { PantrySelection } from '@/lib/types';

describe('pantry matching heuristics', () => {
  it('ranks recipes by pantry coverage', () => {
    const selection: PantrySelection = {
      garlic: true,
      'soy-sauce': true,
      vinegar: true,
      calamansi: true,
      'chicken-thigh': true,
    } as const;

    const results = getMatchResults(selection);

    // The top result should have high match percentage (at least 60%)
    expect(results[0].matchPercentage).toBeGreaterThan(60);

    // Should include a chicken-based recipe in top results
    const topRecipeSlugs = results.slice(0, 5).map((r) => r.slug);
    const hasChickenRecipe = topRecipeSlugs.some(
      (slug) =>
        slug.includes('chicken') || slug.includes('adobo') || slug.includes('inasal')
    );
    expect(hasChickenRecipe).toBe(true);

    // First result should have matched ingredients
    expect(results[0].matchedIngredients.length).toBeGreaterThan(0);
  });

  it('handles empty selections gracefully', () => {
    const results = getMatchResults({});
    expect(results).toEqual([]);
  });
});
