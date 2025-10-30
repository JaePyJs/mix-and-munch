@echo off
REM Mix & Munch - Quick Start Script (Windows)
REM Starts both frontend and backend services

cls
echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║  Mix and Munch - Full Stack Startup                   ║
echo ║  Recipe Crawler, Parser and Image Extractor           ║
echo ╚════════════════════════════════════════════════════════╝
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js not found. Please install Node.js 18+
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js: %NODE_VERSION%

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✅ npm: %NPM_VERSION%
echo.

REM Frontend setup
echo 📦 Setting up Frontend...
if not exist "node_modules" (
    call npm install --silent
    echo ✅ Frontend dependencies installed
) else (
    echo ✅ Frontend dependencies already installed
)

REM Backend setup
echo 📦 Setting up Backend...
if not exist "backend\node_modules" (
    cd backend
    call npm install --silent
    cd ..
    echo ✅ Backend dependencies installed
) else (
    echo ✅ Backend dependencies already installed
)

REM Create environment files
if not exist ".env.local" (
    (
        echo VITE_API_URL=http://localhost:5000
    ) > .env.local
    echo ✅ Created .env.local
)

if not exist "backend\.env" (
    (
        echo BACKEND_PORT=5000
        echo LOG_LEVEL=info
    ) > backend\.env
    echo ✅ Created backend\.env
)

REM Check logs directory
if not exist "backend\logs" (
    mkdir backend\logs
    echo ✅ Created logs directory
)

REM Check data directory
if not exist "backend\data" (
    mkdir backend\data
    echo ✅ Created data directory
)

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║  Ready to start services!                             ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo To start services, open two command prompts:
echo.
echo Command Prompt 1 (Frontend):
echo   ^> npm run dev
echo   - http://localhost:2000
echo.
echo Command Prompt 2 (Backend):
echo   ^> cd backend
echo   ^> npm run dev
echo   - http://localhost:5000
echo.
echo Available Commands:
echo   npm run dev          - Start frontend
echo   npm run build        - Build frontend
echo.
echo   cd backend
echo   npm run dev          - Start backend
echo   npm run crawl        - Run website crawler
echo   npm run parse        - Run content parser
echo.
echo Documentation:
echo   - BACKEND_INTEGRATION.md - Frontend/Backend integration
echo   - DEPLOYMENT_GUIDE.md - Full deployment instructions
echo   - backend/README.md - Backend API documentation
echo.
echo Note: Keep this terminal open for reference
echo.
pause
