const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Checking Existing Tokens...\n");
    
    const CONTRACT_ADDRESS = "0x6BA18b88b64af8898bbb42262ED18EC13DC81315";
    
    const SkunkSquad = await ethers.getContractAt("SkunkSquadNFT", CONTRACT_ADDRESS);
    
    const totalSupply = await SkunkSquad.totalSupply();
    console.log("📊 Total Supply:", totalSupply.toString(), "tokens\n");
    
    // Check tokens 1 and 2
    for (let tokenId = 1; tokenId <= totalSupply; tokenId++) {
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`🎨 Token #${tokenId}`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        
        try {
            // Get token URI
            const tokenURI = await SkunkSquad.tokenURI(tokenId);
            console.log("✅ Token URI:", tokenURI);
            
            // Extract base URI
            const lastSlash = tokenURI.lastIndexOf('/');
            const baseURI = tokenURI.substring(0, lastSlash + 1);
            const tokenFile = tokenURI.substring(lastSlash + 1);
            
            console.log("\n📂 Breakdown:");
            console.log("├── Base URI:", baseURI);
            console.log("└── Token File:", tokenFile);
            
            // Check owner
            try {
                const owner = await SkunkSquad.ownerOf(tokenId);
                console.log("\n👤 Owner:", owner);
            } catch (e) {
                console.log("\n👤 Owner: ❌", e.message);
            }
            
        } catch (e) {
            console.log("❌ Error reading token URI:", e.message);
        }
        
        console.log("");
    }
    
    // Validation
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ VALIDATION");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    const expectedBaseURI = "https://arweave.net/CP7hoS7Dpke7RXxnTmosH6N3P3_-adXN2NFaIhw54do/";
    const expectedContractURI = "https://arweave.net/wpuACWSswfMtCiUp0Wv_cbpzdIm6kkbAHw_gZ_ZJ3Tc";
    
    try {
        const tokenURI = await SkunkSquad.tokenURI(1);
        const lastSlash = tokenURI.lastIndexOf('/');
        const actualBaseURI = tokenURI.substring(0, lastSlash + 1);
        
        console.log("Expected Base URI:");
        console.log(expectedBaseURI);
        console.log("\nActual Base URI:");
        console.log(actualBaseURI);
        console.log("\n✅ Base URI:", actualBaseURI === expectedBaseURI ? "CORRECT ✅" : "INCORRECT ❌");
    } catch (e) {
        console.log("❌ Could not verify base URI:", e.message);
    }
    
    try {
        const contractURI = await SkunkSquad.contractURI();
        console.log("\nExpected Contract URI:");
        console.log(expectedContractURI);
        console.log("\nActual Contract URI:");
        console.log(contractURI);
        console.log("\n✅ Contract URI:", contractURI === expectedContractURI ? "CORRECT ✅" : "INCORRECT ❌");
    } catch (e) {
        console.log("❌ Could not verify contract URI:", e.message);
    }
    
    console.log("\n🎉 Check Complete!");
    process.exit(0);
}

main().catch((error) => {
    console.error("\n❌ Check failed:", error.message);
    process.exit(1);
});