const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 SEPOLIA - Attempting Actual Mint\n");
    
    const CONTRACT_ADDRESS = "0x6BA18b88b64af8898bbb42262ED18EC13DC81315";
    
    const [deployer] = await ethers.getSigners();
    const SkunkSquad = await ethers.getContractAt("SkunkSquadNFT", CONTRACT_ADDRESS);
    
    console.log("Attempting to mint 1 token...");
    console.log("To:", deployer.address);
    
    try {
        // Try with verbose error catching
        const tx = await SkunkSquad.ownerMint(deployer.address, 1, {
            gasLimit: 500000 // Explicit gas limit
        });
        
        console.log("✅ Transaction sent:", tx.hash);
        await tx.wait();
        console.log("✅ Minted successfully!");
        
    } catch (error) {
        console.log("\n❌ Transaction failed!");
        console.log("\nFull error:");
        console.log(error);
        
        if (error.reason) {
            console.log("\nReason:", error.reason);
        }
        
        if (error.code) {
            console.log("Error code:", error.code);
        }
        
        if (error.method) {
            console.log("Method:", error.method);
        }
        
        if (error.transaction) {
            console.log("\nTransaction data:");
            console.log("├── To:", error.transaction.to);
            console.log("├── Data:", error.transaction.data);
            console.log("└── From:", error.transaction.from);
        }
    }
    
    process.exit(0);
}

main().catch((error) => {
    console.error("Script error:", error);
    process.exit(1);
});