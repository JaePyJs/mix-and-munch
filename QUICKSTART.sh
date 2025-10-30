#!/bin/bash
# Mix & Munch - Quick Start Script
# Starts both frontend and backend services

echo "╔════════════════════════════════════════════════════════╗"
echo "║  Mix & Munch - Full Stack Startup                     ║"
echo "║  Recipe Crawler, Parser & Image Extractor            ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

echo "✅ Node.js: $(node --version)"
echo "✅ npm: $(npm --version)"
echo ""

# Frontend setup
echo "📦 Setting up Frontend..."
if [ ! -d "node_modules" ]; then
    npm install --silent
    echo "✅ Frontend dependencies installed"
else
    echo "✅ Frontend dependencies already installed"
fi

# Backend setup
echo "📦 Setting up Backend..."
if [ ! -d "backend/node_modules" ]; then
    cd backend
    npm install --silent
    cd ..
    echo "✅ Backend dependencies installed"
else
    echo "✅ Backend dependencies already installed"
fi

# Create environment files if missing
if [ ! -f ".env.local" ]; then
    echo "VITE_API_URL=http://localhost:5000" > .env.local
    echo "✅ Created .env.local"
fi

if [ ! -f "backend/.env" ]; then
    echo "BACKEND_PORT=5000" > backend/.env
    echo "LOG_LEVEL=info" >> backend/.env
    echo "✅ Created backend/.env"
fi

# Check ports
if lsof -Pi :2000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Port 2000 already in use"
else
    echo "✅ Port 2000 available"
fi

if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Port 5000 already in use"
else
    echo "✅ Port 5000 available"
fi

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║  Ready to start services!                             ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "To start services, open two terminals:"
echo ""
echo "Terminal 1 (Frontend):"
echo "  $ npm run dev"
echo "  → http://localhost:2000"
echo ""
echo "Terminal 2 (Backend):"
echo "  $ cd backend && npm run dev"
echo "  → http://localhost:5000"
echo ""
echo "Or run this for automated startup:"
echo "  $ npm run start:all"
echo ""
echo "Documentation:"
echo "  - BACKEND_INTEGRATION.md - Frontend/Backend integration"
echo "  - DEPLOYMENT_GUIDE.md - Full deployment instructions"
echo "  - backend/README.md - Backend API documentation"
echo ""
