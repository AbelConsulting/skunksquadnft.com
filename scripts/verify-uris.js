const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Verifying Contract URIs...\n");
    
    const CONTRACT_ADDRESS = "0x6BA18b88b64af8898bbb42262ED18EC13DC81315";
    
    // Get contract instance
    const SkunkSquad = await ethers.getContractAt("SkunkSquadNFT", CONTRACT_ADDRESS);
    
    // Check current URIs
    console.log("📋 Current Configuration:");
    
    try {
        const baseURI = await SkunkSquad.baseURI();
        console.log("├── Base URI:", baseURI);
    } catch (e) {
        console.log("├── Base URI: (unable to read)");
    }
    
    try {
        const contractURI = await SkunkSquad.contractURI();
        console.log("├── Contract URI:", contractURI);
    } catch (e) {
        console.log("├── Contract URI: (unable to read)");
    }
    
    try {
        const owner = await SkunkSquad.owner();
        console.log("└── Owner:", owner);
    } catch (e) {
        console.log("└── Owner: (unable to read)");
    }
    
    console.log("\n✅ Expected URIs:");
    console.log("├── Base URI: https://arweave.net/CP7hoS7Dpke7RXxnTmosH6N3P3_-adXN2NFaIhw54do/");
    console.log("└── Contract URI: https://arweave.net/aBV9_oqfIkpLck1YxDwW6l1oCVE5BwxzuA7dhSBokX0");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error:", error);
        process.exit(1);
    });