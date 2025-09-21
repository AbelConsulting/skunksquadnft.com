const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Deploying Ultra Smart SkunkSquad NFT Contract...\n");

    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("👤 Deploying with account:", deployer.address);
    console.log("💰 Account balance:", ethers.utils.formatEther(await deployer.getBalance()), "ETH\n");

    // Contract parameters
    const CONTRACT_NAME = "SkunkSquad NFT Ultra Smart";
    const CONTRACT_SYMBOL = "SKULL";
    const BASE_URI = "https://your-api.com/metadata/";
    const CONTRACT_URI = "https://your-api.com/contract-metadata";
    const UNREVEALED_URI = "https://your-api.com/unrevealed";
    const ROYALTY_RECIPIENT = "0x16Be43d7571Edf69cec8D6221044638d161aA994";
    const ROYALTY_FEE = 500; // 5%

    console.log("📋 Contract Configuration:");
    console.log("   Name:", CONTRACT_NAME);
    console.log("   Symbol:", CONTRACT_SYMBOL);
    console.log("   Base URI:", BASE_URI);
    console.log("   Royalty Recipient:", ROYALTY_RECIPIENT);
    console.log("   Royalty Fee:", ROYALTY_FEE / 100, "%\n");

    // Deploy the contract
    console.log("🔨 Deploying contract...");
    const SkunkSquadNFTUltraSmart = await ethers.getContractFactory("SkunkSquadNFTUltraSmart");
    
    const contract = await SkunkSquadNFTUltraSmart.deploy(
        CONTRACT_NAME,
        CONTRACT_SYMBOL,
        BASE_URI,
        CONTRACT_URI,
        UNREVEALED_URI,
        ROYALTY_RECIPIENT,
        ROYALTY_FEE
    );

    await contract.deployed();
    const contractAddress = contract.address;
    
    console.log("✅ Contract deployed successfully!");
    console.log("📍 Contract Address:", contractAddress);
    console.log("🔗 Etherscan URL:", `https://sepolia.etherscan.io/address/${contractAddress}\n`);

    // Verify initial state
    console.log("🔍 Verifying initial state...");
    
    const name = await contract.name();
    const symbol = await contract.symbol();
    const totalSupply = await contract.totalSupply();
    const maxSupply = await contract.MAX_SUPPLY();
    const owner = await contract.owner();
    const currentPhase = await contract.currentPhase();
    
    console.log("   Name:", name);
    console.log("   Symbol:", symbol);
    console.log("   Total Supply:", totalSupply.toString());
    console.log("   Max Supply:", maxSupply.toString());
    console.log("   Owner:", owner);
    console.log("   Current Phase:", currentPhase);

    // Check smart features
    console.log("\n🧠 Smart Features Status:");
    
    const smartPrice = await contract.getCurrentSmartPrice();
    const dynamicPricing = await contract.dynamicPricing();
    
    console.log("   Current Smart Price:", ethers.utils.formatEther(smartPrice), "ETH");
    console.log("   Base Price:", ethers.utils.formatEther(dynamicPricing.basePriceETH), "ETH");
    console.log("   Demand Multiplier:", dynamicPricing.demandMultiplier.toString() + "%");
    console.log("   Min Price:", ethers.utils.formatEther(dynamicPricing.minPrice), "ETH");
    console.log("   Max Price:", ethers.utils.formatEther(dynamicPricing.maxPrice), "ETH");

    // Test achievement system
    console.log("\n🏆 Achievement System:");
    for (let i = 1; i <= 5; i++) {
        const achievement = await contract.achievements(i);
        console.log(`   ${i}. ${achievement.name}: ${achievement.description} (${achievement.xpReward} XP)`);
    }

    // Save deployment info
    const deploymentInfo = {
        contractName: CONTRACT_NAME,
        contractSymbol: CONTRACT_SYMBOL,
        contractAddress: contractAddress,
        deployerAddress: deployer.address,
        network: "sepolia",
        blockNumber: await ethers.provider.getBlockNumber(),
        timestamp: new Date().toISOString(),
        features: {
            dynamicPricing: true,
            userAnalytics: true,
            gamification: true,
            socialFeatures: true,
            predictions: true
        },
        configuration: {
            baseURI: BASE_URI,
            contractURI: CONTRACT_URI,
            unrevealedURI: UNREVEALED_URI,
            royaltyRecipient: ROYALTY_RECIPIENT,
            royaltyFee: ROYALTY_FEE,
            initialSmartPrice: ethers.utils.formatEther(smartPrice)
        }
    };

    // Write deployment info to file
    const fs = require('fs');
    fs.writeFileSync(
        'ultra-smart-deployment.json',
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\n💾 Deployment info saved to: ultra-smart-deployment.json");

    // Create verification script
    const verificationScript = `
# Verify contract on Etherscan
npx hardhat verify --network sepolia ${contractAddress} \\
  "${CONTRACT_NAME}" \\
  "${CONTRACT_SYMBOL}" \\
  "${BASE_URI}" \\
  "${CONTRACT_URI}" \\
  "${UNREVEALED_URI}" \\
  "${ROYALTY_RECIPIENT}" \\
  ${ROYALTY_FEE}
`;

    fs.writeFileSync('verify-ultra-smart.sh', verificationScript);
    console.log("📝 Verification script saved to: verify-ultra-smart.sh");

    console.log("\n🎉 Ultra Smart Contract Deployment Complete!");
    console.log("\n📚 Next Steps:");
    console.log("1. Verify contract: bash verify-ultra-smart.sh");
    console.log("2. Test smart features: npx hardhat run scripts/test-ultra-smart.js --network sepolia");
    console.log("3. Set up advanced monitoring: npx hardhat run scripts/setup-analytics.js");
    console.log("4. Configure OpenSea integration with new features");

    return {
        contract,
        contractAddress,
        deploymentInfo
    };
}

if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error("❌ Deployment failed:", error);
            process.exit(1);
        });
}

module.exports = main;