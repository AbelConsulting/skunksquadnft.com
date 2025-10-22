const { ethers } = require("hardhat");

async function main() {
    console.log("🧪 SEPOLIA - Updating Base URI\n");
    
    const CONTRACT_ADDRESS = "0x6BA18b88b64af8898bbb42262ED18EC13DC81315";
    const CORRECT_BASE_URI = "https://arweave.net/iqKl2q48_BO-L9SjGYOW7VQd_0AoSScR12IVdzjsZlQ/";
    
    const [deployer] = await ethers.getSigners();
    const SkunkSquad = await ethers.getContractAt("SkunkSquadNFT", CONTRACT_ADDRESS);
    
    console.log("📋 Checking available functions...\n");
    
    // Check if already revealed
    try {
        const isRevealed = await SkunkSquad.isRevealed();
        console.log("Is Revealed:", isRevealed);
        
        if (isRevealed) {
            console.log("\n✅ Already revealed! Need to use setBaseURI() instead\n");
            
            // Try setBaseURI
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            console.log("Updating Base URI");
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
            
            console.log("New Base URI:", CORRECT_BASE_URI);
            console.log("\n⏰ Updating in 5 seconds...\n");
            await new Promise(resolve => setTimeout(resolve, 5000));
            
            try {
                const tx = await SkunkSquad.setBaseURI(CORRECT_BASE_URI);
                console.log("⏳ TX sent:", tx.hash);
                console.log("   Waiting for confirmation...");
                
                await tx.wait();
                console.log("✅ Base URI updated!");
                
                // Verify
                const newTokenURI = await SkunkSquad.tokenURI(1);
                console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
                console.log("Verification");
                console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
                console.log("Token #1 URI:", newTokenURI);
                console.log("Status:", newTokenURI.includes("iqKl2q48") ? "✅ CORRECT!" : "❌ Still wrong");
                
                console.log("\n🔗 View TX:");
                console.log(`   https://sepolia.etherscan.io/tx/${tx.hash}`);
                
            } catch (e) {
                console.log("❌ setBaseURI failed:", e.reason || e.message);
                
                // Check if function exists
                console.log("\nTrying alternative functions...");
                
                // Try updateBaseURI
                try {
                    const tx = await SkunkSquad.updateBaseURI(CORRECT_BASE_URI);
                    console.log("⏳ TX sent (updateBaseURI):", tx.hash);
                    await tx.wait();
                    console.log("✅ Updated via updateBaseURI!");
                } catch (e2) {
                    console.log("❌ updateBaseURI also failed:", e2.reason || e2.message);
                }
            }
        }
    } catch (e) {
        console.log("❌ Error checking state:", e.message);
    }
    
    // Show final state
    try {
        const finalURI = await SkunkSquad.tokenURI(1);
        console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("Final State");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        console.log("Token #1 URI:", finalURI);
        console.log("Status:", finalURI.includes("iqKl2q48") ? "✅ CORRECT!" : "❌ Needs manual check");
    } catch (e) {
        console.log("Could not verify final state");
    }
    
    process.exit(0);
}

main().catch((error) => {
    console.error("❌ Failed:", error.message);
    process.exit(1);
});