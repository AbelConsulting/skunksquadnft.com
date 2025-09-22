# 🚀 SkunkSquad Stripe Quick Setup Reference

## 📋 **Setup Checklist**

### ✅ **Phase 1: Account Setup**
- [ ] Create Stripe account at [stripe.com](https://stripe.com)
- [ ] Complete business verification 
- [ ] Connect bank account
- [ ] Enable 2FA security

### ✅ **Phase 2: Get API Keys**
- [ ] Get **Test** publishable key (`pk_test_...`)
- [ ] Get **Test** secret key (`sk_test_...`)
- [ ] Get **Live** keys when ready (`pk_live_...`, `sk_live_...`)

### ✅ **Phase 3: Configure Webhooks**
- [ ] Create webhook endpoint in Stripe dashboard
- [ ] Set endpoint URL: `https://yourdomain.com/webhooks/stripe`
- [ ] Enable events: `payment_intent.succeeded`, `payment_intent.payment_failed`
- [ ] Copy webhook secret (`whsec_...`)

### ✅ **Phase 4: Configure Project**
- [ ] Run configuration script: `npm run configure-stripe`
- [ ] Deploy payment gateway: `npm run deploy-payment-gateway`
- [ ] Test payment system: `npm run test-payment-system`

---

## 🔑 **Quick Commands**

```bash
# Interactive Stripe configuration
npm run configure-stripe

# Deploy payment gateway contract
npm run deploy-payment-gateway

# Start development environment
npm run dev

# Test payment system
npm run test-payment-system

# Listen for webhooks (requires Stripe CLI)
npm run stripe-listen
```

---

## 📍 **Important URLs**

| Service | Test | Live |
|---------|------|------|
| **Dashboard** | [dashboard.stripe.com/test](https://dashboard.stripe.com/test) | [dashboard.stripe.com](https://dashboard.stripe.com) |
| **API Keys** | [.../test/apikeys](https://dashboard.stripe.com/test/apikeys) | [.../apikeys](https://dashboard.stripe.com/apikeys) |
| **Webhooks** | [.../test/webhooks](https://dashboard.stripe.com/test/webhooks) | [.../webhooks](https://dashboard.stripe.com/webhooks) |
| **Payments** | [.../test/payments](https://dashboard.stripe.com/test/payments) | [.../payments](https://dashboard.stripe.com/payments) |

---

## 💳 **Test Credit Cards**

| Card Type | Number | CVC | Date |
|-----------|--------|-----|------|
| **Visa** | `4242424242424242` | `123` | `12/34` |
| **Visa (debit)** | `4000056655665556` | `123` | `12/34` |
| **Mastercard** | `5555555555554444` | `123` | `12/34` |
| **Amex** | `378282246310005` | `1234` | `12/34` |
| **Declined** | `4000000000000002` | `123` | `12/34` |

---

## 🔧 **Files Updated During Setup**

- **`.env`** - Stripe API keys and configuration
- **`index.html`** - Frontend publishable key
- **Contract deployment** - Payment gateway address

---

## 🆘 **Troubleshooting**

### **"Invalid API Key" Error**
- ✅ Check key format (`pk_test_` or `sk_test_`)
- ✅ Ensure no extra spaces or characters
- ✅ Verify test vs live key mode

### **"Webhook Signature Failed" Error**
- ✅ Check webhook secret (`whsec_`)
- ✅ Verify endpoint URL is correct
- ✅ Ensure webhook events are enabled

### **"Contract Not Deployed" Error**
- ✅ Run `npm run deploy-payment-gateway`
- ✅ Check `PAYMENT_GATEWAY_ADDRESS` in `.env`
- ✅ Verify network connection

### **Payment Not Processing**
- ✅ Check payment server is running (`npm run payment-dev`)
- ✅ Verify API URL in frontend
- ✅ Test with valid test card numbers

---

## 📞 **Support Resources**

- **Stripe Documentation:** [stripe.com/docs](https://stripe.com/docs)
- **Stripe Support:** 24/7 via dashboard
- **NFT Project Setup:** See `STRIPE_SETUP_GUIDE.md`
- **Account Setup:** See `STRIPE_ACCOUNT_SETUP.md`

---

## 🎯 **Ready to Launch?**

Once setup is complete:
1. ✅ All test payments working
2. ✅ Webhooks receiving events  
3. ✅ NFTs minting successfully
4. ✅ Business account verified
5. 🚀 **Switch to live keys and launch!**