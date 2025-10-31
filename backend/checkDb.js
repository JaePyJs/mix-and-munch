import { getDatabase } from './src/database/db.js';

const db = getDatabase();
const recipes = db.prepare('SELECT id, title, source_site FROM recipes LIMIT 5').all();
recipes.forEach(r => console.log(`${r.title.substring(0, 50)} - ${r.source_site}`));
const total = db.prepare('SELECT COUNT(*) as count FROM recipes').get();
console.log(`\nTotal recipes: ${total.count}`);
process.exit(0);
