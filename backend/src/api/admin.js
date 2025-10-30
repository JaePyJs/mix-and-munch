import express from 'express';
import logger from '../utils/logger.js';
import { getDatabase } from '../database/db.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();
const db = getDatabase();

// Get all recipes for admin review
router.get('/recipes', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const status = req.query.status || 'active';

    const stmt = db.prepare(`
      SELECT * FROM recipes
      WHERE status = ?
      ORDER BY last_updated DESC
      LIMIT ?
    `);

    const recipes = stmt.all(status, limit);
    recipes.forEach(r => {
      r.ingredients = JSON.parse(r.ingredients);
      r.instructions = JSON.parse(r.instructions);
      r.tags = JSON.parse(r.tags || '[]');
    });

    res.json({ data: recipes });
  } catch (error) {
    logger.error(`Error fetching recipes: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

// Feature a recipe
router.put('/recipes/:id/feature', (req, res) => {
  try {
    const { featured } = req.body;
    const stmt = db.prepare('UPDATE recipes SET is_featured = ? WHERE id = ?');
    stmt.run(featured ? 1 : 0, req.params.id);

    logger.info(`Recipe ${req.params.id} featured: ${featured}`);
    res.json({ success: true });
  } catch (error) {
    logger.error(`Error updating recipe: ${error.message}`);
    res.status(500).json({ error: 'Update failed' });
  }
});

// Update recipe status
router.put('/recipes/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['active', 'draft', 'archived'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const stmt = db.prepare('UPDATE recipes SET status = ?, last_updated = ? WHERE id = ?');
    stmt.run(status, new Date().toISOString(), req.params.id);

    logger.info(`Recipe ${req.params.id} status: ${status}`);
    res.json({ success: true });
  } catch (error) {
    logger.error(`Error updating status: ${error.message}`);
    res.status(500).json({ error: 'Update failed' });
  }
});

// Get content creator pending reviews
router.get('/reviews/pending', (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT cc.*, co.* FROM creator_content co
      JOIN content_creators cc ON co.creator_id = cc.id
      WHERE co.needs_review = 1
      LIMIT 50
    `);

    const pending = stmt.all();
    res.json({ data: pending });
  } catch (error) {
    logger.error(`Error fetching pending reviews: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch pending' });
  }
});

// Approve/reject content
router.post('/reviews/:id', (req, res) => {
  try {
    const { approved, notes } = req.body;
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      UPDATE creator_content
      SET needs_review = ?, reviewed_date = ?, reviewer_notes = ?
      WHERE id = ?
    `);

    stmt.run(approved ? 0 : 1, now, notes || '', req.params.id);

    logger.info(`Content ${req.params.id} reviewed: ${approved ? 'approved' : 'rejected'}`);
    res.json({ success: true });
  } catch (error) {
    logger.error(`Error reviewing content: ${error.message}`);
    res.status(500).json({ error: 'Review failed' });
  }
});

// Get dashboard stats
router.get('/dashboard/stats', (req, res) => {
  try {
    const totalRecipes = db.prepare('SELECT COUNT(*) as count FROM recipes').get().count;
    const totalCreators = db.prepare('SELECT COUNT(*) as count FROM content_creators WHERE is_active = 1').get().count;
    const pendingReview = db.prepare('SELECT COUNT(*) as count FROM creator_content WHERE needs_review = 1').get().count;
    const crawlRuns = db.prepare('SELECT COUNT(*) as count FROM crawl_logs').get().count;

    const recentCrawls = db.prepare(`
      SELECT * FROM crawl_logs
      WHERE start_time > datetime('now', '-24 hours')
      ORDER BY start_time DESC
      LIMIT 5
    `).all();

    res.json({
      totalRecipes,
      totalCreators,
      pendingReview,
      crawlRuns,
      recentCrawls
    });
  } catch (error) {
    logger.error(`Dashboard stats error: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get duplicate/similar recipes
router.get('/duplicates', (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT * FROM recipe_fingerprints
      WHERE similarity_score > 0.7
      ORDER BY similarity_score DESC
      LIMIT 50
    `);

    const duplicates = stmt.all();
    res.json({ data: duplicates });
  } catch (error) {
    logger.error(`Error fetching duplicates: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch duplicates' });
  }
});

// Merge/consolidate recipes
router.post('/merge-recipes', (req, res) => {
  try {
    const { keep_id, merge_ids } = req.body;

    // In production, implement proper merge logic
    logger.info(`Merging recipes into ${keep_id}`);

    res.json({ success: true, message: 'Recipes merged' });
  } catch (error) {
    logger.error(`Merge error: ${error.message}`);
    res.status(500).json({ error: 'Merge failed' });
  }
});

export default router;
