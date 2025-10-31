# Quick Start Guide - Mix & Munch

## 🚀 5-Minute Setup

```bash
# 1. Install
npm install

# 2. Configure
echo 'GEMINI_API_KEY=your_key_here' > .env.local
echo 'GLM_API_KEY=your_fallback_key' >> .env.local

# 3. Run
npm run dev

# 4. Open http://localhost:3000
```

---

## 📱 Key Features to Test

### Try These Inputs:
1. **"Just garlic and onions"** - Watch AI create magic
2. **"Eggs, rice, and soy sauce"** - Filipino fried rice incoming
3. **"Chicken, tomato, vinegar"** - Adobo variations
4. **"2 ingredients surprise"** - Let Mix get creative

---

## 🎯 What to Look For

✅ **Recipe Cards Should Show**:
- 📋 Recipe Title (in lime green)
- ⏱️ Time & Servings
- 🥘 Ingredients with measurements
- 👨‍🍳 Step-by-step instructions
- 💡 Pro tip/technique
- 🇵🇭 Cultural insight
- ✨ Plating suggestion

✅ **AI Model Badge** shows which responded:
- 🧠 "Gemini 2.5 Pro" (primary)
- ⚡ "Gemini 2.5 Flash" (if enabled)
- 🔄 "GLM 4.6 (Fallback)" (if Gemini failed)

---

## 📱 Mobile Test Checklist

- [ ] Open on iPhone/Android
- [ ] Header collapses to dropdown ✓
- [ ] Recipe card doesn't overflow ✓
- [ ] Buttons are tappable ✓
- [ ] Text is readable (not tiny) ✓

---

## 🔧 Configuration Options

```env
# Use Gemini 2.5 Pro (recommended)
GEMINI_API_KEY=sk-xxx-your-key-xxx

# Optional: GLM 4.6 fallback
GLM_API_KEY=sk-xxx-glm-key-xxx

# Optional: Use faster Flash model (less capable)
USE_GEMINI_FLASH=true  # Default: false
```

---

## 🧪 Test the Fallback

1. Set `GEMINI_API_KEY=invalid_key`
2. Keep `GLM_API_KEY=your_real_key`
3. Send message
4. Watch it fail over to GLM 4.6 ✓

---

## 📊 File Structure

```
app/
  api/chat/route.ts          ← AI integration (Gemini + GLM)
  chat/page.tsx              ← Chat interface
  profile/page.tsx           ← User profile

components/
  chat/
    RecipeCard.tsx           ← Beautiful recipe display
    AIModelBadge.tsx         ← Shows which AI responded
    MessageBubble.tsx        ← Chat messages
```

---

## 🚀 Production Deploy

```bash
# Build for production
npm run build

# Test production build
npm run start

# Deploy to Vercel
npm install -g vercel
vercel
```

---

## 💡 Pro Tips

- **Streaming**: Responses appear word-by-word, not all at once
- **Context**: AI remembers messages in this chat session
- **Fallback**: Happens automatically, no user action needed
- **Mobile**: Test with actual phone, not just DevTools

---

## 🆘 Quick Troubleshoot

| Issue | Solution |
|-------|----------|
| "No AI providers configured" | Add GEMINI_API_KEY to .env.local |
| Recipes don't show sections | Check API response, maybe rate limited |
| Mobile layout broken | Clear browser cache, refresh |
| Super slow responses | Check internet, verify API quotas |

---

## 📞 Key People

**Developer**: Jose Miguel Barron  
**Project**: Mix & Munch - Capstone  
**Status**: ✅ Production Ready

---

**Next Step**: Set your API keys and run `npm run dev` 🍛
