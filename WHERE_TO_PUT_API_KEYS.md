# WHERE TO PUT YOUR API KEYS - Quick Guide

## File Location
📁 **File**: `.env.local` (in the project root folder)  
📍 **Full path**: `C:\Users\jmbar\Downloads\Mix_and_munch\.env.local`

## Step-by-Step Instructions

### 1. Open `.env.local` with a Text Editor
- Right-click on `.env.local`
- Select "Open With" → Notepad or VS Code
- Find these three lines:

```
GEMINI_API_KEY=PASTE_YOUR_REAL_GEMINI_KEY_HERE
GLM_API_KEY=PASTE_YOUR_REAL_GLM_KEY_HERE
YOUTUBE_API_KEY=PASTE_YOUR_REAL_YOUTUBE_KEY_HERE
```

### 2. Get Your Keys

#### 🔑 Gemini API Key (REQUIRED)
1. Go to: https://ai.google.dev/
2. Click **"Get API Key"** button
3. Click **"Create API key"**
4. Copy the key
5. Replace `PASTE_YOUR_REAL_GEMINI_KEY_HERE` with your key

**Example:**
```
GEMINI_API_KEY=AIzaSyAbc123DEF456GHI789JKL...
```

---

#### 🔑 GLM API Key (OPTIONAL - for fallback)
1. Go to: https://ai.glm.cn/
2. Create account
3. Generate API key
4. Copy the key
5. Replace `PASTE_YOUR_REAL_GLM_KEY_HERE` with your key

**Example:**
```
GLM_API_KEY=sk-abc123def456ghi789jkl...
```

---

#### 🔑 YouTube API Key (OPTIONAL - only if you want YouTube feature)
1. Go to: https://console.cloud.google.com/
2. Click **"Create Project"**
3. Name it "Mix-Munch-YouTube"
4. Go to **"APIs & Services"**
5. Click **"+ Enable APIs and Services"**
6. Search **"YouTube Data API v3"**
7. Click **Enable**
8. Go to **"Credentials"**
9. Click **"+ Create Credentials"**
10. Select **"API Key"**
11. Copy the key
12. Replace `PASTE_YOUR_REAL_YOUTUBE_KEY_HERE` with your key

**Example:**
```
YOUTUBE_API_KEY=AIzaSyAbc123DEF456GHI789JKL...
```

---

### 3. Save the File
- Press **Ctrl + S** to save
- Close the text editor

### 4. Restart the Server
```bash
# In PowerShell/Terminal
npm run build
npm start
```

### 5. Test It
- Open http://localhost:3000/chat
- Type: "I have chicken and rice"
- Should get a recipe response (no 500 error) ✅

---

## What Each Key Does

| Key | Used For | Required? |
|-----|----------|-----------|
| **GEMINI_API_KEY** | AI Chat recipes | ✅ YES |
| **GLM_API_KEY** | AI Chat fallback | ⭕ OPTIONAL |
| **YOUTUBE_API_KEY** | YouTube demo page | ⭕ OPTIONAL |

---

## ⚠️ Security Notes
- ❌ **NEVER** commit `.env.local` to Git
- ❌ **NEVER** share your keys publicly
- ❌ **NEVER** post keys in screenshots or messages
- ✅ Keep keys private
- ✅ Rotate keys regularly

---

## If It Still Doesn't Work

Check these:
1. Is the key pasted correctly? (No extra spaces)
2. Is `.env.local` saved?
3. Did you restart the server?
4. Are you using the full key (copy the entire thing)?

---

**That's it! Your keys go in `.env.local` on lines with `GEMINI_API_KEY=`, `GLM_API_KEY=`, and `YOUTUBE_API_KEY=`**
