import { useState, useEffect, useCallback } from 'react';
import { fetchRecipes, searchRecipes } from '../services/api';

/**
 * Hook for fetching recipes from the Mix & Munch backend
 * Handles pagination, loading, and error states
 */
export function useBackendRecipes(limit = 20, initialPage = 1) {
  const [recipes, setRecipes] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pages, setPages] = useState(0);

  const loadRecipes = useCallback(async (pageNum = 1) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRecipes(limit, pageNum);
      if (data.data && Array.isArray(data.data)) {
        setRecipes(data.data);
        setTotal(data.pagination?.total || 0);
        setPages(data.pagination?.pages || 0);
        setPage(pageNum);
      }
    } catch (err) {
      setError(err.message || 'Failed to load recipes');
      console.error('Recipe loading error:', err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    loadRecipes(initialPage);
  }, [initialPage, loadRecipes]);

  const nextPage = useCallback(() => {
    if (page < pages) {
      loadRecipes(page + 1);
    }
  }, [page, pages, loadRecipes]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      loadRecipes(page - 1);
    }
  }, [page, loadRecipes]);

  return {
    recipes,
    total,
    page,
    pages,
    loading,
    error,
    nextPage,
    prevPage,
    loadRecipes,
  };
}

/**
 * Hook for searching recipes
 */
export function useRecipeSearch() {
  const [results, setResults] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = useCallback(async (searchQuery, filters = {}) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setQuery('');
      return;
    }

    setLoading(true);
    setError(null);
    setQuery(searchQuery);

    try {
      const data = await searchRecipes(searchQuery, filters);
      if (data.data && Array.isArray(data.data)) {
        setResults(data.data);
      }
    } catch (err) {
      setError(err.message || 'Search failed');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setResults([]);
    setQuery('');
    setError(null);
  }, []);

  return {
    results,
    query,
    loading,
    error,
    search,
    clearSearch,
  };
}

/**
 * Hook for converting backend recipes to frontend format
 * Adds match score and other UI properties
 */
export function useRecipeTransform(backendRecipes, userIngredients = []) {
  const transformedRecipes = useCallback(() => {
    if (!Array.isArray(backendRecipes)) return [];

    return backendRecipes.map((recipe) => {
      // Parse JSON fields if they're strings
      let ingredients = recipe.ingredients;
      let instructions = recipe.instructions;

      if (typeof ingredients === 'string') {
        try {
          ingredients = JSON.parse(ingredients);
        } catch (e) {
          ingredients = [];
        }
      }

      if (typeof instructions === 'string') {
        try {
          instructions = JSON.parse(instructions);
        } catch (e) {
          instructions = [];
        }
      }

      // Calculate match score if user ingredients provided
      let matchScore = 0;
      if (userIngredients.length > 0 && Array.isArray(ingredients)) {
        const matchedCount = ingredients.filter((ing) =>
          userIngredients.some(
            (userIng) =>
              userIng.toLowerCase().includes(
                ing.name ? ing.name.toLowerCase() : ing.toLowerCase()
              ) ||
              ing.toLowerCase().includes(userIng.toLowerCase())
          )
        ).length;
        matchScore = Math.round((matchedCount / ingredients.length) * 100);
      }

      return {
        id: recipe.id,
        name: recipe.title || 'Unknown Recipe',
        description: recipe.description || '',
        imageUrl: recipe.primary_image_url || '/placeholder-recipe.jpg',
        imageAttribution: recipe.image_attribution || recipe.source_site || 'Unknown source',
        author: recipe.author || 'Unknown',
        source: recipe.source_site || 'Unknown',
        sourceUrl: recipe.source_url || '',
        prepTime: recipe.prep_time || 'N/A',
        cookTime: recipe.cook_time || 'N/A',
        totalTime: recipe.total_time || 'N/A',
        servings: recipe.servings || 'N/A',
        ingredients: ingredients,
        instructions: instructions,
        tags: recipe.tags || [],
        category: recipe.category || 'General',
        rating: recipe.rating || 0,
        reviewCount: recipe.review_count || 0,
        matchScore: matchScore,
      };
    });
  }, [backendRecipes, userIngredients]);

  return transformedRecipes();
}
