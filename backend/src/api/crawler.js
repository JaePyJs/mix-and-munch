import express from 'express';
import logger from '../utils/logger.js';
import { getDatabase } from '../database/db.js';
import WebsiteCrawler from '../services/websiteCrawler.js';
import ContentParser from '../services/contentParser.js';

const router = express.Router();
const db = getDatabase();

// Trigger website crawl
router.post('/websites', async (req, res) => {
  try {
    logger.info('Manual website crawl triggered');
    const crawler = new WebsiteCrawler();
    const stats = await crawler.crawlSites();
    
    res.json({
      success: true,
      message: 'Crawl started',
      stats
    });
  } catch (error) {
    logger.error(`Crawl error: ${error.message}`);
    res.status(500).json({ error: 'Crawl failed' });
  }
});

// Trigger content creator parse
router.post('/creators', async (req, res) => {
  try {
    logger.info('Manual content creator parse triggered');
    const parser = new ContentParser();
    await parser.parseCreators();
    
    res.json({
      success: true,
      message: 'Creator parsing started'
    });
  } catch (error) {
    logger.error(`Parser error: ${error.message}`);
    res.status(500).json({ error: 'Parsing failed' });
  }
});

// Get crawl logs
router.get('/logs', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const stmt = db.prepare(`
      SELECT * FROM crawl_logs
      ORDER BY start_time DESC
      LIMIT ?
    `);
    
    const logs = stmt.all(limit);
    res.json({ data: logs });
  } catch (error) {
    logger.error(`Error fetching logs: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// Get crawl stats
router.get('/stats', (req, res) => {
  try {
    const total = db.prepare('SELECT COUNT(*) as count FROM crawl_logs').get().count;
    const recent = db.prepare(`
      SELECT * FROM crawl_logs
      WHERE start_time > datetime('now', '-7 days')
      ORDER BY start_time DESC
    `).all();

    const successful = recent.filter(l => l.status === 'success').length;
    const failed = recent.filter(l => l.status === 'error').length;

    res.json({
      totalRuns: total,
      recentRuns: recent.length,
      successful,
      failed
    });
  } catch (error) {
    logger.error(`Stats error: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
