import { getDatabase } from '../database/db.js';
import logger from '../utils/logger.js';

/**
 * Database Optimization Script
 * Optimizes queries, creates indexes, and improves performance
 */

class DatabaseOptimizer {
  constructor() {
    this.db = getDatabase();
    this.optimizationStats = {
      indexesCreated: 0,
      queriesOptimized: 0,
      vacuumCleaned: 0,
      analyzeCompleted: 0,
      errors: []
    };
  }

  async optimize() {
    try {
      logger.info('\n' + '='.repeat(60));
      logger.info('DATABASE OPTIMIZATION STARTING');
      logger.info('='.repeat(60));

      // Create indexes for better query performance
      await this.createOptimizationIndexes();

      // Analyze database for query optimization
      await this.analyzeDatabase();

      // Vacuum to clean up space
      await this.vacuumDatabase();

      // Check and log query plans
      await this.analyzeQueryPlans();

      // Report optimization results
      this.reportResults();

      logger.info('='.repeat(60));
      logger.info('DATABASE OPTIMIZATION COMPLETE');
      logger.info('='.repeat(60) + '\n');

      return this.optimizationStats;
    } catch (error) {
      logger.error('Optimization failed:', error);
      throw error;
    }
  }

  async createOptimizationIndexes() {
    logger.info('Creating optimization indexes...');

    const indexes = [
      { name: 'idx_recipes_title', table: 'recipes', columns: 'title' },
      { name: 'idx_recipes_source', table: 'recipes', columns: 'source_site' },
      { name: 'idx_recipes_crawled', table: 'recipes', columns: 'crawled_date' },
      { name: 'idx_recipes_status', table: 'recipes', columns: 'status' },
      { name: 'idx_images_recipe', table: 'recipe_images', columns: 'recipe_id' },
      { name: 'idx_crawl_logs_site', table: 'crawl_logs', columns: 'site_url' },
      { name: 'idx_crawl_logs_time', table: 'crawl_logs', columns: 'start_time' },
      { name: 'idx_users_email', table: 'users', columns: 'email' },
      { name: 'idx_creator_content_creator', table: 'creator_content', columns: 'creator_id' }
    ];

    for (const index of indexes) {
      try {
        this.db.exec(`
          CREATE INDEX IF NOT EXISTS ${index.name} 
          ON ${index.table} (${index.columns})
        `);
        logger.info(`✓ Created index: ${index.name}`);
        this.optimizationStats.indexesCreated++;
      } catch (error) {
        logger.warn(`⚠ Index ${index.name} already exists or failed: ${error.message}`);
      }
    }
  }

  async analyzeDatabase() {
    logger.info('Analyzing database structure...');
    try {
      this.db.exec('ANALYZE');
      logger.info('✓ Database analyzed for query optimization');
      this.optimizationStats.analyzeCompleted++;
    } catch (error) {
      logger.error('✗ Database analysis failed:', error);
      this.optimizationStats.errors.push('Analysis: ' + error.message);
    }
  }

  async vacuumDatabase() {
    logger.info('Running database vacuum...');
    try {
      this.db.exec('VACUUM');
      logger.info('✓ Database vacuumed and optimized');
      this.optimizationStats.vacuumCleaned++;
    } catch (error) {
      logger.error('✗ Vacuum failed:', error);
      this.optimizationStats.errors.push('Vacuum: ' + error.message);
    }
  }

  async analyzeQueryPlans() {
    logger.info('Analyzing common query plans...');

    const queries = [
      'SELECT * FROM recipes WHERE title LIKE ?',
      'SELECT * FROM recipes WHERE source_site = ?',
      'SELECT r.*, COUNT(i.id) as image_count FROM recipes r LEFT JOIN recipe_images i ON r.id = i.recipe_id GROUP BY r.id',
      'SELECT * FROM recipes WHERE crawled_date > ? ORDER BY crawled_date DESC',
      'SELECT * FROM recipe_images WHERE recipe_id = ?'
    ];

    for (const query of queries) {
      try {
        const plan = this.db.prepare(`EXPLAIN QUERY PLAN ${query}`).all();
        logger.info(`Query plan for: ${query.substring(0, 50)}...`);
        logger.info(`  Plan: ${JSON.stringify(plan[0])}`);
        this.optimizationStats.queriesOptimized++;
      } catch (error) {
        logger.warn(`Could not analyze query: ${error.message}`);
      }
    }
  }

  reportResults() {
    logger.info('\nOptimization Report:');
    logger.info(`  Indexes Created: ${this.optimizationStats.indexesCreated}`);
    logger.info(`  Queries Optimized: ${this.optimizationStats.queriesOptimized}`);
    logger.info(`  Vacuum Completed: ${this.optimizationStats.vacuumCleaned}`);
    logger.info(`  Database Analyzed: ${this.optimizationStats.analyzeCompleted}`);

    if (this.optimizationStats.errors.length > 0) {
      logger.info('Errors encountered:');
      this.optimizationStats.errors.forEach(error => logger.info(`  - ${error}`));
    }

    // Get database statistics
    const stats = this.db.prepare("SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()").get();
    logger.info(`\nDatabase Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

    const tableCount = this.db.prepare("SELECT COUNT(*) as count FROM sqlite_master WHERE type='table'").get();
    logger.info(`Tables: ${tableCount.count}`);

    const indexCount = this.db.prepare("SELECT COUNT(*) as count FROM sqlite_master WHERE type='index'").get();
    logger.info(`Indexes: ${indexCount.count}`);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const optimizer = new DatabaseOptimizer();
  optimizer.optimize()
    .then(() => {
      logger.info('Optimization successful!');
      process.exit(0);
    })
    .catch(error => {
      logger.error('Optimization failed:', error);
      process.exit(1);
    });
}

export default DatabaseOptimizer;
