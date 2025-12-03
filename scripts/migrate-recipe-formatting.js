#!/usr/bin/env node

/**
 * Recipe Formatting Migration Script
 * 
 * This script applies the new formatting standards to existing recipes in the database.
 * It processes recipes in batches to avoid overwhelming the database.
 * 
 * Usage:
 *   node migrate-recipe-formatting.js [--dry-run] [--batch-size=100] [--limit=1000]
 *   
 * Options:
 *   --dry-run      Show what would be changed without making actual updates
 *   --batch-size   Number of recipes to process in each batch (default: 100)
 *   --limit        Maximum number of recipes to process (default: all)
 *   
 * Examples:
 *   node migrate-recipe-formatting.js --dry-run
 *   node migrate-recipe-formatting.js --batch-size=50 --limit=500
 */

const fs = require('fs').promises;
const path = require('path');

// Import ingredient formatting utilities
const { 
  formatIngredientList, 
  formatRecipeSteps, 
  validateIngredientFormat 
} = require('../lib/utils/ingredient-formatter');

// Configuration
const CONFIG = {
  dataDir: path.join(__dirname, '..', 'data'),
  backupDir: path.join(__dirname, '..', 'data', 'backups'),
  batchSize: 100,
  limit: null,
  dryRun: false
};

class RecipeMigrator {
  constructor(options = {}) {
    this.config = { ...CONFIG, ...options };
    this.stats = {
      processed: 0,
      updated: 0,
      errors: 0,
      validationIssues: 0
    };
  }

  async init() {
    // Ensure backup directory exists
    await fs.mkdir(this.config.backupDir, { recursive: true });
    console.log(`Migration initialized. Backup directory: ${this.config.backupDir}`);
  }

  async findRecipeFiles() {
    const files = [];
    
    try {
      // Look for recipe files in data directory
      const dataFiles = await fs.readdir(this.config.dataDir);
      
      for (const file of dataFiles) {
        if (file.endsWith('.json') && (file.includes('recipe') || file.includes('crawled'))) {
          const filePath = path.join(this.config.dataDir, file);
          const stat = await fs.stat(filePath);
          
          if (stat.isFile()) {
            files.push(filePath);
          }
        }
      }
      
      // Also check subdirectories
      const subdirs = ['crawled-recipes', 'recipes', 'seed-data'];
      for (const subdir of subdirs) {
        const subdirPath = path.join(this.config.dataDir, subdir);
        
        try {
          const subdirFiles = await fs.readdir(subdirPath);
          for (const file of subdirFiles) {
            if (file.endsWith('.json')) {
              files.push(path.join(subdirPath, file));
            }
          }
        } catch (error) {
          // Subdirectory doesn't exist, skip
        }
      }
      
    } catch (error) {
      console.error('Error finding recipe files:', error.message);
    }
    
    return files;
  }

  async loadRecipes(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const data = JSON.parse(content);
      
      // Handle different file structures
      if (Array.isArray(data)) {
        return data;
      } else if (data.recipes && Array.isArray(data.recipes)) {
        return data.recipes;
      } else if (typeof data === 'object' && data.id) {
        return [data]; // Single recipe
      }
      
      return [];
    } catch (error) {
      console.error(`Error loading recipes from ${filePath}:`, error.message);
      return [];
    }
  }

  async backupFile(filePath) {
    const fileName = path.basename(filePath);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(this.config.backupDir, `${timestamp}_${fileName}`);
    
    await fs.copyFile(filePath, backupPath);
    console.log(`Backed up ${fileName} to ${path.basename(backupPath)}`);
  }

  formatRecipe(recipe) {
    const changes = [];
    const formatted = { ...recipe };
    
    // Format ingredients
    if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
      const originalIngredients = [...recipe.ingredients];
      formatted.ingredients = formatIngredientList(recipe.ingredients);
      
      // Check if ingredients changed
      const ingredientsChanged = JSON.stringify(originalIngredients) !== JSON.stringify(formatted.ingredients);
      if (ingredientsChanged) {
        changes.push('ingredients');
      }
      
      // Validate ingredients
      const validationResults = formatted.ingredients.map(ingredient => 
        validateIngredientFormat(ingredient)
      );
      
      const invalidIngredients = validationResults.filter(result => !result.isValid);
      if (invalidIngredients.length > 0) {
        this.stats.validationIssues++;
        changes.push(`validation_issues: ${invalidIngredients.length}`);
      }
    }
    
    // Format instructions
    if (recipe.instructions && Array.isArray(recipe.instructions)) {
      const originalInstructions = [...recipe.instructions];
      formatted.instructions = formatRecipeSteps(recipe.instructions);
      
      // Check if instructions changed
      const instructionsChanged = JSON.stringify(originalInstructions) !== JSON.stringify(formatted.instructions);
      if (instructionsChanged) {
        changes.push('instructions');
      }
    }
    
    // Standardize source attribution fields
    if (formatted.sourceUrl && !formatted.source_url) {
      formatted.source_url = formatted.sourceUrl;
      delete formatted.sourceUrl;
      changes.push('source_url');
    }

    // Add source_site field based on source_url
    if (formatted.source_url && !formatted.source_site) {
      try {
        const url = new URL(formatted.source_url);
        if (url.hostname === 'mixandmunch.app') {
          formatted.source_site = 'Mix and Munch';
        } else if (url.hostname === 'panlasangpinoy.com') {
          formatted.source_site = 'Panlasang Pinoy';
        } else if (url.hostname === 'kawalingpinoy.com' || url.hostname === 'www.kawalingpinoy.com') {
          formatted.source_site = 'Kawaling Pinoy';
        } else {
          formatted.source_site = url.hostname;
        }
        changes.push('source_site');
      } catch (error) {
        console.warn(`Invalid source URL for recipe "${formatted.title || formatted.name || 'Unknown'}": ${formatted.source_url}`);
      }
    }
    
    // Add migration metadata
    if (changes.length > 0) {
      formatted.formatting_migrated_at = new Date().toISOString();
      formatted.formatting_changes = changes;
    }
    
    return { formatted, changes };
  }

  async processFile(filePath) {
    console.log(`\nProcessing file: ${path.basename(filePath)}`);
    
    const recipes = await this.loadRecipes(filePath);
    if (recipes.length === 0) {
      console.log('No recipes found in file');
      return;
    }
    
    console.log(`Found ${recipes.length} recipes`);
    
    let fileUpdated = false;
    const processedRecipes = [];
    
    for (const recipe of recipes) {
      this.stats.processed++;
      
      if (this.config.limit && this.stats.processed > this.config.limit) {
        console.log(`Reached limit of ${this.config.limit} recipes`);
        break;
      }
      
      try {
        const { formatted, changes } = this.formatRecipe(recipe);
        
        if (changes.length > 0) {
          this.stats.updated++;
          fileUpdated = true;
          
          if (!this.config.dryRun) {
            processedRecipes.push(formatted);
          } else {
            processedRecipes.push(recipe);
          }
          
          console.log(`  ✓ Updated recipe "${recipe.title || recipe.name || 'Unknown'}" (${changes.join(', ')})`);
        } else {
          processedRecipes.push(recipe);
          console.log(`  - No changes needed for "${recipe.title || recipe.name || 'Unknown'}"`);
        }
        
      } catch (error) {
        this.stats.errors++;
        processedRecipes.push(recipe);
        console.error(`  ✗ Error processing recipe "${recipe.title || recipe.name || 'Unknown'}":`, error.message);
      }
    }
    
    // Save updated file if changes were made
    if (fileUpdated && !this.config.dryRun) {
      await this.backupFile(filePath);
      
      // Determine the structure to save
      const originalContent = await fs.readFile(filePath, 'utf8');
      const originalData = JSON.parse(originalContent);
      
      let dataToSave;
      if (Array.isArray(originalData)) {
        dataToSave = processedRecipes;
      } else if (originalData.recipes) {
        dataToSave = { ...originalData, recipes: processedRecipes };
      } else {
        dataToSave = processedRecipes[0]; // Single recipe
      }
      
      await fs.writeFile(filePath, JSON.stringify(dataToSave, null, 2), 'utf8');
      console.log(`  💾 Saved updated file`);
    }
  }

  async migrate() {
    console.log('🚀 Starting recipe formatting migration...\n');
    console.log(`Configuration:`);
    console.log(`  - Dry run: ${this.config.dryRun}`);
    console.log(`  - Batch size: ${this.config.batchSize}`);
    console.log(`  - Limit: ${this.config.limit || 'none'}`);
    
    const recipeFiles = await this.findRecipeFiles();
    console.log(`\nFound ${recipeFiles.length} recipe files to process`);
    
    if (recipeFiles.length === 0) {
      console.log('No recipe files found. Make sure you have recipe data in the data directory.');
      return;
    }
    
    for (const filePath of recipeFiles) {
      await this.processFile(filePath);
      
      if (this.config.limit && this.stats.processed >= this.config.limit) {
        break;
      }
    }
    
    this.printStats();
  }

  printStats() {
    console.log('\n📊 Migration Statistics:');
    console.log(`  - Recipes processed: ${this.stats.processed}`);
    console.log(`  - Recipes updated: ${this.stats.updated}`);
    console.log(`  - Validation issues: ${this.stats.validationIssues}`);
    console.log(`  - Errors: ${this.stats.errors}`);
    
    if (this.config.dryRun) {
      console.log('\n⚠️  This was a dry run. No files were actually modified.');
      console.log('   Remove --dry-run flag to apply changes.');
    } else {
      console.log('\n✅ Migration completed successfully!');
      console.log(`   Backups saved to: ${this.config.backupDir}`);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const options = {};
  
  // Parse command line arguments
  for (const arg of args) {
    if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg.startsWith('--batch-size=')) {
      options.batchSize = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--limit=')) {
      options.limit = parseInt(arg.split('=')[1]);
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Recipe Formatting Migration Script

Usage:
  node migrate-recipe-formatting.js [options]

Options:
  --dry-run           Show what would be changed without making updates
  --batch-size=N      Number of recipes to process in each batch (default: 100)
  --limit=N           Maximum number of recipes to process (default: all)
  --help, -h          Show this help message

Examples:
  node migrate-recipe-formatting.js --dry-run
  node migrate-recipe-formatting.js --batch-size=50 --limit=500
      `);
      return;
    }
  }
  
  const migrator = new RecipeMigrator(options);
  await migrator.init();
  await migrator.migrate();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { RecipeMigrator };