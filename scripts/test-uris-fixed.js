const { ethers } = require("hardhat");

async function main() {
    console.log("🦨 Minting Test Token on Sepolia...\n");
    
    const CONTRACT_ADDRESS = "0x6BA18b88b64af8898bbb42262ED18EC13DC81315";
    
    const [deployer] = await ethers.getSigners();
    console.log("Minting to account:", deployer.address);
    
    // Get contract instance
    const SkunkSquad = await ethers.getContractAt("SkunkSquadNFT", CONTRACT_ADDRESS);
    
    // Check current supply
    const totalSupply = await SkunkSquad.totalSupply();
    console.log("Current Total Supply:", totalSupply.toString());
    
    // Check what functions are available
    console.log("\n🔍 Checking available mint functions...");
    
    // List of possible mint function names to try
    const mintFunctions = [
        'mint',
        'publicMint', 
        'whitelistMint',
        'ownerMint',
        'teamMint',
        'safeMint'
    ];
    
    console.log("\n🎨 Attempting to mint 1 test token...");
    
    let minted = false;
    
    // Try mint(uint256 quantity)
    if (!minted) {
        try {
            console.log("\n Trying: mint(1)...");
            const tx = await SkunkSquad.mint(1);
            console.log("⏳ Waiting for confirmation...");
            console.log("   TX Hash:", tx.hash);
            
            await tx.wait();
            console.log("✅ Minted successfully!");
            minted = true;
            
            const newSupply = await SkunkSquad.totalSupply();
            const tokenURI = await SkunkSquad.tokenURI(newSupply);
            console.log("\n📄 Token URI:", tokenURI);
            console.log("🔍 TX:", `https://sepolia.etherscan.io/tx/${tx.hash}`);
            
        } catch (e) {
            console.log("❌ Failed:", e.reason || e.message);
        }
    }
    
    // Try publicMint(uint256 quantity)
    if (!minted) {
        try {
            console.log("\n Trying: publicMint(1)...");
            const tx = await SkunkSquad.publicMint(1);
            console.log("⏳ Waiting for confirmation...");
            await tx.wait();
            console.log("✅ Minted successfully!");
            minted = true;
            
            const newSupply = await SkunkSquad.totalSupply();
            const tokenURI = await SkunkSquad.tokenURI(newSupply);
            console.log("\n📄 Token URI:", tokenURI);
            
        } catch (e) {
            console.log("❌ Failed:", e.reason || e.message);
        }
    }
    
    // Try ownerMint(address to, uint256 quantity)
    if (!minted) {
        try {
            console.log("\n Trying: ownerMint(address, 1)...");
            const tx = await SkunkSquad.ownerMint(deployer.address, 1);
            console.log("⏳ Waiting for confirmation...");
            await tx.wait();
            console.log("✅ Minted successfully!");
            minted = true;
            
            const newSupply = await SkunkSquad.totalSupply();
            const tokenURI = await SkunkSquad.tokenURI(newSupply);
            console.log("\n📄 Token URI:", tokenURI);
            
        } catch (e) {
            console.log("❌ Failed:", e.reason || e.message);
        }
    }
    
    if (!minted) {
        console.log("\n❌ All mint attempts failed!");
        console.log("\n💡 Please check your SkunkSquadNFT.sol contract");
        console.log("   What are the available mint functions?");
        console.log("   Are there any requirements (whitelist, sale active, etc.)?");
        throw new Error("Unable to mint token");
    }
    
    console.log("\n🎉 Minting Complete!");
    console.log("\nNext: Run the URI test again to verify baseURI");
    console.log("npx hardhat run scripts/test-uris-fixed.js --network sepolia");
    
    process.exit(0);
}

main().catch((error) => {
    console.error("\n❌ Minting failed:", error.message);
    process.exit(1);
});