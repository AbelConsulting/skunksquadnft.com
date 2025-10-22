const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 SEPOLIA - Testing ownerMint with Call Simulation\n");
    
    const CONTRACT_ADDRESS = "0x6BA18b88b64af8898bbb42262ED18EC13DC81315";
    
    const [deployer] = await ethers.getSigners();
    console.log("Caller:", deployer.address);
    
    // Get contract
    const SkunkSquad = await ethers.getContractAt("SkunkSquadNFT", CONTRACT_ADDRESS);
    
    // Check if ownerMint function exists
    console.log("\n🔍 Checking available functions:");
    
    const functions = [
        'ownerMint',
        'teamMint', 
        'mintForAddress',
        'safeMint',
        'adminMint'
    ];
    
    for (const func of functions) {
        try {
            if (SkunkSquad[func]) {
                console.log(`✅ ${func} exists`);
                
                // Try to call it with static call to see error
                try {
                    await SkunkSquad[func].staticCall(deployer.address, 1);
                    console.log(`   Would succeed!`);
                } catch (e) {
                    console.log(`   Would fail: ${e.reason || e.message}`);
                }
            }
        } catch (e) {
            console.log(`❌ ${func} does not exist`);
        }
    }
    
    // Try calling ownerMint directly with different parameters
    console.log("\n🧪 Testing ownerMint variations:");
    
    try {
        console.log("\n1. Testing: ownerMint(address, uint256)");
        await SkunkSquad.ownerMint.staticCall(deployer.address, 1);
        console.log("   ✅ Would work!");
    } catch (e) {
        console.log("   ❌ Failed:", e.message);
        if (e.data) {
            console.log("   Error data:", e.data);
        }
    }
    
    // Check contract state that might block minting
    console.log("\n🔍 Checking blocking conditions:");
    
    try {
        const paused = await SkunkSquad.paused();
        console.log("├── Contract paused:", paused ? "❌ YES (blocking)" : "✅ NO");
    } catch (e) {
        console.log("├── Paused check: function not found");
    }
    
    try {
        const mintingEnabled = await SkunkSquad.mintingEnabled();
        console.log("├── Minting enabled:", mintingEnabled ? "✅ YES" : "❌ NO (blocking)");
    } catch (e) {
        console.log("├── Minting enabled: function not found");
    }
    
    try {
        const saleActive = await SkunkSquad.saleActive();
        console.log("└── Sale active:", saleActive ? "✅ YES" : "❌ NO (might block)");
    } catch (e) {
        console.log("└── Sale active: function not found");
    }
    
    console.log("\n💡 Next step: Check SkunkSquadNFT.sol ownerMint function");
    console.log("   Look for require() statements or modifiers");
    
    process.exit(0);
}

main().catch((error) => {
    console.error("❌ Failed:", error.message);
    process.exit(1);
});