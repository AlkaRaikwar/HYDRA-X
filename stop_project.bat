@echo off
title SwasthyaSetu - Stop

echo.
echo Stopping SwasthyaSetu processes...
echo.

:: Kill processes on port 5000 (backend)
for /f "tokens=5" %%i in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do (
    echo Stopping backend (PID %%i)...
    taskkill /PID %%i /F >nul 2>&1
)

:: Kill processes on port 3000 (frontend)
for /f "tokens=5" %%i in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
    echo Stopping frontend (PID %%i)...
    taskkill /PID %%i /F >nul 2>&1
)

:: Also close titled command windows if open
taskkill /FI "WINDOWTITLE eq SwasthyaSetu Backend" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq SwasthyaSetu Frontend" /F >nul 2>&1

echo.
echo SwasthyaSetu stopped.
pause
