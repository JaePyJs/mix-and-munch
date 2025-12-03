@echo off
echo ========================================
echo   Mix ^& Munch - Starting Server
echo ========================================
echo.

cd /d "%~dp0"

echo Choose mode:
echo [1] Development (slower, hot reload)
echo [2] Production (FAST, no hot reload)
echo.
set /p mode="Enter 1 or 2: "

if "%mode%"=="2" (
    echo.
    echo Building for production...
    call npm run build
    echo.
    echo Starting production server...
    echo Server will be at: http://localhost:3000
    echo Press Ctrl+C to stop
    echo.
    npm run start
) else (
    echo.
    echo Starting development server...
    echo Server will be at: http://localhost:3000
    echo Press Ctrl+C to stop
    echo.
    npm run dev
)
