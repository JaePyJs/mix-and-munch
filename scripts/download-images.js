#!/usr/bin/env node
/**
 * Mix & Munch Recipe Image Downloader
 * Node.js version - easy to run with npm
 * 
 * Usage: node scripts/download-images.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

class ImageDownloader {
  constructor(outputDir = 'public/images/recipes') {
    this.outputDir = path.join(process.cwd(), outputDir);
    this.ensureDir();
  }

  ensureDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  download(url, filepath) {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;
      const dir = path.dirname(filepath);
      
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const request = protocol.get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`HTTP ${response.statusCode}`));
          return;
        }

        const file = fs.createWriteStream(filepath);
        response.pipe(file);

        file.on('finish', () => {
          file.close();
          console.log(`✅ Downloaded: ${path.basename(filepath)}`);
          resolve(filepath);
        });

        file.on('error', (err) => {
          fs.unlink(filepath, () => {}); // Delete partial file
          reject(err);
        });
      });

      request.on('error', (err) => {
        fs.unlink(filepath, () => {});
        reject(err);
      });

      request.setTimeout(5000);
    });
  }

  async downloadRecipeImages(recipesConfig) {
    console.log('\n' + '='.repeat(50));
    console.log('🍽️  Mix & Munch Recipe Image Downloader');
    console.log('='.repeat(50) + '\n');

    const results = {};
    let totalDownloaded = 0;

    for (const [dishName, config] of Object.entries(recipesConfig)) {
      console.log(`📥 Processing: ${config.name}`);
      
      const dishDir = path.join(this.outputDir, dishName);
      if (!fs.existsSync(dishDir)) {
        fs.mkdirSync(dishDir, { recursive: true });
      }

      const downloaded = [];

      // Sample image URLs (replace with real sources)
      // These are placeholder - replace with actual scraped URLs
      const imageUrls = config.imageUrls || this.getDefaultImages(dishName);

      for (let i = 0; i < imageUrls.length; i++) {
        const url = imageUrls[i];
        const filename = `${dishName}_${i + 1}.jpg`;
        const filepath = path.join(dishDir, filename);

        try {
          await this.download(url, filepath);
          downloaded.push(filepath);
          await this.sleep(500); // Rate limiting
        } catch (error) {
          console.log(`⚠️  Failed to download ${url}: ${error.message}`);
        }
      }

      results[dishName] = {
        name: config.name,
        images: downloaded,
        count: downloaded.length,
        path: dishDir
      };

      totalDownloaded += downloaded.length;

      if (downloaded.length > 0) {
        console.log(`✅ Downloaded ${downloaded.length} images for ${config.name}\n`);
      } else {
        console.log(`⚠️  No images downloaded for ${config.name}\n`);
      }
    }

    return { results, totalDownloaded };
  }

  getDefaultImages(dishName) {
    // Default images - in production, these would come from scraping
    const defaults = {
      'adobo': [
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80'
      ],
      'fried-rice': [
        'https://images.unsplash.com/photo-1609501676725-7186f017a4b0?w=400&q=80',
        'https://images.unsplash.com/photo-1609501676725-7186f017a4b0?w=400&q=80'
      ],
      'sinigang': [
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80'
      ],
      'kare-kare': [
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80'
      ],
      'lumpia': [
        'https://images.unsplash.com/photo-1608899375941-b574ec2f8522?w=400&q=80',
        'https://images.unsplash.com/photo-1608899375941-b574ec2f8522?w=400&q=80'
      ],
      'pancit': [
        'https://images.unsplash.com/photo-1609501676725-7186f017a4b0?w=400&q=80',
        'https://images.unsplash.com/photo-1609501676725-7186f017a4b0?w=400&q=80'
      ],
      'tinola': [
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80'
      ],
      'bangus': [
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80'
      ]
    };
    return defaults[dishName] || [];
  }

  generateManifest(results) {
    const manifest = {
      timestamp: new Date().toISOString(),
      totalRecipes: Object.keys(results).length,
      recipes: results
    };

    const manifestPath = path.join(this.outputDir, 'manifest.json');
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    
    console.log(`✅ Manifest saved to: ${manifestPath}`);
    return manifest;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Main execution
async function main() {
  const recipesConfig = {
    'adobo': {
      name: 'Filipino Adobo',
      description: 'Chicken/pork stewed in vinegar and soy sauce',
      imageUrls: null // Will use defaults
    },
    'fried-rice': {
      name: 'Garlic Fried Rice',
      description: 'Rice stir-fried with garlic and egg',
      imageUrls: null
    },
    'sinigang': {
      name: 'Sinigang',
      description: 'Pork or shrimp in tamarind broth',
      imageUrls: null
    },
    'kare-kare': {
      name: 'Kare-Kare',
      description: 'Stew with peanut sauce',
      imageUrls: null
    },
    'lumpia': {
      name: 'Lumpia',
      description: 'Spring rolls with meat filling',
      imageUrls: null
    },
    'pancit': {
      name: 'Pancit',
      description: 'Stir-fried noodles',
      imageUrls: null
    },
    'tinola': {
      name: 'Tinola',
      description: 'Chicken soup with ginger',
      imageUrls: null
    },
    'bangus': {
      name: 'Fried Bangus',
      description: 'Fried milkfish',
      imageUrls: null
    }
  };

  const downloader = new ImageDownloader();

  try {
    const { results, totalDownloaded } = await downloader.downloadRecipeImages(recipesConfig);
    downloader.generateManifest(results);

    console.log('\n' + '='.repeat(50));
    console.log('📊 Download Summary');
    console.log('='.repeat(50));
    console.log(`Total images downloaded: ${totalDownloaded}`);
    
    for (const [dish, data] of Object.entries(results)) {
      console.log(`  ${data.name}: ${data.count} images`);
    }

    console.log(`\n✅ Images saved to: ${downloader.outputDir}`);
    console.log('✅ Manifest created: public/images/recipes/manifest.json');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
