import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';
import { getDatabase } from '../database/db.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ContentParser {
  constructor() {
    this.db = getDatabase();
  }

  async parseCreators() {
    try {
      const seedPath = path.join(__dirname, '../../mock/data/content_creators.json');
      const seedData = await fs.readFile(seedPath, 'utf8');
      const creators = JSON.parse(seedData);

      logger.info(`Processing ${creators.length} content creators`);

      for (const creatorUrl of creators) {
        await this.registerCreator(creatorUrl);
      }

      logger.info('Creator parsing completed');
    } catch (error) {
      logger.error('Creator parsing error:', error);
      throw error;
    }
  }

  async registerCreator(channelUrl) {
    const id = uuidv4();
    const now = new Date().toISOString();

    try {
      // Extract channel name and platform
      const platform = this.getPlatform(channelUrl);
      const name = this.extractChannelName(channelUrl);

      const stmt = this.db.prepare(`
        INSERT OR IGNORE INTO content_creators (
          id, name, platform, channel_url, last_checked, is_active
        ) VALUES (?, ?, ?, ?, ?, ?)
      `);

      stmt.run(id, name, platform, channelUrl, now, 1);

      logger.info(`Registered creator: ${name} (${platform})`);

      // In production, fetch actual channel data
      // For now, this is a placeholder for YouTube/social media integration
      await this.fetchCreatorContent(id, channelUrl, platform);
    } catch (error) {
      logger.error(`Error registering creator ${channelUrl}: ${error.message}`);
    }
  }

  getPlatform(url) {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
    if (url.includes('tiktok.com')) return 'TikTok';
    if (url.includes('instagram.com')) return 'Instagram';
    if (url.includes('facebook.com')) return 'Facebook';
    return 'Other';
  }

  extractChannelName(url) {
    const match = url.match(/(?:@|\/)([\w-]+)(?:\/)?$/);
    return match ? match[1] : url;
  }

  async fetchCreatorContent(creatorId, channelUrl, platform) {
    // Placeholder for actual API integration
    // In production, this would:
    // 1. Use YouTube Data API for videos
    // 2. Fetch captions/transcripts
    // 3. Parse content for recipes
    // 4. Extract images/thumbnails

    logger.debug(`Placeholder: Would fetch content from ${platform} channel: ${channelUrl}`);

    // Example mock content creation
    if (platform === 'YouTube') {
      await this.createMockVideoContent(creatorId, channelUrl);
    }
  }

  async createMockVideoContent(creatorId, channelUrl) {
    // Create mock video entries for demonstration
    const mockVideos = [
      {
        title: 'How to Make Adobo',
        description: 'Traditional Filipino adobo recipe tutorial',
        publishDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        title: 'Sinigang Recipe Guide',
        description: 'Step by step guide for making sinigang',
        publishDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    for (const video of mockVideos) {
      const videoId = uuidv4();
      const stmt = this.db.prepare(`
        INSERT OR IGNORE INTO creator_content (
          id, creator_id, title, content_url, content_type,
          description, publish_date, needs_review
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        videoId,
        creatorId,
        video.title,
        `${channelUrl}/video/${videoId}`,
        'video',
        video.description,
        video.publishDate,
        1 // Mark for admin review
      );
    }
  }

  async parseTranscript(videoId, transcription) {
    try {
      // Extract recipe components from transcription
      const extractedRecipe = this.extractRecipeFromText(transcription);

      if (extractedRecipe) {
        const stmt = this.db.prepare(`
          UPDATE creator_content
          SET extracted_recipe = ?, needs_review = 1
          WHERE id = ?
        `);

        stmt.run(JSON.stringify(extractedRecipe), videoId);
        logger.info(`Extracted recipe from video ${videoId}`);
      }
    } catch (error) {
      logger.error(`Transcript parsing error: ${error.message}`);
    }
  }

  extractRecipeFromText(text) {
    // Simple NLP patterns for recipe extraction
    const ingredients = [];
    const steps = [];

    // Look for ingredient patterns
    const ingredientPatterns = [
      /(\d+\s*(?:cup|tablespoon|teaspoon|gram|oz|lb)s?)\s+([^,\n]+)/gi,
      /(\d+)\s+([^,\n]+)/i
    ];

    for (const pattern of ingredientPatterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[0].length > 5) {
          ingredients.push({
            quantity: match[1],
            item: match[2].trim()
          });
        }
      }
    }

    // Look for instruction markers
    const instructionMarkers = /(step|then|next|first|second|mix|add|cook|fry|bake|simmer)/gi;
    const sentences = text.split(/[.!?\n]/);

    sentences.forEach(sentence => {
      if (instructionMarkers.test(sentence) && sentence.length > 10) {
        steps.push({
          '@type': 'HowToStep',
          text: sentence.trim().substring(0, 500)
        });
      }
    });

    return ingredients.length > 0 || steps.length > 0
      ? { ingredients, recipeInstructions: steps }
      : null;
  }

  async reviewContentItem(itemId, approved, notes) {
    try {
      const stmt = this.db.prepare(`
        UPDATE creator_content
        SET needs_review = ?, reviewed_date = ?, reviewer_notes = ?
        WHERE id = ?
      `);

      const now = new Date().toISOString();
      stmt.run(approved ? 0 : 1, now, notes, itemId);

      logger.info(`Content ${itemId} review status updated`);
    } catch (error) {
      logger.error(`Review error: ${error.message}`);
    }
  }

  async getPendingReview() {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM creator_content
        WHERE needs_review = 1
        LIMIT 20
      `);

      return stmt.all();
    } catch (error) {
      logger.error(`Error fetching pending reviews: ${error.message}`);
      return [];
    }
  }
}

export default ContentParser;

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const parser = new ContentParser();
  parser.parseCreators().catch(console.error);
}
