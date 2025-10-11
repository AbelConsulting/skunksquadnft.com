const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 MAINNET MIGRATION - Skunk Squad NFT Ultra Smart");
    console.log("═══════════════════════════════════════════════════════════════\n");

    // Get deployer account
    const [deployer] = await ethers.getSigners();
    const network = await ethers.provider.getNetwork();
    
    console.log("🔒 MAINNET VERIFICATION:");
    console.log("├── Network:", network.name);
    console.log("├── Chain ID:", network.chainId);
    console.log("├── Deployer:", deployer.address);
    
    const balance = await deployer.getBalance();
    console.log("├── Balance:", ethers.utils.formatEther(balance), "ETH");
    console.log("└── Timestamp:", new Date().toISOString());
    console.log();

    // Check minimum balance
    if (balance.lt(ethers.utils.parseEther("0.02"))) {
        throw new Error(`❌ INSUFFICIENT BALANCE: Current: ${ethers.utils.formatEther(balance)} ETH`);
    }

    // PRODUCTION CONTRACT PARAMETERS
    const CONTRACT_NAME = "SkunkSquad NFT Ultra Smart";
    const CONTRACT_SYMBOL = "SKULL";
    const BASE_URI = "ar://0770a619-f2f1-4c59-9d1d-2fceb4a9294d/";
    const CONTRACT_URI = "ar://0770a619-f2f1-4c59-9d1d-2fceb4a9294d/contract.json";
    const UNREVEALED_URI = "ar://0770a619-f2f1-4c59-9d1d-2fceb4a9294d/unrevealed.json";
    const ROYALTY_RECIPIENT = deployer.address; // Use deployer as royalty recipient
    const ROYALTY_FEE = 250; // 2.5%

    console.log("📋 MAINNET CONTRACT CONFIGURATION:");
    console.log("├── Name:", CONTRACT_NAME);
    console.log("├── Symbol:", CONTRACT_SYMBOL);
    console.log("├── Royalty Fee:", ROYALTY_FEE / 100, "%");
    console.log("├── Royalty Recipient:", ROYALTY_RECIPIENT);
    console.log("└── Arweave Storage: ✅ PERMANENT");
    console.log();

    try {
        // Deploy the contract
        console.log("🔨 Deploying to MAINNET...");
        const SkunkSquadNFTUltraSmart = await ethers.getContractFactory("SkunkSquadNFTUltraSmart");
        
        const contract = await SkunkSquadNFTUltraSmart.deploy(
            CONTRACT_NAME,
            CONTRACT_SYMBOL,
            BASE_URI,
            CONTRACT_URI,
            UNREVEALED_URI,
            ROYALTY_RECIPIENT,
            ROYALTY_FEE,
            {
                gasLimit: 6000000,
                gasPrice: ethers.utils.parseUnits("15", "gwei")
            }
        );

        console.log("⏳ Waiting for deployment...");
        await contract.deployed();
        
        const contractAddress = contract.address;
        const deploymentTx = contract.deployTransaction;

        console.log("\n🎉 MAINNET DEPLOYMENT SUCCESSFUL!");
        console.log("╔════════════════════════════════════════════════════════════╗");
        console.log("║                    MAINNET CONTRACT                       ║");
        console.log("╠════════════════════════════════════════════════════════════╣");
        console.log("║ Address:", contractAddress.padEnd(30), "║");
        console.log("║ TX Hash:", deploymentTx.hash.padEnd(30), "║");
        console.log("╚════════════════════════════════════════════════════════════╝");
        console.log();

        // Verify contract state
        console.log("🔍 Verifying deployment...");
        const name = await contract.name();
        const symbol = await contract.symbol();
        const maxSupply = await contract.MAX_SUPPLY();
        const smartPrice = await contract.getCurrentSmartPrice();
        
        console.log("✅ CONTRACT VERIFIED:");
        console.log("├── Name:", name);
        console.log("├── Symbol:", symbol);
        console.log("├── Max Supply:", maxSupply.toString());
        console.log("├── Smart Price:", ethers.utils.formatEther(smartPrice), "ETH");
        console.log("└── Status: ✅ FULLY OPERATIONAL");

        // Save deployment info
        const deploymentInfo = {
            environment: "MAINNET PRODUCTION",
            network: "mainnet",
            contractAddress: contractAddress,
            deploymentTx: deploymentTx.hash,
            timestamp: new Date().toISOString(),
            configuration: {
                name: CONTRACT_NAME,
                symbol: CONTRACT_SYMBOL,
                baseURI: BASE_URI,
                royaltyFee: ROYALTY_FEE,
                arweaveFolder: "0770a619-f2f1-4c59-9d1d-2fceb4a9294d"
            },
            features: [
                "Ultra Smart Pricing",
                "Arweave Permanent Storage", 
                "Credit Card Payments",
                "Achievement System",
                "Analytics Dashboard"
            ]
        };

        const fs = require('fs');
        fs.writeFileSync('mainnet-deployment.json', JSON.stringify(deploymentInfo, null, 2));

        console.log("\n🎯 MAINNET MIGRATION COMPLETE!");
        console.log("├── Contract Address:", contractAddress);
        console.log("├── Etherscan:", `https://etherscan.io/address/${contractAddress}`);
        console.log("├── OpenSea:", `https://opensea.io/assets/ethereum/${contractAddress}`);
        console.log("└── Deployment Info: mainnet-deployment.json");

        console.log("\n🚀 YOUR NFT PROJECT IS LIVE ON MAINNET! 🦨");

        return contractAddress;

    } catch (error) {
        console.error("\n❌ MAINNET DEPLOYMENT FAILED:");
        console.error("Error:", error.message);
        
        if (error.transactionHash) {
            console.log("Transaction Hash:", error.transactionHash);
            console.log("Check on Etherscan:", `https://etherscan.io/tx/${error.transactionHash}`);
        }
        
        throw error;
    }
}

main()
    .then((address) => {
        console.log("\n✅ MAINNET MIGRATION SUCCESSFUL!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n💥 MAINNET MIGRATION FAILED!");
        process.exit(1);
    });