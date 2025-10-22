const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 SEPOLIA - Diagnosing Mint Issue\n");
    
    const CONTRACT_ADDRESS = "0x6BA18b88b64af8898bbb42262ED18EC13DC81315";
    
    const [deployer] = await ethers.getSigners();
    const SkunkSquad = await ethers.getContractAt("SkunkSquadNFT", CONTRACT_ADDRESS);
    
    console.log("📋 Checking Requirements:");
    console.log("├── Your Address:", deployer.address);
    
    // Check ownership
    const owner = await SkunkSquad.owner();
    console.log("├── Contract Owner:", owner);
    console.log("├── You are owner:", owner.toLowerCase() === deployer.address.toLowerCase() ? "✅ YES" : "❌ NO");
    
    // Check supply
    const totalSupply = await SkunkSquad.totalSupply();
    const maxSupply = await SkunkSquad.MAX_SUPPLY();
    console.log("├── Total Supply:", totalSupply.toString());
    console.log("├── Max Supply:", maxSupply.toString());
    console.log("└── Can mint more:", totalSupply < maxSupply ? "✅ YES" : "❌ NO");
    
    // Try to estimate gas for ownerMint
    console.log("\n🧪 Testing ownerMint gas estimation:");
    
    for (let qty = 1; qty <= 5; qty++) {
        try {
            const gasEstimate = await SkunkSquad.estimateGas.ownerMint(deployer.address, qty);
            console.log(`✅ Mint ${qty} token(s): Would work (gas: ${gasEstimate.toString()})`);
        } catch (e) {
            console.log(`❌ Mint ${qty} token(s): Would fail`);
            if (e.reason) {
                console.log(`   Reason: ${e.reason}`);
            }
            if (e.data) {
                console.log(`   Error data: ${e.data}`);
            }
            // Try to decode custom error
            try {
                const errorData = e.data;
                if (errorData && errorData.startsWith('0x')) {
                    console.log(`   Raw error: ${errorData}`);
                }
            } catch (decodeError) {
                // Ignore
            }
        }
    }
    
    // Check if there's a max per transaction limit
    console.log("\n🔍 Checking contract configuration:");
    
    try {
        const MAX_PER_TX = await SkunkSquad.MAX_PER_TX();
        console.log("├── MAX_PER_TX:", MAX_PER_TX.toString());
    } catch (e) {
        console.log("├── MAX_PER_TX: not found");
    }
    
    try {
        const MAX_PER_WALLET = await SkunkSquad.MAX_PER_WALLET();
        console.log("├── MAX_PER_WALLET:", MAX_PER_WALLET.toString());
    } catch (e) {
        console.log("├── MAX_PER_WALLET: not found");
    }
    
    try {
        const TEAM_RESERVE = await SkunkSquad.TEAM_RESERVE();
        console.log("├── TEAM_RESERVE:", TEAM_RESERVE.toString());
    } catch (e) {
        console.log("├── TEAM_RESERVE: not found");
    }
    
    try {
        const teamMinted = await SkunkSquad.teamMinted();
        console.log("└── Team Minted:", teamMinted.toString());
    } catch (e) {
        console.log("└── Team Minted: not found");
    }
    
    console.log("\n💡 Recommendation:");
    console.log("   Check your SkunkSquadNFT.sol for ownerMint restrictions");
    console.log("   There may be a TEAM_RESERVE limit or other requirement");
    
    process.exit(0);
}

main().catch((error) => {
    console.error("❌ Failed:", error.message);
    process.exit(1);
});