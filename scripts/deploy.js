const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    console.log("🦨 Starting SkunkSquad NFT Ultra-Smart Contract Deployment...\n");
    
    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    const network = await ethers.provider.getNetwork();
    
    console.log("📋 Deployment Details:");
    console.log("├── Network:", network.name, `(Chain ID: ${network.chainId})`);
    console.log("├── Deployer:", deployer.address);
    console.log("├── Balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");
    console.log("└── Timestamp:", new Date().toISOString());
    console.log();
    
    // Constructor parameters
    const constructorArgs = {
        name: "SkunkSquad NFT",
        symbol: "SKUNK",
        baseURI: "https://arweave.net/YOUR_METADATA_BASE_TXID/",  // Update after Arweave upload
        contractURI: "https://arweave.net/YOUR_CONTRACT_METADATA_TXID", // Update after Arweave upload
        unrevealedURI: "https://arweave.net/YOUR_UNREVEALED_TXID", // Update after Arweave upload
        royaltyRecipient: deployer.address, // Change to your desired royalty recipient
        royaltyFee: 250 // 2.5% in basis points (250/10000 = 0.025 = 2.5%)
    };
    
    console.log("🔧 Constructor Parameters:");
    console.log("├── Name:", constructorArgs.name);
    console.log("├── Symbol:", constructorArgs.symbol);
    console.log("├── Base URI:", constructorArgs.baseURI);
    console.log("├── Contract URI:", constructorArgs.contractURI);
    console.log("├── Unrevealed URI:", constructorArgs.unrevealedURI);
    console.log("├── Royalty Recipient:", constructorArgs.royaltyRecipient);
    console.log("└── Royalty Fee:", constructorArgs.royaltyFee / 100, "%");
    console.log();
    
    // Deploy the contract
    console.log("🚀 Deploying SkunkSquadNFTUltraSmart contract...");
    
    const SkunkSquadNFT = await ethers.getContractFactory("SkunkSquadNFTUltraSmart");
    
    // Estimate gas for deployment
    const deploymentData = SkunkSquadNFT.interface.encodeDeploy([
        constructorArgs.name,
        constructorArgs.symbol,
        constructorArgs.baseURI,
        constructorArgs.contractURI,
        constructorArgs.unrevealedURI,
        constructorArgs.royaltyRecipient,
        constructorArgs.royaltyFee
    ]);
    
    const estimatedGas = await deployer.provider.estimateGas({
        data: deploymentData
    });
    
    console.log("⛽ Gas Estimation:", estimatedGas.toString());
    
    // Deploy with a gas limit buffer
    const contract = await SkunkSquadNFT.deploy(
        constructorArgs.name,
        constructorArgs.symbol,
        constructorArgs.baseURI,
        constructorArgs.contractURI,
        constructorArgs.unrevealedURI,
        constructorArgs.royaltyRecipient,
        constructorArgs.royaltyFee,
        {
            gasLimit: estimatedGas * 120n / 100n // 20% buffer
        }
    );
    
    // Wait for deployment
    console.log("⏳ Waiting for deployment transaction to be mined...");
    await contract.waitForDeployment();
    
    const contractAddress = await contract.getAddress();
    const deploymentTx = contract.deploymentTransaction();
    
    console.log("\n✅ CONTRACT DEPLOYED SUCCESSFULLY!");
    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log("║                    DEPLOYMENT SUMMARY                     ║");
    console.log("╠════════════════════════════════════════════════════════════╣");
    console.log("║ Contract Address:", contractAddress.padEnd(25), "║");
    console.log("║ Transaction Hash:", deploymentTx.hash.padEnd(25), "║");
    console.log("║ Block Number:    ", (await deploymentTx.wait()).blockNumber.toString().padEnd(25), "║");
    console.log("║ Gas Used:        ", (await deploymentTx.wait()).gasUsed.toString().padEnd(25), "║");
    console.log("╚════════════════════════════════════════════════════════════╝");
    console.log();
    
    // Verify contract deployment
    console.log("🔍 Verifying contract deployment...");
    
    try {
        // Test basic contract functions
        const name = await contract.name();
        const symbol = await contract.symbol();
        const totalSupply = await contract.totalSupply();
        const maxSupply = await contract.MAX_SUPPLY();
        const mintPrice = await contract.getCurrentSmartPrice();
        
        console.log("✅ Contract Verification:");
        console.log("├── Name:", name);
        console.log("├── Symbol:", symbol);
        console.log("├── Total Supply:", totalSupply.toString());
        console.log("├── Max Supply:", maxSupply.toString());
        console.log("├── Current Mint Price:", ethers.formatEther(mintPrice), "ETH");
        console.log("└── Owner:", await contract.owner());
        console.log();
        
        // Check Ultra-Smart features
        console.log("🧠 Ultra-Smart Features Status:");
        const dynamicPricing = await contract.dynamicPricing();
        console.log("├── Base Price:", ethers.formatEther(dynamicPricing.basePriceETH), "ETH");
        console.log("├── Demand Multiplier:", dynamicPricing.demandMultiplier.toString() + "%");
        console.log("├── Min Price:", ethers.formatEther(dynamicPricing.minPrice), "ETH");
        console.log("├── Max Price:", ethers.formatEther(dynamicPricing.maxPrice), "ETH");
        console.log("└── XP Per Mint:", (await contract.XP_PER_MINT()).toString());
        console.log();
        
    } catch (error) {
        console.log("❌ Contract verification failed:", error.message);
    }
    
    // Save deployment info
    const deploymentInfo = {
        network: network.name,
        chainId: network.chainId,
        contractAddress: contractAddress,
        deploymentTx: deploymentTx.hash,
        blockNumber: (await deploymentTx.wait()).blockNumber,
        gasUsed: (await deploymentTx.wait()).gasUsed.toString(),
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        constructorArgs: constructorArgs,
        verified: true
    };
    
    // Create deployments directory if it doesn't exist
    const deploymentsDir = path.join(__dirname, '..', 'deployments');
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }
    
    // Save deployment info to file
    const deploymentFile = path.join(deploymentsDir, `${network.name}-deployment.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    
    console.log("💾 Deployment info saved to:", deploymentFile);
    console.log();
    
    // Generate contract verification command
    console.log("🔐 Etherscan Verification Command:");
    console.log("npx hardhat verify --network", network.name, contractAddress);
    console.log("  ", `"${constructorArgs.name}"`);
    console.log("  ", `"${constructorArgs.symbol}"`);
    console.log("  ", `"${constructorArgs.baseURI}"`);
    console.log("  ", `"${constructorArgs.contractURI}"`);
    console.log("  ", `"${constructorArgs.unrevealedURI}"`);
    console.log("  ", constructorArgs.royaltyRecipient);
    console.log("  ", constructorArgs.royaltyFee);
    console.log();
    
    // Generate update commands for website
    console.log("🌐 Website Update Commands:");
    console.log("1. Update contract address in wallet.js:");
    console.log(`   const CONTRACT_ADDRESS = "${contractAddress}";`);
    console.log();
    console.log("2. Update Etherscan link in index.html:");
    console.log(`   https://etherscan.io/address/${contractAddress}`);
    console.log();
    
    // Next steps
    console.log("📋 NEXT STEPS:");
    console.log("1. 📤 Upload metadata and images to Arweave");
    console.log("2. 🔄 Update constructor URIs with Arweave TXIDs");
    console.log("3. 🔍 Verify contract on Etherscan");
    console.log("4. 🌐 Update website with contract address");
    console.log("5. 🎨 Configure OpenSea collection");
    console.log("6. 📊 Set up analytics dashboard");
    console.log("7. 🚀 Launch marketing campaign");
    console.log();
    
    console.log("🎉 DEPLOYMENT COMPLETE! Welcome to the Ultra-Smart NFT era! 🦨");
}

// Enhanced error handling
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ DEPLOYMENT FAILED!");
        console.error("Error:", error.message);
        
        if (error.code === 'INSUFFICIENT_FUNDS') {
            console.error("💰 Insufficient funds for deployment. Please add more ETH to:", error.account);
        } else if (error.code === 'NETWORK_ERROR') {
            console.error("🌐 Network connection error. Please check your RPC endpoint.");
        } else if (error.code === 'CONTRACT_SIZE_EXCEEDED') {
            console.error("📦 Contract size exceeds limit. Consider optimizing contract code.");
        }
        
        console.error("\nStack trace:", error.stack);
        process.exit(1);
    });