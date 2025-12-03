# Printful App Integration Guide

## Step-by-Step Setup

### 1️⃣ Create Printful App

1. Go to https://www.printful.com/dashboard/app
2. Click "Create New App" or "Connect Your App"
3. Fill in the app details:
   - **App Name**: SkunkSquad NFT Shop
   - **App Description**: Official SkunkSquad merchandise store
   - **App URL**: https://skunksquadnft.com
   - **Redirect URL**: https://skunksquadnft.com/oauth/callback (optional for OAuth)

4. Save and get your credentials:
   - ✅ API Token (Primary method)
   - ✅ Client ID (for OAuth)
   - ✅ Client Secret (for OAuth)

### 2️⃣ Install Backend Server Dependencies

Open PowerShell and navigate to the server directory:

```powershell
cd server
npm install
```

This will install:
- express (web server)
- cors (handle cross-origin requests)
- node-fetch (make API requests)
- dotenv (environment variables)

### 3️⃣ Configure Environment Variables

1. Copy the example file:
```powershell
Copy-Item .env.example .env
```

2. Open `.env` in your editor and add your Printful credentials:
```
PRINTFUL_API_TOKEN=your_actual_api_token_from_printful
PRINTFUL_CLIENT_ID=your_client_id
PRINTFUL_CLIENT_SECRET=your_client_secret
PORT=3001
```

### 4️⃣ Start the Backend Server

```powershell
npm run dev
```

You should see:
```
🚀 Printful server running on http://localhost:3001
📦 API endpoint: http://localhost:3001/api
```

### 5️⃣ Test the Server

Open a new PowerShell window and test:

```powershell
# Test health endpoint
curl http://localhost:3001/api/health

# Test products endpoint
curl http://localhost:3001/api/products
```

### 6️⃣ Open Your Shop

1. Keep the backend server running
2. Open your shop in a browser: `shop.html`
3. Products from your Printful store will now load!

## 📝 Adding Products to Printful

1. Go to https://www.printful.com/dashboard
2. Click "Stores" → Your Store
3. Click "Add Product"
4. Choose product type (t-shirt, hoodie, mug, etc.)
5. Upload your SkunkSquad designs
6. Set your retail pricing
7. Publish the product

Once published, refresh your shop page and the products will appear!

## 🚀 Production Deployment

### Option 1: Heroku (Recommended)

```powershell
# Install Heroku CLI
# Download from: https://devcenter.heroku.com/articles/heroku-cli

# Login to Heroku
heroku login

# Create app
heroku create skunksquad-printful

# Set environment variables
heroku config:set PRINTFUL_API_TOKEN=your_token

# Deploy
git add .
git commit -m "Add Printful backend"
git push heroku main
```

Update `src/js/printful-api.js` baseURL for production:
```javascript
this.baseURL = 'https://skunksquad-printful.herokuapp.com/api';
```

### Option 2: Railway.app

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Add environment variables in dashboard
5. Deploy automatically

### Option 3: Vercel (Serverless)

```powershell
npm install -g vercel
vercel --prod
```

## 🔔 Setting Up Webhooks (Optional)

Webhooks notify your server when orders are placed/updated:

1. In Printful dashboard, go to Settings → API
2. Add webhook URL: `https://your-domain.com/api/webhooks/printful`
3. Select events:
   - Order created
   - Order updated
   - Order shipped
   - Order failed

## 🔒 Security Checklist

- ✅ Never commit `.env` file to Git
- ✅ Add `.env` to `.gitignore`
- ✅ Use HTTPS in production
- ✅ Keep API tokens secure
- ✅ Implement rate limiting for production

## ❓ Troubleshooting

### Server won't start
- Make sure you're in the `/server` directory
- Check that `node` and `npm` are installed: `node --version`
- Delete `node_modules` and run `npm install` again

### Products not loading
- Check server is running on port 3001
- Check `.env` has correct API token
- Look at browser console for errors
- Check server terminal for error messages

### CORS errors
- Make sure backend server is running
- Check baseURL in `printful-api.js` matches your server
- Verify `cors` package is installed

## 📞 Support

Need help?
- Printful API Docs: https://developers.printful.com/
- Email: skunksquad411@gmail.com
