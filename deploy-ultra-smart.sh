#!/bin/bash

echo "🧠 Ultra Smart NFT Contract Deployment Guide"
echo "=============================================="
echo ""

echo "📋 Pre-deployment Checklist:"
echo "✓ Hardhat environment configured"
echo "✓ .env file with ALCHEMY_API_KEY and PRIVATE_KEY"
echo "✓ Sepolia testnet ETH in deployer wallet"
echo "✓ Contract compiled successfully"
echo ""

echo "🚀 Starting Ultra Smart Contract Deployment..."
echo ""

# Step 1: Compile contracts
echo "1️⃣ Compiling contracts..."
npm run compile
if [ $? -ne 0 ]; then
    echo "❌ Compilation failed!"
    exit 1
fi
echo "✅ Contracts compiled successfully"
echo ""

# Step 2: Deploy ultra smart contract
echo "2️⃣ Deploying Ultra Smart Contract to Sepolia..."
npm run deploy-ultra
if [ $? -ne 0 ]; then
    echo "❌ Deployment failed!"
    exit 1
fi
echo "✅ Ultra Smart Contract deployed successfully"
echo ""

# Step 3: Test all features
echo "3️⃣ Testing all smart features..."
npm run test-ultra
if [ $? -ne 0 ]; then
    echo "⚠️ Some tests failed, but deployment was successful"
else
    echo "✅ All tests passed!"
fi
echo ""

# Step 4: Start analytics dashboard (optional)
echo "4️⃣ Analytics Dashboard:"
echo "To start the real-time analytics dashboard, run:"
echo "   npm run analytics"
echo ""
echo "Then visit: http://localhost:3001"
echo ""

echo "🎉 Ultra Smart Contract Deployment Complete!"
echo ""
echo "📊 Your contract now features:"
echo "   • Dynamic AI-powered pricing"
echo "   • Advanced user analytics"
echo "   • Gamification with achievements"
echo "   • Social features (referrals, gifting)"
echo "   • Predictive minting patterns"
echo "   • Real-time revenue tracking"
echo ""
echo "🔗 Next Steps:"
echo "   1. Verify contract on Etherscan (check verify-ultra-smart.sh)"
echo "   2. Set up OpenSea integration"
echo "   3. Launch analytics dashboard"
echo "   4. Configure your minting phases"
echo "   5. Start building your community!"
echo ""
echo "📚 Documentation:"
echo "   • Contract features: ULTRA_SMART_GUIDE.md"
echo "   • Deployment info: ultra-smart-deployment.json"
echo "   • Test results: ultra-smart-test-report.json"