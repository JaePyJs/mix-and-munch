# Mix & Munch Backend: Website Crawler, Content Parser & Image Extractor

**Capstone Component**: Production-grade backend system for recipe data ingestion  
**Tech Stack**: Node.js/Python, Scrapy/Playwright, PostgreSQL/SQLite, REST API  
**AI Integration**: Gemini API + GLM-4.6 (NOT local Ollama as originally specified)  

---

## 🎯 MISSION (From Your Prompt)

Build a **full production-grade backend system** that:

1. **Crawls Filipino recipe websites** from seed list
2. **Parses content creator videos** (YouTube, social media)
3. **Extracts and attributes images** with copyright respect
4. **Maintains deduplicated recipe database** with unified schema
5. **Powers Gemini AI chatbot** with curated recipe data
6. **Provides admin tools** for moderation and scheduling

---

## 📊 SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                    Mix & Munch Backend System               │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
    ┌───▼────┐          ┌────▼──────┐        ┌─────▼──────┐
    │ Website│          │  Content  │        │   Image    │
    │Crawler │          │  Creator  │        │ Extraction │
    │(Scrapy)│          │  Parser   │        │ & Attribution
    └───┬────┘          └────┬──────┘        └─────┬──────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                    ┌─────────▼────────┐
                    │   Normalization  │
                    │ & Deduplication  │
                    └─────────┬────────┘
                              │
                    ┌─────────▼──────────┐
                    │ Recipe Database    │
                    │ (PostgreSQL/SQLite)│
                    └─────────┬──────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
    ┌───▼────┐          ┌────▼──────┐        ┌─────▼──────┐
    │  REST  │          │  Gemini   │        │   Admin    │
    │  API   │          │ AI Chatbot│        │ Dashboard  │
    └────────┘          └───────────┘        └────────────┘
```

---

## 🌐 SEED DATA

### Website Crawl List (seed_sites.json)
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

### Content Creator Channels (content_creators.json)
```json
[
  {
    "name": "Ninong Ry",
    "url": "https://www.youtube.com/@NinongRy",
    "platform": "youtube"
  },
  {
    "name": "Judy Ann's Kitchen",
    "url": "https://www.youtube.com/@JudyAnnSKitchen",
    "platform": "youtube"
  },
  {
    "name": "Chef RV Manabat",
    "url": "https://www.youtube.com/@ChefRVManabat",
    "platform": "youtube"
  },
  {
    "name": "Abi Marquez",
    "url": "https://www.youtube.com/@AbiMarquez",
    "platform": "youtube"
  },
  {
    "name": "Pepper PH",
    "url": "https://www.youtube.com/@Pepperph",
    "platform": "youtube"
  },
  {
    "name": "Featr Media",
    "url": "https://www.youtube.com/@FeatrMedia",
    "platform": "youtube"
  }
]
```

---

## 🏗️ DIRECTORY STRUCTURE

```
mix-munch-backend/
├── src/
│   ├── crawlers/
│   │   ├── website_crawler.js          # Scrapy/Playwright crawler
│   │   ├── youtube_parser.js            # YouTube video parser
│   │   └── social_parser.js             # Social media parser
│   ├── services/
│   │   ├── image_extractor.js           # Image URL & attribution
│   │   ├── normalizer.js                # Recipe data normalization
│   │   ├── deduplicator.js              # Remove duplicate recipes
│   │   └── database.js                  # DB connections
│   ├── api/
│   │   ├── routes/
│   │   │   ├── recipes.js               # GET recipes
│   │   │   ├── admin.js                 # Admin endpoints
│   │   │   └── health.js                # Health checks
│   │   └── server.js                    # Express/Fastify setup
│   ├── schedulers/
│   │   ├── crawler_schedule.js          # Daily/weekly crawls
│   │   └── parser_schedule.js           # Video parsing schedule
│   ├── admin/
│   │   ├── dashboard.js                 # Web UI for moderation
│   │   └── review_queue.js              # Incomplete recipe review
│   └── utils/
│       ├── logger.js                    # Logging
│       ├── config.js                    # Config management
│       └── validators.js                # Data validation
├── mock/
│   ├── data/
│   │   ├── seed_sites.json              # Website seed list
│   │   ├── content_creators.json        # Creator seed list
│   │   └── sample_recipes.json          # Example output
│   └── responses/
│       └── sample_crawl_output.json     # Mock crawler response
├── db/
│   ├── schema.sql                       # Database schema
│   └── migrations/                      # Schema versions
├── tests/
│   ├── unit/
│   │   ├── crawler.test.js
│   │   ├── parser.test.js
│   │   └── normalizer.test.js
│   ├── integration/
│   │   ├── crawler_api.test.js
│   │   └── end_to_end.test.js
│   └── fixtures/
│       └── sample_html.html             # Test HTML pages
├── docs/
│   ├── README.md                        # Installation & usage
│   ├── API_DOCS.md                      # API endpoints
│   ├── CRAWLER_GUIDE.md                 # Crawler configuration
│   └── ARCHITECTURE.md                  # System design
├── .env.example                         # Environment template
├── package.json                         # Node.js dependencies
└── docker-compose.yml                   # Docker setup

```

---

## 📋 CORE COMPONENTS

### 1. Website Crawler (Scrapy/Playwright)

**Responsibilities:**
- Auto-discover recipe URLs via sitemaps, site search, schema.org/Recipe tags
- Extract recipe data:
  - Title, author, publication date, URL
  - Ingredient lists (with quantities, notes)
  - Instruction steps
  - Tags/categories
  - Ratings & reviews
  - **Primary recipe image URL** (with attribution field)
  
**Data Schema:**
```json
{
  "id": "recipe_uuid",
  "source_site": "panlasangpinoy.com",
  "source_url": "https://panlasangpinoy.com/chicken-adobo",
  "title": "Chicken Adobo",
  "author": "Marvin Kuya",
  "published_date": "2023-01-15",
  "image_url": "https://panlasangpinoy.com/images/chicken-adobo.jpg",
  "image_attribution": "Image courtesy of panlasangpinoy.com",
  "ingredients": [
    {
      "name": "chicken",
      "quantity": 2,
      "unit": "kg",
      "notes": "cut into pieces"
    }
  ],
  "instructions": [
    "Heat oil in a pan",
    "Add garlic and onions"
  ],
  "tags": ["Filipino", "Chicken", "Adobo", "Easy"],
  "rating": 4.8,
  "reviews_count": 150,
  "crawled_at": "2025-10-30T20:59:38Z"
}
```

### 2. Content Creator Parser (YouTube/Social)

**Responsibilities:**
- Fetch YouTube video transcripts/captions
- NLP parse for ingredients, steps, cultural notes
- Extract video metadata:
  - Creator name, channel URL
  - Video title, publication date
  - Thumbnail URL, video duration

**Output Schema:**
```json
{
  "id": "recipe_uuid",
  "source": "youtube",
  "creator_name": "Judy Ann",
  "channel_url": "https://www.youtube.com/@JudyAnnSKitchen",
  "video_url": "https://www.youtube.com/watch?v=xyz123",
  "video_title": "How to Make Sinigang",
  "published_date": "2024-09-20",
  "thumbnail_url": "https://i.ytimg.com/vi/xyz123/maxresdefault.jpg",
  "title": "Sinigang Recipe",
  "ingredients": [...],
  "instructions": [...],
  "cultural_notes": "A traditional Filipino stew",
  "extracted_from_transcript": true,
  "confidence_score": 0.92
}
```

### 3. Image Extraction & Attribution

**Responsibilities:**
- Extract image URLs directly from recipe pages
- Store original URL (not hot-link copy)
- Add explicit attribution: "Image courtesy of [source]"
- Handle missing/broken images gracefully

**Implementation Pattern:**
```typescript
interface RecipeImage {
  original_url: string;              // Keep original URL
  source_domain: string;             // e.g., "panlasangpinoy.com"
  attribution_text: string;          // "Image courtesy of..."
  alt_text?: string;                 // Accessibility
  extracted_at: Date;
  status: "active" | "broken" | "pending_review";
}
```

### 4. Normalization & Deduplication

**Deduplication Strategy:**
- Title + Author similarity (Levenshtein Distance)
- Ingredient list fuzzy matching
- URL canonicalization
- Mark duplicates with `parent_recipe_id`

**Normalization Rules:**
- Standardize ingredient units (tsp → 5ml)
- Normalize ingredient names (garlic → garlic, minced)
- Titlecase recipe titles
- Remove HTML tags from descriptions

### 5. Recipe Database Schema

```sql
CREATE TABLE recipes (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Source tracking
  source_type ENUM('website', 'youtube', 'social'),
  source_url VARCHAR(512),
  source_domain VARCHAR(255),
  
  -- Author & metadata
  author VARCHAR(255),
  published_date TIMESTAMP,
  
  -- Image with attribution
  image_url VARCHAR(512),
  image_attribution VARCHAR(512),
  
  -- Content
  ingredients JSONB,
  instructions JSONB,
  tags JSONB,
  
  -- Quality metrics
  rating FLOAT,
  reviews_count INT,
  extraction_confidence FLOAT,
  
  -- Deduplication
  is_duplicate BOOLEAN DEFAULT FALSE,
  parent_recipe_id UUID REFERENCES recipes(id),
  
  -- Timestamps
  crawled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_title_author (title, author),
  INDEX idx_source_url (source_url),
  INDEX idx_parent_recipe (parent_recipe_id)
);

CREATE TABLE ingredients_master (
  id UUID PRIMARY KEY,
  canonical_name VARCHAR(255) NOT NULL UNIQUE,
  variations JSONB,  -- ["garlic", "minced garlic", "garlics"]
  category VARCHAR(50),  -- "vegetable", "protein", "spice"
  created_at TIMESTAMP
);

CREATE TABLE crawl_logs (
  id UUID PRIMARY KEY,
  source_domain VARCHAR(255),
  status ENUM('success', 'partial_failure', 'failure'),
  recipes_crawled INT,
  recipes_new INT,
  recipes_duplicate INT,
  errors JSONB,
  crawled_at TIMESTAMP,
  duration_seconds INT
);
```

---

## 🔌 REST API ENDPOINTS

### Recipe Endpoints
```
GET  /api/v1/recipes                    # List all recipes (paginated)
GET  /api/v1/recipes/:id                # Get single recipe
GET  /api/v1/recipes/search?q=adobo     # Search recipes
GET  /api/v1/recipes/by-ingredient?ing=chicken  # Filter by ingredient
POST /api/v1/recipes/recommend          # Gemini-powered recommendations
```

### Admin Endpoints
```
POST /api/v1/admin/crawl-now            # Trigger immediate crawl
GET  /api/v1/admin/crawl-logs           # View crawl history
GET  /api/v1/admin/review-queue         # Incomplete recipes
PATCH /api/v1/admin/recipes/:id/approve # Approve parsed recipe
DELETE /api/v1/admin/recipes/:id        # Remove recipe
GET  /api/v1/admin/stats                # Crawl statistics
```

### Health & Status
```
GET  /health                            # Service health check
GET  /api/v1/status                     # System status
```

---

## ⏰ SCHEDULING

### Crawler Schedule (using node-cron or APScheduler)
```python
# Daily crawl at 2 AM
0 2 * * * /run_crawler.sh

# Weekly full re-crawl on Sundays
0 3 * * 0 /run_full_recrawl.sh

# Video parser every 6 hours
0 */6 * * * /run_video_parser.sh
```

---

## 🤖 AI Integration (Gemini + GLM-4.6)

### Gemini for Recipe Generation
```javascript
// User input + recipe database → Gemini creativity
const generateRecipe = async (ingredients, userTone) => {
  const recipeContext = await searchDatabase(ingredients);
  const response = await geminiAPI.generate({
    prompt: `Based on these Filipino recipes: ${recipeContext}
             Create a recipe using: ${ingredients}
             Tone: ${userTone}`,
    model: "gemini-2.0-flash"
  });
  return response;
};
```

### GLM-4.6 for Video Transcript Parsing
```javascript
// Extract ingredients from YouTube transcript
const parseVideoTranscript = async (transcript) => {
  const response = await glmAPI.parse({
    task: "extract_recipe_from_transcript",
    transcript: transcript,
    model: "glm-4.6"
  });
  return normalizeExtractedRecipe(response);
};
```

---

## 📝 EXAMPLE CRAWLER OUTPUT

**From panlasangpinoy.com:**
```json
{
  "recipes": [
    {
      "id": "uuid-1",
      "source_site": "panlasangpinoy.com",
      "source_url": "https://panlasangpinoy.com/chicken-adobo-recipe",
      "title": "Chicken Adobo",
      "author": "Marvin Kuya",
      "published_date": "2023-01-15T10:30:00Z",
      "image_url": "https://panlasangpinoy.com/images/recipes/chicken-adobo-1.jpg",
      "image_attribution": "Image courtesy of panlasangpinoy.com",
      "ingredients": [
        {
          "name": "chicken",
          "quantity": 2,
          "unit": "kg",
          "notes": "cut into pieces"
        },
        {
          "name": "soy sauce",
          "quantity": 200,
          "unit": "ml"
        },
        {
          "name": "vinegar",
          "quantity": 150,
          "unit": "ml"
        },
        {
          "name": "garlic",
          "quantity": 8,
          "unit": "cloves",
          "notes": "minced"
        }
      ],
      "instructions": [
        "Heat oil in a large pan over medium-high heat.",
        "Saute garlic until fragrant.",
        "Add chicken pieces and brown on all sides.",
        "Pour in soy sauce and vinegar.",
        "Bring to a boil, then simmer for 30 minutes.",
        "Serve hot with rice."
      ],
      "tags": ["Filipino", "Chicken", "Adobo", "Easy", "30 minutes"],
      "rating": 4.8,
      "reviews_count": 152,
      "crawled_at": "2025-10-30T20:59:38Z"
    }
  ],
  "crawl_summary": {
    "domain": "panlasangpinoy.com",
    "recipes_found": 1,
    "recipes_new": 1,
    "recipes_duplicate": 0,
    "errors": [],
    "duration_seconds": 45
  }
}
```

---

## 🚀 IMPLEMENTATION PRIORITIES

### Phase 1: Foundation (Week 1-2)
- [ ] Set up Node.js/Python backend structure
- [ ] Configure PostgreSQL/SQLite database
- [ ] Create database schema
- [ ] Build basic Express/FastAPI server

### Phase 2: Website Crawler (Week 2-3)
- [ ] Implement Scrapy/Playwright crawler
- [ ] Extract recipe data from seed sites
- [ ] Handle image URL extraction & attribution
- [ ] Implement error handling & logging

### Phase 3: Content Parser (Week 3-4)
- [ ] YouTube transcript fetcher
- [ ] NLP ingredient extraction
- [ ] Video metadata parser
- [ ] Integration with crawler output

### Phase 4: Normalization (Week 4)
- [ ] Implement deduplication logic
- [ ] Normalize ingredient names
- [ ] Create ingredient master list
- [ ] Handle edge cases

### Phase 5: API & Integration (Week 5)
- [ ] Build REST API endpoints
- [ ] Integrate Gemini API
- [ ] Integrate GLM-4.6 for parsing
- [ ] Test API thoroughly

### Phase 6: Admin & Scheduling (Week 6)
- [ ] Build admin dashboard
- [ ] Implement scheduled crawls
- [ ] Error notifications
- [ ] Logging & monitoring

### Phase 7: Testing & Deployment (Week 7)
- [ ] Unit tests for crawlers
- [ ] Integration tests
- [ ] Load testing
- [ ] Docker containerization
- [ ] Production deployment

---

## ⚠️ CRITICAL IMPLEMENTATION NOTES

### Copyright & Attribution
- **ALWAYS** store original image URLs
- **ALWAYS** include attribution text
- Be conscious of copyright laws
- Use only public domain/creative commons where possible
- Log all image sources for legal review

### Error Handling
- Gracefully handle missing images
- Retry failed crawls with exponential backoff
- Queue incomplete recipes for admin review
- Log all errors with full context

### Scalability
- Use connection pooling for database
- Implement caching (Redis) for frequent queries
- Rate-limit crawlers to respect server load
- Use async/await for non-blocking I/O

### Data Quality
- Validate all extracted data
- Remove HTML tags and normalize text
- Deduplicate before insertion
- Confidence scoring for auto-parsed content

---

## 📊 SUCCESS METRICS

### Crawler Performance
- ✅ Recipes crawled per hour: 500+
- ✅ Error rate: < 5%
- ✅ Data completeness: > 95%
- ✅ Image attribution: 100%

### Content Quality
- ✅ Deduplication accuracy: > 98%
- ✅ Ingredient extraction confidence: > 90%
- ✅ Recipe completeness: > 95%

### API Performance
- ✅ Response time: < 500ms
- ✅ Uptime: > 99.5%
- ✅ Concurrent users: 1000+

---

## 📚 REFERENCES

- **Scrapy**: https://scrapy.org/
- **Playwright**: https://playwright.dev/
- **YouTube Transcript API**: https://github.com/jdepoix/youtube-transcript-api
- **Gemini API**: https://ai.google.dev/
- **GLM-4.6 API**: https://platform.openai.com/ (or alternative)
- **Node.js Best Practices**: https://nodejs.org/
- **PostgreSQL**: https://www.postgresql.org/

---

**Status**: 📋 Ready for implementation  
**Difficulty**: Medium-High (web scraping + NLP)  
**Timeline**: 7 weeks for full system  
**Team Size**: 2-3 backend engineers

Now use this with the Gemini prompt you provided to generate the full backend code! 🚀
