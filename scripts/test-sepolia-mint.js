const { ethers } = require("hardhat");

async function main() {
    console.log("🦨 SEPOLIA - Minting Test Tokens\n");
    
    const CONTRACT_ADDRESS = "0x6BA18b88b64af8898bbb42262ED18EC13DC81315";
    const TOKENS_TO_MINT = 3;
    
    const [deployer] = await ethers.getSigners();
    const SkunkSquad = await ethers.getContractAt("SkunkSquadNFT", CONTRACT_ADDRESS);
    
    console.log("Minting to:", deployer.address);
    console.log("Quantity:", TOKENS_TO_MINT);
    
    const totalSupplyBefore = await SkunkSquad.totalSupply();
    console.log("\nTotal Supply Before:", totalSupplyBefore.toString());
    
    console.log("\n🎨 Minting tokens...");
    
    try {
        const tx = await SkunkSquad.ownerMint(deployer.address, TOKENS_TO_MINT);
        console.log("⏳ TX sent:", tx.hash);
        console.log("   Waiting for confirmation...");
        
        await tx.wait();
        console.log("✅ Minted successfully!");
        
        const totalSupplyAfter = await SkunkSquad.totalSupply();
        console.log("\nTotal Supply After:", totalSupplyAfter.toString());
        console.log("New Tokens:", (totalSupplyAfter - totalSupplyBefore).toString());
        
        console.log("\n📄 New Token URIs:");
        for (let i = Number(totalSupplyBefore) + 1; i <= Number(totalSupplyAfter); i++) {
            const tokenURI = await SkunkSquad.tokenURI(i);
            console.log(`Token #${i}: ${tokenURI}`);
        }
        
        console.log("\n🔗 View TX:");
        console.log(`https://sepolia.etherscan.io/tx/${tx.hash}`);
        
    } catch (e) {
        console.log("❌ Minting failed:", e.reason || e.message);
    }
    
    console.log("\n🎉 Test Complete!");
    process.exit(0);
}

main().catch((error) => {
    console.error("❌ Failed:", error.message);
    process.exit(1);
});