import * as crypto from 'crypto';

export function extractRecipeSchema($) {
  const scripts = $('script[type="application/ld+json"]');
  let recipe = null;

  scripts.each((i, elem) => {
    try {
      const data = JSON.parse($(elem).text());
      
      // Handle different schema structures
      let recipeData = data;
      if (data['@type'] === 'Article' || data['@type'] === 'NewsArticle') {
        recipeData = data.mainEntity;
      }

      if (Array.isArray(recipeData)) {
        recipeData = recipeData.find(r => r['@type'] === 'Recipe');
      }

      if (recipeData && recipeData['@type'] === 'Recipe') {
        recipe = recipeData;
        return false; // break
      }
    } catch (e) {
      // Skip invalid JSON
    }
  });

  return recipe;
}

export function calculateHash(text) {
  if (!text) return '';
  return crypto
    .createHash('md5')
    .update(text.toLowerCase().replace(/\s+/g, ''))
    .digest('hex');
}

export function normalizeIngredient(ingredient) {
  if (typeof ingredient === 'string') {
    return ingredient.trim();
  }
  if (ingredient.text) return ingredient.text.trim();
  if (ingredient.item) return ingredient.item.trim();
  return '';
}

export function calculateSimilarity(hash1, hash2) {
  if (!hash1 || !hash2) return 0;
  if (hash1 === hash2) return 1;

  // Levenshtein distance for fuzzy matching
  const len1 = hash1.length;
  const len2 = hash2.length;
  const matrix = Array(len2 + 1)
    .fill(null)
    .map(() => Array(len1 + 1).fill(0));

  for (let i = 0; i <= len1; i++) matrix[0][i] = i;
  for (let j = 0; j <= len2; j++) matrix[j][0] = j;

  for (let j = 1; j <= len2; j++) {
    for (let i = 1; i <= len1; i++) {
      const indicator = hash1[i - 1] === hash2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }

  const distance = matrix[len2][len1];
  const maxLen = Math.max(len1, len2);
  return 1 - distance / maxLen;
}
