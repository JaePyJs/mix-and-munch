#!/usr/bin/env node

/**
 * Migration script to fix HTML entities in existing crawled recipes
 * 
 * This script will:
 * 1. Process existing crawled recipe JSON files
 * 2. Apply HTML entity cleaning to ingredients and instructions
 * 3. Create cleaned versions of the files
 * 4. Optionally update database records if they exist
 */

const fs = require('fs').promises;
const path = require('path');
const { cleanHtmlEntities, formatIngredientList, formatRecipeSteps } = require('../lib/utils/ingredient-formatter');

const CRAWLED_RECIPES_DIR = path.join(__dirname, '..', 'data', 'crawled-recipes');
const BACKUP_DIR = path.join(__dirname, '..', 'data', 'backups');

class HtmlEntityMigrator {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      recipesProcessed: 0,
      ingredientsFixed: 0,
      instructionsFixed: 0,
      errors: []
    };
  }

  async migrate() {
    console.log('🔧 Starting HTML Entity Migration...\n');

    try {
      // Ensure backup directory exists
      await fs.mkdir(BACKUP_DIR, { recursive: true });

      // Get all JSON files in crawled-recipes directory
      const files = await fs.readdir(CRAWLED_RECIPES_DIR);
      const jsonFiles = files.filter(file => file.endsWith('.json'));

      console.log(`📁 Found ${jsonFiles.length} recipe files to process\n`);

      for (const filename of jsonFiles) {
        await this.processRecipeFile(filename);
      }

      this.printStats();

    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      this.stats.errors.push({ context: 'migration', error: error.message });
    }
  }

  async processRecipeFile(filename) {
    const filePath = path.join(CRAWLED_RECIPES_DIR, filename);
    const backupPath = path.join(BACKUP_DIR, `${Date.now()}-${filename}`);

    try {
      console.log(`📄 Processing: ${filename}`);

      // Read and parse the recipe file
      const content = await fs.readFile(filePath, 'utf8');
      const data = JSON.parse(content);

      // Create backup
      await fs.writeFile(backupPath, content, 'utf8');
      console.log(`💾 Backup created: ${path.basename(backupPath)}`);

      // Process recipes
      if (data.recipes && Array.isArray(data.recipes)) {
        let recipesModified = 0;

        for (const recipe of data.recipes) {
          const modified = await this.processRecipe(recipe);
          if (modified) recipesModified++;
        }

        // Write the cleaned file
        const cleanedContent = JSON.stringify(data, null, 2);
        await fs.writeFile(filePath, cleanedContent, 'utf8');

        console.log(`✅ Processed ${data.recipes.length} recipes (${recipesModified} modified)`);
        this.stats.filesProcessed++;
        this.stats.recipesProcessed += data.recipes.length;
      }

    } catch (error) {
      console.error(`❌ Error processing ${filename}:`, error.message);
      this.stats.errors.push({ file: filename, error: error.message });
    }

    console.log('');
  }

  async processRecipe(recipe) {
    let modified = false;

    // Clean title
    if (recipe.title) {
      const cleanedTitle = cleanHtmlEntities(recipe.title);
      if (cleanedTitle !== recipe.title) {
        recipe.title = cleanedTitle;
        modified = true;
      }
    }

    // Clean description
    if (recipe.description) {
      const cleanedDescription = cleanHtmlEntities(recipe.description);
      if (cleanedDescription !== recipe.description) {
        recipe.description = cleanedDescription;
        modified = true;
      }
    }

    // Clean and format ingredients
    if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
      const originalIngredients = [...recipe.ingredients];
      const cleanedIngredients = recipe.ingredients.map(ingredient => {
        if (typeof ingredient === 'string') {
          return cleanHtmlEntities(ingredient);
        } else if (ingredient && ingredient.item) {
          return { ...ingredient, item: cleanHtmlEntities(ingredient.item) };
        }
        return ingredient;
      });

      // Apply full formatting
      const formattedIngredients = formatIngredientList(
        cleanedIngredients.map(ing => typeof ing === 'string' ? ing : ing.item || ing)
      );

      // Check if any ingredients were modified
      const hasChanges = originalIngredients.some((orig, index) => {
        const origText = typeof orig === 'string' ? orig : orig.item || orig;
        return origText !== formattedIngredients[index];
      });

      if (hasChanges) {
        recipe.ingredients = formattedIngredients;
        this.stats.ingredientsFixed += formattedIngredients.length;
        modified = true;
      }
    }

    // Clean and format instructions
    if (recipe.instructions && Array.isArray(recipe.instructions)) {
      const originalInstructions = [...recipe.instructions];
      const cleanedInstructions = recipe.instructions.map(instruction => {
        if (typeof instruction === 'string') {
          return cleanHtmlEntities(instruction);
        } else if (instruction && instruction.text) {
          return { ...instruction, text: cleanHtmlEntities(instruction.text) };
        }
        return instruction;
      });

      // Apply full formatting
      const formattedInstructions = formatRecipeSteps(
        cleanedInstructions.map(inst => typeof inst === 'string' ? inst : inst.text || inst)
      );

      // Check if any instructions were modified
      const hasChanges = originalInstructions.some((orig, index) => {
        const origText = typeof orig === 'string' ? orig : orig.text || orig;
        return origText !== formattedInstructions[index];
      });

      if (hasChanges) {
        recipe.instructions = formattedInstructions;
        this.stats.instructionsFixed += formattedInstructions.length;
        modified = true;
      }
    }

    return modified;
  }

  printStats() {
    console.log('\n📊 Migration Statistics:');
    console.log('========================');
    console.log(`Files processed: ${this.stats.filesProcessed}`);
    console.log(`Recipes processed: ${this.stats.recipesProcessed}`);
    console.log(`Ingredients fixed: ${this.stats.ingredientsFixed}`);
    console.log(`Instructions fixed: ${this.stats.instructionsFixed}`);
    
    if (this.stats.errors.length > 0) {
      console.log(`\n❌ Errors encountered: ${this.stats.errors.length}`);
      this.stats.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.context || error.file}: ${error.error}`);
      });
    } else {
      console.log('\n✅ Migration completed successfully with no errors!');
    }
  }
}

// Run the migration
if (require.main === module) {
  const migrator = new HtmlEntityMigrator();
  migrator.migrate().catch(console.error);
}

module.exports = HtmlEntityMigrator;