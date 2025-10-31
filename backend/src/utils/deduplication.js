import logger from '../utils/logger.js';

export class RecipeNormalizer {
  static normalizeIngredient(ingredient) {
    if (typeof ingredient === 'string') {
      ingredient = { name: ingredient };
    }

    let normalized = {
      name: ingredient.name || '',
      quantity: ingredient.quantity || '',
      unit: ingredient.unit || ''
    };

    // Normalize quantity
    if (normalized.quantity) {
      normalized.quantity = parseFloat(normalized.quantity) || normalized.quantity;
    }

    // Normalize unit (convert to standardized format)
    normalized.unit = this.normalizeUnit(normalized.unit);

    // Normalize ingredient name (lowercase, trim, remove extra spaces)
    normalized.name = normalized.name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s-]/g, '');

    return normalized;
  }

  static normalizeUnit(unit) {
    if (!unit) return '';

    const unitMap = {
      'teaspoon': 'tsp',
      'tablespoon': 'tbsp',
      'cup': 'cup',
      'cup(s)': 'cup',
      'cups': 'cup',
      'tbsp': 'tbsp',
      'tsp': 'tsp',
      'ml': 'ml',
      'l': 'l',
      'liter': 'l',
      'oz': 'oz',
      'lb': 'lb',
      'g': 'g',
      'kg': 'kg',
      'piece': 'pcs',
      'pcs': 'pcs',
      'clove': 'cloves',
      'cloves': 'cloves',
      'bunch': 'bunch',
      'handful': 'handful'
    };

    return unitMap[unit.toLowerCase().trim()] || unit.toLowerCase().trim();
  }

  static normalizeRecipe(recipe) {
    return {
      ...recipe,
      title: recipe.title
        ? recipe.title.toLowerCase().trim().replace(/\s+/g, ' ')
        : '',
      ingredients: Array.isArray(recipe.ingredients)
        ? recipe.ingredients.map(ing => this.normalizeIngredient(ing))
        : [],
      description: recipe.description
        ? recipe.description.trim()
        : '',
      tags: Array.isArray(recipe.tags)
        ? recipe.tags.map(t => t.toLowerCase().trim())
        : []
    };
  }
}

export class RecipeDeduplicator {
  static levenshteinDistance(str1, str2) {
    const track = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(0));

    for (let i = 0; i <= str1.length; i += 1) {
      track[0][i] = i;
    }

    for (let j = 0; j <= str2.length; j += 1) {
      track[j][0] = j;
    }

    for (let j = 1; j <= str2.length; j += 1) {
      for (let i = 1; i <= str1.length; i += 1) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        track[j][i] = Math.min(
          track[j][i - 1] + 1,
          track[j - 1][i] + 1,
          track[j - 1][i - 1] + indicator
        );
      }
    }

    return track[str2.length][str1.length];
  }

  static jaccardSimilarity(set1, set2) {
    const intersection = set1.filter(item => set2.includes(item));
    const union = [...new Set([...set1, ...set2])];

    return intersection.length / union.length;
  }

  static weightedSimilarityScore(recipe1, recipe2) {
    let score = 0;

    // Title similarity (40% weight)
    const titleDistance = this.levenshteinDistance(
      recipe1.title.toLowerCase(),
      recipe2.title.toLowerCase()
    );
    const maxLen = Math.max(recipe1.title.length, recipe2.title.length);
    const titleSimilarity = 1 - (titleDistance / (maxLen || 1));
    score += titleSimilarity * 0.4;

    // Author/source similarity (20% weight)
    if (recipe1.author && recipe2.author) {
      const authorSimilarity = recipe1.author.toLowerCase() === recipe2.author.toLowerCase() ? 1 : 0;
      score += authorSimilarity * 0.2;
    }

    // Ingredient similarity (30% weight) - Jaccard similarity
    const ing1Names = (recipe1.ingredients || []).map(i => 
      typeof i === 'string' ? i.toLowerCase() : (i.name || '').toLowerCase()
    );
    const ing2Names = (recipe2.ingredients || []).map(i => 
      typeof i === 'string' ? i.toLowerCase() : (i.name || '').toLowerCase()
    );

    if (ing1Names.length > 0 && ing2Names.length > 0) {
      const ingredientJaccard = this.jaccardSimilarity(ing1Names, ing2Names);
      score += ingredientJaccard * 0.3;
    }

    // Tags similarity (10% weight)
    const tags1 = recipe1.tags || [];
    const tags2 = recipe2.tags || [];
    if (tags1.length > 0 && tags2.length > 0) {
      const tagSimilarity = this.jaccardSimilarity(tags1, tags2);
      score += tagSimilarity * 0.1;
    }

    return Math.min(score, 1);
  }

  static isDuplicate(recipe1, recipe2, threshold = 0.75) {
    const similarity = this.weightedSimilarityScore(recipe1, recipe2);
    return similarity >= threshold;
  }

  static findDuplicates(recipes, threshold = 0.75) {
    const duplicates = [];

    for (let i = 0; i < recipes.length; i++) {
      for (let j = i + 1; j < recipes.length; j++) {
        const similarity = this.weightedSimilarityScore(recipes[i], recipes[j]);
        
        if (similarity >= threshold) {
          duplicates.push({
            recipe1Id: recipes[i].id,
            recipe1Title: recipes[i].title,
            recipe2Id: recipes[j].id,
            recipe2Title: recipes[j].title,
            similarity: similarity,
            shouldMerge: similarity > 0.9
          });
        }
      }
    }

    return duplicates;
  }
}

logger.info('Deduplication algorithms loaded: Levenshtein, Jaccard, Weighted Scoring');
