# 🔑 HOW TO ADD YOUR API KEYS - SIMPLE VERSION

## The 3 Keys You Need to Add

**File**: `.env.local` in your project folder

### Key 1: GEMINI (REQUIRED for AI Chat)

**Line 12:** Find this:
```
GEMINI_API_KEY=PASTE_YOUR_REAL_GEMINI_KEY_HERE
```

**Get your key:**
1. Go to https://ai.google.dev/
2. Click "Get API Key" button
3. Copy the entire key
4. Replace the text with your actual key

**Result:**
```
GEMINI_API_KEY=AIzaSyAbc123def456ghi789jkl0mn1op2qr3st4
```

---

### Key 2: GLM (OPTIONAL - for AI Chat backup)

**Line 15:** Find this:
```
GLM_API_KEY=PASTE_YOUR_REAL_GLM_KEY_HERE
```

**Get your key:**
1. Go to https://ai.glm.cn/
2. Create account / login
3. Generate an API key
4. Copy the key
5. Replace the text with your key

**Result:**
```
GLM_API_KEY=sk-abc123def456ghi789jkl0mn1op2qr3st4
```

---

### Key 3: YOUTUBE (OPTIONAL - only for YouTube feature)

**Line 29:** Find this:
```
YOUTUBE_API_KEY=PASTE_YOUR_REAL_YOUTUBE_KEY_HERE
```

**Get your key:**
1. Go to https://console.cloud.google.com/
2. Create new project
3. Go to "APIs & Services"
4. Click "Enable APIs and Services"
5. Search "YouTube Data API v3"
6. Click "Enable"
7. Go to "Credentials"
8. Click "Create Credentials" → "API Key"
9. Copy the key
10. Replace the text with your key

**Result:**
```
YOUTUBE_API_KEY=AIzaSyAbc123def456ghi789jkl0mn1op2qr3st4
```

---

## What You're Replacing

You're changing FROM this (placeholder - DOESN'T WORK):
```
GEMINI_API_KEY=PASTE_YOUR_REAL_GEMINI_KEY_HERE
```

TO this (with your real key - WORKS):
```
GEMINI_API_KEY=AIzaSy_YOUR_ACTUAL_KEY_12345
```

---

## After You Add Keys

1. **Save the file** - Press Ctrl+S
2. **Close your text editor** 
3. **Open PowerShell/Command Prompt** in the project folder
4. **Run these commands:**
   ```
   npm run build
   npm start
   ```
5. **Test it** - Go to http://localhost:3000/chat
6. **Type a message** like "I have chicken and rice"
7. **You should see a recipe** ✅

---

## Common Mistakes to Avoid

❌ **WRONG:**
- Copying only part of the key
- Adding extra spaces after the key
- Using old/expired keys
- Sharing keys on internet
- Forgetting to save the file

✅ **RIGHT:**
- Copy the ENTIRE key
- No spaces at the beginning or end
- Fresh, newly generated keys
- Keep keys PRIVATE
- Press Ctrl+S to save

---

## If Something Goes Wrong

**Error: "AI service not configured"**
→ You didn't paste the key correctly. Check for:
  - Extra spaces
  - Missing characters
  - Did you save the file?
  - Did you restart the server?

**Error: 500 Internal Server Error**
→ Your API key might be:
  - Wrong/expired
  - For the wrong service
  - Disabled in console
  - Not copied completely

**Solution:** 
1. Double-check your keys
2. Make sure they're fully copied
3. Restart: `npm run build && npm start`

---

## Key Locations Quick Reference

```
.env.local
    ↓
Line 12: GEMINI_API_KEY = [your Gemini key]
Line 15: GLM_API_KEY = [your GLM key]
Line 29: YOUTUBE_API_KEY = [your YouTube key]
```

---

**That's it! Once you add the keys and restart, the app will work! 🎉**
