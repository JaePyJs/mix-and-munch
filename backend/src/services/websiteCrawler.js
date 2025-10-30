import axios from 'axios';
import * as cheerio from 'cheerio';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';
import { getDatabase } from '../database/db.js';
import { extractRecipeSchema } from '../utils/schemaParser.js';
import { extractImages, validateImageUrl } from './imageExtractor.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
const CRAWL_TIMEOUT = 30000;
const MAX_PAGES_PER_SITE = 100;

class WebsiteCrawler {
  constructor() {
    this.db = getDatabase();
    this.visitedUrls = new Set();
    this.crawlStats = {
      recipesFound: 0,
      recipesNew: 0,
      recipesUpdated: 0,
      errors: []
    };
  }

  async crawlSites() {
    try {
      const seedPath = path.join(__dirname, '../../mock/data/seed_sites.json');
      const seedData = await fs.readFile(seedPath, 'utf8');
      const sites = JSON.parse(seedData);

      logger.info(`Starting crawl for ${sites.length} sites`);

      for (const site of sites) {
        await this.crawlSite(site);
      }

      logger.info(`Crawl completed: ${JSON.stringify(this.crawlStats)}`);
      return this.crawlStats;
    } catch (error) {
      logger.error('Crawl error:', error);
      throw error;
    }
  }

  async crawlSite(siteUrl) {
    const startTime = new Date();
    let status = 'success';
    let errors = [];

    try {
      logger.info(`Starting crawl of ${siteUrl}`);

      // Get recipes from sitemap if available
      const sitemapRecipes = await this.fetchFromSitemap(siteUrl);
      
      // Get recipes from direct search/discovery
      const discoveredRecipes = await this.discoverRecipes(siteUrl);

      const allRecipes = [...new Set([...sitemapRecipes, ...discoveredRecipes])].slice(0, MAX_PAGES_PER_SITE);

      logger.info(`Found ${allRecipes.length} recipe URLs on ${siteUrl}`);

      for (const recipeUrl of allRecipes) {
        try {
          await this.parseRecipeUrl(recipeUrl, siteUrl);
          this.crawlStats.recipesFound++;
        } catch (error) {
          logger.warn(`Error parsing ${recipeUrl}: ${error.message}`);
          errors.push({ url: recipeUrl, error: error.message });
        }
      }
    } catch (error) {
      status = 'error';
      errors.push({ error: error.message });
      logger.error(`Crawl error for ${siteUrl}: ${error.message}`);
    }

    const endTime = new Date();
    this.logCrawl(siteUrl, status, errors, startTime, endTime);
  }

  async fetchFromSitemap(siteUrl) {
    const recipeUrls = [];
    try {
      const sitemapUrl = new URL('/sitemap.xml', siteUrl).toString();
      const response = await axios.get(sitemapUrl, { timeout: CRAWL_TIMEOUT });
      const $ = cheerio.load(response.data);

      $('loc').each((i, elem) => {
        const url = $(elem).text();
        if (url.toLowerCase().includes('recipe')) {
          recipeUrls.push(url);
        }
      });

      logger.info(`Found ${recipeUrls.length} recipe URLs in sitemap for ${siteUrl}`);
    } catch (error) {
      logger.debug(`Sitemap not found for ${siteUrl}: ${error.message}`);
    }

    return recipeUrls;
  }

  async discoverRecipes(siteUrl) {
    const recipeUrls = [];
    try {
      const response = await axios.get(siteUrl, {
        timeout: CRAWL_TIMEOUT,
        headers: { 'User-Agent': USER_AGENT }
      });

      const $ = cheerio.load(response.data);

      // Find schema.org/Recipe items
      const scripts = $('script[type="application/ld+json"]');
      scripts.each((i, elem) => {
        try {
          const data = JSON.parse($(elem).text());
          if (data['@type'] === 'Recipe' || (Array.isArray(data) && data.some(d => d['@type'] === 'Recipe'))) {
            const url = data.url || data.mainEntity?.url;
            if (url) recipeUrls.push(url);
          }
        } catch (e) {
          // Skip invalid JSON
        }
      });

      // Find recipe links in common patterns
      $('a[href*="recipe"]').each((i, elem) => {
        const href = $(elem).attr('href');
        if (href) {
          const url = new URL(href, siteUrl).toString();
          if (!recipeUrls.includes(url)) recipeUrls.push(url);
        }
      });

      logger.info(`Discovered ${recipeUrls.length} recipe URLs on ${siteUrl}`);
    } catch (error) {
      logger.warn(`Discovery error for ${siteUrl}: ${error.message}`);
    }

    return recipeUrls;
  }

  async parseRecipeUrl(recipeUrl, sourceSite) {
    if (this.visitedUrls.has(recipeUrl)) {
      logger.debug(`Already visited ${recipeUrl}`);
      return;
    }

    this.visitedUrls.add(recipeUrl);

    try {
      const response = await axios.get(recipeUrl, {
        timeout: CRAWL_TIMEOUT,
        headers: { 'User-Agent': USER_AGENT }
      });

      const $ = cheerio.load(response.data);

      // Try to extract schema.org/Recipe first
      let recipeData = extractRecipeSchema($);

      if (!recipeData || !recipeData.name) {
        // Fallback to manual extraction
        recipeData = this.manualExtractRecipe($, recipeUrl);
      }

      if (recipeData && recipeData.name) {
        // Extract images with attribution
        const images = await extractImages($, recipeUrl, sourceSite);
        recipeData.primaryImageUrl = images.primary || recipeData.image;
        recipeData.imageAttribution = images.attribution;
        recipeData.allImages = images.all;

        // Save to database
        await this.saveRecipe(recipeData, recipeUrl, sourceSite);
      }
    } catch (error) {
      logger.error(`Error parsing recipe ${recipeUrl}: ${error.message}`);
      throw error;
    }
  }

  manualExtractRecipe($, url) {
    const recipe = {
      name: this.extractTitle($),
      author: this.extractAuthor($),
      description: this.extractDescription($),
      ingredients: this.extractIngredients($),
      recipeInstructions: this.extractInstructions($),
      recipeYield: this.extractServings($),
      prepTime: this.extractPrepTime($),
      cookTime: this.extractCookTime($),
      totalTime: this.extractTotalTime($),
      keywords: this.extractTags($),
      image: this.extractPrimaryImage($),
      datePublished: this.extractPublishDate($),
      aggregateRating: this.extractRating($)
    };

    return recipe;
  }

  extractTitle($) {
    return (
      $('h1').first().text() ||
      $('h1[class*="recipe"]').first().text() ||
      $('meta[property="og:title"]').attr('content') ||
      $('title').text()
    ).trim().substring(0, 200);
  }

  extractAuthor($) {
    return (
      $('[class*="author"], [rel="author"]').first().text() ||
      $('meta[name="author"]').attr('content') ||
      ''
    ).trim();
  }

  extractDescription($) {
    return (
      $('meta[name="description"]').attr('content') ||
      $('[class*="description"], [class*="intro"]').first().text() ||
      ''
    ).trim().substring(0, 500);
  }

  extractIngredients($) {
    const ingredients = [];
    $('[class*="ingredient"], li[class*="ingredient"]').each((i, elem) => {
      const text = $(elem).text().trim();
      if (text) ingredients.push({ item: text });
    });
    return ingredients.length > 0 ? ingredients : [];
  }

  extractInstructions($) {
    const instructions = [];
    let stepNumber = 0;

    $('[class*="instruction"], [class*="step"], ol li').each((i, elem) => {
      const text = $(elem).text().trim();
      if (text && text.length > 5) {
        stepNumber++;
        instructions.push({
          '@type': 'HowToStep',
          text: text.substring(0, 500)
        });
      }
    });

    return instructions.length > 0 ? instructions : [];
  }

  extractServings($) {
    return $('[class*="servings"], [class*="yield"]').first().text().trim() || '';
  }

  extractPrepTime($) {
    return $('[class*="prep-time"], [class*="preptime"]').first().text().trim() || '';
  }

  extractCookTime($) {
    return $('[class*="cook-time"], [class*="cooktime"]').first().text().trim() || '';
  }

  extractTotalTime($) {
    return $('[class*="total-time"], [class*="totaltime"]').first().text().trim() || '';
  }

  extractTags($) {
    const tags = [];
    $('[class*="tag"], [class*="category"]').each((i, elem) => {
      const tag = $(elem).text().trim();
      if (tag) tags.push(tag);
    });
    return tags;
  }

  extractPrimaryImage($) {
    return (
      $('meta[property="og:image"]').attr('content') ||
      $('img[class*="recipe"], img[alt*="recipe"]').first().attr('src') ||
      $('img').first().attr('src') ||
      ''
    );
  }

  extractPublishDate($) {
    return (
      $('meta[property="article:published_time"]').attr('content') ||
      $('time[datetime]').attr('datetime') ||
      ''
    );
  }

  extractRating($) {
    const rating = $('[class*="rating"], [class*="stars"]').first().text();
    const match = rating.match(/(\d+\.?\d*)/);
    return match ? parseFloat(match[0]) : null;
  }

  async saveRecipe(recipeData, sourceUrl, sourceSite) {
    const id = uuidv4();
    const now = new Date().toISOString();

    const ingredients = Array.isArray(recipeData.ingredients)
      ? recipeData.ingredients
      : recipeData.recipeInstructions || [];

    const instructions = Array.isArray(recipeData.recipeInstructions)
      ? recipeData.recipeInstructions
      : [];

    try {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO recipes (
          id, title, author, source_url, source_site, description,
          servings, prep_time, cook_time, total_time,
          ingredients, instructions, tags, category,
          rating, review_count, primary_image_url, image_attribution,
          publication_date, crawled_date, last_updated, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        id,
        recipeData.name || 'Untitled',
        recipeData.author || '',
        sourceUrl,
        sourceSite,
        recipeData.description || '',
        recipeData.recipeYield || '',
        recipeData.prepTime || '',
        recipeData.cookTime || '',
        recipeData.totalTime || '',
        JSON.stringify(ingredients),
        JSON.stringify(instructions),
        JSON.stringify(recipeData.keywords || []),
        recipeData.category || 'Filipino',
        recipeData.aggregateRating?.ratingValue || null,
        recipeData.aggregateRating?.reviewCount || null,
        recipeData.primaryImageUrl || '',
        recipeData.imageAttribution || '',
        recipeData.datePublished || '',
        now,
        now,
        'active'
      );

      // Save additional images
      if (recipeData.allImages && Array.isArray(recipeData.allImages)) {
        const imgStmt = this.db.prepare(`
          INSERT INTO recipe_images (id, recipe_id, image_url, image_attribution, position)
          VALUES (?, ?, ?, ?, ?)
        `);

        recipeData.allImages.forEach((img, idx) => {
          imgStmt.run(uuidv4(), id, img.url, img.attribution, idx);
        });
      }

      this.crawlStats.recipesNew++;
      logger.info(`Saved recipe: ${recipeData.name}`);
    } catch (error) {
      logger.error(`Error saving recipe: ${error.message}`);
      throw error;
    }
  }

  logCrawl(siteUrl, status, errors, startTime, endTime) {
    const id = uuidv4();
    const duration = endTime - startTime;

    try {
      const stmt = this.db.prepare(`
        INSERT INTO crawl_logs (
          id, site_url, status, recipes_found, recipes_new, recipes_updated,
          errors, start_time, end_time, duration_ms
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        id,
        siteUrl,
        status,
        this.crawlStats.recipesFound,
        this.crawlStats.recipesNew,
        this.crawlStats.recipesUpdated,
        JSON.stringify(errors),
        startTime.toISOString(),
        endTime.toISOString(),
        duration
      );

      logger.info(`Crawl logged: ${siteUrl} - ${status}`);
    } catch (error) {
      logger.error(`Error logging crawl: ${error.message}`);
    }
  }
}

export default WebsiteCrawler;

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const crawler = new WebsiteCrawler();
  crawler.crawlSites().catch(console.error);
}
