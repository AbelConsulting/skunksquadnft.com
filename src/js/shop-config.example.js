/**
 * Shop Configuration Example
 * Copy this file to shop-config.js and update with your actual keys
 * 
 * IMPORTANT: Never commit shop-config.js with real keys to git!
 */

(function() {
    'use strict';
    
    // Detect environment
    const isDevelopment = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1';
    
    // Configuration object
    window.SHOP_CONFIG = {
        // Stripe Publishable Key
        // Development: Get from https://dashboard.stripe.com/test/apikeys
        // Production: Get from https://dashboard.stripe.com/apikeys
        stripePublishableKey: isDevelopment 
            ? 'pk_test_YOUR_TEST_KEY_HERE'  // Replace with your test key
            : 'pk_live_YOUR_LIVE_KEY_HERE',  // Replace with your live key
        
        // API Endpoints
        apiBase: isDevelopment
            ? 'http://localhost:3001/api'
            : 'https://your-production-server.com/api',  // Update with your server URL
        
        // Feature flags
        enableNFTDiscount: true,
        enableGuestCheckout: true,
        
        // Environment indicator
        environment: isDevelopment ? 'development' : 'production',
        isDevelopment: isDevelopment
    };
    
    // Log configuration (only in development)
    if (isDevelopment) {
        console.log('🛒 Shop Config Loaded:', {
            environment: window.SHOP_CONFIG.environment,
            apiBase: window.SHOP_CONFIG.apiBase,
            stripeConfigured: window.SHOP_CONFIG.stripePublishableKey.startsWith('pk_')
        });
    }
    
    // Validate configuration
    if (!window.SHOP_CONFIG.stripePublishableKey.startsWith('pk_')) {
        console.error('❌ Invalid Stripe publishable key in shop-config.js');
    }
})();
