/**
 * Stripe Payment Handler for SkunkSquad Merchandise
 * Handles payment processing for Printful merchandise only
 */

const express = require('express');
const router = express.Router();

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
                    }
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
        
        // TODO: Create Printful order here
        // This will be implemented when connecting to Printful API
        console.log('Cart items:', cartData);
        console.log('Shipping to:', shippingAddress);
        
        // For now, just log the successful payment
        // In production, this would create the Printful order
        
    } catch (error) {
        console.error('Error handling successful payment:', error);
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
