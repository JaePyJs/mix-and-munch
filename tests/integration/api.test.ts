/**
 * API Integration Tests
 * 
 * These tests verify that API route handlers respond correctly to requests.
 * We test the route handlers directly to ensure they work as expected.
 */

import { GET as recipesGET } from '../../app/api/recipes/route';
import { GET as ingredientsGET } from '../../app/api/ingredients/route';
import { POST as chatPOST } from '../../app/api/chat/route';

describe('API Integration Tests', () => {
  describe('Chat API', () => {
    it('should handle POST requests with messages', async () => {
      const request = new Request('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ content: 'I have chicken and want a recipe' }]
        }),
      });

      const response = await chatPOST(request);
      
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toContain('text/event-stream');
    });

    it('should return error for empty messages', async () => {
      const request = new Request('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: [] }),
      });

      const response = await chatPOST(request);
      
      expect(response.status).toBe(400);
    });
  });

  describe('Recipes API', () => {
    it('should return recipes list', async () => {
      const response = await recipesGET();
      
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toContain('application/json');
      
      const responseData = await response.json();
      expect(responseData).toHaveProperty('data');
      expect(Array.isArray(responseData.data)).toBe(true);
      expect(responseData.data.length).toBeGreaterThan(0);
    });
  });

  describe('Ingredients API', () => {
    it('should return ingredients list', async () => {
      const response = await ingredientsGET();
      
      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toContain('application/json');
      
      const responseData = await response.json();
      expect(responseData).toHaveProperty('data');
      expect(Array.isArray(responseData.data)).toBe(true);
      expect(responseData.data.length).toBeGreaterThan(0);
    });
  });
});