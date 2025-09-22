# 💳 SkunkSquad Stripe Integration Setup Guide

Complete guide to set up Stripe payments for your NFT collection.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Stripe Account

#### A. Create Stripe Account
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Create account or login
3. Switch to **Test Mode** (toggle in top right)

#### B. Get API Keys
1. Go to [Developers > API Keys](https://dashboard.stripe.com/test/apikeys)
2. Copy **Publishable key** (starts with `pk_test_`)
3. Copy **Secret key** (starts with `sk_test_`) 
   - Click "Reveal live key" to see full key

#### C. Create Webhook Endpoint
1. Go to [Developers > Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click "Add endpoint"
3. **Endpoint URL**: `http://localhost:3002/webhooks/stripe`
4. **Select events**: 
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.dispute.created`
5. Click "Add endpoint"
6. Copy the **Signing secret** (starts with `whsec_`)

### 3. Configure Environment

Edit `.env` file and update these values:
```bash
# Replace with your actual Stripe keys
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

Update `index.html` Stripe configuration:
```javascript
// Replace in the <script> tag in index.html
window.STRIPE_PUBLISHABLE_KEY = 'pk_test_YOUR_ACTUAL_KEY_HERE';
```

### 4. Deploy Payment Gateway Contract (Optional)

If you want to test the full blockchain integration:
```bash
npm run deploy-payment-gateway
```

### 5. Start Payment Server
```bash
npm run payment-dev
```

Server will start on http://localhost:3002

### 6. Serve Website
```bash
npm run serve
```

Website will be available at http://localhost:3000

## 🧪 Testing Payment Flow

### 1. Test Credit Card Numbers
Use Stripe's test cards:
- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- **Requires 3D Secure**: `4000 0025 0000 3155`

Any future expiry date and any 3-digit CVC.

### 2. Test the Flow
1. Open http://localhost:3000
2. Click "Buy Now 💳" 
3. Fill in the payment form:
   - **Quantity**: 1-10 NFTs
   - **Wallet Address**: Any valid Ethereum address
   - **Card**: Use test card `4242 4242 4242 4242`
   - **Billing Info**: Any name/email

### 3. Check Payment Server Logs
Monitor the terminal running the payment server for:
- ✅ Payment intent created
- ✅ Payment successful
- ✅ Webhook received

## 📝 API Endpoints

### Payment Server (http://localhost:3002)

- `GET /api/pricing` - Get current NFT pricing
- `POST /api/create-payment-intent` - Create payment intent
- `GET /api/payment-status/:id` - Check payment status
- `POST /webhooks/stripe` - Stripe webhook handler

### Test API
```bash
# Test server is running
curl http://localhost:3002/api/pricing

# Expected response:
{
  "success": true,
  "data": {
    "pricePerNFTUSD": "50.00",
    "pricePerNFTCents": "5000",
    "currency": "USD"
  }
}
```

## 🔧 Development Commands

```bash
# Start payment server with auto-reload
npm run payment-dev

# Start website server
npm run serve

# Start both simultaneously
npm run dev

# Test payment API
npm run test-payments

# Setup Stripe webhook listener (requires Stripe CLI)
npm run stripe-listen
```

## 🚨 Troubleshooting

### Payment Server Won't Start
1. Check if port 3002 is available
2. Verify `.env` file exists with Stripe keys
3. Run `npm install` to ensure dependencies

### Stripe Key Not Found
1. Verify keys in `.env` file
2. Update `index.html` with correct publishable key
3. Restart payment server after env changes

### Webhook Not Receiving Events
1. Verify webhook URL: `http://localhost:3002/webhooks/stripe`
2. Check webhook secret in `.env`
3. Ensure events are selected in Stripe dashboard

### CORS Errors
1. Check CORS_ORIGINS in `.env` includes your frontend URL
2. Restart payment server after changes

## 🔐 Security Notes

### For Development
- Use test keys only (`pk_test_...`, `sk_test_...`)
- Never commit `.env` file to version control
- Use localhost URLs for webhook endpoints

### For Production
- Use live keys (`pk_live_...`, `sk_live_...`)
- Use HTTPS for all endpoints
- Set up proper domain for webhook endpoints
- Enable additional Stripe security features

## 🌐 Production Deployment

### 1. Environment Setup
```bash
# Production environment variables
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_LIVE_WEBHOOK_SECRET
NODE_ENV=production
```

### 2. Webhook Configuration
- Update webhook URL to your production domain
- Example: `https://api.skunksquadnft.com/webhooks/stripe`

### 3. Frontend Configuration
- Update API_URL to production server
- Update Stripe publishable key in HTML

## 📞 Support

### Stripe Resources
- [Stripe Documentation](https://stripe.com/docs)
- [Test Cards](https://stripe.com/docs/testing#cards)
- [Webhook Testing](https://stripe.com/docs/webhooks/test)

### SkunkSquad Resources
- Check console logs for detailed error messages
- Review `PAYMENT_GATEWAY_GUIDE.md` for smart contract details
- Monitor payment server terminal for webhook events

## ✅ Success Checklist

- [ ] Stripe account created and in test mode
- [ ] API keys copied to `.env` file
- [ ] Webhook endpoint created with correct events
- [ ] Payment server starts without errors
- [ ] Website loads and shows payment form
- [ ] Test payment completes successfully
- [ ] Webhook receives payment events
- [ ] Console shows successful payment flow

🎉 **You're ready to accept credit card payments for your NFTs!**