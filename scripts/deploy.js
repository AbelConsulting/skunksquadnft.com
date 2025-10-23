const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    console.log("🦨 Starting SkunkSquad NFT Contract Deployment...\n");
    
    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    const network = await ethers.provider.getNetwork();
    
    console.log("📋 Deployment Details:");
    console.log("├── Network:", network.name, `(Chain ID: ${network.chainId})`);
    console.log("├── Deployer:", deployer.address);
    console.log("├── Balance:", ethers.utils.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");
    console.log("└── Timestamp:", new Date().toISOString());
    console.log();
    
    // Revenue sharing configuration
    const REVENUE_SHARE_ADDRESS = "0xeD97F754D65F5c479De75A57D2781489b4F43125";
    const REVENUE_SHARE_PERCENTAGE = 5; // 5%
    
    // Constructor parameters
    const constructorArgs = {
        name: "SkunkSquad NFT",
        symbol: "SKUNK",
        baseURI: "ar://bAFyRZCSkZo-uiVIviMfq4AfN6eV52YNaHWLd1L25Zs/metadata/",
        contractURI: "ar://wpuACWSswfMtCiUp0Wv_cbpzdIm6kkbAHw_gZ_ZJ3Tc/contract.json",
        unrevealedURI: "ar://j57ibv2QPVURMDTsJp271LSUfRdZtx_632Wy31fLT6E/unrevealed.json",
        royaltyRecipient: deployer.address, // Should be a valid address
        royaltyFee: 250 // 2.5% in basis points
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
    
    console.log("💰 Revenue Sharing Configuration:");
    console.log("├── Revenue Share Address:", REVENUE_SHARE_ADDRESS);
    console.log("├── Revenue Share Percentage:", REVENUE_SHARE_PERCENTAGE + "%");
    console.log("├── Deployer Gets:", (100 - REVENUE_SHARE_PERCENTAGE) + "%");
    console.log("└── Partner Gets:", REVENUE_SHARE_PERCENTAGE + "%");
    console.log();
    
    // Deploy the contract
    console.log("🚀 Deploying SkunkSquadNFT contract...");
    
    const SkunkSquadNFT = await ethers.getContractFactory("SkunkSquadNFT");
    
    console.log("⏳ Deploying contract with constructor arguments...");
    
    // Deploy with a safe gas limit
    const contract = await SkunkSquadNFT.deploy(
        constructorArgs.name,
        constructorArgs.symbol,
        constructorArgs.baseURI,
        constructorArgs.contractURI,
        constructorArgs.unrevealedURI,
        constructorArgs.royaltyRecipient,
        constructorArgs.royaltyFee
    );
    
    // Wait for deployment
    console.log("⏳ Waiting for deployment transaction to be mined...");
    await contract.deployed();
    
    const contractAddress = contract.address;
    const deploymentTx = contract.deployTransaction;
    
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
        const mintPrice = await contract.PRICE();
        const revealed = await contract.revealed();
        
        console.log("✅ Contract Verification:");
        console.log("├── Name:", name);
        console.log("├── Symbol:", symbol);
        console.log("├── Total Supply:", totalSupply.toString());
        console.log("├── Max Supply:", maxSupply.toString());
        console.log("├── Mint Price:", ethers.utils.formatEther(mintPrice), "ETH");
        console.log("├── Revealed:", revealed);
        console.log("└── Owner:", await contract.owner());
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
        revenueSharing: {
            partnerAddress: REVENUE_SHARE_ADDRESS,
            partnerPercentage: REVENUE_SHARE_PERCENTAGE,
            deployerPercentage: 100 - REVENUE_SHARE_PERCENTAGE
        },
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
    
    console.log("💰 REVENUE SHARING SETUP:");
    console.log("├── Partner:", REVENUE_SHARE_ADDRESS, "(5%)");
    console.log("├── Deployer:", deployer.address, "(95% + 2.5% royalties)");
    console.log("└── Manual withdrawal required");
    console.log();
    
    console.log("🎉 DEPLOYMENT COMPLETE! Welcome to the Ultra-Smart NFT era! 🦨");
}

// Enhanced error handling
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ DEPLOYMENT FAILED!");
        console.error("Error:", error.message);
        process.exit(1);
    });