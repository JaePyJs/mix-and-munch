import express from 'express';
import logger from '../utils/logger.js';
import { getDatabase } from '../database/db.js';

const router = express.Router();
const db = getDatabase();

// Get all recipes with pagination
router.get('/', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Simple query without filtering
    const recipes = db.prepare('SELECT * FROM recipes ORDER BY crawled_date DESC LIMIT ? OFFSET ?').all(limit, offset);
    const total = db.prepare('SELECT COUNT(*) as total FROM recipes').get().total;

    res.json({
      data: recipes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error(`Error fetching recipes: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

// Get single recipe
router.get('/:id', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM recipes WHERE id = ?');
    const recipe = stmt.get(req.params.id);

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    // Parse JSON fields
    recipe.ingredients = JSON.parse(recipe.ingredients);
    recipe.instructions = JSON.parse(recipe.instructions);
    recipe.tags = JSON.parse(recipe.tags || '[]');

    // Get associated images
    const imgStmt = db.prepare('SELECT * FROM recipe_images WHERE recipe_id = ? ORDER BY position');
    recipe.images = imgStmt.all(req.params.id);

    res.json(recipe);
  } catch (error) {
    logger.error(`Error fetching recipe: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch recipe' });
  }
});

// Get recipes by source site
router.get('/source/:site', (req, res) => {
  try {
    const site = req.params.site;
    const limit = parseInt(req.query.limit) || 50;

    const stmt = db.prepare(`
      SELECT * FROM recipes
      WHERE source_site LIKE ?
      ORDER BY crawled_date DESC
      LIMIT ?
    `);

    const recipes = stmt.all(`%${site}%`, limit);

    recipes.forEach(r => {
      r.ingredients = JSON.parse(r.ingredients);
      r.instructions = JSON.parse(r.instructions);
    });

    res.json({ data: recipes });
  } catch (error) {
    logger.error(`Error fetching recipes by source: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

// Get featured recipes
router.get('/featured/list', (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT * FROM recipes
      WHERE is_featured = 1
      ORDER BY crawled_date DESC
      LIMIT 20
    `);

    const recipes = stmt.all();
    recipes.forEach(r => {
      r.ingredients = JSON.parse(r.ingredients);
      r.instructions = JSON.parse(r.instructions);
    });

    res.json({ data: recipes });
  } catch (error) {
    logger.error(`Error fetching featured recipes: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch featured recipes' });
  }
});

// Search recipes
router.post('/search', (req, res) => {
  try {
    const { query, filters } = req.body;

    let sql = 'SELECT * FROM recipes';
    const params = [];

    if (query) {
      sql += ' WHERE (title LIKE ? OR description LIKE ? OR tags LIKE ?)';
      params.push(`%${query}%`, `%${query}%`, `%${query}%`);
    }

    if (filters?.category) {
      sql += query ? ' AND category = ?' : ' WHERE category = ?';
      params.push(filters.category);
    }

    if (filters?.rating) {
      const hasWhere = query || filters?.category;
      sql += hasWhere ? ' AND rating >= ?' : ' WHERE rating >= ?';
      params.push(filters.rating);
    }

    sql += ' ORDER BY rating DESC, crawled_date DESC LIMIT 50';

    const stmt = db.prepare(sql);
    const results = stmt.all(...params);

    results.forEach(r => {
      r.ingredients = JSON.parse(r.ingredients);
      r.instructions = JSON.parse(r.instructions);
    });

    res.json({ data: results });
  } catch (error) {
    logger.error(`Search error: ${error.message}`);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Get recipe statistics
router.get('/stats/overview', (req, res) => {
  try {
    const total = db.prepare('SELECT COUNT(*) as count FROM recipes').get().count;
    const bySource = db.prepare(`
      SELECT source_site, COUNT(*) as count
      FROM recipes
      GROUP BY source_site
    `).all();

    const byCategory = db.prepare(`
      SELECT category, COUNT(*) as count
      FROM recipes
      GROUP BY category
    `).all();

    res.json({
      total,
      bySource,
      byCategory
    });
  } catch (error) {
    logger.error(`Stats error: ${error.message}`);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
