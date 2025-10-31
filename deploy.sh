#!/bin/bash

# Production Deployment Script
# This script prepares the Mix & Munch application for production deployment

set -e

echo "🚀 Mix & Munch - Production Deployment Script"
echo "=============================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js and npm are installed${NC}"
echo ""

# Frontend build
echo "🔨 Building frontend..."
npm run build
echo -e "${GREEN}✓ Frontend build complete${NC}"
echo ""

# Backend setup
echo "🔧 Setting up backend..."
cd backend || exit 1

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo -e "${YELLOW}⚠ Please update .env with your credentials before deploying${NC}"
fi

# Install dependencies
npm ci --production
echo -e "${GREEN}✓ Backend dependencies installed${NC}"
echo ""

cd .. || exit 1

# Database migration
echo "🗄️ Running database migrations..."
node backend/scripts/seedDatabase.js
echo -e "${GREEN}✓ Database migration complete${NC}"
echo ""

# Build verification
echo "✅ Deployment preparation complete!"
echo ""
echo "Next steps:"
echo "1. Update .env files with production credentials"
echo "2. Deploy frontend to Vercel: vercel deploy --prod"
echo "3. Deploy backend to Railway: railway deploy"
echo "4. Run smoke tests"
echo "5. Monitor logs for errors"
echo ""
echo -e "${GREEN}Ready for production!${NC}"
