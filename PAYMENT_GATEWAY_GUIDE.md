# 💳 SkunkSquad Credit Card Payment System

**Revolutionary fiat-to-NFT payment gateway with instant delivery**

## 🚀 **Overview**

The SkunkSquad Payment Gateway enables users to purchase NFTs directly with credit cards, eliminating the crypto barrier for mainstream adoption. This system bridges traditional finance with blockchain technology through a secure, compliant, and user-friendly interface.

## 🏗️ **Architecture**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │   Payment API   │    │  Smart Contract │
│                 │    │   (Node.js)     │    │   (Solidity)    │
│  Credit Card    │───▶│                 │───▶│                 │
│  Checkout Form  │    │  Stripe         │    │  NFT Minting    │
│                 │    │  Integration    │    │  & Delivery     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Stripe      │    │   Database      │    │    Ethereum     │
│   (Payment)     │    │  (Payments)     │    │   Blockchain    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 **Components**

### **1. Smart Contract (`SkunkSquadPaymentGateway.sol`)**
- **Fiat Payment Tracking**: Records and manages payment states
- **Signature Validation**: Verifies Stripe payment confirmations
- **Automatic NFT Minting**: Delivers NFTs upon payment confirmation
- **Refund Handling**: Manages disputes and chargebacks
- **Price Management**: Dynamic USD pricing with ETH conversion

### **2. Payment API (`payment-server.js`)**
- **Stripe Integration**: Payment intent creation and webhook handling
- **Blockchain Interface**: Smart contract interaction and transaction management
- **Security Layer**: Signature generation and validation
- **Error Handling**: Comprehensive error recovery and user feedback

### **3. React Frontend (`PaymentCheckout.js`)**
- **Credit Card Form**: Stripe Elements integration for secure card input
- **User Experience**: Quantity selection, pricing display, and status tracking
- **Real-time Updates**: Payment progress and NFT delivery confirmation
- **Responsive Design**: Mobile-optimized checkout flow

## 💰 **Payment Flow**

### **Step 1: Payment Initiation**
1. User selects quantity (1-10 NFTs)
2. System calculates total cost in USD
3. Payment intent created in Stripe
4. Smart contract records pending payment

### **Step 2: Card Processing**
1. User enters credit card information
2. Stripe processes payment securely (PCI compliant)
3. Payment confirmation or failure returned

### **Step 3: NFT Delivery**
1. Webhook receives payment confirmation
2. API generates cryptographic signature
3. Smart contract validates signature
4. NFTs automatically minted to user's wallet

### **Step 4: Completion**
1. Transaction hash and token IDs recorded
2. User receives confirmation with NFT details
3. NFTs immediately available in wallet/OpenSea

## 🛡️ **Security Features**

### **Cryptographic Security**
- **ECDSA Signatures**: Cryptographic proof of payment validation
- **Nonce Protection**: Prevents replay attacks and double-spending
- **Time-based Expiry**: Payment windows prevent stale transactions

### **Payment Security**
- **PCI Compliance**: Stripe handles all sensitive card data
- **Webhook Verification**: Stripe signature validation
- **SSL/TLS Encryption**: End-to-end encrypted communications

### **Smart Contract Security**
- **Reentrancy Guards**: Protection against reentrancy attacks
- **Access Controls**: Role-based permission system
- **Emergency Pause**: Circuit breaker for critical issues
- **Audit Trail**: Complete transaction history and logging

## 🚀 **Setup Guide**

### **Prerequisites**
```bash
# Required software
Node.js 18+
npm or yarn
Hardhat development environment
Git
```

### **1. Clone and Install**
```bash
git clone https://github.com/AbelConsulting/skunksquadnft.com.git
cd skunksquadnft.com
npm install
npm install stripe
```

### **2. Environment Configuration**
```bash
cp .env.example .env
# Edit .env with your configuration
```

**Required Environment Variables:**
```bash
# Blockchain
PRIVATE_KEY=your_wallet_private_key
RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
NFT_CONTRACT_ADDRESS=0x7649366eeb2F996513C4A929d9A980779Cf2364C
STRIPE_VALIDATOR_ADDRESS=your_backend_wallet_address

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Server
PORT=3002
REACT_APP_API_URL=http://localhost:3002
```

### **3. Deploy Payment Gateway**
```bash
# Compile contracts
npm run compile

# Deploy to Sepolia testnet
npm run deploy-payment-gateway

# Deploy to mainnet (when ready)
npm run deploy-payment-mainnet
```

### **4. Configure Stripe**
1. **Create Stripe Account**: [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. **Get API Keys**: Copy publishable and secret keys
3. **Setup Webhook**: Add endpoint `https://yourdomain.com/webhooks/stripe`
4. **Enable Events**: 
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.dispute.created`

### **5. Start Payment Server**
```bash
# Development mode
npm run payment-dev

# Production mode
npm run payment-server
```

### **6. Frontend Integration**
```jsx
import PaymentCheckout from './components/PaymentCheckout';

function App() {
  const handlePaymentSuccess = (result) => {
    console.log('NFTs delivered:', result.tokenIds);
    // Handle successful purchase
  };

  const handlePaymentError = (error) => {
    console.error('Payment failed:', error);
    // Handle payment error
  };

  return (
    <PaymentCheckout
      walletAddress="0x..."
      onSuccess={handlePaymentSuccess}
      onError={handlePaymentError}
    />
  );
}
```

## 📊 **API Endpoints**

### **GET `/api/pricing`**
Get current NFT pricing information
```json
{
  "success": true,
  "data": {
    "pricePerNFTUSD": "50.00",
    "pricePerNFTCents": "5000",
    "currency": "USD"
  }
}
```

### **POST `/api/calculate-total`**
Calculate total cost for quantity
```json
{
  "quantity": 3
}
```

### **POST `/api/create-payment-intent`**
Create Stripe payment intent
```json
{
  "quantity": 2,
  "walletAddress": "0x742d35Cc6634C0532925a3b8D400ea4127f3966c",
  "metadata": {
    "customerEmail": "user@example.com"
  }
}
```

### **GET `/api/payment-status/:paymentId`**
Check payment and delivery status
```json
{
  "success": true,
  "data": {
    "paymentId": "pi_...",
    "status": "delivered",
    "tokenIds": ["1001", "1002"],
    "buyer": "0x742d35Cc6634C0532925a3b8D400ea4127f3966c"
  }
}
```

## 💡 **Usage Examples**

### **Basic Integration**
```javascript
// 1. Initialize payment
const response = await fetch('/api/create-payment-intent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    quantity: 2,
    walletAddress: userWallet
  })
});

// 2. Process with Stripe
const { clientSecret } = await response.json();
const result = await stripe.confirmCardPayment(clientSecret, {
  payment_method: { card: cardElement }
});

// 3. NFTs automatically delivered to wallet
```

### **Payment Status Monitoring**
```javascript
const checkPaymentStatus = async (paymentId) => {
  const response = await fetch(`/api/payment-status/${paymentId}`);
  const data = await response.json();
  
  if (data.data.status === 'delivered') {
    console.log('NFTs delivered:', data.data.tokenIds);
  }
};
```

## 🔧 **Configuration Options**

### **Smart Contract Settings**
```solidity
// Update pricing
await paymentGateway.updatePrice(
  ethers.utils.parseUnits("75", 2), // $75.00
  ethers.utils.parseUnits("3000", 2) // $3000 per ETH
);

// Update quantity limits
await paymentGateway.updateConfig(
  20, // max quantity per purchase
  3600 // payment timeout (1 hour)
);
```

### **API Configuration**
```javascript
// Rate limiting
const rateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100 // requests per minute
});

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGINS.split(','),
  credentials: true
}));
```

## 🚨 **Error Handling**

### **Common Errors and Solutions**

| Error | Cause | Solution |
|-------|--------|----------|
| `Invalid quantity` | Quantity outside 1-10 range | Check quantity limits |
| `Payment expired` | Payment took too long | Restart checkout process |
| `Invalid Stripe signature` | Webhook verification failed | Check webhook secret |
| `Contract call failed` | Blockchain interaction error | Check gas and network |

### **Error Recovery**
```javascript
// Automatic retry with exponential backoff
const retryPayment = async (paymentId, attempt = 1) => {
  try {
    await confirmPaymentAndMint(paymentId);
  } catch (error) {
    if (attempt < 3) {
      setTimeout(() => retryPayment(paymentId, attempt + 1), 
                 Math.pow(2, attempt) * 1000);
    } else {
      // Escalate to manual review
      await notifyAdmin(paymentId, error);
    }
  }
};
```

## 📈 **Analytics and Monitoring**

### **Key Metrics**
- **Conversion Rate**: Credit card vs crypto purchases
- **Payment Success Rate**: Successful payments / total attempts
- **Average Transaction Value**: Revenue per purchase
- **Geographic Distribution**: Global payment patterns

### **Monitoring Setup**
```javascript
// Payment metrics
const trackPayment = (paymentId, amount, status) => {
  analytics.track('Payment', {
    paymentId,
    amount,
    status,
    timestamp: Date.now()
  });
};

// Error tracking
const trackError = (error, context) => {
  Sentry.captureException(error, { tags: context });
};
```

## 🚀 **Production Deployment**

### **Mainnet Checklist**
- [ ] **Security Audit**: Smart contract security review
- [ ] **Stripe Live Mode**: Switch to live API keys
- [ ] **SSL Certificate**: HTTPS enabled for all endpoints
- [ ] **Rate Limiting**: Production-grade rate limits
- [ ] **Monitoring**: Error tracking and alerting
- [ ] **Backup Systems**: Database backups and failover
- [ ] **Legal Compliance**: Terms of service and privacy policy

### **Infrastructure Requirements**
```yaml
# Recommended server specs
CPU: 2+ cores
RAM: 4GB+
Storage: 50GB SSD
Network: 100Mbps+
Uptime: 99.9%+
```

## 🎯 **Benefits**

### **For Users**
- **No Crypto Needed**: Purchase with familiar credit cards
- **Instant Delivery**: NFTs delivered immediately after payment
- **Secure Checkout**: PCI-compliant payment processing
- **Global Access**: Accept international credit cards

### **For Project**
- **Mainstream Adoption**: Remove crypto barriers
- **Increased Revenue**: Higher conversion rates
- **Compliance**: Regulated payment processing
- **Analytics**: Detailed payment insights

## 📞 **Support**

### **Technical Support**
- **Email**: dev@skunksquadnft.com
- **Discord**: [SkunkSquad Developer Channel]
- **Documentation**: [Full API Reference]

### **Payment Issues**
- **Email**: payments@skunksquadnft.com
- **Response Time**: < 2 hours
- **Escalation**: Automatic admin notification

---

**The SkunkSquad Payment Gateway represents the future of NFT commerce - making digital assets accessible to everyone through familiar payment methods while maintaining the security and transparency of blockchain technology.** 🦨💳✨