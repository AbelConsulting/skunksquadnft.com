@echo off
echo 🦨 SkunkSquad Webhook URL Setup
echo ==============================
echo.
echo Your payment server is running on: http://localhost:3002
echo.
echo For Stripe webhooks, you need a PUBLIC URL. Here are your options:
echo.
echo OPTION 1: Download ngrok (Recommended)
echo   1. Go to: https://ngrok.com/download
echo   2. Download ngrok for Windows
echo   3. Extract ngrok.exe to this folder
echo   4. Run: ngrok http 3002
echo   5. Copy the HTTPS URL (like https://abc123.ngrok.io)
echo   6. Your webhook endpoint will be: https://abc123.ngrok.io/webhooks/stripe
echo.
echo OPTION 2: Use a different tunneling service
echo   - Cloudflare Tunnel: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/
echo   - Localtunnel: npm install -g localtunnel, then: lt --port 3002
echo.
echo OPTION 3: Deploy to a cloud service
echo   - Vercel, Netlify, Railway, or Heroku
echo.
echo Once you have a public URL, use this format for Stripe:
echo   https://your-public-url.com/webhooks/stripe
echo.
echo Press any key to continue...
pause > nul

echo.
echo 📋 For immediate testing, here's what you can do:
echo.
echo 1. Download ngrok from: https://ngrok.com/download
echo 2. Extract ngrok.exe to this folder
echo 3. Open a new terminal and run: ngrok http 3002
echo 4. Copy the HTTPS URL from ngrok
echo 5. In Stripe dashboard, use: [ngrok-url]/webhooks/stripe
echo.
echo Your payment server is ready and waiting for webhooks!
echo Server URL: http://localhost:3002
echo Webhook endpoint: /webhooks/stripe
echo.
pause