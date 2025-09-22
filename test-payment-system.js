#!/usr/bin/env node

/**
 * SkunkSquad Payment System Test
 * Quick test to verify Stripe integration is working
 */

const axios = require('axios').default;
require('dotenv').config();

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

async function testPaymentSystem() {
    console.log('🧪 Testing SkunkSquad Payment System...');
    console.log(`📡 API URL: ${API_URL}`);
    
    try {
        // Test 1: Check if server is running
        console.log('\n1️⃣ Testing server connectivity...');
        const healthCheck = await axios.get(`${API_URL}/api/pricing`);
        console.log('✅ Server is running');
        console.log('📊 Pricing data:', healthCheck.data);
        
        // Test 2: Test payment intent creation
        console.log('\n2️⃣ Testing payment intent creation...');
        const paymentData = {
            quantity: 1,
            walletAddress: '0x742d35Cc6634C0532925a3b8D591B8a7c9bA1f0C',
            metadata: {
                billingName: 'Test User',
                billingEmail: 'test@example.com'
            }
        };
        
        const paymentIntent = await axios.post(`${API_URL}/api/create-payment-intent`, paymentData);
        console.log('✅ Payment intent created');
        console.log('💳 Payment details:', {
            id: paymentIntent.data.data.paymentIntentId,
            amount: paymentIntent.data.data.amount,
            quantity: paymentIntent.data.data.quantity
        });
        
        // Test 3: Check payment status
        console.log('\n3️⃣ Testing payment status check...');
        const paymentId = paymentIntent.data.data.paymentIntentId;
        
        try {
            const statusCheck = await axios.get(`${API_URL}/api/payment-status/${paymentId}`);
            console.log('✅ Payment status retrieved');
            console.log('📋 Status:', statusCheck.data.data.status);
        } catch (statusError) {
            if (statusError.response?.status === 404) {
                console.log('⚠️ Payment not found in smart contract (normal for test)');
            } else {
                throw statusError;
            }
        }
        
        console.log('\n🎉 All tests passed! Payment system is ready.');
        console.log('\n📋 Next steps:');
        console.log('   1. Configure your Stripe keys in .env');
        console.log('   2. Update Stripe publishable key in index.html');
        console.log('   3. Set up webhook endpoint in Stripe dashboard');
        console.log('   4. Test with real credit card on frontend');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n🔧 Troubleshooting:');
            console.log('   • Payment server not running');
            console.log('   • Run: npm run payment-dev');
            console.log('   • Check port 3002 is available');
        } else if (error.response) {
            console.log('\n🔧 API Error:', error.response.data);
        }
        
        process.exit(1);
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    testPaymentSystem();
}

module.exports = { testPaymentSystem };