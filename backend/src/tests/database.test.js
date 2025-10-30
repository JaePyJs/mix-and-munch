import test from 'node:test';
import assert from 'assert';
import { initializeDatabase, getDatabase } from '../database/db.js';
import { v4 as uuidv4 } from 'uuid';

await test('Database initialization', async (t) => {
  await t.test('should initialize database successfully', async () => {
    await initializeDatabase();
    const db = getDatabase();
    assert(db !== null);
  });

  await t.test('should create recipes table', async () => {
    const db = getDatabase();
    const result = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='recipes'").get();
    assert(result !== undefined);
  });

  await t.test('should create recipe_images table', async () => {
    const db = getDatabase();
    const result = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='recipe_images'").get();
    assert(result !== undefined);
  });

  await t.test('should create content_creators table', async () => {
    const db = getDatabase();
    const result = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='content_creators'").get();
    assert(result !== undefined);
  });
});

await test('Recipe insertion and retrieval', async (t) => {
  const db = getDatabase();
  const recipeId = uuidv4();
  const now = new Date().toISOString();

  await t.test('should insert a recipe', async () => {
    const stmt = db.prepare(`
      INSERT INTO recipes (
        id, title, author, source_url, source_site, ingredients, instructions,
        primary_image_url, image_attribution, tags, crawled_date, last_updated, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      recipeId,
      'Test Adobo',
      'Test Chef',
      'https://example.com/test-adobo',
      'https://example.com',
      JSON.stringify([{ item: 'chicken', quantity: '2 lbs' }]),
      JSON.stringify([{ text: 'Cook chicken' }]),
      'https://example.com/image.jpg',
      'Image courtesy of example.com',
      JSON.stringify(['Filipino', 'Chicken']),
      now,
      now,
      'active'
    );

    const recipe = db.prepare('SELECT * FROM recipes WHERE id = ?').get(recipeId);
    assert(recipe !== undefined);
    assert.strictEqual(recipe.title, 'Test Adobo');
  });

  await t.test('should retrieve recipe by ID', async () => {
    const recipe = db.prepare('SELECT * FROM recipes WHERE id = ?').get(recipeId);
    assert(recipe !== undefined);
    assert.strictEqual(recipe.id, recipeId);
    assert.strictEqual(recipe.author, 'Test Chef');
  });

  await t.test('should preserve image attribution', async () => {
    const recipe = db.prepare('SELECT * FROM recipes WHERE id = ?').get(recipeId);
    assert.strictEqual(recipe.image_attribution, 'Image courtesy of example.com');
    assert(recipe.primary_image_url.startsWith('https://'));
  });

  await t.test('should insert recipe images', async () => {
    const imageId = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO recipe_images (
        id, recipe_id, image_url, image_attribution, alt_text, position
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      imageId,
      recipeId,
      'https://example.com/image-step1.jpg',
      'Image courtesy of example.com',
      'Cooking chicken',
      1
    );

    const images = db.prepare('SELECT * FROM recipe_images WHERE recipe_id = ?').all(recipeId);
    assert(images.length > 0);
    assert.strictEqual(images[0].alt_text, 'Cooking chicken');
  });

  // Cleanup
  db.prepare('DELETE FROM recipe_images WHERE recipe_id = ?').run(recipeId);
  db.prepare('DELETE FROM recipes WHERE id = ?').run(recipeId);
});

await test('Content creator storage', async (t) => {
  const db = getDatabase();
  const creatorId = uuidv4();

  await t.test('should insert a content creator', async () => {
    const stmt = db.prepare(`
      INSERT INTO content_creators (
        id, name, platform, channel_url, is_active
      ) VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(
      creatorId,
      'Test Chef',
      'YouTube',
      'https://www.youtube.com/@TestChef',
      1
    );

    const creator = db.prepare('SELECT * FROM content_creators WHERE id = ?').get(creatorId);
    assert(creator !== undefined);
    assert.strictEqual(creator.name, 'Test Chef');
    assert.strictEqual(creator.platform, 'YouTube');
  });

  await t.test('should prevent duplicate channel URLs', async () => {
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO content_creators (
        id, name, platform, channel_url, is_active
      ) VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(
      uuidv4(),
      'Another Chef',
      'YouTube',
      'https://www.youtube.com/@TestChef',
      1
    );

    const count = db.prepare('SELECT COUNT(*) as count FROM content_creators WHERE channel_url = ?')
      .get('https://www.youtube.com/@TestChef');
    assert.strictEqual(count.count, 1);
  });

  // Cleanup
  db.prepare('DELETE FROM content_creators WHERE id = ?').run(creatorId);
});

console.log('✅ All database tests passed!');
