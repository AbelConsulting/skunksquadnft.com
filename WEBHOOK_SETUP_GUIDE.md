# 🔗 SkunkSquad Webhook Setup Guide

## 📋 **Webhook Setup Process**

Webhooks are crucial for your payment system - they notify your server when payments succeed, fail, or are disputed.

### 🎯 **Step 1: Create Webhook Endpoint in Stripe**

#### **1.1 Navigate to Webhooks**
1. Go to [https://dashboard.stripe.com/test/webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click **"Add endpoint"**

#### **1.2 Configure Endpoint**
**Endpoint URL Options:**

**For Local Development:**
```
https://your-ngrok-url.ngrok.io/webhooks/stripe
```
*We'll generate this URL in Step 2*

**For Production:**
```
https://yourdomain.com/webhooks/stripe
```

#### **1.3 Select Events**
**Required Events (select these):**
- ✅ `payment_intent.succeeded` - When payment completes successfully
- ✅ `payment_intent.payment_failed` - When payment fails
- ✅ `charge.dispute.created` - When customer disputes a charge

**Optional Events (recommended):**
- ✅ `payment_intent.canceled` - When payment is canceled
- ✅ `charge.refunded` - When refund is processed
- ✅ `invoice.payment_succeeded` - For subscription payments (future)

#### **1.4 Get Webhook Secret**
After creating the webhook:
1. Click on your new webhook in the list
2. Scroll down to **"Signing secret"**
3. Click **"Reveal"** 
4. **Copy the secret** (starts with `whsec_`)

---

## 🛠️ **Step 2: Set Up Local Development (ngrok)**

For testing webhooks locally, we'll use ngrok to create a secure tunnel.

### **2.1 Install ngrok**
```bash
# Download from: https://ngrok.com/download
# Or using chocolatey:
choco install ngrok

# Or using scoop:
scoop install ngrok
```

### **2.2 Start Your Payment Server**
```bash
npm run payment-dev
```
*This starts your server on http://localhost:3002*

### **2.3 Create ngrok Tunnel**
In a new terminal:
```bash
ngrok http 3002
```

**Copy the HTTPS URL** (looks like: `https://abc123.ngrok.io`)

### **2.4 Update Webhook Endpoint**
Go back to your Stripe webhook and update the endpoint URL to:
```
https://your-ngrok-url.ngrok.io/webhooks/stripe
```

---

## 🔧 **Step 3: Test Webhook Connection**

### **3.1 Test Webhook Delivery**
1. In Stripe dashboard, go to your webhook
2. Click **"Send test webhook"**
3. Select `payment_intent.succeeded`
4. Click **"Send test webhook"**

### **3.2 Check Server Logs**
You should see in your payment server logs:
```
✅ Webhook received: payment_intent.succeeded
🔍 Webhook signature verified
📦 Processing payment intent: pi_test_...
```

### **3.3 Common Issues**
**❌ "Webhook endpoint returned status code 404"**
- Check ngrok is running and URL is correct
- Verify payment server is running on port 3002

**❌ "Webhook signature verification failed"**
- Check webhook secret in .env file
- Ensure secret starts with `whsec_`

---

## 📊 **Step 4: Webhook Event Handling**

Your payment server already handles these events:

### **payment_intent.succeeded**
```javascript
// Automatically mints NFTs when payment succeeds
await handlePaymentSucceeded(paymentIntent);
```

### **payment_intent.payment_failed**
```javascript
// Logs failure for admin review
await handlePaymentFailed(paymentIntent);
```

### **charge.dispute.created**
```javascript
// Marks payment as refunded in smart contract
await handleChargeback(charge);
```

---

## 🚀 **Step 5: Production Webhook Setup**

### **5.1 Deploy to Production**
When you deploy your site:
1. Update webhook URL to your production domain
2. Switch to live Stripe keys
3. Create new webhook for live mode

### **5.2 Production Endpoint**
```
https://yourdomain.com/webhooks/stripe
```

### **5.3 Security Best Practices**
- ✅ Always verify webhook signatures
- ✅ Use HTTPS endpoints only
- ✅ Implement idempotency for webhook handling
- ✅ Log all webhook events for debugging

---

## 🧪 **Step 6: Testing Webhooks**

### **6.1 Test Payment Flow**
1. **Start payment server:** `npm run payment-dev`
2. **Start ngrok:** `ngrok http 3002`
3. **Update webhook URL** in Stripe dashboard
4. **Test payment** on your website
5. **Check webhook delivery** in Stripe dashboard

### **6.2 Test Cards for Webhooks**
**Successful Payment:**
```
Card: 4242424242424242
CVC: 123
Date: 12/34
```

**Failed Payment:**
```
Card: 4000000000000002
CVC: 123
Date: 12/34
```

### **6.3 Monitor Webhook Attempts**
In Stripe dashboard:
1. Go to **Webhooks** → Your webhook
2. Click **"Attempts"** tab
3. See all delivery attempts and responses

---

## 📋 **Quick Checklist**

- [ ] Webhook endpoint created in Stripe dashboard
- [ ] Required events selected (payment_intent.succeeded, etc.)
- [ ] Webhook secret copied and added to .env
- [ ] ngrok installed and running
- [ ] Payment server running on localhost:3002
- [ ] Webhook URL updated to ngrok URL
- [ ] Test webhook sent successfully
- [ ] Payment flow tested end-to-end

---

## 🆘 **Troubleshooting**

### **Webhook Not Receiving Events**
1. Check ngrok is running: `ngrok http 3002`
2. Verify payment server is running: `npm run payment-dev`
3. Check webhook URL in Stripe dashboard
4. Test with "Send test webhook" in Stripe

### **Signature Verification Failed**
1. Check webhook secret in .env file
2. Ensure no extra spaces in webhook secret
3. Verify webhook secret starts with `whsec_`

### **404 Errors**
1. Check endpoint URL: `/webhooks/stripe` (not `/webhook/stripe`)
2. Verify ngrok tunnel is active
3. Check payment server is running on correct port

---

## 🔄 **Next Steps After Webhook Setup**

1. ✅ Deploy payment gateway smart contract
2. ✅ Test complete payment flow
3. ✅ Test NFT minting after payment
4. ✅ Set up production deployment

**Estimated Setup Time:** 15-30 minutes