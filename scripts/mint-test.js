const { ethers } = require("hardhat");

async function main() {
    console.log("🦨 Minting Test Token on Sepolia...\n");
    
    const CONTRACT_ADDRESS = "0x6BA18b88b64af8898bbb42262ED18EC13DC81315";
    
    const [deployer] = await ethers.getSigners();
    console.log("Minting to account:", deployer.address);
    
    // Get contract instance
    const SkunkSquad = await ethers.getContractAt("SkunkSquadNFT", CONTRACT_ADDRESS);
    
    // Check current state
    const totalSupply = await SkunkSquad.totalSupply();
    const owner = await SkunkSquad.owner();
    const publicMintActive = await SkunkSquad.publicMintActive();
    
    console.log("📊 Current State:");
    console.log("├── Total Supply:", totalSupply.toString());
    console.log("├── Owner:", owner);
    console.log("├── Your Address:", deployer.address);
    console.log("├── You are owner:", owner.toLowerCase() === deployer.address.toLowerCase() ? "✅ YES" : "❌ NO");
    console.log("└── Public Mint Active:", publicMintActive ? "✅ YES" : "❌ NO");
    
    console.log("\n🎨 Minting 1 test token via ownerMint (FREE)...");
    
    try {
        const tx = await SkunkSquad.ownerMint(deployer.address, 1);
        console.log("⏳ Transaction sent:", tx.hash);
        console.log("   Waiting for confirmation...");
        
        const receipt = await tx.wait();
        console.log("\n✅ Token minted successfully!");
        
        // Get the new token ID
        const newSupply = await SkunkSquad.totalSupply();
        console.log("   New Total Supply:", newSupply.toString());
        console.log("   Token ID:", newSupply.toString());
        
        // Get and display the token URI
        const tokenURI = await SkunkSquad.tokenURI(newSupply);
        console.log("\n📄 Token URI:");
        console.log("   ", tokenURI);
        
        // Extract base URI from token URI
        const baseURI = tokenURI.substring(0, tokenURI.lastIndexOf('/') + 1);
        console.log("\n📂 Base URI (derived):");
        console.log("   ", baseURI);
        
        console.log("\n🔍 View on Sepolia Etherscan:");
        console.log(`   https://sepolia.etherscan.io/tx/${tx.hash}`);
        
        console.log("\n✅ Expected Base URI:");
        console.log("   https://arweave.net/CP7hoS7Dpke7RXxnTmosH6N3P3_-adXN2NFaIhw54do/");
        console.log("   Match:", baseURI === "https://arweave.net/CP7hoS7Dpke7RXxnTmosH6N3P3_-adXN2NFaIhw54do/" ? "✅ CORRECT" : "❌ INCORRECT");
        
    } catch (error) {
        console.error("\n❌ Minting failed!");
        console.error("   Error:", error.reason || error.message);
        
        if (error.message.includes("Ownable")) {
            console.log("\n💡 You are not the contract owner.");
            console.log("   Owner address:", owner);
            console.log("   Your address:", deployer.address);
        }
        
        throw error;
    }
    
    console.log("\n🎉 Test Complete!");
    console.log("\nNext: Run the URI test to verify everything:");
    console.log("npx hardhat run scripts/test-uris-fixed.js --network sepolia");
    
    process.exit(0);
}

main().catch((error) => {
    console.error("\n❌ Script failed:", error.message);
    process.exit(1);
});