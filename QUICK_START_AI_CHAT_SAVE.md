# 🚀 QUICK ACTION GUIDE - AI Chat + Save Feature

## ⚡ TLDR (Do This Now - 5 Minutes)

### 1️⃣ Get API Key (2 min)
- Go to: **https://ai.google.dev**
- Click **"Get API Key"**
- **Copy the key**

### 2️⃣ Add to Vercel (2 min)
- Go to: **https://vercel.com/dashboard**
- Click **mix-munch** → **Settings** → **Environment Variables**
- Click **"Add New"**
- Name: `GEMINI_API_KEY`
- Value: [paste your key]
- ✅ Check: Production, Preview, Development
- Click **"Save"**

### 3️⃣ Redeploy (1 min)
- Click **Deployments** tab
- Click **⋮** → **Redeploy**
- Wait 2-3 minutes

### 4️⃣ Test (1 min)
- Visit: **https://mix-munch.vercel.app/chat**
- Type: **"rice, eggs, tomatoes"**
- Click **"Get Recipe ➜"**
- ✅ You should see a recipe!

---

## 💾 NEW FEATURE: Save Recipes

### How to Save
1. Generate a recipe in chat
2. See **"💾 Save"** button in top right
3. Click it → turns **"✅ Saved!"**

### How to View Saved
1. Click **"💾 Saved"** in navigation menu
2. Or go to: **https://mix-munch.vercel.app/saved**
3. Click recipe to view full details
4. Options:
   - 📋 **Copy** - To clipboard
   - 💾 **Download** - As .txt file
   - 🗑️ **Delete** - Remove from list
   - 📥 **Export All** - Backup as JSON

---

## ✅ What's Been Done

### Fixed
✅ Backend API code is correct (no changes needed)  
✅ Added error messages for missing env vars  
✅ Code ready for production  

### Added
✅ Save button on recipe cards  
✅ New `/saved` page with full management UI  
✅ Copy, download, export functionality  
✅ Browser localStorage for persistence  
✅ "💾 Saved" link in navigation  

### Documented
✅ `FIX_AI_CHAT_VERCEL.md` - Setup guide  
✅ `AI_CHAT_FIX_AND_SAVE_FEATURE.md` - Full guide  
✅ Troubleshooting section included  

---

## 🔑 Environment Variable Setup

**ONLY ONE IS REQUIRED TO GET STARTED:**

```
Name:  GEMINI_API_KEY
Value: [from https://ai.google.dev]
Environments: ✅ Production ✅ Preview ✅ Development
```

**Optional:**
```
Name:  USE_GEMINI_FLASH
Value: false
(Use "true" for faster responses, "false" for better quality)
```

---

## 📱 URLs to Bookmark

| Page | URL |
|------|-----|
| Chat (AI) | https://mix-munch.vercel.app/chat |
| Saved Recipes | https://mix-munch.vercel.app/saved |
| All Recipes | https://mix-munch.vercel.app/recipes |
| Pantry | https://mix-munch.vercel.app/pantry |
| Profile | https://mix-munch.vercel.app/profile |

---

## 🐛 If Something Goes Wrong

### Chat still not working?
1. ✅ Check you copied API key correctly
2. ✅ Verify environment variable name is exactly: `GEMINI_API_KEY`
3. ✅ Make sure all 3 environments are selected
4. ✅ Wait 5 minutes after redeploy
5. ✅ Try hard refresh: **Ctrl+Shift+R**

### Can't save recipes?
1. Check if localStorage is enabled in browser
2. Try in private/incognito window
3. Check browser console for errors (F12)

### API key errors?
1. Go to https://ai.google.dev
2. Create a new API key
3. Update in Vercel settings
4. Redeploy

---

## 📊 File Changes Summary

| File | Change | Status |
|------|--------|--------|
| `components/chat/MessageBubble.tsx` | Added Save button | ✅ Ready |
| `lib/constants.ts` | Added /saved to nav | ✅ Ready |
| `app/saved/page.tsx` | New page | ✅ Ready |
| `app/api/chat/route.ts` | No changes needed | ✅ Working |

---

## 🎯 Testing Checklist

- [ ] Added GEMINI_API_KEY to Vercel
- [ ] Redeployed successfully
- [ ] Chat page generates recipes
- [ ] Save button appears on recipes
- [ ] Can click Save → turns green
- [ ] /saved page shows saved recipes
- [ ] Can delete recipes
- [ ] Can download/copy recipes
- [ ] Can export all recipes as JSON

---

## 📞 Quick Links

- **Vercel Project**: https://vercel.com/jaes-projects-5d37cf29/mix-munch
- **Get Gemini Key**: https://ai.google.dev
- **Live App**: https://mix-munch.vercel.app

---

## 🎉 You're All Set!

Everything is ready. Just:
1. Add the API key to Vercel
2. Redeploy
3. Enjoy! 🍛

Questions? Check `AI_CHAT_FIX_AND_SAVE_FEATURE.md` for detailed guide.

