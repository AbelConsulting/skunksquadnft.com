const { ethers } = require("hardhat");

async function main() {
    console.log("🎭 Revealing Collection...\n");
    
    const CONTRACT_ADDRESS = "0x6BA18b88b64af8898bbb42262ED18EC13DC81315";
    
    const [deployer] = await ethers.getSigners();
    const SkunkSquad = await ethers.getContractAt("SkunkSquadNFT", CONTRACT_ADDRESS);
    
    console.log("Revealing with account:", deployer.address);
    
    // The reveal() function might need the baseURI as an argument
    const NEW_BASE_URI = "https://arweave.net/CP7hoS7Dpke7RXxnTmosH6N3P3_-adXN2NFaIhw54do/";
    
    try {
        console.log("\n🎭 Calling reveal with base URI...");
        const tx = await SkunkSquad.reveal(NEW_BASE_URI);
        console.log("⏳ Transaction sent:", tx.hash);
        console.log("   Waiting for confirmation...");
        
        await tx.wait();
        console.log("✅ Collection revealed!");
        console.log("   View TX:", `https://sepolia.etherscan.io/tx/${tx.hash}`);
        
        // Verify
        console.log("\n🔍 Verifying...");
        const tokenURI = await SkunkSquad.tokenURI(1);
        console.log("Token #1 URI:", tokenURI);
        
        const isCorrect = tokenURI.includes("CP7hoS7Dpke7RXxnTmosH6N3P3_-adXN2NFaIhw54do");
        console.log("\n✅ Result:", isCorrect ? "SUCCESS! Tokens now use Arweave ✅" : "Still incorrect ❌");
        
    } catch (e) {
        console.log("❌ Failed:", e.reason || e.message);
        console.log("\n💡 The reveal function signature might be different.");
        console.log("   Checking your SkunkSquadNFT.sol for the exact reveal() function...");
    }
    
    process.exit(0);
}

main().catch((error) => {
    console.error("\n❌ Failed:", error.message);
    process.exit(1);
});