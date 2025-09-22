const axios = require('axios');

async function quickTest() {
    console.log('🧪 Quick Stripe Test...');
    
    try {
        // Wait a moment for server to be ready
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('Testing server at http://localhost:3002...');
        
        // Test pricing endpoint
        const response = await axios.get('http://localhost:3002/api/pricing');
        console.log('✅ Server is responding!');
        console.log('📊 Pricing data:', response.data);
        
        // Test payment intent creation
        console.log('\n💳 Testing payment intent creation...');
        const paymentData = {
            quantity: 1,
            walletAddress: '0x742d35Cc6634C0532925a3b8D591B8a7c9bA1f0C',
            metadata: {
                billingName: 'Test User',
                billingEmail: 'test@example.com'
            }
        };
        
        const paymentResponse = await axios.post('http://localhost:3002/api/create-payment-intent', paymentData);
        console.log('✅ Payment intent created successfully!');
        console.log('💳 Payment Intent ID:', paymentResponse.data.data.paymentIntentId);
        console.log('💰 Amount:', paymentResponse.data.data.amount);
        console.log('🔢 Quantity:', paymentResponse.data.data.quantity);
        
        console.log('\n🎉 Stripe integration is working correctly!');
        console.log('\n📋 Next steps:');
        console.log('   1. ✅ Payment server is running');
        console.log('   2. ✅ Stripe API is responding');
        console.log('   3. ✅ Payment intents can be created');
        console.log('   4. 🔄 Ready for frontend testing');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.log('Response data:', error.response.data);
        }
    }
}

quickTest();