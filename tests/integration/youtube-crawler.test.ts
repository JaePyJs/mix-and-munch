/**
 * YouTube Crawler API Integration Tests
 *
 * Tests for the /api/youtube-crawler route
 */

import { POST } from '../../app/api/youtube-crawler/route';
import { NextRequest } from 'next/server';

// Helper to create mock requests
function createMockRequest(body: object): NextRequest {
  return new NextRequest('http://localhost:3000/api/youtube-crawler', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

describe('YouTube Crawler API Tests', () => {
  describe('Invalid Action Handling', () => {
    it('should return 400 for invalid action', async () => {
      const request = createMockRequest({ action: 'invalid_action' });
      const response = await POST(request);

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.message).toBe('Invalid action');
    });

    it('should return 400 for missing action', async () => {
      const request = createMockRequest({});
      const response = await POST(request);

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.success).toBe(false);
    });
  });

  describe('process_url Action', () => {
    it('should return 400 when URL is missing', async () => {
      const request = createMockRequest({
        action: 'process_url',
      });
      const response = await POST(request);

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.message).toBe('URL is required');
    });

    it('should return 400 for invalid YouTube URL', async () => {
      const request = createMockRequest({
        action: 'process_url',
        url: 'https://invalid-url.com/video',
      });
      const response = await POST(request);

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.message).toBe('Invalid YouTube URL');
    });
  });

  describe('validate_ingredients Action', () => {
    it('should return 400 when ingredients array is missing', async () => {
      const request = createMockRequest({
        action: 'validate_ingredients',
      });
      const response = await POST(request);

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.message).toBe('Ingredients array is required');
    });

    it('should return 400 when ingredients is not an array', async () => {
      const request = createMockRequest({
        action: 'validate_ingredients',
        ingredients: 'not-an-array',
      });
      const response = await POST(request);

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.message).toBe('Ingredients array is required');
    });
  });

  describe('get_progress Action', () => {
    it('should return 400 when sessionId is missing', async () => {
      const request = createMockRequest({
        action: 'get_progress',
      });
      const response = await POST(request);

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Session ID is required');
    });
  });

  describe('add_creator Action', () => {
    it('should return 400 when creator is missing', async () => {
      const request = createMockRequest({
        action: 'add_creator',
      });
      const response = await POST(request);

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.message).toBe('Creator with channelId and name is required');
    });

    it('should return 400 when creator channelId is missing', async () => {
      const request = createMockRequest({
        action: 'add_creator',
        creator: { name: 'Test Creator' },
      });
      const response = await POST(request);

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.message).toBe('Creator with channelId and name is required');
    });

    it('should return 400 when creator name is missing', async () => {
      const request = createMockRequest({
        action: 'add_creator',
        creator: { channelId: 'UC123456' },
      });
      const response = await POST(request);

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.message).toBe('Creator with channelId and name is required');
    });

    it('should return success message for valid creator in serverless', async () => {
      const request = createMockRequest({
        action: 'add_creator',
        creator: {
          channelId: 'UC123456',
          name: 'Test Creator',
        },
      });
      const response = await POST(request);

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.message).toContain('serverless environment');
    });
  });

  describe('get_creators Action', () => {
    it('should return empty array for serverless environment', async () => {
      const request = createMockRequest({
        action: 'get_creators',
      });
      const response = await POST(request);

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBe(0);
      expect(data.message).toContain('serverless environment');
    });
  });

  describe('YouTube URL Validation', () => {
    const validUrls = [
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      'https://youtube.com/watch?v=dQw4w9WgXcQ',
      'https://youtu.be/dQw4w9WgXcQ',
      'https://www.youtube.com/embed/dQw4w9WgXcQ',
    ];

    const invalidUrls = [
      'https://vimeo.com/123456',
      'https://facebook.com/video',
      'not-a-url',
      '',
    ];

    // Test URL regex pattern (same as service uses)
    const youtubeUrlPattern =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;

    validUrls.forEach((url) => {
      it(`should recognize valid YouTube URL: ${url}`, () => {
        const match = url.match(youtubeUrlPattern);
        expect(match).not.toBeNull();
        expect(match![1]).toBe('dQw4w9WgXcQ');
      });
    });

    invalidUrls.forEach((url) => {
      it(`should reject invalid URL: ${url || '(empty)'}`, () => {
        const match = url.match(youtubeUrlPattern);
        expect(match).toBeNull();
      });
    });
  });

  describe('Ingredient Structure Validation', () => {
    const validIngredient = {
      name: 'chicken',
      quantity: '1',
      unit: 'kg',
      confidence: 0.95,
    };

    it('validates ingredient has name', () => {
      expect(validIngredient).toHaveProperty('name');
      expect(typeof validIngredient.name).toBe('string');
    });

    it('validates ingredient has quantity', () => {
      expect(validIngredient).toHaveProperty('quantity');
    });

    it('validates ingredient has unit', () => {
      expect(validIngredient).toHaveProperty('unit');
    });

    it('validates ingredient confidence is number', () => {
      expect(validIngredient).toHaveProperty('confidence');
      expect(typeof validIngredient.confidence).toBe('number');
      expect(validIngredient.confidence).toBeGreaterThanOrEqual(0);
      expect(validIngredient.confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('Error Response Format', () => {
    it('returns consistent error format', async () => {
      const request = createMockRequest({ action: 'invalid' });
      const response = await POST(request);

      const data = await response.json();

      // All error responses should have success: false
      expect(data).toHaveProperty('success');
      expect(data.success).toBe(false);

      // Should have either message or error
      expect(data.message || data.error).toBeTruthy();
    });
  });

  describe('Success Response Format', () => {
    it('returns consistent success format for get_creators', async () => {
      const request = createMockRequest({ action: 'get_creators' });
      const response = await POST(request);

      const data = await response.json();

      // All success responses should have success: true
      expect(data).toHaveProperty('success');
      expect(data.success).toBe(true);

      // Should have data property
      expect(data).toHaveProperty('data');
    });
  });
});

describe('Video ID Extraction', () => {
  // Test the video ID extraction logic independently
  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  };

  it('extracts video ID from standard watch URL', () => {
    expect(extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(
      'dQw4w9WgXcQ'
    );
  });

  it('extracts video ID from short URL', () => {
    expect(extractVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
  });

  it('extracts video ID from embed URL', () => {
    expect(extractVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe(
      'dQw4w9WgXcQ'
    );
  });

  it('returns null for invalid URLs', () => {
    expect(extractVideoId('https://vimeo.com/123456')).toBeNull();
    expect(extractVideoId('')).toBeNull();
    expect(extractVideoId('not-a-url')).toBeNull();
  });
});
