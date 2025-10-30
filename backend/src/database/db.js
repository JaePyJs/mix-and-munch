import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../data/recipes.db');
let db;

export function getDatabase() {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
  }
  return db;
}

export async function initializeDatabase() {
  const database = getDatabase();
  
  // Recipes table
  database.exec(`
    CREATE TABLE IF NOT EXISTS recipes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      author TEXT,
      source_url TEXT UNIQUE NOT NULL,
      source_site TEXT NOT NULL,
      description TEXT,
      servings TEXT,
      prep_time TEXT,
      cook_time TEXT,
      total_time TEXT,
      ingredients JSON NOT NULL,
      instructions JSON NOT NULL,
      tags JSON,
      category TEXT,
      rating REAL,
      review_count INTEGER,
      primary_image_url TEXT,
      image_attribution TEXT,
      publication_date TEXT,
      crawled_date TEXT NOT NULL,
      last_updated TEXT NOT NULL,
      is_featured BOOLEAN DEFAULT 0,
      status TEXT DEFAULT 'active'
    );
  `);

  // Recipe images table (for multiple images per recipe)
  database.exec(`
    CREATE TABLE IF NOT EXISTS recipe_images (
      id TEXT PRIMARY KEY,
      recipe_id TEXT NOT NULL,
      image_url TEXT NOT NULL,
      image_attribution TEXT,
      alt_text TEXT,
      position INTEGER,
      FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE
    );
  `);

  // Content creators table
  database.exec(`
    CREATE TABLE IF NOT EXISTS content_creators (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      platform TEXT NOT NULL,
      channel_url TEXT UNIQUE NOT NULL,
      avatar_url TEXT,
      follower_count INTEGER,
      last_checked TEXT,
      is_active BOOLEAN DEFAULT 1
    );
  `);

  // Creator videos/content table
  database.exec(`
    CREATE TABLE IF NOT EXISTS creator_content (
      id TEXT PRIMARY KEY,
      creator_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content_url TEXT NOT NULL,
      content_type TEXT,
      thumbnail_url TEXT,
      description TEXT,
      publish_date TEXT,
      transcription TEXT,
      extracted_recipe JSON,
      needs_review BOOLEAN DEFAULT 0,
      reviewed_date TEXT,
      reviewer_notes TEXT,
      FOREIGN KEY (creator_id) REFERENCES content_creators(id)
    );
  `);

  // Crawl logs table
  database.exec(`
    CREATE TABLE IF NOT EXISTS crawl_logs (
      id TEXT PRIMARY KEY,
      site_url TEXT NOT NULL,
      status TEXT NOT NULL,
      recipes_found INTEGER,
      recipes_new INTEGER,
      recipes_updated INTEGER,
      errors TEXT,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      duration_ms INTEGER
    );
  `);

  // Deduplication fingerprints
  database.exec(`
    CREATE TABLE IF NOT EXISTS recipe_fingerprints (
      id TEXT PRIMARY KEY,
      recipe_id TEXT NOT NULL,
      title_hash TEXT,
      ingredient_hash TEXT,
      instruction_hash TEXT,
      similarity_score REAL,
      matched_recipe_id TEXT,
      FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
      FOREIGN KEY (matched_recipe_id) REFERENCES recipes(id)
    );
  `);

  // Create indexes for better query performance
  database.exec(`
    CREATE INDEX IF NOT EXISTS idx_recipes_source_site ON recipes(source_site);
    CREATE INDEX IF NOT EXISTS idx_recipes_category ON recipes(category);
    CREATE INDEX IF NOT EXISTS idx_recipes_status ON recipes(status);
    CREATE INDEX IF NOT EXISTS idx_recipes_date ON recipes(crawled_date);
    CREATE INDEX IF NOT EXISTS idx_creator_content_type ON creator_content(content_type);
    CREATE INDEX IF NOT EXISTS idx_crawl_logs_site ON crawl_logs(site_url);
    CREATE INDEX IF NOT EXISTS idx_crawl_logs_date ON crawl_logs(start_time);
  `);

  logger.info('Database initialized successfully');
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

export default getDatabase;
