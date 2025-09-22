@echo off
echo Starting SkunkSquad Payment Server...
echo.

REM Set environment variable for Windows
set NODE_ENV=development

REM Start the payment server
node scripts/payment-server.js

pause