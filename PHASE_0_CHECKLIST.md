# Phase 0: Immediate Actions Checklist

**Duration**: Week 1 (Oct 30 - Nov 6, 2025)  
**Goal**: Fix critical issues, secure the codebase, prepare for production

---

## ✅ TASK BREAKDOWN

### TASK 1: Security - Remove Exposed API Keys

**Owner**: Backend Engineer  
**Priority**: 🔴 CRITICAL  
**Time**: 2-3 hours  
**Blocker**: YES (blocks all other work)

#### 1.1 Identify all exposed keys

```bash
# Search for hardcoded keys
grep -r "AIzaSy" ./src
grep -r "ad4f34d8" ./src
grep -r "eyJhbGci" ./src

# Expected files:
# - services/geminiService.ts (2 API keys)
# - services/supabaseClient.ts (1 key)
```

#### 1.2 Create backend proxy endpoint

**File to create**: `backend/routes/ai.ts` (or `api/ai.js`)

```typescript
// BEFORE: Frontend calls Gemini directly with exposed key
// AFTER: Frontend calls our backend, backend has the key

import { Router } from 'express';

const router = Router();

router.post('/ai/chat', async (req, res) => {
  const { history, newMessage, context } = req.body;
  
  // Validate request
  if (!newMessage) {
    return res.status(400).json({ error: 'Message required' });
  }
  
  // Call Gemini with our backend key (never exposed)
  const apiKey = process.env.GEMINI_API_KEY;
  
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: { text: 'You are Mix...' } },
        contents: [...history, { role: 'user', parts: [{ text: newMessage }] }],
      }),
    });
    
    const data = await response.json();
    res.json({ text: data.candidates[0].content.parts[0].text });
  } catch (error) {
    res.status(500).json({ error: 'AI service error' });
  }
});

export default router;
```

#### 1.3 Update frontend to use proxy

**File to update**: `services/geminiService.ts`

```typescript
// BEFORE:
const apiKey = import.meta.env.VITE_GEMINI_API_KEY 
               || 'AIzaSyCD2rcD0Q_Pw_5uCC6-u3TDAS49UgAvWLw'; // EXPOSED!

// AFTER:
async function* useDirectGeminiAPI(apiHistory, newMessage, context) {
  // No more direct Gemini call
  // Instead, call backend proxy
  
  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        history: apiHistory,
        newMessage,
        context,
      }),
    });
    
    const data = await response.json();
    yield data.text;
  } catch (error) {
    console.error('AI service error:', error);
    // Fallback to mock recipe
    yield* generateMockRecipe();
  }
}
```

#### 1.4 Update environment variables

**File to update/create**: `.env.local`

```env
# Before: Key visible to everyone
VITE_GEMINI_API_KEY=AIzaSyCD2rcD0Q_Pw_5uCC6-u3TDAS49UgAvWLw

# After: Key only on backend
# .env.local (frontend - no secrets)
VITE_BACKEND_URL=http://localhost:5000

# .env (backend - never commit this!)
GEMINI_API_KEY=AIzaSyCD2rcD0Q_Pw_5uCC6-u3TDAS49UgAvWLw
Z_AI_KEY=ad4f34d8e7674e30bb2b986fed82945e.RnYLyzvQwruxvZEX
```

**Create**: `.env.local.example` (safe to commit)

```env
# Copy this file to .env.local and fill in your values
# DO NOT COMMIT .env.local

VITE_BACKEND_URL=http://localhost:5000
VITE_SUPABASE_URL=https://oxehooznbwiubjmdekoj.supabase.co
```

#### 1.5 Verify no secrets in code

```bash
# Remove all hardcoded keys
rm -f services/geminiService.ts.bak
git diff services/geminiService.ts  # Review changes

# Test it works
npm run dev
# Try AI chat in browser
```

**✅ Completion Criteria:**
- [ ] No API keys in frontend code
- [ ] Backend proxy working
- [ ] Frontend calls `/api/ai/chat`
- [ ] .env.local.example created
- [ ] Tests pass: `npm run dev`

---

### TASK 2: Backend API Stub

**Owner**: Backend Engineer  
**Priority**: 🔴 CRITICAL  
**Time**: 2-3 hours  
**Dependencies**: TASK 1 (uses same Express server)

#### 2.1 Create Express.js server

**File to create**: `backend/server.ts` (or `.js`)

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ============================================================
// HEALTH CHECK
// ============================================================
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================================
// RECIPES - List
// ============================================================
app.get('/api/recipes', (req, res) => {
  const limit = parseInt(req.query.limit || '20');
  const page = parseInt(req.query.page || '1');
  
  // For now: return mock recipes
  const mockRecipes = [
    {
      id: 1,
      title: 'Chicken Adobo',
      description: 'Classic Filipino braised chicken',
      cuisine: 'Filipino',
      difficulty: 'medium',
      prepTime: 10,
      cookTime: 45,
      ingredients: JSON.stringify([
        { name: 'Chicken', quantity: '1.5', unit: 'kg' },
        { name: 'Soy Sauce', quantity: '1', unit: 'cup' },
      ]),
      instructions: JSON.stringify([
        'Brown the chicken',
        'Add soy sauce and vinegar',
        'Simmer for 45 minutes',
      ]),
      imageUrl: 'https://via.placeholder.com/400x300?text=Chicken+Adobo',
      status: 'PUBLISHED',
    },
    // Add more mock recipes here
  ];
  
  const total = mockRecipes.length;
  const recipes = mockRecipes.slice((page - 1) * limit, page * limit);
  
  res.json({
    data: recipes,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

// ============================================================
// RECIPES - Get single
// ============================================================
app.get('/api/recipes/:id', (req, res) => {
  const { id } = req.params;
  
  // For now: return mock recipe
  const recipe = {
    id,
    title: 'Chicken Adobo',
    description: 'Classic Filipino braised chicken',
    ingredients: [
      { name: 'Chicken', quantity: '1.5', unit: 'kg' },
    ],
    instructions: [
      'Brown the chicken',
      'Add soy sauce and vinegar',
      'Simmer for 45 minutes',
    ],
    imageUrl: 'https://via.placeholder.com/400x300?text=Chicken+Adobo',
  };
  
  res.json({ data: recipe });
});

// ============================================================
// RECIPES - Search
// ============================================================
app.post('/api/recipes/search', (req, res) => {
  const { query } = req.body;
  
  // For now: return all recipes
  res.json({
    data: [
      { id: 1, title: 'Chicken Adobo', description: 'Classic Filipino dish' },
    ],
  });
});

// ============================================================
// ERROR HANDLER
// ============================================================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// ============================================================
// START SERVER
// ============================================================
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
```

#### 2.2 Add dependencies

```bash
npm install express cors dotenv
npm install -D @types/express @types/node ts-node typescript
```

#### 2.3 Add startup script

**File to update**: `package.json`

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:frontend\" \"npm run dev:backend\"",
    "dev:frontend": "vite --host 0.0.0.0 --port 2000",
    "dev:backend": "ts-node backend/server.ts",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

```bash
npm install -D concurrently
```

#### 2.4 Test it works

```bash
# Terminal 1: Start backend
npm run dev:backend
# Should print: Backend running on http://localhost:5000

# Terminal 2: Test endpoint
curl http://localhost:5000/api/health
# Should return: {"status":"ok","timestamp":"..."}

curl http://localhost:5000/api/recipes?limit=10&page=1
# Should return: {"data":[...],"pagination":{...}}
```

**✅ Completion Criteria:**
- [ ] Express server starts without errors
- [ ] `/api/health` returns status
- [ ] `/api/recipes` returns paginated data
- [ ] `/api/recipes/:id` returns single recipe
- [ ] No console errors
- [ ] CORS working (frontend can call backend)

---

### TASK 3: Fix Supabase Integration

**Owner**: Backend Engineer  
**Priority**: 🟠 HIGH  
**Time**: 1-2 hours  
**Dependencies**: Task 2 (needs backend)

#### 3.1 Inspect Supabase database

```bash
# 1. Go to https://supabase.com/dashboard
# 2. Find project: "oxehooznbwiubjmdekoj"
# 3. Check Tables in SQL Editor:
#    - meal_plan table exists?
#    - recipes table exists?
#    - Foreign key relationship?

# SQL to check:
SELECT * FROM meal_plan LIMIT 1;
SELECT * FROM recipes LIMIT 1;
```

#### 3.2 Verify Supabase key

**File**: `services/supabaseClient.ts`

```typescript
// Check if this is correct:
const supabaseUrl = 'https://oxehooznbwiubjmdekoj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

// The key should match your Supabase project's anon key
// (found in: Project Settings → API)
```

#### 3.3 Fix meal plan query

**File to update**: `App.tsx`

```typescript
// CURRENT (might be broken):
const { data, error } = await supabase
  .from('meal_plan')
  .select(`
    id,
    day,
    recipe:recipes(*)
  `)
  .order('created_at', { ascending: true });

// FIXED:
const { data, error } = await supabase
  .from('meal_plan')
  .select(`
    id,
    day,
    recipe_id,
    recipes(id, name, description, imageUrl, ingredients, instructions)
  `)
  .order('created_at', { ascending: true });

// Then transform:
const formattedData = (data || []).map(item => ({
  id: item.id,
  day: item.day,
  recipe: item.recipes[0] || item.recipes, // Handle join format
}));
```

#### 3.4 Test Supabase connection

```bash
# Create a simple test file: test-supabase.ts
import { supabase } from './services/supabaseClient';

async function testSupabase() {
  // Test 1: Health check
  const { data: dbData, error: dbError } = await supabase.rpc('version');
  if (dbError) console.error('DB error:', dbError);
  else console.log('✅ Supabase connected');
  
  // Test 2: Read meal plan
  const { data, error } = await supabase
    .from('meal_plan')
    .select('*')
    .limit(1);
  if (error) console.error('Meal plan error:', error);
  else console.log('✅ Meal plan accessible:', data);
}

testSupabase();
```

**✅ Completion Criteria:**
- [ ] Supabase project accessible
- [ ] meal_plan table has data (or can add test data)
- [ ] Supabase key is correct
- [ ] Query returns data without errors
- [ ] App.tsx can fetch meal plan

---

### TASK 4: Environment Variable Management

**Owner**: DevOps Engineer  
**Priority**: 🟡 MEDIUM  
**Time**: 1 hour

#### 4.1 Create .env files

**File to create**: `.env.local.example`

```env
# Frontend Environment Variables
# Copy this file to .env.local and fill in your values
# DO NOT COMMIT .env.local - it's in .gitignore

# Backend URL (for API calls)
VITE_BACKEND_URL=http://localhost:5000

# Supabase (optional - for database)
VITE_SUPABASE_URL=https://oxehooznbwiubjmdekoj.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Google Gemini (only used if backend proxy fails)
VITE_GEMINI_API_KEY=your_gemini_key_here
```

**File to create**: `backend/.env.example`

```env
# Backend Environment Variables
# Copy this file to .env and fill in your values
# DO NOT COMMIT .env - it's in .gitignore

PORT=5000

# Gemini API (secret - never expose)
GEMINI_API_KEY=your_gemini_key_here

# Z.AI API (secret - never expose)
Z_AI_KEY=your_z_ai_key_here

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mix_and_munch

# NextAuth (needed for Phase 1)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_32_char_secret_here
```

#### 4.2 Update .gitignore

**File to verify**: `.gitignore`

```
# Environment variables (NEVER commit!)
.env
.env.local
.env.*.local

# Dependencies
node_modules/
dist/

# IDE
.vscode/
.idea/

# OS
.DS_Store
*.swp
```

#### 4.3 Document for team

**File to create**: `ENV_SETUP.md`

```markdown
# Environment Setup Guide

## Frontend (.env.local)

1. Copy `.env.local.example` to `.env.local`
2. Fill in required variables:
   - VITE_BACKEND_URL: Set to http://localhost:5000 locally
   - VITE_GEMINI_API_KEY: Optional (backend is preferred)

## Backend (.env)

1. Copy `backend/.env.example` to `backend/.env`
2. Fill in secrets:
   - GEMINI_API_KEY: Get from https://aistudio.google.com/app/apikeys
   - Z_AI_KEY: Get from https://z.ai
   - NEXTAUTH_SECRET: Generate with: `openssl rand -hex 32`

## Local Development

```bash
# Terminal 1: Frontend (port 2000)
npm run dev:frontend

# Terminal 2: Backend (port 5000)
npm run dev:backend

# Visit: http://localhost:2000
```

## Production

- Frontend deploys to Vercel (set env vars in dashboard)
- Backend deploys to Railway/Render (set env vars in dashboard)
- Never commit .env or .env.local
```

**✅ Completion Criteria:**
- [ ] .env.local.example created
- [ ] backend/.env.example created
- [ ] .gitignore configured
- [ ] ENV_SETUP.md created
- [ ] Team has access to actual env vars

---

### TASK 5: Testing & Verification

**Owner**: QA / Full Team  
**Priority**: 🟡 MEDIUM  
**Time**: 1-2 hours

#### 5.1 Full system test

**Checklist:**

```bash
# 1. Clean install
rm -rf node_modules dist
npm install

# 2. Start backend
npm run dev:backend
# ✅ Should see: "Backend running on http://localhost:5000"
# ✅ Should see: "Health check: http://localhost:5000/api/health"

# 3. Start frontend (new terminal)
npm run dev:frontend
# ✅ Should see: "VITE v7.1.12  ready in XXX ms"
# ✅ Should see: "➜  Local:   http://localhost:2000"

# 4. Test in browser
# - Visit http://localhost:2000
# - ✅ HomePage loads
# - ✅ Click "Recipes" → DemoPage loads recipes
# - ✅ Select ingredients → recipes show match scores
# - ✅ Click recipe card → modal opens
# - ✅ AI chat works (check browser console for no errors)

# 5. Test backend endpoints
curl http://localhost:5000/api/health
# ✅ Returns: {"status":"ok",...}

curl http://localhost:5000/api/recipes
# ✅ Returns: {"data":[...],"pagination":{...}}

# 6. Test Supabase
# - Open browser console
# - Go to MealPlannerPage
# - ✅ Loads without errors
```

#### 5.2 Check for errors

```bash
# Frontend console (F12 in browser)
# Should see NO errors like:
# ❌ "Cannot find module..."
# ❌ "undefined is not a function"
# ❌ "Supabase connection failed"
# ❌ Hardcoded API keys

# Backend console
# Should see NO errors like:
# ❌ "CORS error"
# ❌ "Cannot connect to database"
# ❌ Port already in use
```

**✅ Completion Criteria:**
- [ ] Frontend loads on port 2000
- [ ] Backend runs on port 5000
- [ ] All pages accessible
- [ ] No console errors
- [ ] API endpoints respond
- [ ] Supabase queries work

---

## 📋 WEEKLY CHECKLIST

### Monday (Oct 30)
- [ ] TASK 1: Start removing API keys
- [ ] Code review for TASK 1

### Tuesday (Oct 31)
- [ ] TASK 1: Complete API key removal
- [ ] TASK 2: Start building backend

### Wednesday (Nov 1)
- [ ] TASK 2: Complete backend API stub
- [ ] TASK 3: Inspect Supabase
- [ ] TASK 4: Start env setup

### Thursday (Nov 2)
- [ ] TASK 3: Fix Supabase queries
- [ ] TASK 4: Complete env setup
- [ ] TASK 5: Start testing

### Friday (Nov 3)
- [ ] TASK 5: Complete all testing
- [ ] Code review all changes
- [ ] Documentation update

### Monday-Friday (Nov 4-6)
- [ ] Buffer time for fixes
- [ ] Address any blocking issues
- [ ] Prepare for Phase 1

---

## 🎯 Success Criteria (All Tasks Complete)

**Security** ✅
- [ ] No hardcoded API keys in frontend
- [ ] All secrets in .env (not committed)
- [ ] Backend proxy working

**Functionality** ✅
- [ ] Backend API running
- [ ] All endpoints responding
- [ ] Supabase queries working
- [ ] DemoPage loads recipes

**Code Quality** ✅
- [ ] No console errors
- [ ] TypeScript compiling
- [ ] CORS working
- [ ] Environment properly configured

**Documentation** ✅
- [ ] .env.local.example created
- [ ] ENV_SETUP.md written
- [ ] README updated with setup steps

---

## 🚨 If You Get Stuck

**Backend won't start?**
```bash
# Check if port 5000 is in use
lsof -i :5000
# Kill if needed: kill -9 <PID>

# Check for syntax errors
npm run dev:backend 2>&1 | head -20
```

**CORS error?**
```bash
# Backend might not have CORS enabled
# Add to backend/server.ts:
app.use(cors());
```

**Supabase not connecting?**
```bash
# Check project URL and key in supabaseClient.ts
# Test with: fetch('https://oxehooznbwiubjmdekoj.supabase.co/rest/v1/meal_plan')
```

**API key exposure?**
```bash
# Search for exposed keys
grep -r "AIzaSy\|ad4f34d8\|eyJhbGc" ./src --include="*.ts" --include="*.js"
# Should return NOTHING
```

---

## 📞 Questions?

- Read detailed guide: `CODEBASE_ANALYSIS_AND_ROADMAP.md`
- Check error logs carefully
- Ask in team Slack/Discord
- Schedule pair programming session

---

**Phase 0 Status**: 🔴 NOT STARTED  
**Estimated Completion**: Friday, November 3, 2025  
**Next Phase**: Phase 1 (Next.js Migration) starts Monday, November 6

**Let's fix this! 🚀**
