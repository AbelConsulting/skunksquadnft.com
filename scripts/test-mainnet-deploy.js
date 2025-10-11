const { ethers } = require("hardhat");

async function main() {
    console.log("🔧 SIMPLE MAINNET TEST DEPLOYMENT");
    console.log("═════════════════════════════════════");
    
    const [deployer] = await ethers.getSigners();
    console.log("Deployer:", deployer.address);
    
    const balance = await deployer.getBalance();
    console.log("Balance:", ethers.utils.formatEther(balance), "ETH");
    
    const network = await ethers.provider.getNetwork();
    console.log("Network:", network.name, "Chain ID:", network.chainId);
    
    console.log("\n🚀 Attempting simple contract deployment...");
    
    try {
        // Try deploying the enhanced contract (simpler than ultra-smart)
        const SkunkSquadNFTEnhanced = await ethers.getContractFactory("SkunkSquadNFTEnhanced");
        
        console.log("Factory created successfully");
        
        const contract = await SkunkSquadNFTEnhanced.deploy(
            "Skunk Squad",
            "SKUNK",
            "ar://0770a619-f2f1-4c59-9d1d-2fceb4a9294d/",
            "ar://0770a619-f2f1-4c59-9d1d-2fceb4a9294d/contract.json",
            "ar://0770a619-f2f1-4c59-9d1d-2fceb4a9294d/unrevealed.json",
            "0x16Be43d7571Edf69cec8D6221044638d161aA994",
            250
        );
        
        console.log("✅ Deployment transaction created");
        console.log("Waiting for deployment...");
        
        await contract.deployed();
        
        console.log("🎉 SUCCESS! Contract deployed to:", contract.address);
        
        return contract.address;
        
    } catch (error) {
        console.error("❌ Deployment failed:", error.message);
        if (error.transactionHash) {
            console.log("Transaction hash:", error.transactionHash);
        }
        throw error;
    }
}

main()
    .then((address) => {
        if (address) {
            console.log("\n🎯 DEPLOYMENT SUCCESSFUL!");
            console.log("Contract Address:", address);
        }
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n💥 DEPLOYMENT FAILED!");
        process.exit(1);
    });