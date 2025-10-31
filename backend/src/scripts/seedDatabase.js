import { initializeDatabase, getDatabase } from '../database/db.js';
import WebsiteCrawler from '../services/websiteCrawler.js';
import logger from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Seed Database Script
 * Initializes the database and runs the crawler to populate recipes
 */

class DatabaseSeeder {
  constructor() {
    this.db = null;
    this.stats = {
      recipesCreated: 0,
      recipesUpdated: 0,
      imagesProcessed: 0,
      errors: []
    };
  }

  async initialize() {
    try {
      logger.info('Initializing database...');
      await initializeDatabase();
      this.db = getDatabase();
      logger.info('Database initialized successfully');
      return true;
    } catch (error) {
      logger.error('Database initialization failed:', error);
      throw error;
    }
  }

  async runCrawler() {
    try {
      logger.info('Starting website crawler...');
      const crawler = new WebsiteCrawler();
      const crawlStats = await crawler.crawlSites();
      
      logger.info('Crawler completed with stats:', crawlStats);
      return crawlStats;
    } catch (error) {
      logger.error('Crawler failed:', error);
      throw error;
    }
  }

  async normalizeIngredients() {
    try {
      logger.info('Normalizing ingredients across recipes...');
      
      const recipes = this.db.prepare('SELECT id, ingredients FROM recipes WHERE ingredients IS NOT NULL').all();
      let normalized = 0;

      for (const recipe of recipes) {
        try {
          let ingredients = JSON.parse(recipe.ingredients);
          
          // Normalize each ingredient
          ingredients = ingredients.map(ing => {
            const item = typeof ing === 'string' ? ing : ing.item || '';
            return {
              item: this.normalizeIngredientText(item),
              original: item
            };
          });

          // Store normalized ingredients
          this.db.prepare('UPDATE recipes SET ingredients = ? WHERE id = ?')
            .run(JSON.stringify(ingredients), recipe.id);
          
          normalized++;
        } catch (error) {
          logger.warn(`Error normalizing ingredients for recipe ${recipe.id}:`, error);
        }
      }

      logger.info(`Normalized ingredients for ${normalized} recipes`);
      this.stats.recipesUpdated = normalized;
    } catch (error) {
      logger.error('Ingredient normalization failed:', error);
    }
  }

  normalizeIngredientText(text) {
    if (!text) return '';
    
    // Convert to lowercase
    text = text.toLowerCase().trim();
    
    // Remove common modifiers
    text = text.replace(/\b(fresh|organic|dried|canned|frozen|raw|cooked|minced|diced|chopped|sliced|ground|whole|melted|unsalted|salted|unsweetened|sweetened)\b/gi, '');
    
    // Normalize plural to singular for common ingredients
    const singularMap = {
      'tomatoes': 'tomato',
      'onions': 'onion',
      'peppers': 'pepper',
      'garlic cloves': 'garlic',
      'eggs': 'egg',
      'potatoes': 'potato'
    };

    for (const [plural, singular] of Object.entries(singularMap)) {
      if (text.includes(plural)) {
        text = text.replace(plural, singular);
      }
    }

    // Clean up extra whitespace
    text = text.replace(/\s+/g, ' ').trim();
    
    return text;
  }

  async verifyDataQuality() {
    try {
      logger.info('Verifying data quality...');

      const recipes = this.db.prepare('SELECT COUNT(*) as count FROM recipes').get();
      const recipesWithIngredients = this.db.prepare('SELECT COUNT(*) as count FROM recipes WHERE ingredients IS NOT NULL AND ingredients != "[]"').get();
      const recipesWithInstructions = this.db.prepare('SELECT COUNT(*) as count FROM recipes WHERE instructions IS NOT NULL AND instructions != "[]"').get();
      const recipesWithImages = this.db.prepare('SELECT COUNT(*) as count FROM recipes WHERE primary_image_url IS NOT NULL').get();

      const quality = {
        totalRecipes: recipes.count,
        recipesWithIngredients: recipesWithIngredients.count,
        recipesWithInstructions: recipesWithInstructions.count,
        recipesWithImages: recipesWithImages.count,
        qualityScore: recipes.count > 0 
          ? ((recipesWithIngredients.count + recipesWithInstructions.count) / (recipes.count * 2) * 100).toFixed(2)
          : 0
      };

      logger.info('Data Quality Report:', quality);
      return quality;
    } catch (error) {
      logger.error('Data quality check failed:', error);
      throw error;
    }
  }

  async createTestUsers() {
    try {
      logger.info('Creating test users...');

      const testUsers = [
        { name: 'Demo User', email: 'demo@example.com', preferences: { cuisine: 'asian', dietary: [] } },
        { name: 'Vegan User', email: 'vegan@example.com', preferences: { cuisine: 'any', dietary: ['vegan'] } },
        { name: 'Quick Recipes', email: 'quick@example.com', preferences: { maxCookTime: 30, dietary: [] } }
      ];

      for (const user of testUsers) {
        const userId = uuidv4();
        try {
          this.db.prepare(`
            INSERT OR REPLACE INTO users (
              id, name, email, preferences, created_at, updated_at
            ) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
          `).run(userId, user.name, user.email, JSON.stringify(user.preferences));

          // Add some recipes to their pantry
          const recipeIds = this.db.prepare('SELECT id FROM recipes LIMIT 10').all();
          for (const recipe of recipeIds) {
            this.db.prepare(`
              INSERT OR IGNORE INTO user_recipes (
                id, user_id, recipe_id, saved_at, is_favorite
              ) VALUES (?, ?, ?, datetime('now'), ?)
            `).run(uuidv4(), userId, recipe.id, Math.random() > 0.5 ? 1 : 0);
          }

          logger.info(`Created test user: ${user.email}`);
        } catch (error) {
          logger.warn(`Error creating test user ${user.email}:`, error);
        }
      }
    } catch (error) {
      logger.error('Test user creation failed:', error);
    }
  }

  async generateReport() {
    try {
      logger.info('\n' + '='.repeat(60));
      logger.info('DATABASE SEEDING REPORT');
      logger.info('='.repeat(60));

      const recipes = this.db.prepare('SELECT COUNT(*) as count FROM recipes').get();
      const images = this.db.prepare('SELECT COUNT(*) as count FROM recipe_images').get();
      const crawlLogs = this.db.prepare('SELECT COUNT(*) as count FROM crawl_logs').get();
      const users = this.db.prepare('SELECT COUNT(*) as count FROM users').get();

      const report = {
        timestamp: new Date().toISOString(),
        recipesCreated: recipes.count,
        imagesProcessed: images.count,
        crawlAttempts: crawlLogs.count,
        testUsersCreated: users.count,
        stats: this.stats
      };

      logger.info(`Total Recipes: ${recipes.count}`);
      logger.info(`Total Images: ${images.count}`);
      logger.info(`Crawl Logs: ${crawlLogs.count}`);
      logger.info(`Test Users: ${users.count}`);
      logger.info('='.repeat(60) + '\n');

      return report;
    } catch (error) {
      logger.error('Report generation failed:', error);
    }
  }

  async seed() {
    try {
      logger.info('Starting database seeding process...');
      const startTime = Date.now();

      // Initialize database
      await this.initialize();

      // Run crawler
      const crawlStats = await this.runCrawler();
      this.stats = { ...this.stats, ...crawlStats };

      // Normalize ingredients
      await this.normalizeIngredients();

      // Create test users
      await this.createTestUsers();

      // Verify data quality
      const quality = await this.verifyDataQuality();

      // Generate report
      const report = await this.generateReport();

      const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(2);
      logger.info(`Seeding completed in ${duration} minutes`);

      return {
        success: true,
        duration: `${duration} minutes`,
        quality,
        report
      };
    } catch (error) {
      logger.error('Seeding process failed:', error);
      throw error;
    }
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const seeder = new DatabaseSeeder();
  seeder.seed()
    .then(() => {
      logger.info('Seeding successful!');
      process.exit(0);
    })
    .catch(error => {
      logger.error('Seeding failed:', error);
      process.exit(1);
    });
}

export default DatabaseSeeder;
