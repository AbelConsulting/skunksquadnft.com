/**
 * Stripe Payment Handler for SkunkSquad Merchandise
 * Handles payment processing and Printful order fulfillment
 */

const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

// Stripe will be initialized in the main server file
let stripe;

function initializeStripe(stripeInstance) {
    stripe = stripeInstance;
}

/**
 * Create Checkout Session for merchandise
 */
router.post('/create-checkout-session', async (req, res) => {
    try {
        const { items, customerEmail, successUrl, cancelUrl, isNFTHolder } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'No items provided' });
        }

        // Transform cart items to Stripe line items
        const lineItems = items.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name,
                    description: `Size: ${item.size} | Color: ${item.color}`,
                    images: item.image ? [item.image] : [],
                    metadata: {
                        productId: item.productId,
                        size: item.size,
                        color: item.color,
                        type: 'merchandise' // Distinguish from NFT purchases
                    },
                    // Tax code for physical goods (apparel)
                    tax_code: 'txcd_99999999', // General - Tangible Goods
                },
                unit_amount: Math.round(item.price * 100), // Convert to cents
            },
            quantity: item.quantity,
        }));

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            customer_email: customerEmail,
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                orderType: 'merchandise',
                isNFTHolder: isNFTHolder ? 'true' : 'false',
                cartData: JSON.stringify(items) // Store for webhook processing
            },
            // Enable automatic tax calculation
            automatic_tax: {
                enabled: true,
            },
            shipping_address_collection: {
                allowed_countries: ['US', 'CA', 'GB', 'AU', 'NZ', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'CH', 'SE', 'NO', 'DK', 'FI', 'IE', 'PT', 'PL', 'CZ', 'JP', 'SG', 'HK'],
            },
            billing_address_collection: 'required',
            allow_promotion_codes: true,
            shipping_options: [
                {
                    shipping_rate_data: {
                        type: 'fixed_amount',
                        fixed_amount: {
                            amount: 0, // Free shipping - actual cost calculated later
                            currency: 'usd',
                        },
                        display_name: 'Standard Shipping',
                        delivery_estimate: {
                            minimum: {
                                unit: 'business_day',
                                value: 5,
                            },
                            maximum: {
                                unit: 'business_day',
                                value: 10,
                            },
                        },
                    },
                },
                {
                    shipping_rate_data: {
                        type: 'fixed_amount',
                        fixed_amount: {
                            amount: 1500, // $15 express shipping
                            currency: 'usd',
                        },
                        display_name: 'Express Shipping',
                        delivery_estimate: {
                            minimum: {
                                unit: 'business_day',
                                value: 2,
                            },
                            maximum: {
                                unit: 'business_day',
                                value: 4,
                            },
                        },
                    },
                },
            ],
        });

        res.json({ 
            sessionId: session.id,
            url: session.url 
        });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ 
            error: 'Failed to create checkout session',
            details: error.message 
        });
    }
});

/**
 * Webhook handler for Stripe events
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            await handleSuccessfulPayment(session);
            break;
        
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log('💰 Payment succeeded:', paymentIntent.id);
            break;
        
        case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;
            console.log('❌ Payment failed:', failedPayment.id);
            break;
        
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
});

/**
 * Handle successful payment and create Printful order
 */
async function handleSuccessfulPayment(session) {
    try {
        console.log('✅ Payment successful:', session.id);
        console.log('Customer email:', session.customer_email);
        console.log('Shipping address:', session.shipping_details?.address);
        
        const cartData = JSON.parse(session.metadata.cartData);
        const shippingAddress = session.shipping_details?.address;
        const shippingName = session.shipping_details?.name || session.customer_details?.name || 'Customer';
        
        // Extract name parts
        const nameParts = shippingName.split(' ');
        const firstName = nameParts[0] || 'Customer';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        // Format Printful order items
        const printfulItems = cartData.map(item => {
            // For demo products, we'll need to map to actual Printful variant IDs
            // In production, these should be stored in your product database
            return {
                sync_variant_id: item.variantId || null, // Printful variant ID
                quantity: item.quantity,
                retail_price: item.price.toFixed(2),
                name: item.name,
                // Additional options if needed
                files: item.files || []
            };
        });
        
        // Create Printful order payload
        const printfulOrderData = {
            external_id: session.id, // Use Stripe session ID for tracking
            recipient: {
                name: shippingName,
                address1: shippingAddress?.line1 || '',
                address2: shippingAddress?.line2 || '',
                city: shippingAddress?.city || '',
                state_code: shippingAddress?.state || '',
                country_code: shippingAddress?.country || 'US',
                zip: shippingAddress?.postal_code || '',
                phone: session.customer_details?.phone || '',
                email: session.customer_email || ''
            },
            items: printfulItems,
            retail_costs: {
                currency: 'USD',
                subtotal: (session.amount_total / 100).toFixed(2),
                shipping: '0.00', // Already included in Stripe checkout
                tax: '0.00'
            }
        };
        
        console.log('📦 Creating Printful order...');
        console.log('Order data:', JSON.stringify(printfulOrderData, null, 2));
        
        // Create Printful order via API
        try {
            const printfulResponse = await fetch('http://localhost:3001/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(printfulOrderData)
            });
            
            if (printfulResponse.ok) {
                const printfulOrder = await printfulResponse.json();
                console.log('✅ Printful order created:', printfulOrder.id);
                console.log('Order details:', printfulOrder);
                
                // TODO: Store order mapping in database
                // orderMapping = {
                //     stripeSessionId: session.id,
                //     printfulOrderId: printfulOrder.id,
                //     customerEmail: session.customer_email,
                //     status: 'pending',
                //     createdAt: new Date()
                // }
                
                // TODO: Send confirmation email to customer
                // sendOrderConfirmationEmail(session.customer_email, printfulOrder);
                
            } else {
                const error = await printfulResponse.text();
                console.error('❌ Printful order creation failed:', error);
                
                // TODO: Alert admin about failed order
                // sendAdminAlert({
                //     type: 'printful_order_failed',
                //     stripeSessionId: session.id,
                //     error: error
                // });
            }
            
        } catch (printfulError) {
            console.error('❌ Error calling Printful API:', printfulError);
            
            // Fallback: Log order details for manual processing
            console.error('⚠️ MANUAL ORDER REQUIRED:');
            console.error('Stripe Session:', session.id);
            console.error('Customer:', session.customer_email);
            console.error('Items:', JSON.stringify(cartData, null, 2));
            console.error('Shipping:', JSON.stringify(shippingAddress, null, 2));
            
            // TODO: Store in failed orders queue for retry
            // failedOrdersQueue.add({
            //     sessionId: session.id,
            //     orderData: printfulOrderData,
            //     error: printfulError.message,
            //     timestamp: new Date()
            // });
        }
        
    } catch (error) {
        console.error('❌ Error handling successful payment:', error);
        
        // Critical error - needs immediate attention
        console.error('⚠️ CRITICAL: Payment received but order processing failed');
        console.error('Session ID:', session.id);
        console.error('Error:', error.message);
    }
}

/**
 * Get checkout session details
 */
router.get('/session/:sessionId', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
        res.json(session);
    } catch (error) {
        console.error('Error retrieving session:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Create payment intent (for custom checkout flow)
 */
router.post('/create-payment-intent', async (req, res) => {
    try {
        const { amount, currency = 'usd', metadata } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency,
            metadata: {
                orderType: 'merchandise',
                ...metadata
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = { router, initializeStripe };
