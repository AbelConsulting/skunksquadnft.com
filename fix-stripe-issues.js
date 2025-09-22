#!/usr/bin/env node

/**
 * Fix Common Stripe Integration Issues
 */

const fs = require('fs');
const path = require('path');

async function fixStripeIntegration() {
    console.log('🔧 Fixing SkunkSquad Stripe Integration Issues...\n');
    
    try {
        // 1. Check and fix .env file
        console.log('1️⃣ Checking .env configuration...');
        const envPath = path.join(__dirname, '.env');
        
        if (!fs.existsSync(envPath)) {
            console.log('❌ .env file not found');
            return;
        }
        
        let envContent = fs.readFileSync(envPath, 'utf8');
        let fixes = [];
        
        // Check RPC URL
        if (envContent.includes('RPC_URL=https://eth-sepolia.g.alchemy.com/v2/MM2ndEQYXsoFzQ9q9Qlpn')) {
            console.log('⚠️  RPC_URL appears incomplete (missing full API key)');
            fixes.push('RPC URL needs complete Alchemy API key');
        }
        
        // Check required Stripe keys
        const stripeSecretMatch = envContent.match(/STRIPE_SECRET_KEY=sk_test_[\w]+/);
        const stripePublishableMatch = envContent.match(/STRIPE_PUBLISHABLE_KEY=pk_test_[\w]+/);
        
        if (stripeSecretMatch) {
            console.log('✅ Stripe Secret Key configured');
        } else {
            console.log('❌ Stripe Secret Key missing or invalid');
            fixes.push('Stripe Secret Key needs to be configured');
        }
        
        if (stripePublishableMatch) {
            console.log('✅ Stripe Publishable Key configured');
        } else {
            console.log('❌ Stripe Publishable Key missing or invalid');
            fixes.push('Stripe Publishable Key needs to be configured');
        }
        
        // 2. Check if payment server file exists
        console.log('\n2️⃣ Checking payment server...');
        const paymentServerPath = path.join(__dirname, 'scripts', 'payment-server.js');
        
        if (fs.existsSync(paymentServerPath)) {
            console.log('✅ Payment server file exists');
        } else {
            console.log('❌ Payment server file missing');
            fixes.push('Payment server file missing');
        }
        
        // 3. Check if required JS files exist
        console.log('\n3️⃣ Checking frontend files...');
        const jsFiles = [
            'src/js/main.js',
            'src/js/payment.js',
            'src/js/wallet.js'
        ];
        
        jsFiles.forEach(file => {
            const filePath = path.join(__dirname, file);
            if (fs.existsSync(filePath)) {
                console.log(`✅ ${file} exists`);
            } else {
                console.log(`❌ ${file} missing`);
                fixes.push(`${file} needs to be created`);
            }
        });
        
        // 4. Check package.json scripts
        console.log('\n4️⃣ Checking package.json scripts...');
        const packagePath = path.join(__dirname, 'package.json');
        
        if (fs.existsSync(packagePath)) {
            const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            
            if (packageContent.scripts && packageContent.scripts['payment-server']) {
                console.log('✅ payment-server script exists');
            } else {
                console.log('❌ payment-server script missing');
                fixes.push('payment-server script needs to be added to package.json');
            }
        }
        
        // 5. Summary
        console.log('\n📋 Summary:');
        if (fixes.length === 0) {
            console.log('✅ No major issues found!');
            console.log('\n🚀 Try starting the payment server:');
            console.log('   npm run payment-server');
            console.log('   OR');
            console.log('   start-payment-server.bat');
        } else {
            console.log(`❌ Found ${fixes.length} issue(s) to fix:`);
            fixes.forEach((fix, index) => {
                console.log(`   ${index + 1}. ${fix}`);
            });
        }
        
        console.log('\n🔧 Quick fixes available:');
        console.log('   • Use start-payment-server.bat for Windows');
        console.log('   • Check Stripe dashboard for correct API keys');
        console.log('   • Verify Alchemy API key is complete');
        
    } catch (error) {
        console.error('❌ Error during diagnosis:', error.message);
    }
}

// Run diagnosis
fixStripeIntegration();