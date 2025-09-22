# 🚀 SkunkSquad Stripe Account Setup Guide

This guide will walk you through setting up your Stripe account for credit card NFT payments.

## 📋 **Prerequisites**

- Business bank account (for receiving payments)
- Business information (EIN/SSN, business address)
- Government-issued ID
- Business website (can be this NFT site)

## 🔧 **Step 1: Create Stripe Account**

### 1.1 Sign Up for Stripe
1. Go to [https://stripe.com](https://stripe.com)
2. Click "Start now" 
3. Enter your email and create a password
4. Choose "Accept payments" as your use case

### 1.2 Business Information
You'll need to provide:
- **Business type:** LLC, Corporation, Sole Proprietorship, etc.
- **Business name:** "Skunk Squad NFT" or your business name
- **Business website:** Your NFT website URL
- **Business description:** "Digital collectible NFTs and blockchain art"
- **Tax ID:** EIN or SSN depending on business structure

### 1.3 Personal Information
- Full legal name
- Date of birth
- Home address
- Phone number
- Last 4 digits of SSN

### 1.4 Bank Account
- **Account type:** Business checking account
- **Routing number**
- **Account number** 
- **Account holder name**

> ⚠️ **Important:** Use a business bank account to avoid personal tax complications

## 🔑 **Step 2: Get API Keys**

### 2.1 Navigate to API Keys
1. Log into your Stripe dashboard
2. Go to **Developers** → **API keys**
3. You'll see both **Test** and **Live** keys

### 2.2 Test Keys (For Development)
Copy these values:
- **Publishable key:** `pk_test_...` 
- **Secret key:** `sk_test_...`

### 2.3 Live Keys (For Production)
- **Publishable key:** `pk_live_...`
- **Secret key:** `sk_live_...`

> 🔒 **Security:** Never share secret keys or commit them to version control

## 🔗 **Step 3: Set Up Webhooks**

### 3.1 Create Webhook Endpoint
1. Go to **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. **Endpoint URL:** `https://yourdomain.com/webhooks/stripe`
   - For development: `https://your-ngrok-url.ngrok.io/webhooks/stripe`
4. **Events to send:**
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.dispute.created`

### 3.2 Get Webhook Secret
1. After creating the webhook, click on it
2. Copy the **Signing secret** (starts with `whsec_`)
3. This validates webhook authenticity

## 💳 **Step 4: Configure Payment Methods**

### 4.1 Enable Payment Methods
1. Go to **Settings** → **Payment methods**
2. Enable:
   - **Cards** (Visa, Mastercard, American Express)
   - **Digital wallets** (Apple Pay, Google Pay) - optional
   - **Buy now, pay later** (Klarna, Affirm) - optional

### 4.2 Set Currency
- Primary currency: **USD**
- You can add other currencies later if needed

## 🏦 **Step 5: Business Verification**

### 5.1 Identity Verification
Stripe will ask for:
- **Government ID** (driver's license or passport)
- **Business documents** (Articles of Incorporation, EIN letter)
- **Bank statement** (to verify account ownership)

### 5.2 Processing Timeframe
- **Instant verification:** If all documents are clear
- **1-2 business days:** For manual review
- **Up to 7 days:** If additional documents needed

## 📊 **Step 6: Set Up Payouts**

### 6.1 Payout Schedule
1. Go to **Settings** → **Payouts**
2. Choose payout frequency:
   - **Daily** (recommended for high volume)
   - **Weekly** 
   - **Monthly**

### 6.2 Payout Method
- **Bank transfer** (ACH) - standard
- **Instant payout** (debit card) - faster but higher fees

## 🔒 **Step 7: Security Settings**

### 7.1 Two-Factor Authentication
1. Go to **Settings** → **Team**
2. Enable **2FA** for your account
3. Use authenticator app (Google Authenticator, Authy)

### 7.2 Webhook Security
- Always verify webhook signatures
- Use HTTPS endpoints only
- Implement idempotency for webhook handling

## 💰 **Step 8: Pricing & Fees**

### 8.1 Stripe Fees
- **Standard rate:** 2.9% + 30¢ per successful charge
- **International cards:** +1.5%
- **Currency conversion:** +1%

### 8.2 Chargeback Protection
- **Stripe Radar:** Fraud protection (included)
- **Chargeback protection:** $15 per protected chargeback

## 📧 **Step 9: Customer Communication**

### 9.1 Email Receipts
1. Go to **Settings** → **Emails**
2. Customize receipt templates
3. Add your business logo and branding

### 9.2 Business Information
- **Support email:** support@yourdomain.com
- **Support phone:** Your business phone
- **Business address:** Your business address

## 🧪 **Step 10: Test Your Setup**

### 10.1 Test Card Numbers
Use these for testing:
- **Visa:** `4242424242424242`
- **Visa (debit):** `4000056655665556`
- **Mastercard:** `5555555555554444`
- **American Express:** `378282246310005`
- **Declined card:** `4000000000000002`

### 10.2 Test Scenarios
- Successful payment
- Declined payment
- Disputed payment
- Refund processing

## 🚀 **Step 11: Go Live**

### 11.1 Activate Live Mode
1. Complete business verification
2. Go to **Settings** → **Account**
3. Click **"Activate your account"**

### 11.2 Switch to Live Keys
- Update your `.env` file with live keys
- Update webhook endpoints to production URLs
- Test with small real transactions

## 📋 **Final Checklist**

- [ ] Stripe account created and verified
- [ ] API keys obtained (test and live)
- [ ] Webhooks configured with proper events
- [ ] Payment methods enabled
- [ ] Bank account connected and verified
- [ ] Two-factor authentication enabled
- [ ] Test payments completed successfully
- [ ] Business information and branding set up
- [ ] Customer email templates customized
- [ ] Live mode activated (when ready)

## 🆘 **Need Help?**

- **Stripe Documentation:** [https://stripe.com/docs](https://stripe.com/docs)
- **Stripe Support:** Available 24/7 via dashboard
- **Integration Guide:** See `STRIPE_SETUP_GUIDE.md` for technical setup

---

## 🔄 **Next Steps**

After completing this setup:
1. Update your `.env` file with actual Stripe keys
2. Deploy the payment gateway smart contract
3. Test the complete payment flow
4. Launch your NFT collection with credit card payments!

**Estimated Setup Time:** 30-60 minutes (plus verification wait time)