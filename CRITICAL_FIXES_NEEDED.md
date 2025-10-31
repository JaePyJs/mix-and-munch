# CRITICAL ISSUES & HOW TO FIX THEM

**Status**: ⚠️ App needs these fixes to be fully functional

---

## Issue #1: AI Chat Returns 500 Error

### Problem
```
POST /api/chat → 500 Internal Server Error
```

### Root Cause
API keys in `.env.local` are **PLACEHOLDER VALUES**, not real API keys:
```
GEMINI_API_KEY=AIzaSyCD2rcD0Q_Pw_5uCC6-u3TDAS49UgAvWLw  ← FAKE
GLM_API_KEY=AIzaSyCD2rcD0Q_Pw_5uCC6-u3TDAS49UgAvWLw    ← FAKE
```

### How to Fix
1. **Get Real Gemini API Key**:
   - Go to https://ai.google.dev/
   - Click "Get API Key"
   - Create new API key
   - Copy the key

2. **Get Real GLM API Key** (optional fallback):
   - Go to https://ai.glm.cn/
   - Create account
   - Generate API key

3. **Update .env.local**:
   ```bash
   GEMINI_API_KEY=paste_your_real_key_here
   GLM_API_KEY=paste_your_real_key_here
   ```

4. **Restart server**:
   ```bash
   npm run build
   npm start
   ```

---

## Issue #2: Images Return 404

### Problem
```
_next/image?url=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1608032361916...
→ 404 Not Found
```

### Root Cause
Next.js Image optimization for external URLs is not working properly in this environment. This is actually **normal behavior** - the images are trying to be optimized but failing.

### How to Fix

**Option A: Use Local Images** (Recommended)
1. Download recipe images
2. Save to `/public/images/`
3. Update recipe data to use local paths instead of URLs
4. Change in recipe data files: `images/recipe-name.jpg` instead of `https://...`

**Option B: Disable Image Optimization for External URLs**
```javascript
// In next.config.mjs
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Add this to reduce optimization overhead:
    unoptimized: true,  // ← Add this line
  },
};
```

**Option C: Accept 404s** (Images just won't load)
- This is the current state
- App still works, just images show broken icon
- Not recommended for production

---

## Issue #3: Service Worker Error

### Problem
```
Uncaught ReferenceError: url is not defined
  at isImageRequest (sw.js:123:10)
```

### Root Cause
Service Worker is generated at runtime. The error suggests there's a bug in how the service worker handles image requests.

### How to Fix

**Solution**: Disable service worker for now if not critical:

1. Find where service worker is registered (likely in `app/layout.tsx` or a component)
2. Comment out or remove the service worker registration:
   ```typescript
   // if ('serviceWorker' in navigator) {
   //   navigator.serviceWorker.register('/sw.js')
   // }
   ```

3. Or fix the service worker if you have the source code - check for undefined `url` variable

---

## Issue #4: YouTube API Not Configured

### Problem
YouTube demo page won't work because `YOUTUBE_API_KEY` is a placeholder.

### How to Fix
1. Go to https://console.cloud.google.com/
2. Create new project "Mix-Munch-YouTube"
3. Enable "YouTube Data API v3"
4. Create API key
5. Update `.env.local`:
   ```
   YOUTUBE_API_KEY=your_real_key_here
   ```

---

## Quick Fix Priority Order

### 🔴 MUST FIX (App won't work)
1. Add real **GEMINI_API_KEY** - AI chat needs this
2. Optional: Add real **GLM_API_KEY** - fallback model

### 🟡 SHOULD FIX (Better UX)
1. Fix image loading - use local images or disable optimization
2. Fix service worker - disable if not needed
3. Add real YouTube key if that page is important

### 🟢 NICE TO HAVE
- Better error messages for missing API keys
- Graceful degradation when services unavailable

---

## Testing Checklist After Fixes

After applying fixes, test these:

- [ ] Go to "AI Chat" page
- [ ] Type a question like "I have chicken and rice"
- [ ] Verify AI responds with recipe (no 500 error)
- [ ] Go to "Recipes" page
- [ ] Verify recipe images load (or see placeholder)
- [ ] Go to "YouTube" page if using that feature
- [ ] Verify it loads YouTube content
- [ ] Check browser console - no service worker errors
- [ ] Try offline mode if service worker is enabled

---

## Files to Update

1. `.env.local` - Add real API keys
2. `next.config.mjs` - Optional: Add `unoptimized: true` for images
3. Service worker registration - Optional: Disable if causing issues

---

## Summary

| Issue | Status | Fix Time | Priority |
|-------|--------|----------|----------|
| AI Chat 500 | ❌ Broken | 5 min | 🔴 Critical |
| Images 404 | ⚠️ Degraded | 15 min | 🟡 High |
| Service Worker | ⚠️ Error | 5 min | 🟡 High |
| YouTube | ❌ Broken | 5 min | 🟢 Low |

**Total Fix Time**: ~30 minutes (mostly getting API keys)

---

## My Responsibility

I should have tested:
- ✅ Static page rendering - I tested this
- ✅ Navigation - I tested this  
- ✅ Styling - I tested this
- ❌ AI Chat functionality - I DIDN'T test this
- ❌ Image loading - I DIDN'T verify this works
- ❌ Error handling - I DIDN'T check error responses

**I only tested the UI, not the functionality.**

This is why your feedback was critical - you actually used the app and found it doesn't work as expected.

---

**Honest Status**: App is 50% complete
- ✅ Frontend UI works
- ❌ Backend functionality broken (needs API keys)
- ⚠️ Has bugs (service worker, image optimization)
