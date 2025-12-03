# 📊 Google Analytics 4 Setup Guide for SkunkSquad

## Quick Setup (5 minutes)

### Step 1: Get Your GA4 Measurement ID

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click "Admin" (gear icon, bottom left)
3. Create a new property called "SkunkSquad NFT"
4. Choose "Web" as platform
5. Copy your **Measurement ID** (looks like `G-XXXXXXXXXX`)

### Step 2: Add to Your Website

Open `index.html` and add this **before the closing `</head>` tag**:

```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>

<!-- SkunkSquad Analytics Tracking -->
<script src="./src/js/analytics.js?v=1" defer></script>
```

**Replace `G-XXXXXXXXXX` with your actual Measurement ID!**

### Step 3: Initialize Analytics

In `src/js/analytics.js`, find line 11 and update:

```javascript
this.GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // Your actual ID here
```

Then uncomment lines 218-222:

```javascript
// Uncomment these lines:
window.analytics.init('G-XXXXXXXXXX');
window.analytics.trackPageView();
```

### Step 4: Add to Your Mint Handler

In your mint handler (or `enhanced-mint-handler.js`), add tracking:

```javascript
// When wallet connects
window.analytics.trackWalletConnect('MetaMask', userAddress);

// When user starts minting
window.analytics.trackMintAttempt(quantity, totalCostETH);

// When mint succeeds
window.analytics.trackMintSuccess(quantity, totalCostETH, txHash, tokenIds);

// When mint fails
window.analytics.trackMintError('insufficient_funds', error.message);
```

## What Gets Tracked Automatically

✅ **Page Views** - Every page visit  
✅ **Scroll Depth** - 25%, 50%, 75%, 100%  
✅ **Social Clicks** - Twitter, Discord, OpenSea  
✅ **External Links** - Any link with `target="_blank"`  
✅ **Button Clicks** - When you call `trackButtonClick()`  

## Custom Events You Can Track

```javascript
// Wallet connections
window.analytics.trackWalletConnect('MetaMask', address);

// Minting
window.analytics.trackMintAttempt(2, '0.02');
window.analytics.trackMintSuccess(2, '0.02', txHash);
window.analytics.trackMintError('rejected', 'User rejected');

// Members portal
window.analytics.trackMembersAccess(true, 5); // Has 5 NFTs

// Social media
window.analytics.trackSocialClick('discord', 'join');

// Custom events
window.analytics.trackCustomEvent('rarity_check', {
  nft_id: 1337,
  rarity_score: 95
});
```

## Key Metrics to Watch

### In Google Analytics:

1. **Realtime** → See live users
2. **Reports > Engagement > Events**
   - `wallet_connect` - How many connect wallets
   - `begin_checkout` - Mint attempts
   - `purchase` - Successful mints 🎉
   - `mint_error` - Failed mints (fix these!)
   
3. **Reports > Monetization > Ecommerce purchases**
   - Total ETH revenue
   - Average order value
   - Conversion rate

4. **Reports > User Attributes**
   - New vs returning users
   - Geographic locations
   - Device types (mobile vs desktop)

## Advanced: Set Up Conversions

1. Go to **Admin > Events**
2. Mark `purchase` as a conversion ⭐
3. Mark `wallet_connect` as a conversion
4. Now track your conversion funnel:
   - Page visit → Wallet connect → Mint attempt → Purchase

## Estimated Insights

After 1 week, you'll know:
- 📊 How many visitors actually mint
- 💰 Total ETH revenue
- 🌍 Where your users are from
- 📱 Mobile vs desktop usage
- 🔗 Which social platform drives most traffic
- ⚠️ Common error messages (so you can fix them!)

## Privacy Compliance

The analytics script:
- ✅ Anonymizes wallet addresses (only first 10 chars)
- ✅ Uses Google's default privacy settings
- ✅ No personally identifiable information collected
- ⚠️ Add to your privacy policy: "We use Google Analytics"

## Testing

1. Open your site in a new incognito window
2. Open browser console (F12)
3. You should see: `✅ Google Analytics initialized`
4. Click around, mint, connect wallet
5. Check Google Analytics Realtime view (updates in ~30 seconds)

## Troubleshooting

**"Analytics not working"**
- Check measurement ID is correct
- Make sure scripts loaded (check Network tab in DevTools)
- Check for ad blockers

**"No data in GA4"**
- Wait 24-48 hours for initial data
- Check Realtime view for immediate feedback
- Verify property setup in GA4

**"Conversions not tracking"**
- Make sure you marked events as conversions in GA4
- Check Events debugger in GA4

## Next Level: Google Tag Manager

For even more control, use Google Tag Manager instead:
1. Replaces hardcoded GA4 script
2. Add/remove tags without code changes
3. Track anything with clicks/triggers
4. A/B testing integration

Let me know if you want a GTM setup guide!

---

**After setup, you'll have professional analytics like major NFT projects!** 📈
