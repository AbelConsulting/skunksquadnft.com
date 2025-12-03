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

// Middleware
app.use(cors());
app.use(express.json());

// Printful API Configuration
const PRINTFUL_API_TOKEN = process.env.PRINTFUL_API_TOKEN;
const PRINTFUL_CLIENT_ID = process.env.PRINTFUL_CLIENT_ID;
const PRINTFUL_CLIENT_SECRET = process.env.PRINTFUL_CLIENT_SECRET;
const PRINTFUL_BASE_URL = 'https://api.printful.com';

/**
 * Make authenticated request to Printful API
 */
async function printfulRequest(endpoint, options = {}) {
    const url = `${PRINTFUL_BASE_URL}${endpoint}`;
    
    const headers = {
        'Authorization': `Bearer ${PRINTFUL_API_TOKEN}`,
        'Content-Type': 'application/json',
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

        return data.result;
    } catch (error) {
        console.error('Printful API Error:', error);
        throw error;
    }
}

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Printful server is running' });
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

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await printfulRequest('/store/products');
        res.json(products || []);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get single product
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

// Create order
app.post('/api/orders', async (req, res) => {
    try {
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
app.listen(PORT, () => {
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
});
