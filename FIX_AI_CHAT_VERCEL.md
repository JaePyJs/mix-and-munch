# ⚠️ CRITICAL: How to Fix AI Chat on Vercel

## 🔴 Why AI Chat Isn't Working

The backend is correct, but **environment variables are not set in Vercel**. The code checks for:
- `GEMINI_API_KEY` (primary)
- `GLM_API_KEY` (fallback)

Without these, it returns error 503: "No AI providers configured"

---

## ✅ SOLUTION: Add Environment Variables to Vercel

### Step 1: Get Gemini API Key (2 minutes)
1. Go to: **https://ai.google.dev**
2. Click **"Get API Key"** (top right)
3. Click **"Create API Key"**
4. Select **"Create API key in new project"** (or existing)
5. Copy the generated API key
6. **Keep it safe** - you'll need it in next step

### Step 2: Add to Vercel Dashboard
1. Go to: **https://vercel.com/dashboard**
2. Click the **"mix-munch"** project
3. Go to **Settings** tab (top navigation)
4. Click **"Environment Variables"** (left sidebar)
5. Click **"Add New"** button
6. Fill in:
   ```
   Name:  GEMINI_API_KEY
   Value: [paste your API key here]
   ```
7. Select environments: **Production, Preview, Development**
8. Click **"Save"**

### Step 3: Add Additional Config (Optional)
Click "Add New" again and add:
```
Name:  USE_GEMINI_FLASH
Value: false
```
(This ensures you use the better Gemini 2.5 Pro model)

### Step 4: Redeploy
1. Go to **Deployments** tab
2. Find the most recent deployment
3. Click the **⋮ (three dots)** button on the right
4. Select **"Redeploy"**
5. Wait 2-3 minutes for new build

### Step 5: Test It!
1. Visit: **https://mix-munch.vercel.app/chat**
2. Type: **"I have rice, eggs, and tomatoes"**
3. You should see AI generate a recipe! ✨

---

## 🛠️ Troubleshooting

### Error: "No AI providers configured"
→ You didn't add the API key. Go back to Step 2.

### Error: "API key not valid"
→ Your key expired or is wrong. Get a new one from https://ai.google.dev

### Error: "Timeout waiting for response"
→ Gemini API is slow. Try again in 10 seconds.

### Chat works but no streaming
→ Markdown rendering might have issue. Check browser console (F12)

---

## 📋 Environment Variables Reference

| Variable | Required | Where to Get | Format |
|----------|----------|--------------|--------|
| `GEMINI_API_KEY` | ✅ YES | https://ai.google.dev | 50+ character string |
| `GLM_API_KEY` | ❌ No | Your provider | (leave blank for now) |
| `USE_GEMINI_FLASH` | ❌ No | Set to `false` | `true` or `false` |

---

## ✨ What Each Environment Variable Does

**GEMINI_API_KEY** (REQUIRED)
- Primary AI model
- Generates the recipes
- Best quality responses
- Free tier available

**GLM_API_KEY** (Optional fallback)
- Secondary AI model
- Only used if Gemini fails
- Skip for now - not needed

**USE_GEMINI_FLASH** (Optional)
- `false` = Use Gemini 2.5 Pro (better, slower)
- `true` = Use Gemini 2.5 Flash (faster, slightly lower quality)
- Default: false (Pro is better)

---

## 🎯 Quick Checklist

- [ ] I visited https://ai.google.dev
- [ ] I created and copied my Gemini API key
- [ ] I went to Vercel project settings
- [ ] I added GEMINI_API_KEY environment variable
- [ ] I selected Production, Preview, Development
- [ ] I clicked Save
- [ ] I clicked Redeploy
- [ ] I waited 2-3 minutes
- [ ] I tested at https://mix-munch.vercel.app/chat

---

## 🎉 Expected Result

After completing these steps, you should see:
1. Chat textbox accepts input
2. AI responds with a recipe
3. Recipe is properly formatted with:
   - **Bold text** for titles
   - *Italic text* for emphasis
   - Bullet points for ingredients
   - Numbered steps for instructions

If you still have issues, check Vercel deployment logs for error messages.

