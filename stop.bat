@echo off
echo ========================================
echo   Mix ^& Munch - Stopping All Servers
echo ========================================
echo.

echo Killing all Node.js processes...
taskkill /F /IM node.exe 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Node.js processes stopped successfully.
) else (
    echo No Node.js processes were running.
)

echo.
echo Killing any processes on port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a 2>nul
)

echo.
echo All servers stopped.
echo.
pause
