#!/usr/bin/env node

/**
 * SkunkSquad Stripe Configuration Script
 * 
 * This script helps you easily configure all Stripe settings across
 * your project files with a single command.
 * 
 * Usage:
 *   node configure-stripe.js
 * 
 * The script will prompt you for your Stripe keys and automatically
 * update all configuration files.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ANSI colors for terminal output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function colorize(text, color) {
    return `${colors[color]}${text}${colors.reset}`;
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, resolve);
    });
}

async function main() {
    console.log(colorize('\n🦨 SkunkSquad Stripe Configuration Setup', 'cyan'));
    console.log(colorize('=====================================\n', 'cyan'));
    
    console.log(colorize('This script will help you configure Stripe for your NFT collection.', 'blue'));
    console.log(colorize('Please have your Stripe dashboard open to copy the keys.\n', 'blue'));
    
    // Get Stripe account info
    console.log(colorize('📋 Step 1: Stripe Account Information', 'magenta'));
    console.log(colorize('─────────────────────────────────────\n', 'magenta'));
    
    const mode = await askQuestion(colorize('Are you setting up TEST or LIVE keys? (test/live): ', 'yellow'));
    const isLive = mode.toLowerCase() === 'live';
    
    console.log(`\n${colorize('📖 Where to find your keys:', 'green')}`);
    console.log(`   Dashboard: https://dashboard.stripe.com/${isLive ? '' : 'test/'}apikeys`);
    console.log(`   Webhooks: https://dashboard.stripe.com/${isLive ? '' : 'test/'}webhooks\n`);
    
    // Get API keys
    console.log(colorize('🔑 Step 2: API Keys', 'magenta'));
    console.log(colorize('──────────────────\n', 'magenta'));
    
    const publishableKey = await askQuestion(colorize(`Publishable Key (pk_${isLive ? 'live' : 'test'}_...): `, 'yellow'));
    const secretKey = await askQuestion(colorize(`Secret Key (sk_${isLive ? 'live' : 'test'}_...): `, 'yellow'));
    
    // Validate keys
    if (!publishableKey.startsWith(`pk_${isLive ? 'live' : 'test'}_`)) {
        console.log(colorize('❌ Invalid publishable key format!', 'red'));
        process.exit(1);
    }
    
    if (!secretKey.startsWith(`sk_${isLive ? 'live' : 'test'}_`)) {
        console.log(colorize('❌ Invalid secret key format!', 'red'));
        process.exit(1);
    }
    
    // Get webhook secret
    console.log(colorize('\n🔗 Step 3: Webhook Configuration', 'magenta'));
    console.log(colorize('─────────────────────────────────────\n', 'magenta'));
    
    const hasWebhook = await askQuestion(colorize('Have you created a webhook endpoint? (y/n): ', 'yellow'));
    
    let webhookSecret = '';
    if (hasWebhook.toLowerCase() === 'y') {
        webhookSecret = await askQuestion(colorize('Webhook Secret (whsec_...): ', 'yellow'));
        
        if (!webhookSecret.startsWith('whsec_')) {
            console.log(colorize('❌ Invalid webhook secret format!', 'red'));
            process.exit(1);
        }
    } else {
        console.log(colorize('\n⚠️  You\'ll need to create a webhook later:', 'yellow'));
        console.log(colorize('   1. Go to Developers → Webhooks in Stripe dashboard', 'blue'));
        console.log(colorize('   2. Add endpoint: https://yourdomain.com/webhooks/stripe', 'blue'));
        console.log(colorize('   3. Select events: payment_intent.succeeded, payment_intent.payment_failed', 'blue'));
        console.log(colorize('   4. Copy the signing secret and run this script again\n', 'blue'));
        webhookSecret = 'whsec_YOUR_WEBHOOK_SECRET_HERE';
    }
    
    // Optional: Business info
    console.log(colorize('🏢 Step 4: Business Information (Optional)', 'magenta'));
    console.log(colorize('──────────────────────────────────────────────\n', 'magenta'));
    
    const businessName = await askQuestion(colorize('Business Name (default: Skunk Squad NFT): ', 'yellow')) || 'Skunk Squad NFT';
    const accountId = await askQuestion(colorize('Stripe Account ID (acct_..., optional): ', 'yellow')) || 'acct_YOUR_ACCOUNT_ID';
    
    rl.close();
    
    // Update configuration files
    console.log(colorize('\n🔧 Updating configuration files...', 'cyan'));
    
    try {
        // Update .env file
        updateEnvFile({
            publishableKey,
            secretKey,
            webhookSecret,
            businessName,
            accountId,
            isLive
        });
        
        // Update index.html
        updateIndexHtml({
            publishableKey,
            isLive
        });
        
        console.log(colorize('✅ Configuration updated successfully!', 'green'));
        console.log(colorize('\n📋 Next steps:', 'blue'));
        console.log(colorize('   1. Deploy your payment gateway contract: npm run deploy-payment-gateway', 'blue'));
        console.log(colorize('   2. Start the payment server: npm run payment-dev', 'blue'));
        console.log(colorize('   3. Test payments: npm run test-payment-system', 'blue'));
        
        if (!hasWebhook || hasWebhook.toLowerCase() !== 'y') {
            console.log(colorize('\n⚠️  Don\'t forget to set up your webhook endpoint!', 'yellow'));
        }
        
    } catch (error) {
        console.log(colorize(`❌ Error updating files: ${error.message}`, 'red'));
        process.exit(1);
    }
}

function updateEnvFile({ publishableKey, secretKey, webhookSecret, businessName, accountId, isLive }) {
    const envPath = path.join(__dirname, '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update Stripe keys
    envContent = envContent.replace(
        /STRIPE_SECRET_KEY=.*/,
        `STRIPE_SECRET_KEY=${secretKey}`
    );
    
    envContent = envContent.replace(
        /STRIPE_PUBLISHABLE_KEY=.*/,
        `STRIPE_PUBLISHABLE_KEY=${publishableKey}`
    );
    
    envContent = envContent.replace(
        /STRIPE_WEBHOOK_SECRET=.*/,
        `STRIPE_WEBHOOK_SECRET=${webhookSecret}`
    );
    
    envContent = envContent.replace(
        /STRIPE_BUSINESS_NAME=.*/,
        `STRIPE_BUSINESS_NAME=${businessName}`
    );
    
    envContent = envContent.replace(
        /STRIPE_ACCOUNT_ID=.*/,
        `STRIPE_ACCOUNT_ID=${accountId}`
    );
    
    // Update REACT_APP_STRIPE_PUBLISHABLE_KEY
    envContent = envContent.replace(
        /REACT_APP_STRIPE_PUBLISHABLE_KEY=.*/,
        `REACT_APP_STRIPE_PUBLISHABLE_KEY=${publishableKey}`
    );
    
    // Comment/uncomment live vs test keys
    if (isLive) {
        // Comment out test key lines and uncomment live key lines
        envContent = envContent.replace(
            /^(STRIPE_SECRET_KEY=sk_test.*)/gm,
            '# $1'
        );
        envContent = envContent.replace(
            /^(STRIPE_PUBLISHABLE_KEY=pk_test.*)/gm,
            '# $1'
        );
        envContent = envContent.replace(
            /^# (STRIPE_SECRET_KEY=sk_live.*)/gm,
            '$1'
        );
        envContent = envContent.replace(
            /^# (STRIPE_PUBLISHABLE_KEY=pk_live.*)/gm,
            '$1'
        );
    }
    
    fs.writeFileSync(envPath, envContent);
    console.log(colorize('   ✓ Updated .env file', 'green'));
}

function updateIndexHtml({ publishableKey, isLive }) {
    const indexPath = path.join(__dirname, 'index.html');
    let indexContent = fs.readFileSync(indexPath, 'utf8');
    
    // Update meta tag
    indexContent = indexContent.replace(
        /<meta name="stripe-publishable-key" content=".*">/,
        `<meta name="stripe-publishable-key" content="${publishableKey}">`
    );
    
    // Update JavaScript configuration
    indexContent = indexContent.replace(
        /window\.STRIPE_PUBLISHABLE_KEY = '.*';/,
        `window.STRIPE_PUBLISHABLE_KEY = '${publishableKey}';`
    );
    
    // Update API URL for production
    if (isLive) {
        indexContent = indexContent.replace(
            /window\.API_URL = 'http:\/\/localhost:3002';/,
            `window.API_URL = 'https://yourdomain.com';`
        );
    }
    
    fs.writeFileSync(indexPath, indexContent);
    console.log(colorize('   ✓ Updated index.html file', 'green'));
}

// Handle errors
process.on('uncaughtException', (error) => {
    console.log(colorize(`\n❌ Unexpected error: ${error.message}`, 'red'));
    process.exit(1);
});

process.on('unhandledRejection', (error) => {
    console.log(colorize(`\n❌ Unhandled promise rejection: ${error.message}`, 'red'));
    process.exit(1);
});

// Start the configuration
main().catch((error) => {
    console.log(colorize(`❌ Configuration failed: ${error.message}`, 'red'));
    process.exit(1);
});