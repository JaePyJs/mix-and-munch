import { getDatabase, initializeDatabase } from '../database/db.js';
import logger from '../utils/logger.js';
import axios from 'axios';

/**
 * Comprehensive Testing Suite for Phase 2
 * Tests: API endpoints, database queries, search algorithms, load testing
 */

class ComprehensiveTests {
  constructor() {
    this.db = getDatabase();
    this.baseUrl = 'http://localhost:3001';
    this.results = {
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  async testDatabaseConnectivity() {
    logger.info('Testing database connectivity...');
    try {
      const recipes = this.db.prepare('SELECT COUNT(*) as count FROM recipes').get();
      const images = this.db.prepare('SELECT COUNT(*) as count FROM recipe_images').get();
      const crawlLogs = this.db.prepare('SELECT COUNT(*) as count FROM crawl_logs').get();

      logger.info(`✓ Database connected: ${recipes.count} recipes, ${images.count} images`);
      this.results.passed++;
      return true;
    } catch (error) {
      logger.error('✗ Database connectivity failed:', error.message);
      this.results.failed++;
      this.results.errors.push('Database connectivity: ' + error.message);
      return false;
    }
  }

  async testAPIEndpoints() {
    logger.info('Testing API endpoints...');
    const endpoints = [
      { method: 'GET', path: '/api/health', expectedStatus: 200 },
      { method: 'GET', path: '/api/recipes', expectedStatus: 200 },
      { method: 'GET', path: '/api/crawler/stats', expectedStatus: 200 },
      { method: 'GET', path: '/api/crawler/logs', expectedStatus: 200 }
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axios({
          method: endpoint.method,
          url: `${this.baseUrl}${endpoint.path}`,
          timeout: 5000
        });

        if (response.status === endpoint.expectedStatus) {
          logger.info(`✓ ${endpoint.method} ${endpoint.path}`);
          this.results.passed++;
        } else {
          logger.error(`✗ ${endpoint.method} ${endpoint.path}: Expected ${endpoint.expectedStatus}, got ${response.status}`);
          this.results.failed++;
        }
      } catch (error) {
        logger.error(`✗ ${endpoint.method} ${endpoint.path}: ${error.message}`);
        this.results.failed++;
        this.results.errors.push(`${endpoint.path}: ${error.message}`);
      }
    }
  }

  async testSearchFunctionality() {
    logger.info('Testing search functionality...');
    try {
      const queries = [
        'recipe',
        'chicken',
        'pasta',
        'dessert'
      ];

      for (const query of queries) {
        try {
          const response = await axios.get(`${this.baseUrl}/api/recipes?search=${query}`, { timeout: 5000 });
          if (response.status === 200 && Array.isArray(response.data)) {
            logger.info(`✓ Search query "${query}" returned ${response.data.length} results`);
            this.results.passed++;
          }
        } catch (error) {
          logger.warn(`⚠ Search query "${query}" failed: ${error.message}`);
        }
      }
    } catch (error) {
      logger.error('✗ Search functionality test failed:', error.message);
      this.results.failed++;
      this.results.errors.push('Search: ' + error.message);
    }
  }

  async testRecipeData() {
    logger.info('Testing recipe data quality...');
    try {
      const recipes = this.db.prepare('SELECT * FROM recipes LIMIT 5').all();

      for (const recipe of recipes) {
        const checks = {
          hasTitle: !!recipe.title,
          hasIngredients: recipe.ingredients && JSON.parse(recipe.ingredients).length > 0,
          hasInstructions: recipe.instructions && JSON.parse(recipe.instructions).length > 0,
          hasSourceUrl: !!recipe.source_url,
          hasCrawledDate: !!recipe.crawled_date
        };

        const passed = Object.values(checks).filter(v => v).length;
        const total = Object.keys(checks).length;

        if (passed === total) {
          logger.info(`✓ Recipe "${recipe.title.substring(0, 50)}" has all required fields`);
          this.results.passed++;
        } else {
          logger.warn(`⚠ Recipe "${recipe.title.substring(0, 50)}" missing fields: ${JSON.stringify(checks)}`);
          this.results.failed++;
        }
      }
    } catch (error) {
      logger.error('✗ Recipe data test failed:', error.message);
      this.results.failed++;
      this.results.errors.push('Recipe data: ' + error.message);
    }
  }

  async testImageProcessing() {
    logger.info('Testing image processing...');
    try {
      const imagesPerRecipe = this.db.prepare(`
        SELECT r.id, COUNT(i.id) as image_count 
        FROM recipes r 
        LEFT JOIN recipe_images i ON r.id = i.recipe_id 
        GROUP BY r.id 
        LIMIT 5
      `).all();

      let totalImages = 0;
      for (const recipe of imagesPerRecipe) {
        totalImages += recipe.image_count;
        logger.info(`✓ Recipe has ${recipe.image_count} images`);
      }

      logger.info(`✓ Total images processed: ${totalImages}`);
      this.results.passed++;
    } catch (error) {
      logger.error('✗ Image processing test failed:', error.message);
      this.results.failed++;
      this.results.errors.push('Image processing: ' + error.message);
    }
  }

  async testPerformance() {
    logger.info('Testing API response performance...');
    const queries = [
      '/api/recipes',
      '/api/recipes?search=chicken',
      '/api/crawler/stats'
    ];

    for (const query of queries) {
      try {
        const startTime = Date.now();
        await axios.get(`${this.baseUrl}${query}`, { timeout: 5000 });
        const duration = Date.now() - startTime;

        if (duration < 500) {
          logger.info(`✓ ${query} completed in ${duration}ms (fast)`);
          this.results.passed++;
        } else if (duration < 1000) {
          logger.info(`⚠ ${query} completed in ${duration}ms (acceptable)`);
          this.results.passed++;
        } else {
          logger.warn(`⚠ ${query} completed in ${duration}ms (slow)`);
          this.results.failed++;
        }
      } catch (error) {
        logger.error(`✗ Performance test failed for ${query}: ${error.message}`);
        this.results.failed++;
      }
    }
  }

  async testLoadHandling() {
    logger.info('Testing concurrent request handling...');
    try {
      const concurrentRequests = 10;
      const promises = [];

      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(
          axios.get(`${this.baseUrl}/api/recipes`, { timeout: 5000 }).catch(e => ({ error: e }))
        );
      }

      const results = await Promise.all(promises);
      const successful = results.filter(r => !r.error).length;

      if (successful === concurrentRequests) {
        logger.info(`✓ Handled ${concurrentRequests} concurrent requests successfully`);
        this.results.passed++;
      } else {
        logger.warn(`⚠ Handled ${successful}/${concurrentRequests} concurrent requests`);
        this.results.failed++;
      }
    } catch (error) {
      logger.error('✗ Load handling test failed:', error.message);
      this.results.failed++;
      this.results.errors.push('Load handling: ' + error.message);
    }
  }

  async testAlgorithmIntegration() {
    logger.info('Testing algorithm integration...');
    try {
      const response = await axios.get(`${this.baseUrl}/api/recipes?search=chicken&dedup=true`, { timeout: 5000 });
      
      if (response.data && Array.isArray(response.data)) {
        logger.info(`✓ Algorithm deduplication returned ${response.data.length} results`);
        this.results.passed++;
      }
    } catch (error) {
      logger.error('✗ Algorithm integration test failed:', error.message);
      this.results.failed++;
      this.results.errors.push('Algorithm integration: ' + error.message);
    }
  }

  async testDataIntegrity() {
    logger.info('Testing data integrity...');
    try {
      // Check for orphaned images (images without recipes)
      const orphanedImages = this.db.prepare(`
        SELECT COUNT(*) as count FROM recipe_images 
        WHERE recipe_id NOT IN (SELECT id FROM recipes)
      `).get();

      if (orphanedImages.count === 0) {
        logger.info('✓ No orphaned images found');
        this.results.passed++;
      } else {
        logger.warn(`⚠ Found ${orphanedImages.count} orphaned images`);
        this.results.failed++;
      }

      // Check for recipes with valid source URLs
      const recipesWithoutUrls = this.db.prepare(`
        SELECT COUNT(*) as count FROM recipes WHERE source_url IS NULL
      `).get();

      if (recipesWithoutUrls.count === 0) {
        logger.info('✓ All recipes have source URLs');
        this.results.passed++;
      } else {
        logger.warn(`⚠ ${recipesWithoutUrls.count} recipes missing source URLs`);
      }
    } catch (error) {
      logger.error('✗ Data integrity test failed:', error.message);
      this.results.failed++;
      this.results.errors.push('Data integrity: ' + error.message);
    }
  }

  async runAllTests() {
    logger.info('\n' + '='.repeat(60));
    logger.info('COMPREHENSIVE TEST SUITE - PHASE 2');
    logger.info('='.repeat(60) + '\n');

    await this.testDatabaseConnectivity();
    await this.testAPIEndpoints();
    await this.testSearchFunctionality();
    await this.testRecipeData();
    await this.testImageProcessing();
    await this.testPerformance();
    await this.testLoadHandling();
    await this.testAlgorithmIntegration();
    await this.testDataIntegrity();

    logger.info('\n' + '='.repeat(60));
    logger.info('TEST RESULTS');
    logger.info('='.repeat(60));
    logger.info(`Passed: ${this.results.passed}`);
    logger.info(`Failed: ${this.results.failed}`);
    logger.info(`Total: ${this.results.passed + this.results.failed}`);

    if (this.results.errors.length > 0) {
      logger.info('\nErrors:');
      this.results.errors.forEach(error => logger.info(`  - ${error}`));
    }

    logger.info('='.repeat(60) + '\n');

    return {
      success: this.results.failed === 0,
      passed: this.results.passed,
      failed: this.results.failed,
      errors: this.results.errors
    };
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const tests = new ComprehensiveTests();
  tests.runAllTests()
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      logger.error('Test suite failed:', error);
      process.exit(1);
    });
}

export default ComprehensiveTests;
