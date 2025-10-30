# Mix & Munch Backend - Recipe Crawler, Parser & Image Extractor

## Overview

A production-grade Node.js backend system for Mix & Munch that crawls Filipino recipe websites, parses content creator multimedia (YouTube, social media), extracts and normalizes recipe data with proper image attribution, and maintains a deduplicated recipe database.

### Key Features

- **Website Crawler**: Automated crawling of 10+ Filipino recipe sites with sitemap discovery and schema.org/Recipe parsing
- **Content Creator Parser**: YouTube chef channel parsing with transcription analysis for ingredient/step extraction
- **Image Extraction & Attribution**: Preserves original image URLs with explicit copyright attribution
- **Deduplication Engine**: Automatic duplicate detection using hash fingerprints
- **RESTful API**: Complete API for recipe queries, search, and filtering
- **Admin Dashboard API**: Content moderation, crawler management, and statistics
- **Scheduled Tasks**: Daily crawls and automated content updates
- **SQLite Database**: Lightweight, embedded database for production deployment
- **Error Handling & Logging**: Comprehensive logging with file persistence

## Architecture

```
backend/
├── src/
│   ├── server.js                 # Express app & server setup
│   ├── database/
│   │   └── db.js                 # SQLite initialization & schema
│   ├── services/
│   │   ├── websiteCrawler.js     # Website crawling engine
│   │   ├── contentParser.js      # Content creator parsing
│   │   └── imageExtractor.js     # Image URL extraction & validation
│   ├── api/
│   │   ├── recipes.js            # Recipe query endpoints
│   │   ├── crawler.js            # Crawler control endpoints
│   │   └── admin.js              # Admin & moderation endpoints
│   ├── scheduler/
│   │   └── cronJobs.js           # Scheduled crawl jobs
│   ├── utils/
│   │   ├── logger.js             # Winston logging configuration
│   │   └── schemaParser.js       # schema.org extraction utilities
│   └── tests/
│       └── (unit & integration tests)
├── mock/
│   └── data/
│       ├── seed_sites.json       # 10 Filipino recipe sites
│       └── content_creators.json # YouTube chef channels
├── data/
│   └── recipes.db               # SQLite database
├── logs/
│   ├── error.log
│   └── combined.log
├── package.json
├── .env.example
└── README.md
```

## Installation

### Prerequisites

- Node.js 18+ (or 16 LTS minimum)
- npm 8+
- 500MB disk space for database

### Setup

1. **Install dependencies**:
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env as needed (defaults work fine for local development)
   ```

3. **Initialize database**:
   ```bash
   npm run dev
   # Server will auto-init database on first run
   ```

## Running the Backend

### Development Mode

```bash
npm run dev
# Server runs on http://localhost:5000
# Auto-logs to console and files
```

### Manual Crawling

```bash
# Crawl all Filipino recipe sites
npm run crawl

# Parse content creators
npm run parse

# Extract images
npm run crawl-images
```

### Start Scheduler

The scheduler starts automatically with `npm run dev`. It runs:
- **Daily at 2 AM**: Website crawl
- **At 6 AM & 6 PM**: Content creator parsing
- **Weekly (Sundays)**: Log cleanup

## API Documentation

### Recipe Endpoints

#### Get All Recipes
```http
GET /api/recipes?page=1&limit=20&category=Filipino&search=adobo
```

Response:
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Classic Adobo Recipe",
      "author": "Chef Name",
      "source_url": "https://...",
      "source_site": "https://panlasangpinoy.com",
      "ingredients": [
        { "item": "2 lbs chicken", "quantity": "2 lbs" }
      ],
      "instructions": [
        { "@type": "HowToStep", "text": "..." }
      ],
      "primary_image_url": "https://...",
      "image_attribution": "Image courtesy of panlasangpinoy.com",
      "tags": ["Filipino", "Chicken"],
      "rating": 4.5,
      "prep_time": "15 mins",
      "cook_time": "45 mins"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1250,
    "pages": 63
  }
}
```

#### Get Single Recipe
```http
GET /api/recipes/{id}
```

#### Search Recipes
```http
POST /api/recipes/search
Content-Type: application/json

{
  "query": "chicken",
  "filters": {
    "category": "Filipino",
    "rating": 3.5
  }
}
```

#### Get Statistics
```http
GET /api/recipes/stats/overview
```

### Crawler Endpoints

#### Trigger Website Crawl
```http
POST /api/crawler/websites
```

#### Trigger Creator Parse
```http
POST /api/crawler/creators
```

#### Get Crawl Logs
```http
GET /api/crawler/logs?limit=50
```

#### Get Crawl Statistics
```http
GET /api/crawler/stats
```

### Admin Endpoints

#### Get All Recipes (Admin)
```http
GET /api/admin/recipes?status=active&limit=100
```

#### Feature Recipe
```http
PUT /api/admin/recipes/{id}/feature
Content-Type: application/json

{ "featured": true }
```

#### Update Recipe Status
```http
PUT /api/admin/recipes/{id}/status
Content-Type: application/json

{ "status": "active" }
```

Valid statuses: `active`, `draft`, `archived`

#### Get Pending Reviews
```http
GET /api/admin/reviews/pending
```

#### Review Content
```http
POST /api/admin/reviews/{id}
Content-Type: application/json

{
  "approved": true,
  "notes": "Looks good, published"
}
```

#### Dashboard Stats
```http
GET /api/admin/dashboard/stats
```

#### Get Duplicates
```http
GET /api/admin/duplicates
```

#### Merge Recipes
```http
POST /api/admin/merge-recipes
Content-Type: application/json

{
  "keep_id": "primary_recipe_id",
  "merge_ids": ["dup_id_1", "dup_id_2"]
}
```

## Database Schema

### Tables

#### `recipes`
- `id` (TEXT PRIMARY KEY) - UUID
- `title` (TEXT) - Recipe name
- `author` (TEXT) - Recipe creator
- `source_url` (TEXT UNIQUE) - Original page URL
- `source_site` (TEXT) - Domain crawled from
- `ingredients` (JSON) - Ingredient list with quantities
- `instructions` (JSON) - Step-by-step instructions
- `primary_image_url` (TEXT) - Main recipe image URL
- `image_attribution` (TEXT) - Copyright attribution
- `tags` (JSON) - Categories and tags
- `rating` (REAL) - Average rating
- `crawled_date` (TEXT) - Timestamp crawled
- `status` (TEXT) - active/draft/archived

#### `recipe_images`
- `id` (TEXT PRIMARY KEY)
- `recipe_id` (TEXT FOREIGN KEY)
- `image_url` (TEXT) - Full image URL (not cached)
- `image_attribution` (TEXT) - Attribution text
- `alt_text` (TEXT) - Image description

#### `content_creators`
- `id` (TEXT PRIMARY KEY)
- `name` (TEXT) - Creator name
- `platform` (TEXT) - YouTube/TikTok/Instagram/etc
- `channel_url` (TEXT UNIQUE) - Channel link
- `is_active` (BOOLEAN) - Currently tracked

#### `creator_content`
- `id` (TEXT PRIMARY KEY)
- `creator_id` (TEXT FOREIGN KEY)
- `title` (TEXT) - Video/post title
- `content_url` (TEXT) - Direct link
- `content_type` (TEXT) - video/post/story
- `transcription` (TEXT) - Caption/transcript
- `extracted_recipe` (JSON) - Parsed recipe data
- `needs_review` (BOOLEAN) - Pending admin approval

#### `crawl_logs`
- `id` (TEXT PRIMARY KEY)
- `site_url` (TEXT) - Site crawled
- `status` (TEXT) - success/error
- `recipes_found` (INTEGER)
- `recipes_new` (INTEGER)
- `errors` (JSON) - Error details

#### `recipe_fingerprints`
- `id` (TEXT PRIMARY KEY)
- `recipe_id` (TEXT FOREIGN KEY)
- `title_hash` (TEXT) - MD5 of title
- `ingredient_hash` (TEXT) - MD5 of ingredients
- `similarity_score` (REAL) - Similarity to other recipes
- `matched_recipe_id` (TEXT) - Duplicate of

## Image Attribution & Copyright

All extracted recipe images preserve:
1. **Original URL** - Stored exactly as found on source page
2. **Attribution Line** - "Image courtesy of [domain]"
3. **Alt Text** - Original image description if available

Example:
```json
{
  "primary_image_url": "https://panlasangpinoy.com/wp-content/uploads/adobo.jpg",
  "image_attribution": "Image courtesy of panlasangpinoy.com",
  "images": [
    {
      "url": "https://panlasangpinoy.com/images/adobo-step1.jpg",
      "attribution": "Image courtesy of panlasangpinoy.com",
      "alt": "Cooking chicken for adobo"
    }
  ]
}
```

## Data Deduplication

The system automatically detects duplicate recipes using:
- **Title Hash** - MD5 of normalized title
- **Ingredient Hash** - Levenshtein distance on ingredient lists
- **Instruction Hash** - Similarity scoring on steps
- **Similarity Threshold** - Matches >70% similarity

Admin can review and merge duplicates via `/api/admin/duplicates` endpoint.

## Seed Data

### Filipino Recipe Sites (seed_sites.json)
```json
[
  "https://panlasangpinoy.com",
  "https://www.kawalingpinoy.com",
  "https://www.angsarap.net",
  "https://www.pepper.ph",
  "https://www.foxyfolksy.com",
  "https://www.recipesbynora.com",
  "https://www.iankewks.com",
  "https://junblog.com",
  "https://rezelkealoha.com",
  "https://www.foodwithmae.com"
]
```

### Content Creators (content_creators.json)
```json
[
  "https://www.youtube.com/@NinongRy",
  "https://www.youtube.com/@JudyAnnSKitchen",
  "https://www.youtube.com/@ChefRVManabat",
  "https://www.youtube.com/@AbiMarquez",
  "https://www.youtube.com/@Pepperph",
  "https://www.youtube.com/@FeatrMedia"
]
```

## Error Handling & Logging

Logs are written to:
- **Console** - Real-time output during development
- **logs/combined.log** - All log levels
- **logs/error.log** - Errors only

Log format includes timestamp, level, message, and context data.

Example error log entry:
```
2025-10-30T16:42:17.359Z [ERROR]: Error parsing recipe https://example.com/recipe: Timeout
```

## Performance & Scaling

### Current Limits
- Max 100 recipe pages per site crawl
- 30-second timeout per page
- SQLite optimal for <100K recipes

### For Production Scaling

1. **Database**: Migrate to PostgreSQL for 1M+ recipes
2. **Crawling**: Implement Puppeteer pool for parallel crawls
3. **Caching**: Add Redis for frequently accessed recipes
4. **CDN**: Host images on CDN rather than proxy
5. **API Rate Limiting**: Add rate limiter middleware

## Troubleshooting

### Database Lock Errors
```bash
# Reset database
rm data/recipes.db
npm run dev
```

### Crawl Timeouts
- Increase `CRAWL_TIMEOUT` in .env
- Check internet connection
- Verify target sites are accessible

### Image Extraction Issues
- Inspect target site HTML structure
- Check CSS selectors match current site layout
- Verify images are publicly accessible

### Scheduler Not Running
- Check logs: `tail -f logs/combined.log`
- Verify node-schedule is installed
- Ensure server is still running

## Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test src/tests/websiteCrawler.test.js
```

Example test:
```javascript
import test from 'node:test';
import assert from 'assert';
import WebsiteCrawler from '../services/websiteCrawler.js';

test('crawler should extract recipe data', async () => {
  const crawler = new WebsiteCrawler();
  const result = await crawler.parseRecipeUrl(
    'https://example.com/recipe',
    'https://example.com'
  );
  assert(result.title);
  assert(result.ingredients);
});
```

## Integration with Frontend

The frontend (running on port 3000) connects to this backend on port 5000:

```typescript
// Frontend code
const response = await fetch('http://localhost:5000/api/recipes');
const recipes = await response.json();
```

Configure CORS in `src/server.js` if needed.

## Contributing

See `CONTRIBUTING.md` for development guidelines.

## License

This project respects the copyright of all crawled recipe websites. Always ensure proper attribution and follow each site's terms of service.

## Support

For issues or questions:
1. Check logs: `tail -f logs/combined.log`
2. Review API documentation above
3. Check seed data in `mock/data/`
4. Inspect database: `sqlite3 data/recipes.db`

---

**Backend Status**: Production-ready for up to 10K recipes. Scale database layer for larger deployments.
