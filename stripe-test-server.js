const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Simple test endpoint that doesn't require blockchain
app.get('/api/test-stripe', async (req, res) => {
    try {
        // Test Stripe connection by creating a simple payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: 4900, // $49.00 in cents
            currency: 'usd',
            metadata: {
                test: 'true'
            }
        });
        
        res.json({
            success: true,
            message: 'Stripe connection successful!',
            data: {
                paymentIntentId: paymentIntent.id,
                amount: paymentIntent.amount,
                currency: paymentIntent.currency,
                status: paymentIntent.status
            }
        });
    } catch (error) {
        console.error('Stripe test error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

const PORT = 3003;

app.listen(PORT, () => {
    console.log(`🧪 Stripe Test Server running on port ${PORT}`);
    console.log(`💳 Stripe Mode: ${process.env.STRIPE_SECRET_KEY?.startsWith('sk_live') ? 'LIVE' : 'TEST'}`);
    console.log('\n📋 Test endpoints:');
    console.log(`   GET  http://localhost:${PORT}/api/health`);
    console.log(`   GET  http://localhost:${PORT}/api/test-stripe`);
});