const axios = require('axios');

async function testStripeDirectly() {
    console.log('🧪 Testing Stripe Integration...');
    
    try {
        // Test health endpoint first
        console.log('1️⃣ Testing health endpoint...');
        const healthResponse = await axios.get('http://localhost:3003/api/health');
        console.log('✅ Health check passed:', healthResponse.data.message);
        
        // Test Stripe endpoint
        console.log('\n2️⃣ Testing Stripe connection...');
        const stripeResponse = await axios.get('http://localhost:3003/api/test-stripe');
        console.log('✅ Stripe test passed!');
        console.log('💳 Payment Intent ID:', stripeResponse.data.data.paymentIntentId);
        console.log('💰 Amount:', stripeResponse.data.data.amount, 'cents');
        console.log('🔄 Status:', stripeResponse.data.data.status);
        
        console.log('\n🎉 SUCCESS: Your Stripe integration is working correctly!');
        console.log('\n📋 What this means:');
        console.log('   ✅ Stripe API keys are valid');
        console.log('   ✅ Payment intents can be created');
        console.log('   ✅ Server is responding to requests');
        console.log('   ✅ Ready for live credit card testing');
        
        console.log('\n🔄 Next steps:');
        console.log('   1. Test frontend payment flow');
        console.log('   2. Configure webhook endpoints');
        console.log('   3. Test with real credit card numbers');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.log('Response status:', error.response.status);
            console.log('Response data:', error.response.data);
        }
    }
}

// Run test after a short delay
setTimeout(testStripeDirectly, 3000);