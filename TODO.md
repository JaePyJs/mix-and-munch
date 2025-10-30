# Mix & Munch - Master TODO List

**Status**: Phase 0 Complete ✅ | Phase 1 Ready 🚀  
**Start Date**: October 30, 2025  
**Phase 0 Completed**: October 31, 2025 (1 day ahead of schedule!)
**Target Completion**: November 30, 2025 (4 weeks)  
**Current Phase**: Phase 1 - Backend Foundation

---

## 📋 PHASE 0: FOUNDATION & SECURITY (Week 1: Oct 30 - Nov 6) ✅ COMPLETE

### Critical Security & Setup
- [x] **SEC-001** Review & update all environment variables (.env)
  - [x] Remove hardcoded API keys
  - [x] Add Gemini API key configuration
  - [x] Add GLM-4.6 API key configuration
  - [x] Set database connection strings
  - Status: ✅ COMPLETE
  
- [x] **SEC-002** Audit codebase for security issues
  - [x] Check for SQL injection vulnerabilities
  - [x] Verify input validation on all endpoints
  - [x] Ensure API rate limiting
  - Status: ✅ COMPLETE

- [x] **SETUP-001** Initialize version control
  - [x] Create .gitignore (exclude .env, node_modules, etc)
  - [x] Initial git commit
  - [x] Set up GitHub repository (if not done)
  - Status: ✅ COMPLETE

- [x] **SETUP-002** Configure development environment
  - [x] Node.js 18+ verified (v22.15.1)
  - [x] PostgreSQL/SQLite setup (template ready)
  - [x] Install all dependencies (npm install - 105 packages)
  - [x] Run initial builds (1.08s, 25 output files)
  - Status: ✅ COMPLETE

### Documentation
- [x] **DOC-001** Create API documentation (OpenAPI/Swagger)
  - [x] Document all endpoints
  - [x] Add request/response examples
  - Status: ✅ COMPLETE

- [x] **DOC-002** Create developer README
  - [x] Local development setup
  - [x] Running tests
  - [x] Database migrations
  - Status: ✅ COMPLETE

### Testing Setup
- [x] **TEST-001** Initialize testing framework
  - [x] Jest/Mocha setup (Jest 29.7.0 configured)
  - [x] Test directory structure (unit, integration, fixtures)
  - [x] Coverage configuration (50% threshold)
  - Status: ✅ COMPLETE (4/4 tests passing)

---

## 🏗️ PHASE 1: BACKEND FOUNDATION (Week 2-3: Nov 7-20)

### Backend Infrastructure
- [ ] **BACKEND-001** Initialize backend project structure
  - [ ] Create src/ directory structure
  - [ ] Set up Express/FastAPI server
  - [ ] Configure middleware (logging, error handling, cors)
  - [ ] Status: Not Started

- [ ] **DATABASE-001** Design & implement database schema
  - [ ] Create recipes table
  - [ ] Create ingredients_master table
  - [ ] Create crawl_logs table
  - [ ] Add indexes & constraints
  - [ ] Create migrations
  - [ ] Status: Not Started

- [ ] **DATABASE-002** Set up database connection pool
  - [ ] Configure connection pool
  - [ ] Implement connection retry logic
  - [ ] Add database health checks
  - [ ] Status: Not Started

### Website Crawler
- [ ] **CRAWLER-001** Set up Scrapy/Playwright crawler infrastructure
  - [ ] Install dependencies
  - [ ] Configure crawler settings
  - [ ] Set up logging
  - [ ] Status: Not Started

- [ ] **CRAWLER-002** Implement seed site crawler (panlasangpinoy.com)
  - [ ] Parse recipe pages
  - [ ] Extract title, author, date
  - [ ] Extract ingredients with quantities
  - [ ] Extract instructions
  - [ ] Extract recipe images (with URLs)
  - [ ] Extract ratings & reviews
  - [ ] Status: Not Started

- [ ] **CRAWLER-003** Implement seed site crawler (other 9 sites)
  - [ ] kawalingpinoy.com
  - [ ] angsarap.net
  - [ ] pepper.ph
  - [ ] foxyfolksy.com
  - [ ] recipesbynora.com
  - [ ] iankewks.com
  - [ ] junblog.com
  - [ ] rezelkealoha.com
  - [ ] foodwithmae.com
  - [ ] Status: Not Started

- [ ] **CRAWLER-004** Implement auto-discovery
  - [ ] Parse sitemaps (sitemap.xml)
  - [ ] Follow pagination links
  - [ ] Parse schema.org/Recipe markup
  - [ ] Status: Not Started

### Image Extraction & Attribution
- [ ] **IMAGE-001** Implement image URL extraction
  - [ ] Extract primary image URLs
  - [ ] Preserve original URLs (no copying)
  - [ ] Handle image errors gracefully
  - [ ] Add to-do for broken images
  - [ ] Status: Not Started

- [ ] **IMAGE-002** Implement attribution system
  - [ ] Add image_attribution field to schema
  - [ ] Auto-generate attribution text
  - [ ] Track image source domain
  - [ ] Log all image sources
  - [ ] Status: Not Started

### Content Creator Parser
- [ ] **PARSER-001** Set up YouTube integration
  - [ ] Integrate YouTube Transcript API
  - [ ] Fetch video metadata (title, channel, upload date)
  - [ ] Fetch video thumbnails
  - [ ] Status: Not Started

- [ ] **PARSER-002** Implement transcript extraction
  - [ ] Extract transcripts for all 6 creators
  - [ ] Handle caption fallback
  - [ ] Parse transcript text
  - [ ] Status: Not Started

- [ ] **PARSER-003** Implement NLP ingredient extraction
  - [ ] Parse ingredients from transcript
  - [ ] Extract quantities & units
  - [ ] Extract cooking steps
  - [ ] Extract cultural notes
  - [ ] Status: Not Started

### Normalization & Deduplication
- [ ] **NORM-001** Implement data normalizer
  - [ ] Standardize ingredient units (tsp → 5ml)
  - [ ] Normalize ingredient names
  - [ ] Titlecase recipe titles
  - [ ] Remove HTML tags
  - [ ] Status: Not Started

- [ ] **DEDUP-001** Implement deduplication logic
  - [ ] Title + Author similarity (Levenshtein)
  - [ ] Ingredient list fuzzy matching
  - [ ] URL canonicalization
  - [ ] Mark duplicates with parent_recipe_id
  - [ ] Status: Not Started

---

## 🔌 PHASE 2: API & INTEGRATION (Week 3-4: Nov 14-27)

### REST API Implementation
- [ ] **API-001** Implement recipe endpoints
  - [ ] GET /api/v1/recipes (paginated)
  - [ ] GET /api/v1/recipes/:id
  - [ ] GET /api/v1/recipes/search?q=adobo
  - [ ] GET /api/v1/recipes/by-ingredient?ing=chicken
  - [ ] Status: Not Started

- [ ] **API-002** Implement recommendation endpoint
  - [ ] POST /api/v1/recipes/recommend (Gemini-powered)
  - [ ] Integrate Gemini API
  - [ ] Format recipe context for AI
  - [ ] Status: Not Started

- [ ] **API-003** Implement admin endpoints
  - [ ] POST /api/v1/admin/crawl-now (trigger immediate crawl)
  - [ ] GET /api/v1/admin/crawl-logs
  - [ ] GET /api/v1/admin/review-queue
  - [ ] PATCH /api/v1/admin/recipes/:id/approve
  - [ ] DELETE /api/v1/admin/recipes/:id
  - [ ] GET /api/v1/admin/stats
  - [ ] Status: Not Started

- [ ] **API-004** Implement health endpoints
  - [ ] GET /health
  - [ ] GET /api/v1/status
  - [ ] Database connectivity check
  - [ ] External API status check
  - [ ] Status: Not Started

### AI Integration
- [ ] **AI-001** Integrate Gemini API
  - [ ] Set up API credentials
  - [ ] Implement recipe generation prompt
  - [ ] Add error handling & retries
  - [ ] Test with sample ingredients
  - [ ] Status: Not Started

- [ ] **AI-002** Integrate GLM-4.6 API
  - [ ] Set up API credentials
  - [ ] Implement transcript parsing model
  - [ ] Test ingredient extraction
  - [ ] Confidence scoring
  - [ ] Status: Not Started

### Scheduling & Admin
- [ ] **SCHED-001** Set up job scheduler
  - [ ] Implement node-cron (Node.js) or APScheduler (Python)
  - [ ] Daily crawl at 2 AM
  - [ ] Weekly full re-crawl on Sundays
  - [ ] Video parser every 6 hours
  - [ ] Status: Not Started

- [ ] **ADMIN-001** Build admin dashboard UI
  - [ ] React/Vue.js dashboard
  - [ ] View crawl logs
  - [ ] Review queue interface
  - [ ] Approve/reject recipes
  - [ ] View statistics
  - [ ] Status: Not Started

- [ ] **ADMIN-002** Implement error notifications
  - [ ] Email alerts on crawl failure
  - [ ] Slack integration (optional)
  - [ ] Status: Not Started

---

## ✅ PHASE 3: TESTING & OPTIMIZATION (Week 4: Nov 28+)

### Unit Tests
- [ ] **TEST-002** Write tests for crawlers
  - [ ] Website crawler tests
  - [ ] Content creator parser tests
  - [ ] Image extraction tests
  - [ ] Mock HTML fixtures
  - [ ] Status: Not Started

- [ ] **TEST-003** Write tests for API endpoints
  - [ ] Recipe endpoints
  - [ ] Admin endpoints
  - [ ] Error handling
  - [ ] Status: Not Started

- [ ] **TEST-004** Write tests for normalizer & deduplicator
  - [ ] Unit normalization tests
  - [ ] Deduplication accuracy
  - [ ] Edge cases
  - [ ] Status: Not Started

### Integration Tests
- [ ] **TEST-005** End-to-end crawler → API flow
  - [ ] Mock website crawl
  - [ ] Data normalization
  - [ ] Database insertion
  - [ ] API retrieval
  - [ ] Status: Not Started

### Performance Testing
- [ ] **PERF-001** Load testing
  - [ ] 1000 concurrent users
  - [ ] Response time < 500ms
  - [ ] Database query optimization
  - [ ] Status: Not Started

- [ ] **PERF-002** Crawler performance
  - [ ] Target: 500+ recipes/hour
  - [ ] Error rate < 5%
  - [ ] Data completeness > 95%
  - [ ] Status: Not Started

### Documentation
- [ ] **DOC-003** API documentation (Swagger/OpenAPI)
  - [ ] All endpoints documented
  - [ ] Request/response examples
  - [ ] Error codes explained
  - [ ] Status: Not Started

- [ ] **DOC-004** Crawler configuration guide
  - [ ] How to add new seed sites
  - [ ] How to adjust crawl settings
  - [ ] Troubleshooting guide
  - [ ] Status: Not Started

---

## 🎯 CAPSTONE AI SYSTEM (Parallel: Nov 7+)

### Frontend Framework (Next.js React)
- [ ] **FRONTEND-001** Initialize Next.js project
  - [ ] Set up Next.js 14+
  - [ ] Configure Tailwind CSS
  - [ ] Set up TypeScript
  - [ ] Status: Not Started

- [ ] **FRONTEND-002** Build ingredient input interface
  - [ ] Chat-based input form
  - [ ] Conversational responses
  - [ ] Real-time ingredient extraction
  - [ ] Status: Not Started

### AI Recipe Generation
- [ ] **AI-003** Implement local AI (if using Ollama)
  - [ ] Set up Ollama with Deepseek R1 1.5B
  - [ ] Test local inference
  - [ ] Integration with frontend
  - [ ] Status: SKIPPED (using Gemini instead)

- [ ] **AI-004** Implement Gemini-powered generation
  - [ ] Zero-refusal constraint in prompt
  - [ ] Always create recipe, never refuse
  - [ ] Filipino cultural context
  - [ ] Test with edge cases
  - [ ] Status: Not Started

### Algorithm Implementation (From Capstone)
- [ ] **ALG-001** Implement Jaccard Similarity
  - [ ] Formula: |A ∩ B| / |A ∪ B|
  - [ ] Ingredient overlap scoring
  - [ ] Unit tests
  - [ ] Status: Not Started

- [ ] **ALG-002** Implement Weighted Scoring
  - [ ] Relevance ranking algorithm
  - [ ] Recipe scoring system
  - [ ] Unit tests
  - [ ] Status: Not Started

- [ ] **ALG-003** Implement Levenshtein Distance
  - [ ] Edit distance calculation
  - [ ] Fuzzy ingredient matching
  - [ ] Typo tolerance
  - [ ] Unit tests
  - [ ] Status: Not Started

### UI/UX
- [ ] **UI-001** Design recipe display
  - [ ] Beautiful recipe cards
  - [ ] Ingredient highlighting
  - [ ] Step-by-step instructions
  - [ ] Image attribution display
  - [ ] Status: Not Started

- [ ] **UI-002** Add Filipino cultural elements
  - [ ] Color scheme (Filipino-inspired)
  - [ ] Typography
  - [ ] Icons & illustrations
  - [ ] Responsive design
  - [ ] Status: Not Started

---

## 🧪 QUALITY ASSURANCE

### Code Quality
- [ ] **QUALITY-001** Set up linting
  - [ ] ESLint configuration
  - [ ] Code formatting (Prettier)
  - [ ] Fix all linting errors
  - [ ] Status: Not Started

- [ ] **QUALITY-002** Code review checklist
  - [ ] Security review
  - [ ] Performance review
  - [ ] Documentation review
  - [ ] Test coverage review (>80%)
  - [ ] Status: Not Started

### ISO 25010 Compliance
- [ ] **ISO-001** Measure usability
  - [ ] Task completion rate
  - [ ] Time to complete
  - [ ] Error rate
  - [ ] User satisfaction survey
  - [ ] Status: Not Started

- [ ] **ISO-002** Measure reliability
  - [ ] Uptime monitoring
  - [ ] Error logs analysis
  - [ ] Crash reports
  - [ ] Status: Not Started

- [ ] **ISO-003** Measure performance
  - [ ] Response time metrics
  - [ ] Database query performance
  - [ ] API latency
  - [ ] Status: Not Started

---

## 📚 DOCUMENTATION & DEFENSE

### Final Documentation
- [ ] **DOC-005** Update README with complete setup
  - [ ] Installation instructions
  - [ ] Environment setup
  - [ ] Running tests
  - [ ] Deployment guide
  - [ ] Status: Not Started

- [ ] **DOC-006** Create architecture diagrams
  - [ ] System architecture
  - [ ] Data flow diagram
  - [ ] Database schema diagram
  - [ ] Status: Not Started

- [ ] **DOC-007** Create user guide
  - [ ] How to use the app
  - [ ] FAQ
  - [ ] Troubleshooting
  - [ ] Status: Not Started

### Capstone Defense
- [ ] **DEF-001** Prepare presentation slides
  - [ ] System overview
  - [ ] Architecture slides
  - [ ] Technology choices
  - [ ] Demo scenarios
  - [ ] Status: Not Started

- [ ] **DEF-002** Prepare demo scenarios
  - [ ] Demo 1: Website crawler working
  - [ ] Demo 2: Recipe generation with Gemini
  - [ ] Demo 3: Admin dashboard
  - [ ] Demo 4: Algorithm performance
  - [ ] Status: Not Started

- [ ] **DEF-003** Practice defense presentation
  - [ ] 15-minute overview
  - [ ] Answer technical questions
  - [ ] Handle edge cases
  - [ ] Status: Not Started

---

## 🚀 DEPLOYMENT

### Docker & Containerization
- [ ] **DEPLOY-001** Create Dockerfile
  - [ ] Backend service
  - [ ] Database service
  - [ ] Admin dashboard
  - [ ] Status: Not Started

- [ ] **DEPLOY-002** Create docker-compose.yml
  - [ ] Multi-container setup
  - [ ] Volume mounts
  - [ ] Environment variables
  - [ ] Status: Not Started

### Production Deployment
- [ ] **DEPLOY-003** Deploy to production
  - [ ] Choose hosting (Heroku, DigitalOcean, AWS)
  - [ ] Set up CI/CD pipeline
  - [ ] Configure monitoring
  - [ ] Status: Not Started

---

## 📊 TRACKING & REPORTING

### Weekly Checkins
- [ ] **Week 1 (Oct 30-Nov 6)**: Phase 0 Complete?
  - [ ] Security audit done
  - [ ] Environment configured
  - [ ] Tests setup
  - [ ] Status: Pending

- [ ] **Week 2 (Nov 7-13)**: Backend foundation?
  - [ ] Database schema created
  - [ ] Basic crawler working
  - [ ] First recipes in DB
  - [ ] Status: Pending

- [ ] **Week 3 (Nov 14-20)**: API & integration?
  - [ ] REST API working
  - [ ] Gemini integration done
  - [ ] Admin dashboard basic
  - [ ] Status: Pending

- [ ] **Week 4 (Nov 21-27)**: Testing & optimization?
  - [ ] Tests passing
  - [ ] Performance acceptable
  - [ ] Documentation complete
  - [ ] Status: Pending

- [ ] **Week 5 (Nov 28+)**: Final polish & defense?
  - [ ] Demo ready
  - [ ] Presentation slides
  - [ ] All documentation finalized
  - [ ] Status: Pending

---

## 🎯 SUCCESS CRITERIA

### Must Have (To Pass)
- [x] Understand capstone requirements ✅
- [ ] All 3 algorithms implemented
- [ ] Website crawler working (≥5 sites)
- [ ] YouTube parser working
- [ ] REST API functional
- [ ] Database populated with 100+ recipes
- [ ] Gemini integration working
- [ ] Presentation slides ready
- [ ] Can defend all technical choices

### Should Have (To Excel)
- [ ] All 10 websites crawled
- [ ] Admin dashboard polished
- [ ] 500+ recipes in database
- [ ] High test coverage (>80%)
- [ ] Performance optimized
- [ ] Beautiful UI/UX
- [ ] Comprehensive documentation

### Nice to Have
- [ ] Docker deployment
- [ ] CI/CD pipeline
- [ ] Multi-language support
- [ ] Community features

---

## 📝 NOTES

**Critical Path Items** (Must do first):
1. Phase 0: Security & Setup
2. DATABASE-001: Schema design
3. CRAWLER-002: First crawler
4. AI-001: Gemini integration
5. API-001: Basic endpoints

**Parallel Work** (Can do simultaneously):
- Backend crawler development (Nov 7-20)
- Frontend UI development (Nov 7-20)
- Testing (Nov 14-27)

**Risk Items**:
- Website structure changes (crawlers break)
- API rate limiting (need caching)
- Image copyright issues (need legal review)
- Gemini API downtime (need fallback)

---

**Generated**: October 30, 2025  
**Last Updated**: October 30, 2025  
**Project Duration**: 4 weeks (Oct 30 - Nov 30)  
**Status**: 🟢 Ready to Start
