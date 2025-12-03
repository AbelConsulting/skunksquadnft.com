# 🎯 Google Analytics 4 Setup - 2 Minutes

## Step 1: Get Your GA4 Measurement ID

### Option A: If You Already Have GA4
1. Go to https://analytics.google.com/
2. Click **Admin** (gear icon at bottom left)
3. Under **Property** column, click **Data Streams**
4. Click your web stream (or create one)
5. Copy the **Measurement ID** (looks like `G-XXXXXXXXXX`)

### Option B: Create New GA4 Property (First Time)
1. Go to https://analytics.google.com/
2. Click **Admin** (gear icon)
3. Click **Create Property**
4. Enter:
   - Property name: `SkunkSquad NFT`
   - Time zone: Your timezone
   - Currency: USD
5. Click **Next**
6. Choose industry: `Arts & Entertainment` or `Technology`
7. Business size: Select appropriate
8. Click **Create**
9. Accept Terms of Service
10. Under **Data Streams**, click **Web**
11. Enter:
    - Website URL: `https://skunksquadnft.com`
    - Stream name: `SkunkSquad Website`
12. Click **Create Stream**
13. **Copy your Measurement ID** (G-XXXXXXXXXX)

---

## Step 2: Add ID to Your Website

Once you have your Measurement ID (e.g., `G-ABC123DEF4`):

### Update the code:
Open `src/js/analytics.js` and replace line 8:

**FROM:**
```javascript
this.GA_MEASUREMENT_ID = 'G-YOUR-ACTUAL-ID-HERE';
```

**TO:**
```javascript
this.GA_MEASUREMENT_ID = 'G-ABC123DEF4'; // Your actual ID here
```

---

## Step 3: Initialize Analytics

The analytics is already integrated! It will automatically track:

✅ **Page Views** - Every page visit
✅ **Wallet Connections** - When users connect wallet
✅ **Mint Events** - NFT minting with quantity and price
✅ **Transaction Success/Failure** - Track conversion rate
✅ **Button Clicks** - CTA engagement
✅ **Errors** - Debug user issues

---

## Step 4: Verify It's Working

### Method 1: Real-time Reports
1. Go to GA4
2. Click **Reports** → **Realtime**
3. Open your website
4. You should see your visit in real-time!

### Method 2: Browser Console
1. Open your website
2. Press F12 (open DevTools)
3. Go to **Console** tab
4. Look for: `✅ Google Analytics initialized`

### Method 3: Network Tab
1. Open DevTools (F12)
2. Go to **Network** tab
3. Filter: `google-analytics` or `gtag`
4. Refresh page
5. See requests to `www.google-analytics.com`

---

## 📊 What You'll Track

### Conversion Events (Already Configured):
- `wallet_connect` - User connects wallet
- `mint_initiated` - User clicks mint button
- `mint_success` - NFT successfully minted
- `mint_failed` - Transaction failed

### Page Views:
- Homepage visits
- About page
- Sample art gallery
- Members portal

### User Actions:
- Button clicks
- Social link clicks
- Navigation usage

---

## 🎯 Recommended GA4 Setup

### Create Custom Conversions:
1. Go to **Admin** → **Conversions**
2. Click **New conversion event**
3. Add these events:
   - `mint_success` (main conversion!)
   - `wallet_connect`
   - `mint_initiated`

### Set Up Goals:
- **Primary Goal**: Track `mint_success` events
- **Secondary Goal**: Track `wallet_connect` (top of funnel)

### Create Audiences:
- **Engaged Users**: Visited 3+ pages
- **Potential Minters**: Connected wallet but didn't mint
- **NFT Holders**: Successfully minted

---

## 🔒 Privacy & Compliance

The implementation already includes:
- ✅ No PII (personally identifiable info) collected
- ✅ Wallet addresses are NOT tracked
- ✅ Respects user privacy settings
- ✅ Anonymous analytics only

Consider adding a privacy banner if targeting EU users (GDPR).

---

## 🐛 Troubleshooting

### "Not seeing data in GA4"
- Wait 24-48 hours for full data processing
- Use Realtime reports for instant feedback
- Check browser isn't blocking scripts (AdBlocker)

### "Analytics initialized but no events"
- Check browser console for errors
- Verify measurement ID is correct
- Make sure `this.enabled = true` in analytics.js

### "Getting errors in console"
- Ensure GA4 script loads (check Network tab)
- Try clearing browser cache
- Disable browser extensions temporarily

---

## 📈 Quick Stats to Monitor

### Daily:
- Realtime users
- Mint conversions

### Weekly:
- Total page views
- Bounce rate
- Mint conversion rate
- Popular pages

### Monthly:
- User growth
- Engagement trends
- Traffic sources

---

## 🚀 Next Level Analytics

Once basic tracking is working:

1. **Enhanced E-commerce Tracking** (already set up!)
   - Tracks NFT price
   - Tracks quantity
   - Tracks transaction value

2. **User ID Tracking** (optional)
   - Track wallet addresses (anonymized)
   - Track cross-device behavior

3. **Custom Dimensions**
   - NFT rarity tier
   - Mint quantity
   - Gas price paid

---

## ✅ Checklist

- [ ] Get GA4 Measurement ID
- [ ] Update `src/js/analytics.js` line 8
- [ ] Save file
- [ ] Deploy to production
- [ ] Test in Realtime reports
- [ ] Verify events are firing
- [ ] Set up conversion goals
- [ ] Create custom audiences

---

**That's it! You're now tracking everything you need to optimize your NFT launch! 🎉**

Questions? Check the console for `✅ Google Analytics initialized` message.
