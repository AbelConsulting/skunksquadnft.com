/**
 * Printful Integration Server
 * Backend proxy for Printful API to handle CORS and secure token management
 */

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Stripe (only if API key is provided)
let stripe;
if (process.env.STRIPE_SECRET_KEY) {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    console.log('✅ Stripe initialized successfully');
} else {
    console.warn('⚠️ STRIPE_SECRET_KEY not found - payment processing disabled');
}

// Import Stripe handler
const { router: stripeRouter, initializeStripe } = require('./stripe-handler');
if (stripe) {
    initializeStripe(stripe);
}

// Middleware
app.use(cors());

// Special handling for Stripe webhooks (needs raw body)
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

// JSON middleware for all other routes
app.use(express.json());

// Printful API Configuration
const PRINTFUL_API_TOKEN = process.env.PRINTFUL_API_TOKEN;
const PRINTFUL_CLIENT_ID = process.env.PRINTFUL_CLIENT_ID;
const PRINTFUL_CLIENT_SECRET = process.env.PRINTFUL_CLIENT_SECRET;
const PRINTFUL_BASE_URL = 'https://api.printful.com';
const API_VERSION = 'v2'; // Using V2 endpoints

// Validate API token is loaded
if (!PRINTFUL_API_TOKEN) {
    console.error('❌ ERROR: PRINTFUL_API_TOKEN not found in environment variables');
    console.error('Please check your .env file in the server directory');
    process.exit(1);
}

console.log('✅ API Token loaded successfully');

/**
 * Make authenticated request to Printful API
 */
async function printfulRequest(endpoint, options = {}) {
    // Add /v2 prefix if not already present and not a legacy endpoint
    const apiEndpoint = endpoint.startsWith('/v2') || endpoint.startsWith('/store') 
        ? endpoint 
        : `/v2${endpoint}`;
    
    const url = `${PRINTFUL_BASE_URL}${apiEndpoint}`;
    
    const headers = {
        'Authorization': `Bearer ${PRINTFUL_API_TOKEN}`,
        'Content-Type': 'application/json',
        'X-PF-Store-Id': process.env.PRINTFUL_STORE_ID || '',
        ...options.headers
    };

    try {
        const response = await fetch(url, {
            ...options,
            headers
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || `API Error: ${response.status}`);
        }

        // Log rate limit info from V2 headers
        const rateLimitRemaining = response.headers.get('X-Ratelimit-Remaining');
        const rateLimitReset = response.headers.get('X-Ratelimit-Reset');
        
        if (rateLimitRemaining && parseInt(rateLimitRemaining) < 10) {
            console.warn(`⚠️ Rate limit warning: ${rateLimitRemaining} requests remaining. Resets at: ${rateLimitReset}`);
        }

        return data.result || data; // V2 may return data directly
    } catch (error) {
        console.error('Printful API Error:', error);
        throw error;
    }
}

// Health check
app.get('/api/health', (req, res) => {
    const hasToken = !!PRINTFUL_API_TOKEN;
    const tokenPreview = hasToken ? `${PRINTFUL_API_TOKEN.substring(0, 10)}...` : 'NOT SET';
    
    res.json({ 
        status: 'ok', 
        message: 'Printful server is running',
        printfulConfigured: hasToken,
        tokenPreview: tokenPreview,
        stripeConfigured: !!stripe,
        environment: process.env.NODE_ENV || 'development'
    });
});

// Get store information
app.get('/api/store', async (req, res) => {
    try {
        const store = await printfulRequest('/store');
        res.json(store);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all products (V2 endpoint)
app.get('/api/products', async (req, res) => {
    try {
        // V2 endpoint with pagination support
        const limit = req.query.limit || 100;
        const offset = req.query.offset || 0;
        
        const products = await printfulRequest(`/store/products?limit=${limit}&offset=${offset}`);
        res.json(products || []);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get single product (V2 endpoint)
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await printfulRequest(`/store/products/${req.params.id}`);
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get product variant
app.get('/api/variants/:id', async (req, res) => {
    try {
        const variant = await printfulRequest(`/store/variants/${req.params.id}`);
        res.json(variant);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Calculate shipping rates
app.post('/api/shipping/rates', async (req, res) => {
    try {
        const rates = await printfulRequest('/shipping/rates', {
            method: 'POST',
            body: JSON.stringify(req.body)
        });
        res.json(rates);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create order (V2 endpoint with enhanced features)
app.post('/api/orders', async (req, res) => {
    try {
        // V2 allows more flexible itemized order building
        const order = await printfulRequest('/orders', {
            method: 'POST',
            body: JSON.stringify(req.body)
        });
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get order
app.get('/api/orders/:id', async (req, res) => {
    try {
        const order = await printfulRequest(`/orders/${req.params.id}`);
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Estimate order costs
app.post('/api/orders/estimate', async (req, res) => {
    try {
        const estimate = await printfulRequest('/orders/estimate-costs', {
            method: 'POST',
            body: JSON.stringify(req.body)
        });
        res.json(estimate);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get countries
app.get('/api/countries', async (req, res) => {
    try {
        const countries = await printfulRequest('/countries');
        res.json(countries);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Stripe payment routes (merchandise only)
if (stripe) {
    app.use('/api/stripe', stripeRouter);
    console.log('✅ Stripe payment routes enabled');
}

// Create Printful order endpoint
app.post('/api/orders', async (req, res) => {
    try {
        console.log('📦 Creating Printful order...');
        console.log('Order data:', JSON.stringify(req.body, null, 2));
        
        // Create order in Printful
        const orderData = {
            recipient: req.body.recipient,
            items: req.body.items,
            retail_costs: req.body.retail_costs,
            external_id: req.body.external_id
        };
        
        const result = await printfulRequest('/orders', 'POST', orderData);
        
        console.log('✅ Printful order created successfully');
        console.log('Order ID:', result.id);
        
        res.json(result);
    } catch (error) {
        console.error('❌ Error creating Printful order:', error.message);
        console.error('Error details:', error);
        res.status(500).json({ 
            error: error.message,
            details: 'Failed to create Printful order. Please check logs.'
        });
    }
});

// Get order status
app.get('/api/orders/:orderId', async (req, res) => {
    try {
        const order = await printfulRequest(`/orders/${req.params.orderId}`);
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Webhook endpoint for Printful events
app.post('/api/webhooks/printful', async (req, res) => {
    try {
        console.log('Printful Webhook received:', req.body);
        
        const { type, data } = req.body;
        
        switch (type) {
            case 'order_created':
                console.log('Order created:', data);
                break;
            case 'order_updated':
                console.log('Order updated:', data);
                break;
            case 'order_shipped':
                console.log('Order shipped:', data);
                break;
            case 'order_failed':
                console.log('Order failed:', data);
                break;
            default:
                console.log('Unknown webhook type:', type);
        }
        
        res.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`🚀 Printful server running on http://localhost:${PORT}`);
    console.log(`📦 API endpoint: http://localhost:${PORT}/api`);
    console.log('');
    console.log('Available endpoints:');
    console.log('  GET  /api/health');
    console.log('  GET  /api/store');
    console.log('  GET  /api/products');
    console.log('  GET  /api/products/:id');
    console.log('  POST /api/orders');
    console.log('  POST /api/webhooks/printful');
    if (stripe) {
        console.log('  POST /api/stripe/create-checkout-session');
        console.log('  POST /api/stripe/webhook');
    }
});

// Handle server errors
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        console.error('Please stop the other process or use a different port');
    } else {
        console.error('❌ Server error:', error);
    }
    process.exit(1);
});

// Handle uncaught errors to prevent crashes
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down server...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
