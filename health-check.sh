#!/bin/bash

# Production Health Check Script
# This script verifies all systems are healthy before deployment

set -e

echo "🏥 Production Health Check"
echo "========================="
echo ""

errors=0
warnings=0

# Check Node.js
echo "📦 Checking Node.js..."
if command -v node &> /dev/null; then
    node_version=$(node --version)
    echo "✓ Node.js: $node_version"
else
    echo "✗ Node.js not found"
    ((errors++))
fi

# Check npm
echo "📦 Checking npm..."
if command -v npm &> /dev/null; then
    npm_version=$(npm --version)
    echo "✓ npm: $npm_version"
else
    echo "✗ npm not found"
    ((errors++))
fi

# Check frontend build
echo ""
echo "🎨 Checking frontend..."
if [ -d "dist" ]; then
    echo "✓ Frontend build found"
else
    echo "✗ Frontend build not found"
    ((errors++))
fi

# Check backend files
echo ""
echo "🔧 Checking backend..."
if [ -f "backend/src/server.js" ]; then
    echo "✓ Backend server found"
else
    echo "✗ Backend server not found"
    ((errors++))
fi

# Check database
echo ""
echo "🗄️ Checking database..."
if [ -f "backend/data/recipes.db" ]; then
    echo "✓ Database found"
    db_size=$(du -h backend/data/recipes.db | awk '{print $1}')
    echo "  Size: $db_size"
else
    echo "⚠ Database not found (will be created on startup)"
    ((warnings++))
fi

# Check environment files
echo ""
echo "🔐 Checking configuration..."
if [ -f ".env" ]; then
    echo "✓ .env file found"
    if grep -q "SUPABASE_URL" .env; then
        echo "✓ Supabase configured"
    else
        echo "✗ Supabase not configured"
        ((errors++))
    fi
    if grep -q "GEMINI_API_KEY" .env; then
        echo "✓ Gemini API configured"
    else
        echo "⚠ Gemini API not configured"
        ((warnings++))
    fi
else
    echo "✗ .env file not found"
    ((errors++))
fi

if [ -f "backend/.env" ]; then
    echo "✓ Backend .env file found"
else
    echo "⚠ Backend .env not found (will use defaults)"
    ((warnings++))
fi

# Check TypeScript
echo ""
echo "📝 Checking TypeScript..."
if [ -f "tsconfig.json" ]; then
    echo "✓ TypeScript config found"
else
    echo "✗ TypeScript config not found"
    ((errors++))
fi

# Check dependencies
echo ""
echo "📚 Checking dependencies..."
if [ -d "node_modules" ]; then
    num_packages=$(find node_modules -maxdepth 1 -type d | wc -l)
    echo "✓ Frontend dependencies installed ($num_packages packages)"
else
    echo "⚠ Frontend dependencies not installed"
    ((warnings++))
fi

if [ -d "backend/node_modules" ]; then
    num_packages=$(find backend/node_modules -maxdepth 1 -type d | wc -l)
    echo "✓ Backend dependencies installed ($num_packages packages)"
else
    echo "⚠ Backend dependencies not installed"
    ((warnings++))
fi

# Summary
echo ""
echo "========================="
if [ $errors -eq 0 ]; then
    echo "✅ All checks passed!"
    if [ $warnings -gt 0 ]; then
        echo "⚠️  $warnings warning(s) - review before deployment"
    fi
else
    echo "❌ $errors error(s) found - fix before deployment"
    exit 1
fi
