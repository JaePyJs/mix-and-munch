@echo off
REM Production Health Check Script for Windows

echo.
echo =========================================
echo  Production Health Check
echo =========================================
echo.

setlocal enabledelayedexpansion
set errors=0
set warnings=0

REM Check Node.js
echo Checking Node.js...
where node >nul 2>nul
if errorlevel 1 (
    echo [FAIL] Node.js not found
    set /a errors=!errors!+1
) else (
    for /f "tokens=*" %%i in ('node --version') do set node_version=%%i
    echo [OK] Node.js: !node_version!
)

REM Check npm
echo Checking npm...
where npm >nul 2>nul
if errorlevel 1 (
    echo [FAIL] npm not found
    set /a errors=!errors!+1
) else (
    for /f "tokens=*" %%i in ('npm --version') do set npm_version=%%i
    echo [OK] npm: !npm_version!
)

REM Check frontend build
echo.
echo Checking frontend...
if exist dist (
    echo [OK] Frontend build found
) else (
    echo [FAIL] Frontend build not found
    set /a errors=!errors!+1
)

REM Check backend files
echo.
echo Checking backend...
if exist backend\src\server.js (
    echo [OK] Backend server found
) else (
    echo [FAIL] Backend server not found
    set /a errors=!errors!+1
)

REM Check database
echo.
echo Checking database...
if exist backend\data\recipes.db (
    echo [OK] Database found
) else (
    echo [WARN] Database not found (will be created on startup)
    set /a warnings=!warnings!+1
)

REM Check environment files
echo.
echo Checking configuration...
if exist .env (
    echo [OK] .env file found
    findstr "SUPABASE_URL" .env >nul
    if errorlevel 1 (
        echo [FAIL] Supabase not configured
        set /a errors=!errors!+1
    ) else (
        echo [OK] Supabase configured
    )
    findstr "GEMINI_API_KEY" .env >nul
    if errorlevel 1 (
        echo [WARN] Gemini API not configured
        set /a warnings=!warnings!+1
    ) else (
        echo [OK] Gemini API configured
    )
) else (
    echo [FAIL] .env file not found
    set /a errors=!errors!+1
)

if exist backend\.env (
    echo [OK] Backend .env file found
) else (
    echo [WARN] Backend .env not found (will use defaults)
    set /a warnings=!warnings!+1
)

REM Check TypeScript
echo.
echo Checking TypeScript...
if exist tsconfig.json (
    echo [OK] TypeScript config found
) else (
    echo [FAIL] TypeScript config not found
    set /a errors=!errors!+1
)

REM Check dependencies
echo.
echo Checking dependencies...
if exist node_modules (
    echo [OK] Frontend dependencies installed
) else (
    echo [WARN] Frontend dependencies not installed
    set /a warnings=!warnings!+1
)

if exist backend\node_modules (
    echo [OK] Backend dependencies installed
) else (
    echo [WARN] Backend dependencies not installed
    set /a warnings=!warnings!+1
)

REM Summary
echo.
echo =========================================
if !errors! equ 0 (
    echo [SUCCESS] All checks passed!
    if !warnings! gtr 0 (
        echo [WARNING] !warnings! warning(s) - review before deployment
    )
) else (
    echo [FAILED] !errors! error(s) found - fix before deployment
    pause
    exit /b 1
)
echo.
pause
