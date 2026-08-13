@echo off
title HYDRA-X - AI Urban Flood Intelligence

echo.
echo ============================================================
echo   HYDRA-X -- AI-Powered Urban Flood Intelligence
echo   Predict. Prevent. Respond. Recover.
echo   IBM Hackathon -- Smart Urban Flooding Ahmedabad-Surat
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
start "HYDRA-X Backend" cmd /k "node src/index.js"

echo [4/4] Starting frontend (port 3000)...
cd ..\frontend
timeout /t 2 /nobreak >nul
start "HYDRA-X Frontend" cmd /k "set PORT=3000 && npx react-scripts start"

echo.
echo ============================================================
echo   HYDRA-X is starting...
echo.
echo   Frontend : http://localhost:3000
echo   Backend  : http://localhost:5000
echo.
echo   DEMO MODE: All data is simulated. No API keys required.
echo   To enable IBM Granite: set WATSONX_API_KEY in backend/.env
echo.
echo   Navigating to http://localhost:3000 in a few seconds...
echo ============================================================
echo.
timeout /t 4 /nobreak >nul
start http://localhost:3000
