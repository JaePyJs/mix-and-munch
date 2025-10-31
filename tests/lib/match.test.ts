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

    expect(results[0].slug).toBe('soy-calamansi-chicken-adobo');
    expect(results[0].matchPercentage).toBeGreaterThan(70);
    expect(results[0].matchedIngredients).toEqual(
      expect.arrayContaining(['garlic', 'soy-sauce', 'vinegar', 'calamansi', 'chicken-thigh'])
    );
  });

  it('handles empty selections gracefully', () => {
    const results = getMatchResults({});
    expect(results[0].matchPercentage).toBe(0);
  });
});
