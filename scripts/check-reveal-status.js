const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Checking SkunkSquad Reveal Status...\n");
    
    const CONTRACT_ADDRESS = "0xAa5C50099bEb130c8988324A0F6Ebf65979f10EF";
    const SkunkSquad = await ethers.getContractAt("SkunkSquadNFT", CONTRACT_ADDRESS);
    
    try {
        const isRevealed = await SkunkSquad.revealed();
        console.log("✅ Revealed:", isRevealed);
        
        const totalSupply = await SkunkSquad.totalSupply();
        console.log("📊 Total Supply:", totalSupply.toString());
        
        if (totalSupply > 0) {
            console.log("\n🎨 Sample Token URIs:");
            const tokenURI1 = await SkunkSquad.tokenURI(1);
            console.log("Token #1:", tokenURI1);
            
            if (totalSupply > 100) {
                const tokenURI100 = await SkunkSquad.tokenURI(100);
                console.log("Token #100:", tokenURI100);
            }
        }
        
        console.log("\n✅ Collection is", isRevealed ? "REVEALED" : "UNREVEALED");
        
    } catch (e) {
        console.log("❌ Error:", e.message);
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
