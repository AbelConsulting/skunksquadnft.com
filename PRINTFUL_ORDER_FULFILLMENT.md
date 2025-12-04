# Printful Order Fulfillment Integration

## Overview
Complete Stripe → Printful order automation for SkunkSquad merchandise shop.

## How It Works

### 1. Customer Journey
```
Customer → Shop → Add to Cart → Checkout → Stripe Payment → Printful Order → Fulfillment
```

### 2. Technical Flow

#### Step 1: Cart Management (`shop.js`)
- Customer selects product, size, color, quantity
- System captures Printful `variantId` for each item
- Cart stored in `localStorage` with variant mapping

#### Step 2: Stripe Checkout (`stripe-handler.js`)
- **POST** `/api/stripe/create-checkout-session`
- Cart data passed in session metadata
- NFT holder discount applied if applicable
- Shipping address collected via Stripe

#### Step 3: Payment Webhook (`stripe-handler.js`)
- Stripe sends `checkout.session.completed` event
- Webhook verifies signature (requires `STRIPE_WEBHOOK_SECRET`)
- Extracts: cart items, shipping address, customer email

#### Step 4: Printful Order Creation (`handleSuccessfulPayment()`)
- Formats order payload with:
  - Recipient details from Stripe shipping
  - Line items with `sync_variant_id` from cart
  - External ID = Stripe session ID (for tracking)
- **POST** `/api/orders` → Printful API
- Logs success/failure for monitoring

#### Step 5: Order Fulfillment (Printful)
- Printful receives order
- Manufactures products
- Ships to customer
- Sends tracking info via webhook

---

## Files Modified

### Backend
1. **`server/stripe-handler.js`**
   - Added `fetch` import for API calls
   - Implemented `handleSuccessfulPayment()` with full Printful order creation
   - Error handling and fallback logging
   - Maps cart data to Printful order format

2. **`server/printful-server.js`**
   - Added `/api/orders` POST endpoint (creates Printful orders)
   - Added `/api/orders/:orderId` GET endpoint (checks order status)

### Frontend
3. **`src/js/shop.js`**
   - Captures `variantId` when adding to cart
   - Stores Printful variant mapping for order creation

---

## Configuration Required

### 1. Stripe Webhook Secret
Get from: https://dashboard.stripe.com/webhooks

**Steps:**
1. Create endpoint: `https://yourdomain.com/api/stripe/webhook`
2. Select events: `checkout.session.completed`
3. Copy signing secret
4. Update `.env`:
```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2. Printful API Token
Get from: https://www.printful.com/dashboard/store

**Steps:**
1. Go to Stores → Your Store → Settings
2. Generate API Access
3. Copy token
4. Update `.env`:
```env
PRINTFUL_API_TOKEN=your_actual_token_here
```

### 3. Product Variant Mapping
**Critical:** Cart items must include valid Printful `sync_variant_id`

Currently in `shop.js`, we capture:
```javascript
variantId: variant.id  // From Printful product sync
```

**Verify variants exist:**
```bash
curl http://localhost:3001/api/products
```

Check each product has `variants` array with `id` field.

---

## Testing

### 1. Test Mode (Recommended First)
Use Stripe test mode cards:
- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`

### 2. Webhook Testing
**Option A: Stripe CLI**
```powershell
stripe listen --forward-to localhost:3001/api/stripe/webhook
stripe trigger checkout.session.completed
```

**Option B: ngrok**
```powershell
ngrok http 3001
# Use ngrok URL in Stripe webhook settings
```

### 3. Full Flow Test
1. Start server: `cd server; node printful-server.js`
2. Open shop: `http://localhost:3001/shop.html`
3. Add product to cart
4. Proceed to checkout
5. Use test card: `4242 4242 4242 4242`
6. Complete payment
7. Check server logs for:
   ```
   ✅ Payment successful: cs_test_...
   📦 Creating Printful order...
   ✅ Printful order created: 12345678
   ```

### 4. Verify Order in Printful
- Login to Printful Dashboard
- Go to Orders
- Look for order with External ID = Stripe session ID
- Check status: `draft` → `pending` → `fulfilled`

---

## Error Handling

### Payment Success, Order Fails
```javascript
// Logged as CRITICAL error
console.error('⚠️ CRITICAL: Payment received but order processing failed');
```

**Action Required:**
1. Check server logs for Stripe session ID
2. Manually create order in Printful Dashboard
3. Use session metadata for cart items
4. Investigate API error (auth, variant IDs, etc.)

### Common Issues

#### 1. Invalid Variant ID
```
Error: Variant not found
```
**Fix:** Update product variant mapping in database/config

#### 2. Missing Shipping Address
```
Error: Recipient address required
```
**Fix:** Ensure Stripe checkout collects shipping via `shipping_address_collection`

#### 3. Insufficient Printful Credits
```
Error: Insufficient funds
```
**Fix:** Add funds to Printful account or enable auto-charge

#### 4. Webhook Signature Mismatch
```
Error: No signatures found matching the expected signature
```
**Fix:** Update `STRIPE_WEBHOOK_SECRET` in `.env`

---

## Future Enhancements (TODO)

### 1. Database Order Tracking
```javascript
// Store in MongoDB/PostgreSQL
orderMapping = {
    stripeSessionId: session.id,
    printfulOrderId: printfulOrder.id,
    customerEmail: session.customer_email,
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date()
}
```

### 2. Email Notifications
```javascript
// After successful order creation
sendOrderConfirmationEmail(session.customer_email, {
    orderNumber: printfulOrder.id,
    items: cartData,
    trackingUrl: printfulOrder.tracking_url,
    estimatedDelivery: printfulOrder.estimated_delivery
});
```

### 3. Admin Dashboard
- View all orders
- Track fulfillment status
- Handle failed orders
- Resend webhooks
- Manual order creation

### 4. Retry Logic
```javascript
// Add to failed orders queue
failedOrdersQueue.add({
    sessionId: session.id,
    orderData: printfulOrderData,
    retryCount: 0,
    maxRetries: 3,
    nextRetry: Date.now() + 300000 // 5 minutes
});
```

### 5. Inventory Sync
- Check Printful stock before checkout
- Disable unavailable sizes/colors
- Show "Low stock" warnings
- Auto-sync product availability

---

## Production Checklist

- [ ] Stripe live keys configured in `.env`
- [ ] Stripe webhook endpoint created with live secret
- [ ] Printful API token added to `.env`
- [ ] All products have valid `sync_variant_id` mappings
- [ ] Tested full checkout flow in Stripe test mode
- [ ] Verified Printful order creation in sandbox
- [ ] Set up error monitoring (Sentry, LogRocket, etc.)
- [ ] Configure email notifications
- [ ] Add order tracking page for customers
- [ ] Test webhook delivery with ngrok/production URL
- [ ] Monitor first live order end-to-end
- [ ] Document support process for failed orders

---

## Monitoring

### Key Logs to Watch
```bash
# Successful payment
✅ Payment successful: cs_live_...

# Order creation start
📦 Creating Printful order...

# Order created
✅ Printful order created: 12345678

# Critical error
⚠️ CRITICAL: Payment received but order processing failed
```

### Webhook Health Check
```javascript
// Check last 10 webhook events
stripe events list --limit 10
```

### Printful Order Status
```javascript
// GET /api/orders/:orderId
fetch('http://localhost:3001/api/orders/12345678')
    .then(r => r.json())
    .then(order => console.log(order.status));
```

---

## Support

### Failed Order Recovery
1. Find Stripe session ID in error logs
2. Retrieve cart data from session metadata
3. Get shipping address from session
4. Manually create order in Printful Dashboard
5. Send confirmation email to customer

### Contact Points
- **Stripe Support:** https://support.stripe.com
- **Printful Support:** support@printful.com
- **Developer Docs:** 
  - Stripe: https://stripe.com/docs/webhooks
  - Printful: https://developers.printful.com

---

## Architecture Diagram

```
┌─────────────┐
│  Customer   │
└──────┬──────┘
       │ 1. Browse & Add to Cart
       ▼
┌─────────────┐
│  shop.html  │ ◄── Captures variantId
└──────┬──────┘
       │ 2. Checkout
       ▼
┌──────────────┐
│ Stripe       │ ◄── Collects payment & shipping
│ Checkout     │
└──────┬───────┘
       │ 3. Payment Success
       ▼
┌──────────────┐
│ Webhook      │ ◄── checkout.session.completed
│ /api/stripe  │
└──────┬───────┘
       │ 4. handleSuccessfulPayment()
       ▼
┌──────────────┐
│ POST         │ ◄── Creates order with variant IDs
│ /api/orders  │
└──────┬───────┘
       │ 5. Order data
       ▼
┌──────────────┐
│ Printful API │ ◄── Manufactures & ships
└──────┬───────┘
       │ 6. Fulfillment
       ▼
┌──────────────┐
│  Customer    │ ◄── Receives product
│  (Delivery)  │
└──────────────┘
```

---

## Status: ✅ IMPLEMENTED

The complete Stripe → Printful order fulfillment pipeline is now functional. 

**Next Steps:**
1. Configure webhook secret
2. Test with real Printful token
3. Process first test order
4. Monitor and refine
