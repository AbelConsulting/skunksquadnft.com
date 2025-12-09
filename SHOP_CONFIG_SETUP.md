# Shop Configuration Setup

## Overview
The Stripe publishable key is now managed securely through an environment-based configuration file instead of being hardcoded.

## Setup Instructions

### 1. Create Configuration File

```bash
# Copy the example file
cp src/js/shop-config.example.js src/js/shop-config.js
```

### 2. Update with Your Keys

Edit `src/js/shop-config.js` and replace the placeholder keys:

```javascript
stripePublishableKey: isDevelopment 
    ? 'pk_test_YOUR_TEST_KEY_HERE'  // Your Stripe test key
    : 'pk_live_YOUR_LIVE_KEY_HERE'   // Your Stripe live key
```

### 3. Get Your Stripe Keys

- **Test Keys**: https://dashboard.stripe.com/test/apikeys
- **Live Keys**: https://dashboard.stripe.com/apikeys

### 4. Update Production URL (if needed)

Update the production API base URL in `shop-config.js`:

```javascript
apiBase: isDevelopment
    ? 'http://localhost:3001/api'
    : 'https://your-production-server.com/api'
```

## Security Notes

✅ **DO:**
- Keep `shop-config.js` in `.gitignore` (already done)
- Use test keys for development
- Use live keys only in production
- Never commit `shop-config.js` to git

❌ **DON'T:**
- Hardcode keys in source files
- Commit API keys to version control
- Share keys publicly
- Use live keys in development

## Environment Detection

The configuration automatically detects the environment:

- **Development**: `localhost` or `127.0.0.1` → Uses test keys
- **Production**: Any other domain → Uses live keys

## Files

- `shop-config.js` - Your actual config (gitignored, not committed)
- `shop-config.example.js` - Template file (committed to git)
- `shop-checkout-handler.js` - Uses `window.SHOP_CONFIG.stripePublishableKey`

## Verification

To verify the configuration is working:

1. Open browser console on shop-checkout.html
2. Check for: `✅ Stripe initialized`
3. If you see an error, verify your keys in `shop-config.js`

## Current Status

✅ Stripe publishable key moved to config file
✅ Environment-based key selection
✅ Config file added to .gitignore
✅ Example template created
✅ Shop checkout page updated to load config

## Next Steps

1. Copy `shop-config.example.js` to `shop-config.js`
2. Add your actual Stripe keys
3. Test checkout flow in development
4. Deploy to production with live keys
