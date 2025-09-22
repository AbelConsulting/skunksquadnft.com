# 🧪 Stripe Integration Test Plan

## ✅ Status Check
Your Stripe integration setup is complete:
- ✅ Stripe API keys configured in .env
- ✅ Payment server code exists
- ✅ Website is running on http://localhost:3000
- ✅ Test mode enabled (sk_test_ key detected)

## 🔧 Manual Testing Steps

### 1. Frontend Button Test
1. Open http://localhost:3000 in your browser
2. Click the "Buy Now 💳" button in the navigation
3. Click the "💳 Credit Card Payment" option in the modal
4. This should trigger the Stripe payment flow

### 2. Test Credit Card Numbers
Use these Stripe test card numbers:

**Successful Cards:**
- `4242 4242 4242 4242` (Visa)
- `5555 5555 5555 4444` (Mastercard)
- `3782 822463 10005` (American Express)

**Test Details:**
- Any future expiry date (e.g., 12/25)
- Any 3-digit CVC (4-digit for Amex)
- Any ZIP code

### 3. Expected Behavior
When payment is successful:
1. Stripe payment intent created
2. Payment confirmation received
3. NFT should be "minted" to your wallet

## 🚨 Troubleshooting

### If Payment Server Not Connecting:
```powershell
# Start payment server manually
cd "c:\Users\marcf\Documents\GitHub\skunksquadnft.com"
node scripts/payment-server.js
```

### Check Server Status:
```powershell
# Test if server is responding
Invoke-WebRequest -Uri "http://localhost:3002/api/pricing" -Method GET
```

### Manual Stripe Test:
```javascript
// In browser console (F12):
fetch('http://localhost:3002/api/test-stripe')
  .then(r => r.json())
  .then(data => console.log(data))
```

## 🎯 Key Integration Points

1. **Frontend (index.html)**
   - Stripe publishable key: `pk_test_51S9yVUCN6mu4fXCO...`
   - Payment modal functionality
   - API calls to payment server

2. **Payment Server (port 3002)**
   - Creates Stripe payment intents
   - Handles payment confirmations
   - Communicates with smart contract

3. **Smart Contract**
   - Address: `0x55A3ee558b447d42C44B6a330a3102A1eC77FDEF`
   - Handles NFT minting after payment confirmation

## 🔄 Next Steps After Testing

1. **Test Payment Flow End-to-End**
2. **Set up Stripe Webhooks** (for production)
3. **Test with different card types**
4. **Verify NFT delivery to wallet**

## 📊 Monitoring

- Stripe Dashboard: https://dashboard.stripe.com/test/payments
- Check payment logs in browser console
- Monitor server logs for errors

---
**Note:** You're in TEST MODE - no real money will be charged!