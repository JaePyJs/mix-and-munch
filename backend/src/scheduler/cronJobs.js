import schedule from 'node-schedule';
import logger from '../utils/logger.js';
import WebsiteCrawler from '../services/websiteCrawler.js';
import ContentParser from '../services/contentParser.js';

export function startScheduler() {
  logger.info('Starting scheduler for automated crawls and parses');

  // Run website crawl daily at 2 AM
  schedule.scheduleJob('0 2 * * *', async () => {
    try {
      logger.info('Running scheduled website crawl');
      const crawler = new WebsiteCrawler();
      await crawler.crawlSites();
    } catch (error) {
      logger.error(`Scheduled crawl error: ${error.message}`);
    }
  });

  // Run content creator parse twice daily
  schedule.scheduleJob('0 6,18 * * *', async () => {
    try {
      logger.info('Running scheduled content creator parse');
      const parser = new ContentParser();
      await parser.parseCreators();
    } catch (error) {
      logger.error(`Scheduled parse error: ${error.message}`);
    }
  });

  // Cleanup old logs weekly
  schedule.scheduleJob('0 0 * * 0', async () => {
    try {
      logger.info('Cleaning up old logs');
      const { getDatabase } = await import('../database/db.js');
      const db = getDatabase();
      db.prepare(`
        DELETE FROM crawl_logs
        WHERE start_time < datetime('now', '-30 days')
      `).run();
      logger.info('Cleanup completed');
    } catch (error) {
      logger.error(`Cleanup error: ${error.message}`);
    }
  });

  logger.info('Scheduler initialized with 3 jobs');
}

export function stopScheduler() {
  schedule.gracefulShutdown();
  logger.info('Scheduler stopped');
}
