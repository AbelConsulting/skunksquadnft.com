# Deploy Printful Backend Server

Your Printful shop needs a backend server running 24/7 to handle API requests. Here's how to deploy it:

---

## 🚂 Option 1: Railway (Recommended)

**Why Railway?** Free tier, automatic deployments, super easy setup.

### Steps:

1. **Sign up at [railway.app](https://railway.app)** (free with GitHub)

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose `AbelConsulting/skunksquadnft.com`
   - Set root directory: `/server`

3. **Add Environment Variables**
   - In Railway dashboard, go to your project
   - Click "Variables" tab
   - Add these:
     ```
     PRINTFUL_API_TOKEN=7HhosTpmLhXJRHHE5jvliar5h8Sbjj60t5SbKMAs
     PORT=3001
     ```

4. **Deploy!**
   - Railway will auto-deploy
   - You'll get a URL like: `https://your-app.railway.app`

5. **Update Frontend**
   - Copy your Railway URL
   - Edit `src/js/printful-api.js`:
     ```javascript
     this.productionURL = 'https://your-app.railway.app/api';
     ```

6. **Push to GitHub**
   - Commit and push changes
   - Your live site will now use real products!

---

## 🔷 Option 2: Render

**Why Render?** Also free, similar to Railway.

### Steps:

1. **Sign up at [render.com](https://render.com)**

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect GitHub: `AbelConsulting/skunksquadnft.com`
   - Name: `skunksquad-printful`
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `node printful-server.js`

3. **Environment Variables**
   ```
   PRINTFUL_API_TOKEN=7HhosTpmLhXJRHHE5jvliar5h8Sbjj60t5SbKMAs
   PORT=3001
   ```

4. **Deploy & Update Frontend** (same as Railway step 5-6)

---

## 🟣 Option 3: Heroku

**Note:** Heroku is no longer free, but very reliable.

### Steps:

1. **Install Heroku CLI**
   ```powershell
   # In PowerShell
   winget install Heroku.HerokuCLI
   ```

2. **Login and Create App**
   ```powershell
   cd C:\Users\Jewel\Documents\GitHub\skunksquadnft.com\server
   heroku login
   heroku create skunksquad-printful
   ```

3. **Set Environment Variables**
   ```powershell
   heroku config:set PRINTFUL_API_TOKEN=7HhosTpmLhXJRHHE5jvliar5h8Sbjj60t5SbKMAs
   ```

4. **Deploy**
   ```powershell
   git init
   git add .
   git commit -m "Initial commit"
   heroku git:remote -a skunksquad-printful
   git push heroku main
   ```

5. **Update Frontend** (same as Railway step 5-6)

---

## 📝 After Deployment

### Update Your Frontend Code

Once deployed, edit `src/js/printful-api.js`:

```javascript
constructor(apiToken = null) {
    this.apiToken = apiToken;
    // Try localhost first (for development)
    this.baseURL = 'http://localhost:3001/api';
    // Production URL (your deployed server)
    this.productionURL = 'https://YOUR-DEPLOYED-URL.railway.app/api';
    this.storeId = null;
    this.useLocalhost = true;
}
```

Replace `YOUR-DEPLOYED-URL` with your actual deployment URL.

### Commit & Push

```powershell
git add .
git commit -m "Connect to production Printful server"
git push origin main
```

Your live site will now load real products! 🎉

---

## 🔒 Security Note

**IMPORTANT:** Never commit your API token to GitHub!

The token is already in `.gitignore`, but double-check:
- ✅ `.env` is in `.gitignore`
- ✅ Token is only in environment variables on hosting platform
- ✅ Token is NOT in any committed code files

---

## 🧪 Testing

After deployment, test your production server:

```powershell
# Replace with your actual URL
Invoke-RestMethod -Uri "https://your-app.railway.app/api/health"
Invoke-RestMethod -Uri "https://your-app.railway.app/api/products"
```

Should return your Printful products!
