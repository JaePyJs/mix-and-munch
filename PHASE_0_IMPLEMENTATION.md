# Phase 0 Implementation Guide - Security & Foundation Setup

**Target Completion**: November 6, 2025  
**Time Estimate**: 6-8 hours  
**Start Date**: October 30, 2025  

---

## 🎯 OBJECTIVES

1. ✅ Set up secure environment configuration
2. ✅ Audit codebase for security issues
3. ✅ Initialize version control properly
4. ✅ Configure development environment
5. ✅ Set up testing framework

---

## ✅ PHASE 0 CHECKLIST

### PART 1: ENVIRONMENT & SECRETS (1 hour)

#### Task 1.1: Update .env.local
```bash
# DO THIS NOW:
# 1. Copy .env.example to .env.local (already done)
# 2. Add your API keys to .env.local:
```

**Required API Keys:**
- [ ] Gemini API Key (from Google AI Studio)
  - Go to: https://ai.google.dev/
  - Click "Get API Key"
  - Create new API key for Mix & Munch
  - Add to GEMINI_API_KEY=

- [ ] YouTube API Key (for video parser)
  - Go to: https://console.cloud.google.com/
  - Create new project "Mix Munch YouTube"
  - Enable YouTube Data API v3
  - Create API key
  - Add to YOUTUBE_API_KEY=

**Database Configuration:**
```
DB_TYPE=postgres        # or 'sqlite'
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=           # Set a strong password!
DB_NAME=mix_munch_db
```

**Check:**
```bash
# Verify .env.local is in .gitignore
# Verify it has all required fields
# Verify no API keys are in public files
```

#### Task 1.2: Validate environment setup
```bash
# Run this to check:
echo "GEMINI_API_KEY status: $([ -z "$GEMINI_API_KEY" ] && echo 'NOT SET ❌' || echo 'SET ✅')"
echo "Database configured: $(grep DB_HOST .env.local | wc -l)"
```

---

### PART 2: SECURITY AUDIT (2 hours)

#### Task 2.1: Check for exposed secrets
```bash
# Search for hardcoded API keys in code
grep -r "GEMINI" src/ --include="*.js" --include="*.ts" --include="*.tsx"
grep -r "api_key" src/ --include="*.js" --include="*.ts"
grep -r "password" src/ --include="*.js" --include="*.ts"
grep -r "secret" src/ --include="*.js" --include="*.ts"
```

**Action Items:**
- [ ] Remove any hardcoded API keys
- [ ] Move all credentials to .env variables
- [ ] Use environment variables in code

#### Task 2.2: Input validation audit
```bash
# Check all API endpoints for input validation
grep -r "POST\|PUT\|DELETE" api/ --include="*.js" --include="*.ts"
```

**Check These:**
- [ ] /api/v1/recipes - validate ingredient input
- [ ] /api/v1/admin/* - require authentication
- [ ] /api/v1/recipes/recommend - validate user message

**Action:** Add input validation middleware

#### Task 2.3: CORS & Security Headers
```bash
# Check if CORS is properly configured
grep -r "cors\|CORS" src/ --include="*.js" --include="*.ts"
```

**Action Items:**
- [ ] Verify CORS_ORIGIN includes only trusted domains
- [ ] Add security headers middleware
- [ ] Enable rate limiting

#### Task 2.4: Create security checklist
```
SECURITY AUDIT RESULTS:
☐ No hardcoded secrets in code
☐ All credentials in .env
☐ Input validation on all endpoints
☐ CORS properly configured
☐ Rate limiting enabled
☐ SQL injection prevention
☐ XSS protection
☐ CSRF tokens (if needed)
```

---

### PART 3: VERSION CONTROL (30 minutes)

#### Task 3.1: Initialize Git (if not done)
```bash
cd C:\Users\jmbar\Downloads\Mix_and_munch
git init
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

#### Task 3.2: Create initial commit
```bash
# Verify .gitignore
cat .gitignore | head -20

# Stage files (excluding .env.local)
git add .
git status  # Review what's staged

# Initial commit
git commit -m "Phase 0: Initial security and foundation setup

- Added comprehensive .env.example with all configuration options
- Updated .gitignore for security and build files
- Implemented security audit checklist
- Prepared for Phase 1 backend development"

# Check commit
git log --oneline
```

#### Task 3.3: GitHub setup (optional)
```bash
# If using GitHub:
# 1. Create repo on github.com
# 2. Add remote:
git remote add origin https://github.com/username/mix-munch.git
git branch -M main
git push -u origin main
```

---

### PART 4: DEVELOPMENT ENVIRONMENT (2 hours)

#### Task 4.1: Install dependencies
```bash
# Navigate to project
cd C:\Users\jmbar\Downloads\Mix_and_munch

# Install frontend dependencies
npm install

# Verify installation
npm list --depth=0

# Expected packages:
# - react, react-dom
# - @google/genai (for Gemini)
# - tailwindcss, vite
```

#### Task 4.2: Add backend dependencies (needed for Phase 1)
```bash
# Create package.json script for backend
npm install --save-dev nodemon      # Auto-reload on changes
npm install --save-dev dotenv       # Environment variables

# For backend (to install later):
# npm install express cors body-parser
# npm install pg                     # PostgreSQL
# npm install axios                  # HTTP requests
```

#### Task 4.3: Test build
```bash
# Build frontend
npm run build

# Check build output
ls dist/

# Expected: index.html, assets folder, etc.
```

#### Task 4.4: Verify Gemini integration
```bash
# Create a test file to verify Gemini works
```

---

### PART 5: TESTING SETUP (1 hour)

#### Task 5.1: Initialize Jest (Node.js testing)
```bash
npm install --save-dev jest @types/jest

# Create jest.config.js
cat > jest.config.js << 'EOF'
export default {
  testEnvironment: 'node',
  testMatch: ['**/*.test.js', '**/*.test.ts'],
  collectCoverageFrom: ['src/**/*.js', 'src/**/*.ts'],
  coveragePathIgnorePatterns: ['/node_modules/'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
EOF

# Add test script to package.json
```

#### Task 5.2: Create test directory structure
```bash
mkdir -p tests/unit
mkdir -p tests/integration
mkdir -p tests/fixtures

# Create sample test
cat > tests/unit/example.test.js << 'EOF'
describe('Example Test Suite', () => {
  test('should pass', () => {
    expect(true).toBe(true);
  });
});
EOF

# Run tests
npm test
```

#### Task 5.3: Add test script to package.json
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

### PART 6: DOCUMENTATION & SETUP (1 hour)

#### Task 6.1: Create SETUP.md
```bash
cat > SETUP.md << 'EOF'
# Development Setup

## Prerequisites
- Node.js 18+
- PostgreSQL 12+
- Git

## Installation

1. Clone repository
```
git clone https://github.com/username/mix-munch.git
cd mix-munch
```

2. Install dependencies
```
npm install
```

3. Configure environment
```
cp .env.example .env.local
# Edit .env.local with your API keys
```

4. Run development server
```
npm run dev
# Visit http://localhost:2000
```

## Testing
```
npm test
npm run test:coverage
```

## Database Setup
```
# Create PostgreSQL database
createdb mix_munch_db

# Run migrations (Phase 1)
npm run migrate
```
EOF
```

#### Task 6.2: Update README.md
Add section:
```markdown
## 🚀 Quick Start

1. **Setup**: Follow [SETUP.md](./SETUP.md)
2. **Environment**: Copy `.env.example` → `.env.local`
3. **Development**: `npm run dev`
4. **Tests**: `npm test`
```

#### Task 6.3: Create SECURITY.md
```bash
cat > SECURITY.md << 'EOF'
# Security Guidelines

## Environment Variables
- Never commit `.env.local`
- Keep API keys secure
- Rotate keys regularly
- Use different keys for dev/staging/prod

## Code Security
- Validate all user input
- Use parameterized queries (no SQL injection)
- Sanitize output (prevent XSS)
- Use HTTPS in production
- Keep dependencies updated

## API Security
- Rate limiting enabled
- CORS properly configured
- Authentication on admin endpoints
- JWT token validation

## Reporting Security Issues
Email: security@mixmunch.com (to be set up)
EOF
```

---

## 🧪 VERIFICATION CHECKLIST

### Before Moving to Phase 1, Verify:

```
✅ ENVIRONMENT
☐ .env.local created with all required keys
☐ Gemini API key valid
☐ YouTube API key configured
☐ Database credentials set
☐ No hardcoded secrets in code

✅ SECURITY
☐ Security audit completed
☐ All vulnerabilities addressed
☐ CORS configured
☐ Rate limiting enabled
☐ Input validation in place

✅ VERSION CONTROL
☐ Git initialized
☐ .gitignore properly configured
☐ Initial commit done
☐ GitHub repository created (optional)

✅ DEVELOPMENT SETUP
☐ Dependencies installed (npm install successful)
☐ Frontend builds successfully (npm run build)
☐ No build warnings/errors
☐ SETUP.md created

✅ TESTING
☐ Jest initialized
☐ Test directory created
☐ Sample test passes
☐ Coverage configured

✅ DOCUMENTATION
☐ README updated
☐ SETUP.md created
☐ SECURITY.md created
```

---

## 🚨 COMMON ISSUES & SOLUTIONS

### Issue 1: "Cannot find module '@google/genai'"
```bash
# Solution:
npm install @google/genai --save
```

### Issue 2: ".env not recognized"
```bash
# Solution: Windows needs special handling
# Use dotenv package:
npm install dotenv
# Then in code:
import dotenv from 'dotenv';
dotenv.config();
```

### Issue 3: "Port 2000/3001 already in use"
```bash
# Solution:
# Windows:
netstat -ano | findstr :2000
taskkill /PID <PID> /F

# Or change port in package.json
```

### Issue 4: "Gemini API key not working"
```bash
# Verify:
1. Key is from Google AI Studio (not GCP)
2. Key is in .env.local (not .env)
3. Key doesn't have extra spaces
4. No quotes around key
```

---

## 📝 SUMMARY

**What We're Doing:**
1. ✅ Securing all credentials and secrets
2. ✅ Auditing code for security vulnerabilities
3. ✅ Setting up git properly
4. ✅ Installing and configuring development tools
5. ✅ Creating testing infrastructure

**Why It Matters:**
- Prevents security breaches
- Enables team collaboration
- Ensures code quality
- Facilitates bug detection

**Next Phase:**
- Phase 1: Backend foundation (database + API)
- Phase 2: Web crawler implementation
- Phase 3: Content parser + AI integration

---

**Estimated Time**: 6-8 hours  
**Difficulty**: Easy-Medium  
**Prerequisites**: Already installed (Node.js, npm)  
**Blockers**: None expected

**Start**: Now! ✅  
**Target Completion**: November 6, 2025  

---

## 📞 NEED HELP?

- **Environment Issues**: Check .env.example
- **Gemini API**: https://ai.google.dev/docs
- **YouTube API**: https://developers.google.com/youtube
- **Node.js**: https://nodejs.org/docs
- **Git**: https://git-scm.com/doc
