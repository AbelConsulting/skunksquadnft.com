const { ethers } = require("hardhat");

async function main() {
    console.log("🎭 Revealing SkunkSquad NFT Collection...\n");
    
    const CONTRACT_ADDRESS = "0xAa5C50099bEb130c8988324A0F6Ebf65979f10EF";
    
    const [deployer] = await ethers.getSigners();
    const SkunkSquad = await ethers.getContractAt("SkunkSquadNFT", CONTRACT_ADDRESS);
    
    console.log("Revealing with account:", deployer.address);
    console.log("Contract:", CONTRACT_ADDRESS);
    
    // Check current reveal status
    try {
        const isRevealed = await SkunkSquad.revealed();
        console.log("\nCurrent reveal status:", isRevealed);
        
        if (isRevealed) {
            console.log("\n✅ Collection is already revealed!");
            console.log("\nChecking token URI...");
            const tokenURI = await SkunkSquad.tokenURI(1);
            console.log("Token #1 URI:", tokenURI);
            return;
        }
    } catch (e) {
        console.log("Note: Could not check reveal status");
    }
    
    try {
        console.log("\n🎭 Calling reveal()...");
        const tx = await SkunkSquad.reveal({
            gasLimit: 100000
        });
        console.log("⏳ Transaction sent:", tx.hash);
        console.log("   Waiting for confirmation...");
        
        await tx.wait();
        console.log("✅ Collection revealed!");
        console.log("   View TX:", `https://etherscan.io/tx/${tx.hash}`);
        
        // Verify
        console.log("\n🔍 Verifying reveal...");
        const isRevealed = await SkunkSquad.revealed();
        console.log("Revealed status:", isRevealed);
        
        const tokenURI = await SkunkSquad.tokenURI(1);
        console.log("Token #1 URI:", tokenURI);
        
        console.log("\n✅ SUCCESS! Collection is now revealed!");
        console.log("\n📊 Next Steps:");
        console.log("1. Wait 5-10 minutes for OpenSea to update");
        console.log("2. Refresh my-nfts.html to see images");
        console.log("3. Check on OpenSea:", `https://opensea.io/assets/ethereum/${CONTRACT_ADDRESS}/1`);
        
    } catch (e) {
        console.log("❌ Failed:", e.reason || e.message);
        console.log("\nError details:", e);
    }
    
    process.exit(0);
}

main().catch((error) => {
    console.error("\n❌ Failed:", error.message);
    process.exit(1);
});