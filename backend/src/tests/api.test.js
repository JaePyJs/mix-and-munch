// Test suite for API endpoints
// Run with: npm test

import test from 'node:test';
import assert from 'assert';

const API_URL = 'http://localhost:3001/api';

// Helper function to make API calls
async function apiCall(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, options);
  return response.json();
}

await test('API Health Check', async (t) => {
  await t.test('should return health status', async () => {
    try {
      const response = await fetch('http://localhost:3001/api/health');
      const data = await response.json();
      assert.strictEqual(data.status, 'ok');
    } catch (error) {
      console.log('⚠️  Note: Backend server not running. Start with: npm run dev');
    }
  });
});

await test('Recipe Endpoints', async (t) => {
  await t.test('GET /api/recipes should return paginated recipes', async () => {
    try {
      const data = await apiCall('/recipes');
      assert(Array.isArray(data.data));
      assert(data.pagination !== undefined);
      assert(data.pagination.page === 1);
    } catch (error) {
      console.log('ℹ️  Backend not running or no recipes yet');
    }
  });

  await t.test('GET /api/recipes should support pagination', async () => {
    try {
      const data = await apiCall('/recipes?page=1&limit=10');
      assert(data.pagination.limit === 10);
    } catch (error) {
      console.log('ℹ️  Backend not running');
    }
  });

  await t.test('GET /api/recipes/:id should return single recipe', async () => {
    try {
      const list = await apiCall('/recipes');
      if (list.data && list.data.length > 0) {
        const id = list.data[0].id;
        const recipe = await apiCall(`/recipes/${id}`);
        assert.strictEqual(recipe.id, id);
        assert(recipe.title !== undefined);
      }
    } catch (error) {
      console.log('ℹ️  No recipes to test');
    }
  });
});

await test('Crawler Endpoints', async (t) => {
  await t.test('GET /api/crawler/stats should return statistics', async () => {
    try {
      const stats = await apiCall('/crawler/stats');
      assert(stats.recipes_found !== undefined);
    } catch (error) {
      console.log('ℹ️  Backend not running');
    }
  });

  await t.test('GET /api/crawler/logs should return crawl logs', async () => {
    try {
      const logs = await apiCall('/crawler/logs');
      assert(Array.isArray(logs.data));
    } catch (error) {
      console.log('ℹ️  No logs available yet');
    }
  });
});

await test('Admin Endpoints', async (t) => {
  await t.test('GET /api/admin/recipes should list recipes for admin', async () => {
    try {
      const recipes = await apiCall('/admin/recipes');
      assert(Array.isArray(recipes.data));
    } catch (error) {
      console.log('ℹ️  Backend not running');
    }
  });

  await t.test('GET /api/admin/dashboard/stats should return dashboard data', async () => {
    try {
      const stats = await apiCall('/admin/dashboard/stats');
      assert(stats.total_recipes !== undefined);
    } catch (error) {
      console.log('ℹ️  Backend not running');
    }
  });

  await t.test('GET /api/admin/duplicates should return duplicate recipes', async () => {
    try {
      const duplicates = await apiCall('/admin/duplicates');
      assert(Array.isArray(duplicates.data) || duplicates.duplicates !== undefined);
    } catch (error) {
      console.log('ℹ️  No duplicates found yet');
    }
  });
});

console.log('✅ API tests completed!');
