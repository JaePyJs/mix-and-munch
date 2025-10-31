@echo off
REM Production Deployment Script for Windows
REM This script prepares Mix & Munch application for production deployment

echo.
echo ========================================
echo  Mix and Munch - Production Deployment
echo ========================================
echo.

REM Check prerequisites
echo Checking prerequisites...

where node >nul 2>nul
if errorlevel 1 (
    echo Error: Node.js is not installed
    exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
    echo Error: npm is not installed
    exit /b 1
)

echo [OK] Node.js and npm are installed
echo.

REM Frontend build
echo Building frontend...
call npm run build
if errorlevel 1 (
    echo Error: Frontend build failed
    exit /b 1
)
echo [OK] Frontend build complete
echo.

REM Backend setup
echo Setting up backend...
cd backend

if not exist .env (
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo WARNING: Please update .env with your credentials before deploying
)

echo Installing backend dependencies...
call npm ci --production
if errorlevel 1 (
    echo Error: Backend dependencies installation failed
    exit /b 1
)
echo [OK] Backend dependencies installed
echo.

cd ..

REM Database migration
echo Running database migrations...
node backend/scripts/seedDatabase.js
if errorlevel 1 (
    echo Error: Database migration failed
    exit /b 1
)
echo [OK] Database migration complete
echo.

REM Completion message
echo.
echo ========================================
echo  Deployment preparation complete!
echo ========================================
echo.
echo Next steps:
echo  1. Update .env files with production credentials
echo  2. Deploy frontend to Vercel: vercel deploy --prod
echo  3. Deploy backend to Railway: railway deploy
echo  4. Run smoke tests
echo  5. Monitor logs for errors
echo.
echo Ready for production!
echo.
pause
