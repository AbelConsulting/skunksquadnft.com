const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 DEPLOYMENT READINESS CHECK");
    console.log("═════════════════════════════════════════");
    
    try {
        // Check if we can get signers
        const signers = await ethers.getSigners();
        console.log("✅ Signers available:", signers.length);
        
        if (signers.length > 0) {
            const deployer = signers[0];
            console.log("✅ Deployer address:", deployer.address);
            
            // Check balance
            const balance = await deployer.getBalance();
            console.log("💰 Deployer balance:", ethers.utils.formatEther(balance), "ETH");
            
            // Check network
            const network = await ethers.provider.getNetwork();
            console.log("🌐 Network:", network.name, "(Chain ID:", network.chainId + ")");
            
            if (balance.gt(0)) {
                console.log("🚀 READY TO DEPLOY!");
            } else {
                console.log("❌ Insufficient balance for deployment");
            }
        } else {
            console.log("❌ No signers available - check PRIVATE_KEY in .env");
        }
        
    } catch (error) {
        console.log("❌ Configuration error:", error.message);
        console.log("\n📋 SETUP REQUIRED:");
        console.log("1. Add PRIVATE_KEY to .env file");
        console.log("2. Ensure wallet has testnet ETH");
        console.log("3. Get testnet ETH from: https://sepoliafaucet.com/");
    }
    
    // Check environment variables
    console.log("\n📋 ENVIRONMENT VARIABLES:");
    console.log("├── PRIVATE_KEY:", process.env.PRIVATE_KEY ? "✅ Set" : "❌ Missing");
    console.log("├── SEPOLIA_RPC_URL:", process.env.SEPOLIA_RPC_URL ? "✅ Set" : "⚠️  Using default");
    console.log("└── ETHERSCAN_API_KEY:", process.env.ETHERSCAN_API_KEY ? "✅ Set" : "⚠️  Using default");
    
    console.log("\n🎯 NEXT STEPS:");
    console.log("1. Add your wallet's private key to .env file");
    console.log("2. Get Sepolia testnet ETH from faucet");
    console.log("3. Run: npm run deploy-ultra");
    console.log("4. For mainnet: npm run deploy-mainnet");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Error:", error);
        process.exit(1);
    });