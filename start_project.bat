@echo off
title SwasthyaSetu - Rural Healthcare AI

echo.
echo ============================================================
echo   SwasthyaSetu -- Rural Healthcare AI (IBM Granite)
echo   Problem Statement #19: Rural and Tribal Healthcare
echo ============================================================
echo.

:: Check node
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Install from https://nodejs.org
    pause
    exit /b 1
)

:: Check npm
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm not found. Reinstall Node.js.
    pause
    exit /b 1
)

echo [1/4] Installing backend dependencies...
cd backend
if not exist node_modules (
    npm install
    if %errorlevel% neq 0 ( echo [ERROR] Backend npm install failed. & pause & exit /b 1 )
) else (
    echo       node_modules already present, skipping.
)

echo [2/4] Installing frontend dependencies...
cd ..\frontend
if not exist node_modules (
    npm install
    if %errorlevel% neq 0 ( echo [ERROR] Frontend npm install failed. & pause & exit /b 1 )
) else (
    echo       node_modules already present, skipping.
)

echo [3/4] Starting backend (port 5000)...
cd ..\backend
start "SwasthyaSetu Backend" cmd /k "node src/index.js"

echo [4/4] Starting frontend (port 3000)...
cd ..\frontend
timeout /t 2 /nobreak >nul
start "SwasthyaSetu Frontend" cmd /k "set PORT=3000 && npx react-scripts start"

echo.
echo ============================================================
echo   Backend  : http://localhost:5000
echo   Frontend : http://localhost:3000
echo.
echo   The browser will open automatically in a few seconds.
echo   Close both command windows to stop the project.
echo.
echo   AI Mode: DEMO (set backend/.env for IBM Granite)
echo ============================================================
echo.
timeout /t 3 /nobreak >nul
start http://localhost:3000
