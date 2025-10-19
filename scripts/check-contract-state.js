const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Checking Contract State...\n");
    
    const CONTRACT_ADDRESS = "0x6BA18b88b64af8898bbb42262ED18EC13DC81315";
    
    const [deployer] = await ethers.getSigners();
    const SkunkSquad = await ethers.getContractAt("SkunkSquadNFT", CONTRACT_ADDRESS);
    
    console.log("📋 Basic Info:");
    console.log("├── Contract:", CONTRACT_ADDRESS);
    console.log("├── Your Address:", deployer.address);
    
    try {
        const owner = await SkunkSquad.owner();
        console.log("├── Owner:", owner);
        console.log("└── You are owner:", owner.toLowerCase() === deployer.address.toLowerCase() ? "✅ YES" : "❌ NO");
        
        if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
            console.log("\n❌ PROBLEM: You are not the owner!");
            console.log("   You need to use the owner wallet to mint.");
            process.exit(1);
        }
    } catch (e) {
        console.log("└── Owner: ❌ Cannot read -", e.message);
    }
    
    console.log("\n📊 Contract State:");
    
    try {
        const MAX_SUPPLY = await SkunkSquad.MAX_SUPPLY();
        console.log("├── MAX_SUPPLY:", MAX_SUPPLY.toString());
    } catch (e) {
        console.log("├── MAX_SUPPLY: ❌", e.message);
    }
    
    try {
        const totalSupply = await SkunkSquad.totalSupply();
        console.log("├── Total Supply:", totalSupply.toString());
    } catch (e) {
        console.log("├── Total Supply: ❌", e.message);
    }
    
    try {
        const publicMintActive = await SkunkSquad.publicMintActive();
        console.log("├── Public Mint Active:", publicMintActive ? "✅ YES" : "❌ NO");
    } catch (e) {
        console.log("├── Public Mint Active: ❌", e.message);
    }
    
    try {
        const whitelistMintActive = await SkunkSquad.whitelistMintActive();
        console.log("├── Whitelist Mint Active:", whitelistMintActive ? "✅ YES" : "❌ NO");
    } catch (e) {
        console.log("├── Whitelist Mint Active: ❌", e.message);
    }
    
    try {
        const revealed = await SkunkSquad.revealed();
        console.log("└── Revealed:", revealed ? "✅ YES" : "❌ NO");
    } catch (e) {
        console.log("└── Revealed: ❌", e.message);
    }
    
    console.log("\n💰 Pricing:");
    
    try {
        const publicPrice = await SkunkSquad.PUBLIC_PRICE();
        console.log("├── Public Price:", ethers.formatEther(publicPrice), "ETH");
    } catch (e) {
        console.log("├── Public Price: ❌", e.message);
    }
    
    try {
        const whitelistPrice = await SkunkSquad.WHITELIST_PRICE();
        console.log("└── Whitelist Price:", ethers.formatEther(whitelistPrice), "ETH");
    } catch (e) {
        console.log("└── Whitelist Price: ❌", e.message);
    }
    
    console.log("\n📝 URIs:");
    
    try {
        const contractURI = await SkunkSquad.contractURI();
        console.log("└── Contract URI:", contractURI);
    } catch (e) {
        console.log("└── Contract URI: ❌", e.message);
    }
    
    console.log("\n🎯 Diagnosis:");
    
    // Try to estimate gas for ownerMint
    try {
        console.log("Testing ownerMint gas estimation...");
        const gasEstimate = await SkunkSquad.estimateGas.ownerMint(deployer.address, 1);
        console.log("✅ ownerMint would succeed!");
        console.log("   Estimated gas:", gasEstimate.toString());
    } catch (e) {
        console.log("❌ ownerMint would fail!");
        console.log("   Reason:", e.reason || e.message);
        
        // Try to decode the error
        if (e.data) {
            console.log("   Error data:", e.data);
        }
    }
    
    console.log("\n✅ Diagnostic Complete!");
    process.exit(0);
}

main().catch((error) => {
    console.error("\n❌ Diagnostic failed:", error.message);
    process.exit(1);
});