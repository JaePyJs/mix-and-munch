#!/usr/bin/env node

/**
 * Mix & Munch Recipe Web Crawler
 * 
 * Enhanced Node.js crawler for Filipino recipe websites
 * Supports multiple sources including panlasangpinoy.com
 * 
 * Usage:
 *   node scripts/crawl-recipes.js
 *   node scripts/crawl-recipes.js --source=panlasangpinoy
 *   node scripts/crawl-recipes.js --limit=10
 */

const axios = require('axios');
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
  outputDir: path.join(__dirname, '..', 'data', 'crawled-recipes'),
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  timeout: 10000,
  delay: 1000, // Delay between requests to be respectful
  maxRetries: 3
};

// Recipe sources configuration
const RECIPE_SOURCES = {
  panlasangpinoy: {
    name: 'Panlasang Pinoy',
    baseUrl: 'https://panlasangpinoy.com',
    categories: {
      'main-dish': 'https://panlasangpinoy.com/categories/recipes/main-dish-recipes/',
      'filipino': 'https://panlasangpinoy.com/categories/recipes/filipino-recipes/',
      'pasta': 'https://panlasangpinoy.com/categories/recipes/pasta-recipes/',
      'chicken': 'https://panlasangpinoy.com/categories/recipes/chicken-recipes/',
      'pork': 'https://panlasangpinoy.com/categories/recipes/pork-recipes/',
      'beef': 'https://panlasangpinoy.com/categories/recipes/beef-recipes/'
    },
    selectors: {
      recipeLinks: 'h2.entry-title a, .recipe-title a, article h2 a, .post-title a',
      title: 'h1.entry-title, .recipe-title h1, .wp-recipe-card-title, .post-title',
      description: '.recipe-summary, .entry-content p:first-of-type, meta[property="og:description"]',
      ingredients: '.wprm-recipe-ingredient, .recipe-ingredient, .ingredients li',
      instructions: '.wprm-recipe-instruction-text, .recipe-instruction, .instructions li, .directions li',
      image: '.wprm-recipe-image img, .recipe-image img, .entry-content img:first-of-type, meta[property="og:image"]',
      prepTime: '.wprm-recipe-prep_time, .prep-time, [class*="prep"]',
      cookTime: '.wprm-recipe-cook_time, .cook-time, [class*="cook"]',
      servings: '.wprm-recipe-servings, .servings, [class*="serving"]'
    }
  },
  kawalingpinoy: {
    name: 'Kawaling Pinoy',
    baseUrl: 'https://www.kawalingpinoy.com',
    categories: {
      'main-dishes': 'https://www.kawalingpinoy.com/category/main-dishes/',
      'appetizers': 'https://www.kawalingpinoy.com/category/appetizers/',
      'desserts': 'https://www.kawalingpinoy.com/category/desserts/',
      'beverages': 'https://www.kawalingpinoy.com/category/beverages/'
    },
    selectors: {
      recipeLinks: '.entry-title a, .recipe-title a',
      title: 'h1.entry-title, .recipe-title',
      description: '.entry-content p:first-of-type, meta[property="og:description"]',
      ingredients: '.recipe-ingredient, .ingredients li',
      instructions: '.recipe-instruction, .instructions li',
      image: '.entry-content img:first-of-type, meta[property="og:image"]',
      prepTime: '.prep-time, [class*="prep"]',
      cookTime: '.cook-time, [class*="cook"]',
      servings: '.servings, [class*="serving"]'
    }
  }
};

class RecipeCrawler {
  constructor(options = {}) {
    this.options = { ...CONFIG, ...options };
    this.stats = {
      totalProcessed: 0,
      successful: 0,
      failed: 0,
      errors: []
    };
  }

  async init() {
    // Create output directory
    await fs.mkdir(this.options.outputDir, { recursive: true });
    console.log(`🚀 Mix & Munch Recipe Crawler initialized`);
    console.log(`📁 Output directory: ${this.options.outputDir}`);
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async fetchWithRetry(url, retries = 0) {
    try {
      console.log(`🌐 Fetching: ${url}`);
      const response = await axios.get(url, {
        timeout: this.options.timeout,
        headers: {
          'User-Agent': this.options.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive'
        }
      });
      return response.data;
    } catch (error) {
      if (retries < this.options.maxRetries) {
        console.log(`⚠️  Retry ${retries + 1}/${this.options.maxRetries} for ${url}`);
        await this.delay(2000 * (retries + 1)); // Exponential backoff
        return this.fetchWithRetry(url, retries + 1);
      }
      throw error;
    }
  }

  parseHtml(html) {
    // Simple HTML parsing without external dependencies
    const extractText = (html, selector) => {
      // Basic regex-based extraction for common patterns
      const patterns = {
        'h1': /<h1[^>]*>(.*?)<\/h1>/gi,
        'title': /<title[^>]*>(.*?)<\/title>/gi,
        'meta-description': /<meta[^>]*property=["']og:description["'][^>]*content=["'](.*?)["']/gi,
        'meta-image': /<meta[^>]*property=["']og:image["'][^>]*content=["'](.*?)["']/gi
      };

      if (selector.includes('meta[property="og:description"]')) {
        const match = patterns['meta-description'].exec(html);
        return match ? match[1] : '';
      }
      
      if (selector.includes('meta[property="og:image"]')) {
        const match = patterns['meta-image'].exec(html);
        return match ? match[1] : '';
      }

      if (selector.includes('h1')) {
        const match = patterns['h1'].exec(html);
        return match ? match[1].replace(/<[^>]*>/g, '') : '';
      }

      return '';
    };

    const extractLinks = (html, selector) => {
      // More comprehensive link extraction
      const linkRegex = /<a[^>]*href=["'](.*?)["'][^>]*>(.*?)<\/a>/gi;
      const titleRegex = /<h[1-6][^>]*class="[^"]*(?:entry-title|post-title|recipe-title)[^"]*"[^>]*>.*?<a[^>]*href=["'](.*?)["'][^>]*>(.*?)<\/a>.*?<\/h[1-6]>/gi;
      
      const links = [];
      let match;
      
      // First try to extract from title elements
      while ((match = titleRegex.exec(html)) !== null) {
        const href = match[1];
        const text = match[2].replace(/<[^>]*>/g, '');
        
        if (href && !href.startsWith('#') && !href.includes('javascript:')) {
          links.push(href);
        }
      }
      
      // If no title links found, try general links
      if (links.length === 0) {
        const linkRegex2 = /<a[^>]*href=["'](.*?)["'][^>]*>(.*?)<\/a>/gi;
        while ((match = linkRegex2.exec(html)) !== null) {
          const href = match[1];
          const text = match[2].replace(/<[^>]*>/g, '');
          
          // Filter for recipe-related links
          if (href && (href.includes('/recipe') || href.includes('/20') || text.toLowerCase().includes('recipe'))) {
            links.push(href);
          }
        }
      }
      
      return [...new Set(links)]; // Remove duplicates
    };

    return { extractText, extractLinks };
  }

  async crawlSource(sourceName, limit = 50) {
    const source = RECIPE_SOURCES[sourceName];
    if (!source) {
      throw new Error(`Unknown source: ${sourceName}`);
    }

    console.log(`\n🎯 Crawling ${source.name}...`);
    const recipes = [];

    for (const [category, categoryUrl] of Object.entries(source.categories)) {
      console.log(`\n📂 Processing category: ${category}`);
      
      try {
        const html = await this.fetchWithRetry(categoryUrl);
        const parser = this.parseHtml(html);
        
        // Extract recipe links
        const recipeLinks = parser.extractLinks(html, source.selectors.recipeLinks);
        console.log(`🔗 Found ${recipeLinks.length} recipe links in ${category}`);

        // Process each recipe (limited)
        const categoryLimit = Math.ceil(limit / Object.keys(source.categories).length);
        const linksToProcess = recipeLinks.slice(0, categoryLimit);

        for (const link of linksToProcess) {
          try {
            await this.delay(this.options.delay); // Be respectful
            
            const fullUrl = link.startsWith('http') ? link : `${source.baseUrl}${link}`;
            const recipe = await this.scrapeRecipe(fullUrl, source, category);
            
            if (recipe) {
              recipes.push(recipe);
              this.stats.successful++;
              console.log(`✅ Scraped: ${recipe.title}`);
            }
          } catch (error) {
            this.stats.failed++;
            this.stats.errors.push({ url: link, error: error.message });
            console.log(`❌ Failed to scrape ${link}: ${error.message}`);
          }
          
          this.stats.totalProcessed++;
        }
      } catch (error) {
        console.log(`❌ Failed to process category ${category}: ${error.message}`);
        this.stats.errors.push({ category, error: error.message });
      }
    }

    return recipes;
  }

  async scrapeRecipe(url, source, category) {
    const html = await this.fetchWithRetry(url);
    const parser = this.parseHtml(html);

    // Extract recipe data with multiple fallback methods
    let title = parser.extractText(html, source.selectors.title);
    if (!title) {
      // Fallback: extract from title tag
      const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
      title = titleMatch ? titleMatch[1].replace(/\s*-\s*Panlasang Pinoy.*$/i, '').trim() : '';
    }

    let description = parser.extractText(html, source.selectors.description);
    if (!description) {
      // Fallback: extract first paragraph from content
      const descMatch = html.match(/<p[^>]*>(.*?)<\/p>/i);
      description = descMatch ? descMatch[1].replace(/<[^>]*>/g, '').trim() : '';
    }

    const image = parser.extractText(html, source.selectors.image);

    // Enhanced ingredient extraction with multiple patterns
    const ingredientPatterns = [
      /<li[^>]*class="[^"]*ingredient[^"]*"[^>]*>(.*?)<\/li>/gi,
      /<li[^>]*>(.*?(?:cup|tbsp|tsp|pound|lb|oz|gram|kg|piece|pcs|clove|slice).*?)<\/li>/gi,
      /<p[^>]*>(.*?(?:cup|tbsp|tsp|pound|lb|oz|gram|kg|piece|pcs|clove|slice).*?)<\/p>/gi
    ];

    let ingredients = [];
    for (const pattern of ingredientPatterns) {
      const matches = html.match(pattern) || [];
      const extracted = matches.map(match => 
        match.replace(/<[^>]*>/g, '').trim()
      ).filter(Boolean);
      
      if (extracted.length > 0) {
        ingredients = extracted;
        break;
      }
    }

    // Enhanced instruction extraction with multiple patterns
    const instructionPatterns = [
      /<li[^>]*class="[^"]*instruction[^"]*"[^>]*>(.*?)<\/li>/gi,
      /<li[^>]*class="[^"]*step[^"]*"[^>]*>(.*?)<\/li>/gi,
      /<p[^>]*class="[^"]*step[^"]*"[^>]*>(.*?)<\/p>/gi,
      /<ol[^>]*>.*?<li[^>]*>(.*?)<\/li>.*?<\/ol>/gi,
      /<div[^>]*class="[^"]*instruction[^"]*"[^>]*>.*?<p[^>]*>(.*?)<\/p>.*?<\/div>/gi
    ];

    let instructions = [];
    for (const pattern of instructionPatterns) {
      const matches = html.match(pattern) || [];
      const extracted = matches.map(match => 
        match.replace(/<[^>]*>/g, '').trim()
      ).filter(Boolean);
      
      if (extracted.length > 0) {
        instructions = extracted;
        break;
      }
    }

    // If still no instructions, try to extract numbered steps
    if (instructions.length === 0) {
      const stepMatches = html.match(/(?:step\s*)?(\d+)[.:]\s*([^.!?]*[.!?])/gi) || [];
      instructions = stepMatches.map(match => 
        match.replace(/^(?:step\s*)?\d+[.:]\s*/i, '').trim()
      ).filter(Boolean);
    }

    // Validate essential data - be more lenient
    if (!title || title.length < 3) {
      throw new Error('Missing or invalid recipe title');
    }

    // Accept recipes with either ingredients or instructions (some might have one but not the other)
    if (ingredients.length === 0 && instructions.length === 0) {
      throw new Error('Missing both ingredients and instructions');
    }

    // Apply formatting utilities to clean and standardize the data
    const formattedIngredients = formatIngredientList(ingredients);
    const formattedInstructions = formatRecipeSteps(instructions);

    // Validate ingredient formatting
    const validationResults = formattedIngredients.map(ingredient => 
      validateIngredientFormat(ingredient)
    );
    
    // Log any validation warnings (but don't fail the crawl)
    const invalidIngredients = validationResults.filter(result => !result.isValid);
    if (invalidIngredients.length > 0) {
      console.warn(`Recipe "${title}" has ${invalidIngredients.length} ingredients with formatting issues`);
    }

    return {
      id: this.generateId(url),
      title: title.trim(),
      description: description.trim(),
      category: category,
      ingredients: formattedIngredients,
      instructions: formattedInstructions,
      image_url: image,
      source_url: url,
      source_site: source.name,
      crawled_at: new Date().toISOString(),
      prep_time: '',
      cook_time: '',
      servings: ''
    };
  }

  generateId(url) {
    // Simple ID generation based on URL
    return Buffer.from(url).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  }

  async saveRecipes(recipes, sourceName) {
    const filename = `${sourceName}-recipes-${Date.now()}.json`;
    const filepath = path.join(this.options.outputDir, filename);
    
    const output = {
      source: sourceName,
      crawled_at: new Date().toISOString(),
      total_recipes: recipes.length,
      recipes: recipes,
      statistics: this.stats
    };

    await fs.writeFile(filepath, JSON.stringify(output, null, 2));
    console.log(`💾 Saved ${recipes.length} recipes to ${filepath}`);
    
    return filepath;
  }

  printStats() {
    console.log('\n📊 Crawling Statistics:');
    console.log(`   Total processed: ${this.stats.totalProcessed}`);
    console.log(`   Successful: ${this.stats.successful}`);
    console.log(`   Failed: ${this.stats.failed}`);
    console.log(`   Success rate: ${((this.stats.successful / this.stats.totalProcessed) * 100).toFixed(1)}%`);
    
    if (this.stats.errors.length > 0) {
      console.log(`\n⚠️  Errors encountered: ${this.stats.errors.length}`);
      this.stats.errors.slice(0, 5).forEach(error => {
        console.log(`   - ${error.url || error.category}: ${error.error}`);
      });
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const options = {};
  
  // Parse command line arguments
  args.forEach(arg => {
    if (arg.startsWith('--source=')) {
      options.source = arg.split('=')[1];
    } else if (arg.startsWith('--limit=')) {
      options.limit = parseInt(arg.split('=')[1]);
    }
  });

  const source = options.source || 'panlasangpinoy';
  const limit = options.limit || 20;

  console.log('🍲 Mix & Munch Recipe Crawler');
  console.log('================================');
  console.log(`Source: ${source}`);
  console.log(`Limit: ${limit} recipes`);

  try {
    const crawler = new RecipeCrawler();
    await crawler.init();

    const recipes = await crawler.crawlSource(source, limit);
    const filepath = await crawler.saveRecipes(recipes, source);
    
    crawler.printStats();
    
    console.log('\n🎉 Crawling completed successfully!');
    console.log(`📄 Results saved to: ${filepath}`);
    
  } catch (error) {
    console.error('\n❌ Crawling failed:', error.message);
    process.exit(1);
  }
}

// Export for use as module
module.exports = { RecipeCrawler, RECIPE_SOURCES };

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}