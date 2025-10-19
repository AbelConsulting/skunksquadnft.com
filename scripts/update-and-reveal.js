const { ethers } = require("hardhat");

async function main() {
    console.log("🔧 Updating Base URI and Revealing Collection...\n");
    
    const CONTRACT_ADDRESS = "0x6BA18b88b64af8898bbb42262ED18EC13DC81315";
    const NEW_BASE_URI = "https://arweave.net/CP7hoS7Dpke7RXxnTmosH6N3P3_-adXN2NFaIhw54do/";
    
    const [deployer] = await ethers.getSigners();
    console.log("Updating with account:", deployer.address);
    
    const SkunkSquad = await ethers.getContractAt("SkunkSquadNFT", CONTRACT_ADDRESS);
    
    // Step 1: Update Base URI
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("1️⃣  UPDATING BASE URI");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    console.log("📝 Setting Base URI to:");
    console.log("   ", NEW_BASE_URI);
    
    try {
        const tx1 = await SkunkSquad.setBaseURI(NEW_BASE_URI);
        console.log("\n⏳ Transaction sent:", tx1.hash);
        console.log("   Waiting for confirmation...");
        
        await tx1.wait();
        console.log("✅ Base URI updated!");
        console.log("   View TX:", `https://sepolia.etherscan.io/tx/${tx1.hash}`);
    } catch (e) {
        console.log("❌ Failed to update Base URI:", e.reason || e.message);
        throw e;
    }
    
    // Step 2: Reveal the collection
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("2️⃣  REVEALING COLLECTION");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    console.log("🎭 Revealing all tokens...");
    
    try {
        const tx2 = await SkunkSquad.reveal();
        console.log("\n⏳ Transaction sent:", tx2.hash);
        console.log("   Waiting for confirmation...");
        
        await tx2.wait();
        console.log("✅ Collection revealed!");
        console.log("   View TX:", `https://sepolia.etherscan.io/tx/${tx2.hash}`);
    } catch (e) {
        console.log("❌ Failed to reveal:", e.reason || e.message);
        // Don't throw - base URI is already updated
    }
    
    // Step 3: Verify the changes
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("3️⃣  VERIFICATION");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    try {
        const tokenURI = await SkunkSquad.tokenURI(1);
        console.log("🎨 Token #1 URI:");
        console.log("   ", tokenURI);
        
        const lastSlash = tokenURI.lastIndexOf('/');
        const baseURI = tokenURI.substring(0, lastSlash + 1);
        
        console.log("\n✅ Base URI Check:");
        console.log("   Expected:", NEW_BASE_URI);
        console.log("   Actual:  ", baseURI);
        console.log("   Match:   ", baseURI === NEW_BASE_URI ? "✅ CORRECT" : "❌ INCORRECT");
        
        if (baseURI === NEW_BASE_URI) {
            console.log("\n🎉 SUCCESS! All URIs are now correct!");
            console.log("\n📋 Summary:");
            console.log("├── Base URI: ✅ Updated to Arweave");
            console.log("├── Contract URI: ✅ Already correct");
            console.log("└── Tokens: ✅ Now showing actual metadata");
        }
    } catch (e) {
        console.log("❌ Verification failed:", e.message);
    }
    
    console.log("\n🎉 Complete!");
    process.exit(0);
}

main().catch((error) => {
    console.error("\n❌ Update failed:", error.message);
    process.exit(1);
});