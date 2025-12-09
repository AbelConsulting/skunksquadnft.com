# Stripe Tax Configuration Guide

## Issue
Stripe has paused payments because tax configuration is required for physical goods.

## Solution
Enable Stripe Tax in your dashboard and the code has been updated to support automatic tax calculation.

---

## Step 1: Enable Stripe Tax in Dashboard

### 1.1 Go to Stripe Tax Settings
1. Log in to https://dashboard.stripe.com
2. Navigate to **Settings** → **Tax**
3. Or visit directly: https://dashboard.stripe.com/settings/tax

### 1.2 Activate Stripe Tax
1. Click **"Start using Stripe Tax"** or **"Turn on"**
2. You'll need to provide:
   - **Business information** (already set up)
   - **Business address**
   - **Tax registration numbers** (if applicable)

### 1.3 Configure Tax Registrations
1. Click **"Add registration"**
2. Select countries/states where you're registered to collect sales tax
3. Common registrations:
   - **US**: Add states where you have nexus (economic presence)
   - **EU**: Add VAT numbers if selling in Europe
   - **Other countries**: As needed

#### For US-based business:
- If selling to US customers, register for sales tax in states where:
  - You have a physical presence
  - You exceed economic nexus thresholds (~$100k-$500k in sales per state)
  
#### Starting small:
- You can start with just your home state
- Add more as your business grows
- Stripe Tax calculates for all locations, but only collects where registered

---

## Step 2: Verify Code Updates (Already Done)

The following changes have been made to your code:

### ✅ Enabled Automatic Tax in Checkout
```javascript
automatic_tax: {
    enabled: true,
}
```

### ✅ Added Tax Codes to Products
```javascript
tax_code: 'txcd_99999999', // General - Tangible Goods
```

### Tax Code Reference:
- `txcd_99999999` - General - Tangible Goods (default for physical merchandise)
- `txcd_20030000` - Apparel (more specific for clothing)
- See all codes: https://stripe.com/docs/tax/tax-categories

---

## Step 3: Update Product Tax Codes (Optional)

For more accurate tax calculation, you can use specific tax codes:

### Apparel Tax Code
If selling primarily clothing, update the code:

```javascript
tax_code: 'txcd_20030000', // Apparel
```

### Other Common Tax Codes:
- Books: `txcd_30011000`
- Digital Goods: `txcd_10000000`
- Accessories: `txcd_20020000`

---

## Step 4: Test Tax Calculation

### Test Mode:
1. Set up tax registrations in **Test mode** first
2. Create test checkout session
3. Use test card: `4242 4242 4242 4242`
4. Verify tax is calculated correctly

### Check Tax Amount:
- Tax should appear on checkout page
- Amount varies by customer location
- Only charged where you're registered

---

## Step 5: Configure Tax Settings

### In Stripe Dashboard → Tax → Settings:

#### Tax Calculation Behavior:
- ✅ **Calculate tax automatically**
- ✅ **Collect tax in registered locations**

#### Tax Display:
- Choose: "Exclusive" (tax added at checkout) or "Inclusive" (tax included in price)
- Recommended: **Exclusive** (shows price + tax separately)

#### Threshold Monitoring:
- ✅ Enable alerts for reaching nexus thresholds
- Stripe will notify you when to register in new states

---

## Step 6: Production Checklist

Before going live:

- [ ] Tax settings enabled in **Live mode**
- [ ] At least one tax registration added
- [ ] Business address configured
- [ ] Tax codes assigned to products
- [ ] Test transaction completed successfully
- [ ] Tax amounts appear correctly on receipts
- [ ] Webhook handles tax data properly

---

## Important Notes

### Registration Requirements:
- **Must register** in your home state/country
- **Should register** in locations where you have economic nexus
- Stripe Tax calculates everywhere but only **collects** where registered

### Compliance:
- Keep records of all transactions
- File tax returns in registered jurisdictions
- Remit collected taxes to tax authorities
- Stripe Tax helps calculate, but **you're responsible for filing**

### Pricing Impact:
- Stripe Tax: **0.5% of transaction** + $0.50 per invoice
- Only charged when tax is calculated
- Small price for automatic compliance

### Common Issues:
1. **"Tax disabled"** → Enable in Settings → Tax
2. **"No registrations"** → Add at least your home state
3. **"Invalid tax code"** → Use valid codes from Stripe docs
4. **"Tax not showing"** → Check `automatic_tax: enabled` in code

---

## Quick Fix for Immediate Payments

If you need to accept payments immediately while setting up proper tax:

### Option A: Simple Fixed Tax Rate (Temporary)
```javascript
// Remove automatic_tax, add to line items:
tax_rates: ['txr_XXXXXXXXX'], // Create fixed rate in dashboard
```

### Option B: Manual Tax Calculation
```javascript
// Calculate tax server-side and include in price
unit_amount: Math.round((item.price * 1.07) * 100), // 7% tax included
```

⚠️ **Not recommended long-term** - Use Stripe Tax for compliance

---

## Resources

- **Stripe Tax Docs**: https://stripe.com/docs/tax
- **Tax Codes List**: https://stripe.com/docs/tax/tax-categories
- **Dashboard**: https://dashboard.stripe.com/settings/tax
- **Nexus Guide**: https://stripe.com/guides/introduction-to-sales-tax-nexus
- **Support**: https://support.stripe.com/topics/tax

---

## Current Status

✅ Code updated with automatic tax support
✅ Tax code added to products (General - Tangible Goods)
✅ Automatic tax enabled in checkout sessions

⚠️ **Action Required**: Configure tax registrations in Stripe Dashboard

Once you add at least one tax registration in your Stripe Dashboard, payments will resume automatically!
