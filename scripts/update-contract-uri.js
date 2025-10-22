const { ethers } = require("hardhat");

async function main() {
    // Contract address on Sepolia
    const contractAddress = "0xBC00f05B9918B6B529d7edd33d89b4fB7016F6aF";
    
    // Get the manifest transaction ID from command line argument
    const manifestTxId = process.argv[2];
    
    if (!manifestTxId) {
        console.log("❌ Please provide the manifest transaction ID as an argument");
        console.log("Usage: npx hardhat run scripts/update-contract-uri.js --network sepolia TXID");
        process.exit(1);
    }
    
    console.log("🦨 Skunk Squad NFT - Contract URI Update");
    console.log("=========================================");
    console.log(`📋 Contract: ${contractAddress}`);
    console.log(`🔗 Manifest TXID: ${manifestTxId}`);
    
    // Connect to the deployed contract
    const SkunkSquadNFT = await ethers.getContractFactory("SkunkSquadNFTUltraSmart");
    const contract = SkunkSquadNFT.attach(contractAddress);
    
    // Get current base URI
    try {
        const currentURI = await contract.baseURI();
        console.log(`📁 Current Base URI: ${currentURI}`);
    } catch (error) {
        console.log("⚠️ Could not fetch current base URI");
    }
    
    // Create new base URI with the manifest transaction ID
    const newBaseURI = `ar://${manifestTxId}/metadata/`;
    console.log(`🆕 New Base URI: ${newBaseURI}`);
    
    // Update the base URI
    try {
        console.log("🔄 Updating base URI...");
        const tx = await contract.setBaseURI(newBaseURI);
        console.log(`📤 Transaction submitted: ${tx.hash}`);
        
        console.log("⏳ Waiting for confirmation...");
        const receipt = await tx.wait();
        
        if (receipt.status === 1) {
            console.log("✅ Base URI updated successfully!");
            console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
            
            // Verify the update
            const updatedURI = await contract.baseURI();
            console.log(`✅ Verified Base URI: ${updatedURI}`);
            
            // Test a sample token URI
            console.log("\n🧪 Testing sample token URIs:");
            for (let i = 1; i <= 3; i++) {
                try {
                    const tokenURI = await contract.tokenURI(i);
                    console.log(`Token ${i}: ${tokenURI}`);
                } catch (error) {
                    console.log(`Token ${i}: Not minted yet - would be ${newBaseURI}${i}.json`);
                }
            }
            
        } else {
            console.log("❌ Transaction failed!");
        }
        
    } catch (error) {
        console.error("❌ Error updating base URI:", error.message);
        
        if (error.message.includes("Ownable: caller is not the owner")) {
            console.log("💡 Make sure you're using the owner account that deployed the contract");
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });