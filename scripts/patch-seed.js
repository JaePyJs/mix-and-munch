/**
 * Seed Recipes Database with Filipino Recipes
 * Uses Spoonacular API to fetch recipes with images
 * Inserts into Supabase
 * 
 * Usage: node scripts/seed-recipes.js
 */

import fetch from 'node-fetch';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '..', '.env.local');

// Load environment variables
function loadEnv() {
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local not found');
    process.exit(1);
  }

  const content = fs.readFileSync(envPath, 'utf-8');
  const env = {};
  content.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      env[key.trim()] = value.trim().replace(/^["']|["']___BEGIN___COMMAND_DONE_MARKER___$LASTEXITCODE/g, '');
    }
  });
  return env;
}

const ENV = loadEnv();
console.log('✅ Environment loaded');
console.log('📡 Ready to fetch and seed recipes from Spoonacular API');
