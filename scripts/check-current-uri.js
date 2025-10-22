const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Checking Current Contract Configuration...\n");

    // Load deployment info
    const fs = require('fs');
    let deploymentInfo;
    
    try {
        deploymentInfo = JSON.parse(fs.readFileSync('ultra-smart-deployment.json', 'utf8'));
        console.log("📖 Contract Address:", deploymentInfo.contractAddress);
    } catch (error) {
        console.log("❌ No deployment info found.");
        process.exit(1);
    }

    // Get contract instance
    const contract = await ethers.getContractAt("SkunkSquadNFTUltraSmart", deploymentInfo.contractAddress);
    
    try {
        // Check current base URI
        const baseURI = await contract.baseURI();
        console.log("📍 Current Base URI:", baseURI);
        
        // Test a token URI (assuming token 1 exists)
        try {
            const token1URI = await contract.tokenURI(1);
            console.log("🔗 Token 1 URI:", token1URI);
        } catch (error) {
            console.log("ℹ️  Token 1 not minted yet or not accessible");
        }
        
        // Check total supply
        const totalSupply = await contract.totalSupply();
        console.log("📊 Total Supply:", totalSupply.toString());
        
        // Check if base URI is a placeholder
        if (baseURI.includes("0770a619-f2f1-4c59-9d1d-2fceb4a9294d")) {
            console.log("\n⚠️  PLACEHOLDER BASE URI DETECTED");
            console.log("   This is not a valid Arweave transaction ID");
            console.log("   You need to update it with a real transaction ID");
        } else if (baseURI.startsWith("ar://") && baseURI.length > 10) {
            console.log("\n✅ Base URI format looks correct");
            
            // Extract transaction ID and test it
            const txId = baseURI.replace("ar://", "").replace("/", "");
            console.log("🔍 Extracted Transaction ID:", txId);
            
            // Test if accessible
            const testUrl = `https://arweave.net/${txId}`;
            console.log("🌐 Testing access:", testUrl);
        } else {
            console.log("\n❓ Unknown base URI format");
        }
        
    } catch (error) {
        console.log("❌ Error checking contract:", error.message);
    }
}

if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error("❌ Check failed:", error);
            process.exit(1);
        });
}