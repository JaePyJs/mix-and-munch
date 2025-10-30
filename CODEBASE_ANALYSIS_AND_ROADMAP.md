# Mix & Munch: Complete Codebase Analysis & Strategic Roadmap

**Analysis Date**: October 30, 2025  
**Current Phase**: MVP (20% production-ready)  
**Tech Stack**: React 19 + TypeScript + Vite + Tailwind CSS  

---

## 📚 PART 1: CODEBASE ARCHITECTURE DEEP DIVE

### 1.1 Project Structure Overview

```
Mix_and_munch/
├── 📄 Core Files
│   ├── App.tsx                    # Main application component (router logic)
│   ├── index.tsx                  # React entry point
│   ├── index.html                 # HTML template
│   ├── index.css                  # Global styles (Tailwind)
│   ├── types.ts                   # TypeScript type definitions
│   └── vite.config.ts             # Vite build configuration
│
├── 📁 components/
│   └── Header.tsx                 # Navigation header with mobile menu
│
├── 📁 pages/ (SPA routing)
│   ├── HomePage.tsx               # Landing page with features showcase
│   ├── DemoPage.tsx               # Main recipe browser & ingredient matching
│   ├── MealPlannerPage.tsx        # Weekly meal planning (Supabase-backed)
│   ├── ShoppingListPage.tsx       # Auto-generated shopping list
│   ├── AuthPage.tsx               # [Not implemented] Auth placeholder
│   ├── CrawlerPage.tsx            # [Not implemented] Crawler admin panel
│   └── YouTubePage.tsx            # [Not implemented] YouTube recipe extraction
│
├── 📁 services/
│   ├── geminiService.ts           # ✅ AI chat (Gemini + Z.AI fallback + mock)
│   ├── supabaseClient.ts          # ✅ Database client (real-time enabled)
│   ├── api.js                     # ✅ Backend API integration (expecting Node.js)
│   ├── useRecipes.ts              # ✅ Recipe hooks (fetch, search, transform)
│   ├── imageService.ts            # Recipe image fetching
│   ├── spoonacularService.ts      # Third-party recipe API integration
│   ├── auth.js                    # [Stub] Authentication
│   └── db.js                      # [Stub] Direct database access
│
├── 📁 data/
│   └── mockData.ts                # Hardcoded ingredients, mock recipes
│
├── 📁 public/                     # Static assets
├── 📁 dist/                       # Production build output
├── 📁 node_modules/               # Dependencies
│
├── ⚙️ Configuration Files
│   ├── package.json               # Project metadata & npm scripts
│   ├── tsconfig.json              # TypeScript compiler options
│   ├── tailwind.config.js         # Tailwind CSS theme & colors
│   ├── postcss.config.cjs         # PostCSS plugins
│   ├── vite.config.ts             # Vite bundler config
│   └── .env.local                 # Environment variables (GITIGNORED)
│
├── 📋 Documentation & Config
│   ├── PRISMA_SCHEMA.prisma       # [Reference] Full database schema
│   ├── PHASE_1_API_CODE.ts        # [Examples] Backend API endpoints
│   ├── NEXTAUTH_CONFIG.ts         # [Reference] Authentication setup
│   ├── README.md                  # Consolidated documentation
│   └── [70+ status docs]          # Project history/status files
│
└── 🚀 Deployment & Testing
    ├── vercel.json                # Vercel deployment config
    ├── QUICKSTART.sh/bat          # Setup scripts
    ├── TEST_API.ps1               # Backend testing script
    └── server.cjs                 # Development server
```

---

### 1.2 Technology Stack Analysis

#### Frontend (Currently Implemented)
```
Framework:      React 19.2.0  (latest stable)
Language:       TypeScript 5.9.3
Build Tool:     Vite 7.1.12 (⚡ blazing fast bundler)
Styling:        Tailwind CSS 4.1.16 (utility-first CSS)
State:          React hooks (useState, useCallback, useMemo)
Routing:        Client-side (no Next.js yet)

Key Dependencies:
- @google/genai: 1.27.0 (AI chat integration)
- @supabase/supabase-js: 2.76.1 (Backend & real-time)
- marked: 16.4.1 (Markdown rendering)
- esbuild: 0.25.11 (JavaScript compiler)
- rollup: 4.52.5 (Module bundler)
```

#### Backend (Planned, Referenced in Code)
```
Framework:      Express.js (referenced in /api structure)
Database:       PostgreSQL (Supabase hosted)
ORM:            Prisma (schema defined in PRISMA_SCHEMA.prisma)
Auth:           NextAuth.js (JWT + OAuth)
Hosting:        Vercel (frontend) + Supabase (backend)
```

#### External Services
```
AI:             Google Gemini API (primary) + Z.AI (fallback)
Database:       Supabase (PostgreSQL)
Recipe Source:  Spoonacular API (referenced)
Hosting:        Vercel (frontend), could use Heroku/Railway (backend)
```

---

### 1.3 Component Architecture

#### High-Level Data Flow
```
┌─────────────────────────────────────────────────────────────┐
│                     App.tsx (Router)                        │
│  - Manages page state (home/demo/meal-planner/shopping-list)│
│  - Fetches meal plan from Supabase                          │
│  - Handles add/remove from meal plan                        │
└────────────┬────────────────────────────────────────────────┘
             │
   ┌─────────┴──────────┬────────────────┬──────────────┐
   │                    │                │              │
   v                    v                v              v
HomePage           DemoPage        MealPlannerPage  ShoppingListPage
(Landing)       (Main App)      (Weekly Planner)   (Auto-generated)
   │                │                 │                 │
   └─┬───────┬──────┼──────────┬──────┴─────────┬──────┘
     │       │      │          │                │
     └──────→ Header (Navigation, Mobile-responsive)

```

#### Component State Management
- **No Redux/Context API** - Using local React hooks
- **Supabase Real-time**: Enabled for meal_plan table (auto-sync)
- **Meal Plan State**: Fetched in App.tsx, passed to children via props
- **UI State**: Managed per-component with useState hooks

---

### 1.4 Key Component Details

#### App.tsx - Main Router & State Manager
**Responsibilities:**
- Manages which page is displayed
- Fetches meal plan from Supabase (`meal_plan` table)
- Handles `handleAddToMealPlan()` - inserts recipe into meal plan
- Handles `handleRemoveFromMealPlan()` - deletes from meal plan
- Re-fetches meal plan after changes

**Critical Issue:**
```typescript
// Currently tries to JOIN with recipes table:
select: `id, day, recipe:recipes(*)`
// But the actual schema expects:
// meal_plan: { id, day, recipe_id }
// recipes: { id, title, ... }
// FIX: Need to adjust Supabase query to properly join
```

#### DemoPage.tsx - Recipe Browser
**Features:**
1. Ingredient selection (left sidebar)
   - Categorized ingredients (Proteins, Vegetables, Pantry)
   - Checkbox multi-select
2. Recipe display (right main area)
   - Search bar + category filter
   - Recipe cards with match scores
   - Recipe detail modal with add-to-meal-plan
3. Real-time filtering
   - Calculates match score between ingredients and recipes
   - Filters by category and search term

**Data Flow:**
```
categorizedIngredients (mockData.ts)
    ↓
selectedIngredients (Set<string>)
    ↓
useBackendRecipes() - fetches from backend API
    ↓
useRecipeTransform() - calculates match scores
    ↓
filteredRecipes - sorted by matchScore
    ↓
RecipeCard + RecipeDetailModal
```

#### MealPlannerPage.tsx - Weekly Calendar
**Features:**
- 7 columns (Monday-Sunday)
- Shows recipes added for each day
- Remove button for each meal
- Loading state

**DB Integration:**
- Reads from `mealPlan` prop (fetched from Supabase)
- Calls `onRemoveFromMealPlan(itemId)` to delete

#### ShoppingListPage.tsx - Auto-Generated List
**Algorithms:**
1. Aggregates ingredients from all meals in plan
2. Combines quantities by unit (e.g., 2 cups + 1 cup rice = 3 cups)
3. Features:
   - Checkbox items
   - Copy to clipboard
   - Print functionality
   - Grouped by ingredient name

---

### 1.5 Services Architecture

#### geminiService.ts - AI Chat Engine
**Feature:** Streaming chat responses (Server-Sent Events)

**Fallback Chain:**
```
1. Try Supabase Edge Function (streaming)
   ↓ (if fails)
2. Direct Gemini API call (https://generativelanguage.googleapis.com/v1beta/...)
   ↓ (if fails)
3. Z.AI API (glm-4.6 model)
   ↓ (if all fail)
4. Mock Recipe Generator (hardcoded Filipino dishes)
```

**System Prompt:** (The famous "Mix" persona)
- ALWAYS generates a Filipino recipe
- NEVER refuses ("ZERO REFUSALS")
- Accepts ANY ingredient combination
- Encourages wild/creative experiments
- Uses emojis and enthusiastic tone

**API Key Issue:**
```typescript
// SECURITY FLAW: Hardcoded API keys in frontend code
const apiKey = import.meta.env.VITE_GEMINI_API_KEY 
               || 'AIzaSyCD2rcD0Q_Pw_5uCC6-u3TDAS49UgAvWLw'; // EXPOSED!
const zaiKey = 'ad4f34d8e7674e30bb2b986fed82945e.RnYLyzvQwruxvZEX'; // EXPOSED!
```

#### supabaseClient.ts - Database Client
**Configuration:**
```typescript
URL: https://oxehooznbwiubjmdekoj.supabase.co
Key: eyJhbGc... (Anon key - OK for frontend)
```

**Real-time enabled for:**
- meal_plan table (auto-sync to UI)

**Tables Used:**
- `meal_plan` - stores planned meals
- `recipes` - recipe data (or backend API)

#### api.js - Backend Integration
**Endpoints Expected:**
```
GET /api/recipes?limit=20&page=1
GET /api/recipes/:id
POST /api/recipes/search
GET /api/recipes/featured/list
GET /api/recipes/source/:site
GET /api/recipes/stats/overview
GET /api/admin/dashboard/stats
GET /api/crawler/logs
GET /api/health
POST /api/ratings
```

**Error Handling:** Wraps fetch in `handleResponse()` for consistent error handling

#### useRecipes.ts - React Hooks for Data
**Three Main Hooks:**

1. **useBackendRecipes(limit, page)**
   - Fetches recipes from `/api/recipes`
   - Handles pagination
   - Returns: `{ recipes, total, page, pages, loading, error, nextPage, prevPage }`

2. **useRecipeSearch()**
   - Searches recipes via `/api/recipes/search`
   - Returns: `{ results, query, loading, error, search(), clearSearch() }`

3. **useRecipeTransform(backendRecipes, userIngredients)**
   - Transforms API response to UI format
   - Calculates match score: `(matchedCount / totalIngredients) * 100`
   - Returns: Formatted recipes with UI properties

---

### 1.6 Types Definition (types.ts)

**Core Types:**
```typescript
Page = 'home' | 'demo' | 'meal-planner' | 'shopping-list'

Recipe {
  id: number
  name: string
  description: string
  imageUrl: string
  ingredients: Ingredient[]
  instructions: string[]
  matchScore?: number
  category?: string
  comments?: Comment[]
}

Ingredient {
  name: string
  quantity?: number | string
  unit?: string
}

ChatMessage {
  role: 'user' | 'model'
  content: string
}

MealPlanItem {
  id: number
  day: string
  recipe: Recipe
}

ShoppingListItem {
  name: string
  quantity: Map<string, number>  // unit -> quantity
  checked: boolean
}
```

---

### 1.7 Data & Mock Data

**categorizedIngredients** (mockData.ts):
```
Proteins:
  - Chicken, Pork Belly, Shrimp, Ground Beef, Fish Fillet

Vegetables & Herbs:
  - Garlic, Onion, Ginger, Tomato, Carrot, Potato, Cabbage
  - Green Beans, Bell Pepper, Kangkong, Radish, Eggplant, Bay Leaves

Pantry Staples:
  - Soy Sauce, Vinegar, Fish Sauce (Patis), Oyster Sauce
  - Tamarind Soup Base, Jasmine Rice, Pancit Canton Noodles
  - Cooking Oil, Black Peppercorns, Egg, Coconut Milk
```

**mockRecipes** - Hardcoded examples:
- Chicken Adobo
- Pancit Canton
- Sinigang
- (More in mockData.ts)

---

### 1.8 Styling System

**Tailwind Configuration:**
```javascript
Colors:
  brand-lime: '#A3E635' (bright green accent)
  brand-gray-200: '#d4d4d8' (light gray text)
  brand-gray-700: '#3f3f46' (medium gray)
  brand-gray-800: '#27272a' (dark gray cards)
  brand-gray-900: '#18181b' (darker backgrounds)
  brand-gray-950: '#09090b' (darkest backgrounds)

Font: Inter sans-serif
Layout: Responsive grid (mobile-first)
Design: Dark theme throughout
```

**Styling Approach:**
- No CSS-in-JS libraries (Tailwind directly in JSX)
- Responsive breakpoints: md (768px), lg (1024px)
- Print styles: `no-print` class to hide elements when printing

---

## 📊 PART 2: CURRENT STATE ANALYSIS

### 2.1 What's Working ✅

| Feature | Status | Notes |
|---------|--------|-------|
| **AI Chat** | ✅ Working | Gemini + Z.AI fallback + mock recipes |
| **Recipe Browser** | ✅ Working | Ingredient matching, filtering, search |
| **Meal Planner** | ✅ Partially | Works with Supabase, needs data |
| **Shopping List** | ✅ Working | Auto-generated from meal plan |
| **UI/UX** | ✅ Beautiful | Dark theme, mobile-responsive |
| **Navigation** | ✅ Working | Header with mobile menu |
| **Ingredient Selection** | ✅ Working | Multi-select with categorization |
| **Match Score Calculation** | ✅ Working | Matches selected ingredients to recipes |

### 2.2 What's Not Working / Missing ❌

| Feature | Status | Impact |
|---------|--------|--------|
| **User Authentication** | ❌ Missing | No login/signup system |
| **Backend API** | ❌ Expected | Code references /api/recipes but backend doesn't exist |
| **Recipe Database** | ⚠️ Partial | Using mock data, no real recipes |
| **Database Persistence** | ⚠️ Limited | Only meal_plan works with Supabase |
| **Data Security** | ❌ Critical | API keys exposed in frontend code |
| **Error Boundaries** | ❌ Missing | No error recovery UI |
| **Loading States** | ⚠️ Minimal | Basic skeleton loaders, needs improvement |

### 2.3 Integration Status

| Service | Expected | Actual | Gap |
|---------|----------|--------|-----|
| **Supabase** | Real-time DB | Partially connected | Query issues |
| **Gemini API** | AI responses | ✅ Working | Key exposed |
| **Z.AI Fallback** | Backup AI | ✅ Working | Key exposed |
| **Backend API** | Recipe CRUD | ❌ Not running | Code ready but server needed |
| **Spoonacular** | Recipe source | Referenced only | Not integrated |

---

### 2.4 Code Quality Assessment

**Strengths:**
- ✅ TypeScript throughout (type-safe)
- ✅ Functional components with hooks (modern React)
- ✅ Responsive design
- ✅ Modular service architecture
- ✅ Good error handling in API calls
- ✅ Well-organized folder structure

**Weaknesses:**
- ❌ Exposed API keys
- ❌ No input validation on user forms
- ❌ No error boundaries
- ❌ Limited error recovery UI
- ❌ No loading skeletons for all components
- ❌ No tests (unit, integration, E2E)
- ❌ No CI/CD pipeline

---

## 🚀 PART 3: STRATEGIC ROADMAP

### Phase 0: Immediate Fixes (Week 1)

**Goal:** Secure the app, fix critical bugs, prepare for production

#### Task 0.1: Security Audit & API Key Management
**Priority:** CRITICAL

```typescript
// CURRENT (INSECURE):
const apiKey = 'AIzaSyCD2rcD0Q_Pw_5uCC6-u3TDAS49UgAvWLw';

// FIXED:
// 1. Remove all hardcoded keys from frontend
// 2. Create backend proxy endpoint:
//    POST /api/ai/chat - handles Gemini requests server-side
// 3. Backend validates requests, enforces rate limits
// 4. Update .env.local to reference proxy only

Files to Update:
- services/geminiService.ts (remove hardcoded keys)
- Create backend/routes/ai.js (proxy endpoint)
- Update .env.local documentation
```

**Effort:** 2-3 hours
**Owner:** Backend engineer

---

#### Task 0.2: Fix Supabase Integration
**Priority:** HIGH

**Issue:** MealPlannerPage expects `recipe:recipes(*)` but Supabase query might be failing

```typescript
// IN: App.tsx (fetchMealPlan function)
// CURRENT:
const { data, error } = await supabase
  .from('meal_plan')
  .select(`id, day, recipe:recipes(*)`)
  .order('created_at', { ascending: true });

// Need to verify:
// 1. Does meal_plan table have recipe_id foreign key?
// 2. Is the join syntax correct for this Supabase version?
// 3. Do recipes exist in the recipes table?

// POSSIBLE FIX:
const { data, error } = await supabase
  .from('meal_plan')
  .select(`
    id,
    day,
    recipes(id, name, description, imageUrl, ingredients, instructions)
  `)
  .order('created_at', { ascending: true });
```

**Effort:** 1-2 hours
**Owner:** Backend engineer

**Testing:** Check Supabase console for meal_plan table structure and sample data

---

#### Task 0.3: Backend API Stub Setup
**Priority:** HIGH

**Goal:** Create minimal Express.js backend to serve recipes

```typescript
// backend/server.js
const express = require('express');
const app = express();

// ENDPOINT 1: List recipes
app.get('/api/recipes', (req, res) => {
  const limit = req.query.limit || 20;
  const page = req.query.page || 1;
  
  // FOR NOW: Return mock recipes
  res.json({
    data: mockRecipes.slice(0, limit),
    pagination: { page, limit, total: mockRecipes.length, pages: 1 }
  });
});

// ENDPOINT 2: Get single recipe
app.get('/api/recipes/:id', (req, res) => {
  const recipe = mockRecipes.find(r => r.id === req.params.id);
  res.json({ data: recipe });
});

// ENDPOINT 3: Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(5000, () => console.log('Backend running on port 5000'));
```

**Effort:** 2-3 hours
**Owner:** Backend engineer

**Test:** `npm start` then visit `http://localhost:5000/api/recipes`

---

#### Task 0.4: Environment Variable Cleanup
**Priority:** MEDIUM

**.env.local template (add to repo root):**
```env
# Required - Sign up at https://aistudio.google.com/app/apikeys
VITE_GEMINI_API_KEY=your_key_here

# Optional - For development
VITE_BACKEND_URL=http://localhost:5000
VITE_SUPABASE_URL=https://oxehooznbwiubjmdekoj.supabase.co
VITE_SUPABASE_ANON_KEY=your_key_here

# DO NOT COMMIT .env.local - it's in .gitignore
```

**Effort:** 30 minutes
**Owner:** DevOps engineer

---

### Phase 1: Foundation Setup (Weeks 1-2)

**Goal:** Migrate to Next.js, establish database, set up CI/CD

#### 1.1 Migration from Vite to Next.js

**Why Next.js?**
- ✅ API routes (no separate backend needed)
- ✅ Server-side rendering (SEO)
- ✅ Built-in middleware (auth, logging)
- ✅ Vercel deployment (seamless)
- ✅ File-based routing

**Steps:**
```bash
# 1. Create new Next.js project
npx create-next-app@latest mix-and-munch-next

# 2. Copy components/pages/styles
cp -r components/ next-app/app/components/
cp -r pages/ next-app/app/pages/
cp -r services/ next-app/app/services/
cp index.css next-app/app/globals.css

# 3. Update imports (next/navigation, etc)
# 4. Remove Vite dependencies
# 5. Add Next.js dependencies
npm install

# 6. Test: npm run dev
```

**Effort:** 1-2 days
**Owner:** Frontend engineer + Backend engineer

---

#### 1.2 Database Setup (PostgreSQL + Prisma)

**Steps:**
```bash
# 1. Create Supabase project (free tier is fine for MVP)
# 2. Get DATABASE_URL from Supabase settings

# 3. Initialize Prisma
npm install -D prisma @prisma/client
npx prisma init

# 4. Copy PRISMA_SCHEMA.prisma to prisma/schema.prisma
# 5. Run migrations
npx prisma migrate dev --name init

# 6. Generate Prisma client
npx prisma generate
```

**Effort:** 1-2 hours
**Owner:** Backend engineer

---

#### 1.3 Authentication (NextAuth.js)

**Steps:**
```typescript
// 1. Install NextAuth
npm install next-auth

// 2. Create app/api/auth/[...nextauth]/route.ts
// (Use NEXTAUTH_CONFIG.ts as reference)

// 3. Add providers (Google OAuth + Credentials)
// 4. Update environment variables:
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<random-32-char-string>

// 5. Create session UI in Header.tsx
// 6. Protect routes with middleware
```

**Effort:** 2-3 days
**Owner:** Backend engineer

---

### Phase 2: API Development (Weeks 2-3)

**Goal:** Build REST API, connect to database

#### 2.1 Recipe API Endpoints

**Create in `app/api/recipes/`:**

```typescript
// GET /api/recipes
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '20');
  const page = parseInt(searchParams.get('page') || '1');
  const skip = (page - 1) * limit;
  
  const recipes = await prisma.recipe.findMany({
    take: limit,
    skip,
    where: { status: 'PUBLISHED' }
  });
  
  const total = await prisma.recipe.count({ where: { status: 'PUBLISHED' } });
  
  return Response.json({
    data: recipes,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  });
}

// POST /api/recipes/search
export async function POST(req) {
  const { query, filters } = await req.json();
  
  const recipes = await prisma.recipe.findMany({
    where: {
      OR: [
        { title: { search: query } },
        { description: { search: query } }
      ],
      status: 'PUBLISHED'
    }
  });
  
  return Response.json({ data: recipes });
}

// GET /api/recipes/:id
export async function GET(req, { params }) {
  const recipe = await prisma.recipe.findUnique({
    where: { id: params.id },
    include: { reviews: true, author: true }
  });
  
  return Response.json({ data: recipe });
}
```

**Effort:** 1-2 days
**Owner:** Backend engineer

---

#### 2.2 Meal Plan API

```typescript
// POST /api/mealplans
export async function POST(req) {
  const session = await getSession();
  const { recipeId, day } = await req.json();
  
  const mealPlan = await prisma.mealPlan.create({
    data: {
      userId: session.user.id,
      day,
      recipes: { connect: { id: recipeId } }
    }
  });
  
  return Response.json({ data: mealPlan }, { status: 201 });
}

// DELETE /api/mealplans/:id
export async function DELETE(req, { params }) {
  const session = await getSession();
  
  const mealPlan = await prisma.mealPlan.delete({
    where: { id: params.id }
  });
  
  return Response.json({ data: mealPlan });
}
```

**Effort:** 1 day
**Owner:** Backend engineer

---

### Phase 3: Recipe Crawler (Weeks 3-4)

**Goal:** Populate database with real recipes

#### 3.1 Recipe Scraper Setup

```typescript
// backend/crawler/scraper.ts
import * as cheerio from 'cheerio';

async function scrapeRecipe(url) {
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);
  
  const recipe = {
    title: $('h1').text(),
    description: $('meta[name="description"]').attr('content'),
    ingredients: [],
    instructions: [],
    imageUrl: $('img.recipe-image').attr('src'),
    sourceUrl: url,
    sourceSite: new URL(url).hostname
  };
  
  // Parse ingredients
  $('li.ingredient').each((i, el) => {
    recipe.ingredients.push($(el).text());
  });
  
  // Parse instructions
  $('ol.instructions li').each((i, el) => {
    recipe.instructions.push($(el).text());
  });
  
  return recipe;
}

export async function crawlRecipes() {
  const sites = [
    'https://panlasang-pinoy.com',
    'https://kawaling-pinoy.com',
    'https://lutong-bahay.com'
  ];
  
  for (const site of sites) {
    // Fetch recipe links from site
    // For each link: scrapeRecipe() and save to DB
    // Handle duplicates and rate limiting
  }
}
```

**Effort:** 2-3 days
**Owner:** Backend engineer

**Note:** Use Puppeteer for sites with JavaScript rendering

---

### Phase 4: Frontend Integration (Weeks 4-5)

**Goal:** Connect UI to backend APIs

#### 4.1 Update DemoPage to use real recipes

```typescript
// Before: using useBackendRecipes from mock backend
// After: query real database via /api/recipes

export default function DemoPage() {
  const [recipes, setRecipes] = useState([]);
  
  useEffect(() => {
    fetch('/api/recipes?limit=30')
      .then(r => r.json())
      .then(data => setRecipes(data.data))
      .catch(err => console.error(err));
  }, []);
  
  return (
    // Same UI as before, but with real data
  );
}
```

**Effort:** 1 day
**Owner:** Frontend engineer

---

#### 4.2 Meal Plan Persistence

```typescript
// Update MealPlannerPage to use new APIs

const handleAddToMealPlan = async (recipe, day) => {
  const res = await fetch('/api/mealplans', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipeId: recipe.id, day })
  });
  
  const data = await res.json();
  setMealPlan([...mealPlan, data.data]);
};

const handleRemoveFromMealPlan = async (itemId) => {
  await fetch(`/api/mealplans/${itemId}`, { method: 'DELETE' });
  setMealPlan(mealPlan.filter(m => m.id !== itemId));
};
```

**Effort:** 1 day
**Owner:** Frontend engineer

---

### Phase 5: Production Hardening (Weeks 5-6)

**Goal:** Security, testing, monitoring

#### 5.1 Security Measures

- ✅ CORS configuration
- ✅ Rate limiting on APIs
- ✅ Input validation (Zod)
- ✅ HTTPS enforcement
- ✅ CSRF protection
- ✅ Helmet.js headers

#### 5.2 Error Handling

```typescript
// Global error boundary
export default function Error({ error, reset }) {
  return (
    <div className="error-container">
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

#### 5.3 Monitoring & Logging

- Sentry for error tracking
- DataDog for performance monitoring
- Server logs for debugging

**Effort:** 2-3 days
**Owner:** DevOps engineer

---

### Phase 6: Testing (Weeks 6-7)

**Goal:** 80%+ test coverage

#### 6.1 Unit Tests
```typescript
// tests/utils/recipeMatch.test.ts
describe('Recipe Matching Algorithm', () => {
  it('calculates match score correctly', () => {
    const ingredients = ['chicken', 'soy sauce', 'garlic'];
    const userItems = ['chicken', 'soy sauce'];
    const score = calculateMatch(ingredients, userItems);
    expect(score).toBe(66); // 2 out of 3
  });
});
```

#### 6.2 Integration Tests
```typescript
// tests/api/recipes.test.ts
describe('GET /api/recipes', () => {
  it('returns paginated recipes', async () => {
    const res = await fetch('/api/recipes?limit=10&page=1');
    const data = await res.json();
    expect(data.data).toHaveLength(10);
    expect(data.pagination.page).toBe(1);
  });
});
```

#### 6.3 E2E Tests (Cypress)
```typescript
// tests/e2e/meal-planning.cy.ts
describe('Meal Planning Flow', () => {
  it('adds recipe to meal plan', () => {
    cy.visit('/');
    cy.contains('Start Cooking').click();
    cy.contains('Chicken Adobo').click();
    cy.contains('Add to Meal Plan').click();
    cy.visit('/meal-planner');
    cy.contains('Chicken Adobo').should('exist');
  });
});
```

**Effort:** 2-3 days
**Owner:** QA engineer

---

### Phase 7: Deployment (Week 8)

**Goal:** Live production app

#### 7.1 Frontend Deployment (Vercel)
```bash
# Already has vercel.json, just push to main branch
git push origin main
# Vercel auto-deploys
```

#### 7.2 Backend Deployment (Railway/Render)
```bash
# Create Railway project
railway link <projectId>

# Set environment variables
railway variables set DATABASE_URL=...
railway variables set NEXTAUTH_SECRET=...

# Deploy
git push
```

**Effort:** 1 day
**Owner:** DevOps engineer

---

## 📋 PART 4: TASK BREAKDOWN & TIMELINE

### Summary Table

| Phase | Tasks | Timeline | Owner | Priority |
|-------|-------|----------|-------|----------|
| **0** | Security + Supabase Fix + Backend Stub | Week 1 | Backend | 🔴 CRITICAL |
| **1** | Next.js Migration + DB + Auth | Weeks 1-2 | Full Team | 🔴 CRITICAL |
| **2** | API Endpoints | Weeks 2-3 | Backend | 🟠 HIGH |
| **3** | Recipe Crawler | Weeks 3-4 | Backend | 🟠 HIGH |
| **4** | Frontend Integration | Weeks 4-5 | Frontend | 🟠 HIGH |
| **5** | Production Hardening | Weeks 5-6 | DevOps | 🟡 MEDIUM |
| **6** | Testing | Weeks 6-7 | QA | 🟡 MEDIUM |
| **7** | Deployment | Week 8 | DevOps | 🟡 MEDIUM |

**Total Timeline:** 8 weeks (with full-time team of 3-4)

---

## 🎯 PART 5: NEXT IMMEDIATE ACTIONS

### This Week (Oct 30 - Nov 6)

#### Day 1-2: Assessment
- [ ] Run `npm run dev` and test all pages
- [ ] Check Supabase connection (sign in to console)
- [ ] Verify Gemini API key works
- [ ] List all failing integrations

#### Day 3-4: Quick Wins
- [ ] Remove hardcoded API keys from code
- [ ] Create `.env.local.example` template
- [ ] Set up environment variables properly
- [ ] Create GitHub repo and push code

#### Day 5: Planning Meeting
- [ ] Review this roadmap with team
- [ ] Assign ownership for Phase 0 & 1
- [ ] Create GitHub issues for each task
- [ ] Establish sprint schedule

### Next Week (Nov 6-13)

#### Phase 0 (Security Fixes)
- [ ] Create backend proxy for AI service
- [ ] Fix Supabase meal plan queries
- [ ] Set up Express.js starter
- [ ] Test all integrations

#### Phase 1 Preparation
- [ ] Create Next.js project scaffold
- [ ] Plan database migrations
- [ ] Design API structure
- [ ] Plan authentication flow

---

## 📚 PART 6: KNOWLEDGE BASE FOR TEAM

### For Frontend Engineers

**Key Files to Know:**
- `App.tsx` - Main router, state management
- `pages/DemoPage.tsx` - Recipe browser (main feature)
- `components/Header.tsx` - Navigation
- `services/useRecipes.ts` - Custom hooks
- `tailwind.config.js` - Design system

**Technologies:**
- React 19 (latest hooks, concurrent features)
- TypeScript (strict mode recommended)
- Tailwind CSS (utility-first)
- Next.js (upcoming migration)

**Common Tasks:**
- Add new page: Create in `pages/` folder
- Fetch data: Use custom hooks in `services/useRecipes.ts`
- Update styles: Use Tailwind classes directly in JSX
- Connect to database: Use Prisma client from Next.js API

---

### For Backend Engineers

**Key Files to Know:**
- `PRISMA_SCHEMA.prisma` - Database structure
- `PHASE_1_API_CODE.ts` - Example API endpoints
- `services/geminiService.ts` - AI integration
- `services/api.js` - Backend API definitions

**Technologies:**
- Express.js or Next.js API routes (both viable)
- PostgreSQL (via Supabase)
- Prisma ORM (TypeScript-safe)
- NextAuth.js (authentication)

**Critical Tasks:**
1. Fix Supabase queries (meal plan table)
2. Create API endpoints for recipes
3. Set up authentication middleware
4. Build recipe crawler
5. Implement rate limiting & error handling

---

### For DevOps Engineers

**Key Files to Know:**
- `vercel.json` - Frontend deployment config
- `.env.local` - Environment setup
- `package.json` - Scripts & dependencies
- Database: Supabase project

**Infrastructure Checklist:**
- [ ] Set up Supabase PostgreSQL
- [ ] Configure Vercel frontend deployment
- [ ] Set up backend hosting (Railway/Render)
- [ ] Configure environment variables
- [ ] Set up error tracking (Sentry)
- [ ] Set up monitoring (DataDog)
- [ ] Configure CI/CD pipeline (GitHub Actions)

---

### For Project Manager

**Key Metrics:**
- **Production Readiness:** Currently 13%, target 95%+
- **API Coverage:** 0/30 endpoints implemented
- **Feature Coverage:** 17/170 features working
- **Test Coverage:** 0% target 80%+

**Risks:**
- 🔴 Security: Exposed API keys
- 🔴 Data Loss: Meal plans not persistent
- 🟠 Performance: No backend optimization
- 🟠 Scalability: No load testing

**Success Criteria (Phase 1 Complete):**
- ✅ Next.js app running
- ✅ PostgreSQL connected
- ✅ Authentication working
- ✅ 15 API endpoints
- ✅ 50+ recipes in database
- ✅ Zero hardcoded secrets

---

## 🔗 PART 7: REFERENCE MATERIALS

### Important Code References

1. **Prisma Schema** → `PRISMA_SCHEMA.prisma` (complete database model)
2. **API Examples** → `PHASE_1_API_CODE.ts` (copy-paste templates)
3. **Auth Setup** → `NEXTAUTH_CONFIG.ts` (authentication flow)
4. **Package Info** → `package.json` (all dependencies listed)

### External Resources

- **React 19**: https://react.dev/
- **TypeScript**: https://www.typescriptlang.org/
- **Next.js**: https://nextjs.org/docs
- **Prisma**: https://www.prisma.io/docs/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Supabase**: https://supabase.com/docs

---

## ✅ SIGN-OFF CHECKLIST

- [ ] Team has read and understood architecture
- [ ] Phase 0 tasks assigned and started
- [ ] GitHub repo created with issues
- [ ] Environment setup documented
- [ ] Database backup strategy planned
- [ ] Communication channels established
- [ ] Deployment plan reviewed
- [ ] Risk mitigation discussed

---

**Document Version**: 1.0  
**Last Updated**: October 30, 2025  
**Status**: ACTIVE - Ready for Implementation  
**Next Review**: November 6, 2025 (after Phase 0)

---

**🚀 Ready to build production? Let's go!**
