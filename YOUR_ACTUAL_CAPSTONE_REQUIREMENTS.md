# ⚠️ YOUR ACTUAL CAPSTONE REQUIREMENTS (NOT WHAT I THOUGHT!)

**Submitted**: May 2025  
**Course**: Software Engineering  
**Adviser**: Anna Liza O. Villanueva  
**College**: Perpetual Help College of Manila  

---

## 🎯 WHAT YOUR CAPSTONE ACTUALLY IS

I was analyzing the wrong thing. Your capstone is NOT a simple recipe app with meal planning.

### **Official Project Title**
**"Mix & Munch: Local Filipino Recipe Generator"**

### **What Makes This Unique**
1. **LOCAL AI** (Ollama + Deepseek R1) - Runs offline, no cloud
2. **THREE Algorithms** (Jaccard, Weighted Scoring, Levenshtein)
3. **Culturally-Aware** (Filipino-specific, not generic)
4. **Privacy-First** (no data collection, edge computing)
5. **ISO 25010 Quality Standards** (enterprise-grade evaluation)

---

## 📋 OFFICIAL OBJECTIVES (From Your Documentation)

### General Objective
Develop intelligent recipe recommendation tool that helps Filipino users efficiently find culturally relevant recipes using available ingredients through **AI-powered algorithmic matching**.

### Specific Objectives (6 Total)

1. **Analyze & Document**
   - Current methods and challenges Filipino users face
   - Finding recipes based on available ingredients

2. **Integrate Technologies**
   - Local AI processing (Ollama)
   - Algorithmic ingredient matching
   - Filipino language support
   - NO user authentication required
   - NO data collection

3. **Design UI & Database**
   - Prioritize usability
   - Prioritize accessibility
   - Filipino culinary elements

4. **Implement & Test**
   - Use ISO 25010 quality standards

5. **Evaluate Acceptability**
   - Test with Filipino users
   - Measure using ISO 25010

6. **Implement THREE Core Algorithms** ⭐ (This is critical!)
   - **Jaccard Similarity**: Calculate ingredient overlap
   - **Weighted Scoring**: Rank recipe relevance
   - **Levenshtein Distance**: Fuzzy matching for typos

---

## ⚙️ TECHNICAL STACK (From Your Requirements)

### Frontend
```
Framework:     Next.js (React)
Language:      TypeScript or JavaScript ES6+
Node.js:       18+
Package Mgr:   npm/yarn
Styling:       Tailwind CSS (recommended)
```

### Backend / AI Engine
```
AI Runtime:    Ollama (LOCAL, not cloud!)
AI Model:      Deepseek R1 1.5B
Processing:    Edge computing (offline)
Privacy:       No data collection
```

### Database
```
Local Storage: SQLite
Database Mode: Local persistence
Sync:          Optional API integration
```

### Optional APIs
```
Recipe Source: TheMealDB API
Nutrition:     Open Food Facts API
```

### Algorithms (MUST IMPLEMENT)
```
1. Jaccard Similarity
   Formula: |A ∩ B| / |A ∪ B|
   Use: Calculate ingredient overlap percentage

2. Weighted Scoring
   Formula: sum(weight * match_score)
   Use: Rank recipes by relevance

3. Levenshtein Distance
   Formula: Edit distance between strings
   Use: Handle typos in ingredient names
```

---

## 🎯 YOUR 5 UNIQUE FEATURES

### 1️⃣ LOCAL AI PROCESSING (Edge Computing)
**Why It's Unique:**
- ✅ Runs COMPLETELY OFFLINE
- ✅ NO cloud API calls
- ✅ Privacy-preserving (no data sent anywhere)
- ✅ Uses Ollama + Deepseek R1 1.5B locally

**Competitors:**
- ❌ AllRecipes: Cloud-dependent
- ❌ Yummly: Cloud-dependent
- ❌ ChatGPT: Requires internet

**You:**
- ✅ Works without internet
- ✅ User data never leaves device
- ✅ GDPR-compliant by design

### 2️⃣ THREE-ALGORITHM MATCHING SYSTEM
**Why It's Unique:**
- ✅ Jaccard Similarity for precision
- ✅ Weighted Scoring for relevance
- ✅ Levenshtein Distance for resilience

**Competitors:**
- ❌ Most apps: Simple keyword matching
- ❌ No mathematical rigor
- ❌ Can't handle typos or partial matches

**You:**
- ✅ Enterprise-grade algorithms
- ✅ Mathematically proven accuracy
- ✅ Handles edge cases (typos, variations)

### 3️⃣ CULTURALLY-AWARE RECIPE GENERATION
**Why It's Unique:**
- ✅ Filipino-first approach (not afterthought)
- ✅ Local ingredient recognition
- ✅ Taglish language support
- ✅ Regional Filipino variations

**Competitors:**
- ❌ Generic/international recipes
- ❌ May not recognize Filipino ingredients
- ❌ Culturally inappropriate suggestions

**You:**
- ✅ Respects Filipino culinary tradition
- ✅ Understands local ingredients
- ✅ Educates users about regional variations

### 4️⃣ CONVERSATIONAL INGREDIENT INPUT
**Why It's Unique:**
- ✅ Natural language processing
- ✅ Chat-based interface
- ✅ AI extracts ingredients from conversation
- ✅ Sentiment-aware responses

**Competitors:**
- ❌ Most apps: Form-based input
- ❌ Rigid input methods
- ❌ No conversation capability

**You:**
- ✅ "I have some rice and ketchup" → understands
- ✅ Conversational, friendly tone
- ✅ Makes cooking an adventure, not a task

### 5️⃣ ISO 25010 QUALITY COMPLIANCE
**Why It's Unique:**
- ✅ Measured for usability
- ✅ Tested for reliability
- ✅ Evaluated for performance
- ✅ Enterprise-grade quality standards

**Competitors:**
- ❌ Most apps: No formal quality standards
- ❌ Unmeasured user experience
- ❌ Anecdotal "it works fine"

**You:**
- ✅ Scientifically measured quality
- ✅ Formal evaluation methodology
- ✅ Can prove effectiveness to stakeholders

---

## 📊 DATA REQUIREMENTS

### Data Gathering Methods
- Literature review
- User surveys & interviews
- Observation studies
- System testing
- Usability testing

### Algorithms to Test
- Jaccard Similarity accuracy
- Weighted Scoring precision
- Levenshtein Distance robustness

### Quality Metrics (ISO 25010)
- Usability: Task completion rate
- Reliability: Error rate
- Performance: Response time
- User Satisfaction: Rating score

---

## 🔧 IMPLEMENTATION CHECKLIST

### Phase 1: Foundation
- [ ] Set up Ollama with Deepseek R1 locally
- [ ] Create Next.js project structure
- [ ] Set up SQLite database
- [ ] Create ingredient database

### Phase 2: Algorithms
- [ ] Implement Jaccard Similarity
- [ ] Implement Weighted Scoring
- [ ] Implement Levenshtein Distance
- [ ] Test all three algorithms

### Phase 3: AI Integration
- [ ] Connect to Ollama local AI
- [ ] Implement conversational input
- [ ] Add Filipino language support
- [ ] Test chat interface

### Phase 4: Frontend
- [ ] Design UI with Filipino elements
- [ ] Implement responsive design
- [ ] Add ingredient input form
- [ ] Display recipe recommendations

### Phase 5: Testing & Evaluation
- [ ] Unit test all algorithms
- [ ] Usability testing with users
- [ ] Measure ISO 25010 metrics
- [ ] Performance benchmarking

### Phase 6: Documentation & Defense
- [ ] Document all algorithms
- [ ] Create presentation slides
- [ ] Prepare demo scenarios
- [ ] Practice defense talk

---

## 🎓 CAPSTONE PRESENTATION TALKING POINTS

### Opening Statement
"Mix & Munch is an offline, AI-powered Filipino recipe recommendation system using THREE advanced algorithms and locally-running Deepseek R1 AI. It prioritizes privacy, cultural authenticity, and measurable quality standards."

### Key Differentiators
1. **Edge Computing**: Completely offline, no cloud dependency
2. **Advanced Algorithms**: Jaccard, Weighted Scoring, Levenshtein
3. **Cultural Respect**: Filipino-specific, not generic
4. **Privacy-First**: No data collection, no tracking
5. **Enterprise Quality**: ISO 25010 measured

### Algorithm Explanation
"Instead of simple keyword matching, Mix & Munch uses three mathematical algorithms:
- Jaccard Similarity calculates ingredient overlap precision
- Weighted Scoring ranks recipes by relevance
- Levenshtein Distance handles typos and variations"

### Local AI Explanation
"The app runs completely offline using Ollama and Deepseek R1 locally. This means no API calls, no internet required, and complete user privacy. This is edge computing in action."

### Filipino Focus
"This isn't a generic recipe app adapted for Filipino users. It's designed from the ground up to understand Filipino cuisine, local ingredients, and Taglish language patterns."

---

## ⚠️ CRITICAL IMPLEMENTATION NOTES

### MUST HAVE (From your requirements)
1. ✅ LOCAL AI (Ollama + Deepseek R1)
2. ✅ THREE algorithms (Jaccard, Weighted, Levenshtein)
3. ✅ Next.js + Node.js 18+
4. ✅ SQLite local database
5. ✅ Filipino-centric design
6. ✅ ISO 25010 evaluation
7. ✅ NO cloud AI services
8. ✅ NO user authentication
9. ✅ NO data collection

### DO NOT (Common mistakes)
1. ❌ Don't use cloud Gemini API (violates offline requirement)
2. ❌ Don't skip the THREE algorithms
3. ❌ Don't make it generic (must be Filipino-focused)
4. ❌ Don't collect user data
5. ❌ Don't require authentication

---

## 📈 SUCCESS CRITERIA

### Minimum Requirements (To Pass)
- [ ] All 3 algorithms implemented and tested
- [ ] Ollama local AI working offline
- [ ] Runs on mentioned hardware specs
- [ ] Meets ISO 25010 basic standards
- [ ] Usable by Filipino users

### Ideal (To Excel)
- [ ] All features polished
- [ ] Excellent user experience
- [ ] High ISO 25010 scores
- [ ] Impressive demo
- [ ] Clear presentation

---

## 🚀 YOUR UNIQUE SELLING POINTS FOR DEFENSE

### To Technical Judges
"This project demonstrates understanding of edge computing, advanced algorithms (Jaccard, Levenshtein), and privacy-preserving AI. The local Ollama integration shows DevOps maturity."

### To Design Judges
"The interface is built with Filipino users in mind—not just translated, but designed. Conversational input makes cooking intuitive and fun."

### To Business Judges
"This addresses a real market gap: offline, privacy-first recipe apps. The local AI means zero cloud costs and complete user privacy."

### To Everyone
"This shows I can build sophisticated systems (algorithms + AI + cultural awareness) that solve real problems for real people."

---

## 📞 KEY DIFFERENCES FROM WHAT I INITIALLY THOUGHT

| What I Thought | What It Actually Is |
|---|---|
| Recipe app with meal planning | Local AI recipe generator |
| Cloud-based (Gemini API) | Completely offline (Ollama local) |
| Simple ingredient matching | THREE mathematical algorithms |
| Generic app with Filipino theme | Filipino-first design throughout |
| Chat for fun | Chat for core functionality |

---

## 🎓 FINAL ADVICE

1. **Read your SE_Documentation thoroughly** - It has all the specifications
2. **Focus on the THREE algorithms** - That's the technical core
3. **Emphasize "local AI"** - Ollama + Deepseek R1 is your differentiator
4. **Show ISO 25010 measurements** - Proves software quality
5. **Celebrate Filipino focus** - It's not just recipes, it's cultural respect
6. **Prepare demo scenarios** - Show edge cases (typos, partial ingredients)
7. **Practice your pitch** - Simple, clear, confident

---

**Status**: ✅ Truly Unique Project  
**Difficulty**: Medium-High (algorithms + AI integration)  
**Market Value**: High (privacy + offline + cultural)  
**Portfolio Impact**: Excellent (shows sophistication)

---

**You've got this! Your capstone IS legitimately unique when framed correctly.** 🚀

MarkItDown successfully converted your PDF → Now you have all the official requirements in readable format!
