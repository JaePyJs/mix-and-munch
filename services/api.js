/**
 * API Service - Mix & Munch Backend Integration
 * Connects React frontend to Express.js backend
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

/**
 * Backend API Base URL
 */
export const API_BASE_URL = `${BACKEND_URL}/api`;

/**
 * API Endpoints mapping
 */
export const API_ENDPOINTS = {
  // Recipes (Backend REST API)
  recipes: {
    list: `${API_BASE_URL}/recipes`,
    get: (id) => `${API_BASE_URL}/recipes/${id}`,
    search: `${API_BASE_URL}/recipes/search`,
    featured: `${API_BASE_URL}/recipes/featured/list`,
    bySource: (site) => `${API_BASE_URL}/recipes/source/${site}`,
    stats: `${API_BASE_URL}/recipes/stats/overview`,
  },

  // Admin & Crawler
  admin: {
    dashboard: `${API_BASE_URL}/admin/dashboard/stats`,
    logs: `${API_BASE_URL}/crawler/logs`,
  },

  // Health Check
  health: `${API_BASE_URL}/health`,
};

/**
 * Error handling wrapper
 */
async function handleResponse(response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: `HTTP ${response.status}: ${response.statusText}`
    }));
    throw new Error(error.error || 'API request failed');
  }
  return response.json();
}

/**
 * Recipes API Calls
 */

export async function fetchRecipes(limit = 20, page = 1) {
  try {
    const url = new URL(API_ENDPOINTS.recipes.list);
    url.searchParams.append('limit', limit);
    url.searchParams.append('page', page);
    
    const response = await fetch(url.toString());
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    throw error;
  }
}

export async function getRecipe(id) {
  try {
    const response = await fetch(API_ENDPOINTS.recipes.get(id));
    return await handleResponse(response);
  } catch (error) {
    console.error(`Error fetching recipe ${id}:`, error);
    throw error;
  }
}

export async function searchRecipes(query, filters = {}) {
  try {
    const response = await fetch(API_ENDPOINTS.recipes.search, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, filters }),
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Error searching recipes:', error);
    throw error;
  }
}

export async function getFeaturedRecipes() {
  try {
    const response = await fetch(API_ENDPOINTS.recipes.featured);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching featured recipes:', error);
    throw error;
  }
}

export async function getRecipesBySource(site) {
  try {
    const response = await fetch(API_ENDPOINTS.recipes.bySource(site));
    return await handleResponse(response);
  } catch (error) {
    console.error(`Error fetching recipes from ${site}:`, error);
    throw error;
  }
}

export async function getRecipeStats() {
  try {
    const response = await fetch(API_ENDPOINTS.recipes.stats);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching recipe stats:', error);
    throw error;
  }
}

/**
 * Admin API Calls
 */

export async function getAdminDashboard() {
  try {
    const response = await fetch(API_ENDPOINTS.admin.dashboard);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    throw error;
  }
}

export async function getCrawlerLogs() {
  try {
    const response = await fetch(API_ENDPOINTS.admin.logs);
    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching crawler logs:', error);
    throw error;
  }
}

/**
 * Health Check
 */

export async function checkHealth() {
  try {
    const response = await fetch(API_ENDPOINTS.health);
    return await handleResponse(response);
  } catch (error) {
    console.error('Backend health check failed:', error);
    return { status: 'error', message: error.message };
  }
}

export async function rateRecipe(recipeId, rating, comment) {
  const response = await fetch('/api/ratings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipeId, rating, comment }),
  });
  return response.json();
}
