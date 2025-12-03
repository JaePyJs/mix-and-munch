# Mix & Munch - AI Coding Agent Instructions

## Architecture Overview

**Stack**: Next.js 14 App Router + TypeScript + Tailwind CSS + Vercel AI SDK + Google Gemini 2.5 Flash  
**Data**: Static JSON files in `data/` - no database required  
**Deployment**: Vercel (production at mix-munch.vercel.app)

### Key Data Flow

1. **Recipes**: Static JSON (`data/recipes.json`) → `lib/data.ts` getters → components
2. **Crawled content**: `scripts/crawl-recipes.js` → `data/crawled-recipes/` → `scripts/merge-crawled-recipes.js` → `data/recipes.json`
3. **AI Chat**: Client → `/api/chat` (Edge runtime) → Gemini 2.5 Flash streaming via `ai` SDK
4. **Pantry Matching**: User selections → `getMatchResults()` in `lib/data.ts` → sorted recipe list

## Essential Commands

```bash
start.bat            # Start development server (double-click)
stop.bat             # Stop all servers (double-click)
npm run dev          # Start Next.js dev server (localhost:3000)
npm test             # Run Jest tests (76+ tests across 5 suites)
npm run test:watch   # Watch mode for TDD
npm run lint         # ESLint check
npm run type-check   # TypeScript strict mode validation

# Recipe crawling workflow
npm run crawl-panlasang     # Crawl panlasangpinoy.com recipes
npm run validate-recipes    # Check recipe data quality
npm run validate-recipes:fix # Auto-fix recipe formatting issues
```

## Project Conventions

### Component Structure

- Use `'use client'` directive only when needed (state, hooks, browser APIs)
- Import UI primitives from `@/components/ui/*` (Button, Tag, etc.)
- Follow variant pattern for styling: `variant?: 'primary' | 'secondary' | 'ghost'`
- Use `clsx()` for conditional classNames

### Type System

- All types centralized in `lib/types.ts` - extend existing types, don't duplicate
- Recipe types: `Recipe` (full), `RecipeSummary` (list view), `MatchResult` (with pantry match data)
- Use `satisfies` for type-safe object literals

### Data Access Pattern

```typescript
// Always use lib/data.ts getters, not direct JSON imports
import { getAllRecipes, getRecipeBySlug, getMatchResults } from '@/lib/data';
```

### Styling Conventions

- Dark theme only: `bg-brand-gray-*`, `text-brand-gray-*`
- Accent color: `brand-lime` (#A3E635), secondary: `brand-green`
- Custom classes: `card-surface`, `page-grid`, `shadow-glow`
- Mobile-first responsive: `sm:`, `lg:` breakpoints

### i18n Pattern

```typescript
import { useTranslation } from '@/lib/hooks/useTranslation';
const { t } = useTranslation();
// Keys in locales/en.json and locales/tl.json
```

## Testing Guidelines

- Tests live in `tests/` with structure: `unit/`, `integration/`, `e2e/`, `performance/`
- Test file naming: `*.test.ts` or `*.test.tsx`
- Setup in `tests/setupTests.ts` - sets `GEMINI_API_KEY=test-api-key-for-testing`
- API routes return mock responses when test API key detected

```typescript
// Example test pattern
import { render, screen } from '@testing-library/react';
import { RecipeCard } from '@/components/recipes/RecipeCard';
```

## API Routes

All routes in `app/api/` use Next.js App Router conventions:

| Route                  | Runtime | Purpose                     |
| ---------------------- | ------- | --------------------------- |
| `/api/chat`            | Edge    | Gemini AI streaming chat    |
| `/api/recipes`         | Node    | Recipe CRUD operations      |
| `/api/ingredients`     | Node    | Ingredient data             |
| `/api/youtube-crawler` | Node    | Video transcript extraction |

## Key Files for Understanding

- `lib/data.ts` - Central data access layer with matching algorithm
- `lib/utils/ingredient-formatter.ts` - Recipe text normalization utilities
- `app/pantry/page.tsx` - Example of pantry matching UI pattern
- `scripts/crawl-recipes.js` - Web scraping with proper selectors per source
- `components/ui/Button.tsx` - Reference for component variant pattern

## Environment Variables

Required in `.env.local`:

```
GEMINI_API_KEY=your_key_here  # Get from https://ai.google.dev/
```

## Common Patterns to Follow

### Adding a new page

1. Create `app/[route]/page.tsx` with metadata export
2. Add navigation in `lib/constants.ts` NAV_ITEMS array
3. Add translations to both `locales/en.json` and `locales/tl.json`

### Adding new recipes

1. Add to `data/recipes.json` following `Recipe` type schema
2. Ensure `matchIngredients` array contains valid ingredient IDs from `data/ingredients.json`
3. Run `npm run validate-recipes` to verify format

### Modifying AI behavior

- System prompt in `app/api/chat/route.ts` - Filipino cuisine focus
- Streaming response uses `streamText()` from `ai` SDK
