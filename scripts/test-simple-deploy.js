const { ethers } = require("hardhat");

async function main() {
    console.log("🧪 TESTING SIMPLE NFT DEPLOYMENT");
    console.log("═════════════════════════════════════");
    
    const [deployer] = await ethers.getSigners();
    console.log("Deployer:", deployer.address);
    
    const network = await ethers.provider.getNetwork();
    console.log("Network:", network.name, "Chain ID:", network.chainId);
    
    try {
        console.log("\n🚀 Deploying SimpleNFT...");
        
        const SimpleNFT = await ethers.getContractFactory("SimpleNFT");
        
        const contract = await SimpleNFT.deploy(
            "Test NFT",
            "TEST",
            "ar://0770a619-f2f1-4c59-9d1d-2fceb4a9294d/"
        );
        
        console.log("✅ Deployment transaction created");
        await contract.deployed();
        
        console.log("🎉 SUCCESS! SimpleNFT deployed to:", contract.address);
        
        // Test basic functions
        const name = await contract.name();
        const symbol = await contract.symbol();
        const maxSupply = await contract.MAX_SUPPLY();
        
        console.log("\n📋 Contract verified:");
        console.log("- Name:", name);
        console.log("- Symbol:", symbol);
        console.log("- Max Supply:", maxSupply.toString());
        
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
            console.log("\n✅ SIMPLE NFT DEPLOYMENT SUCCESSFUL!");
            console.log("This proves mainnet deployment works!");
            console.log("Issue is in the complex contract, not the network.");
        }
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ SIMPLE NFT DEPLOYMENT FAILED!");
        console.error("Issue is with the network/setup");
        process.exit(1);
    });