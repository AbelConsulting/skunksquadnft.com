const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 SEPOLIA - Current State Check\n");
    
    const CONTRACT_ADDRESS = "0x6BA18b88b64af8898bbb42262ED18EC13DC81315";
    
    const [deployer] = await ethers.getSigners();
    const network = await ethers.provider.getNetwork();
    
    console.log("📋 Network Info:");
    console.log("├── Network:", network.name);
    console.log("├── Chain ID:", network.chainId.toString());
    console.log("└── Your Address:", deployer.address);
    
    const SkunkSquad = await ethers.getContractAt("SkunkSquadNFT", CONTRACT_ADDRESS);
    
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📊 CONTRACT STATE");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    try {
        const totalSupply = await SkunkSquad.totalSupply();
        console.log("✅ Total Supply:", totalSupply.toString());
        
        const maxSupply = await SkunkSquad.MAX_SUPPLY();
        console.log("✅ Max Supply:", maxSupply.toString());
        
        const owner = await SkunkSquad.owner();
        console.log("✅ Owner:", owner);
        console.log("   You are owner:", owner.toLowerCase() === deployer.address.toLowerCase() ? "✅ YES" : "❌ NO");
        
        const contractURI = await SkunkSquad.contractURI();
        console.log("✅ Contract URI:", contractURI);
        
        console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("🎨 TOKEN URIs");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        
        if (totalSupply > 0n) {
            for (let i = 1; i <= Math.min(Number(totalSupply), 5); i++) {
                const tokenURI = await SkunkSquad.tokenURI(i);
                const owner = await SkunkSquad.ownerOf(i);
                console.log(`Token #${i}:`);
                console.log(`├── URI: ${tokenURI}`);
                console.log(`└── Owner: ${owner}`);
                console.log("");
            }
            
            // Extract and verify base URI
            const firstTokenURI = await SkunkSquad.tokenURI(1);
            const lastSlash = firstTokenURI.lastIndexOf('/');
            const baseURI = firstTokenURI.substring(0, lastSlash + 1);
            
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            console.log("✅ VALIDATION");
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
            
            const expectedBaseURI = "https://arweave.net/CP7hoS7Dpke7RXxnTmosH6N3P3_-adXN2NFaIhw54do/";
            const expectedContractURI = "https://arweave.net/wpuACWSswfMtCiUp0Wv_cbpzdIm6kkbAHw_gZ_ZJ3Tc";
            
            console.log("Base URI Check:");
            console.log("├── Expected:", expectedBaseURI);
            console.log("├── Actual:  ", baseURI);
            console.log("└── Status:  ", baseURI === expectedBaseURI ? "✅ CORRECT" : "❌ INCORRECT");
            
            console.log("\nContract URI Check:");
            console.log("├── Expected:", expectedContractURI);
            console.log("├── Actual:  ", contractURI);
            console.log("└── Status:  ", contractURI === expectedContractURI ? "✅ CORRECT" : "❌ INCORRECT");
        } else {
            console.log("⚠️  No tokens minted yet");
        }
        
    } catch (e) {
        console.log("❌ Error:", e.message);
    }
    
    console.log("\n🎉 State Check Complete!");
    console.log("\nView on Sepolia Etherscan:");
    console.log(`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`);
    
    process.exit(0);
}

main().catch((error) => {
    console.error("❌ Failed:", error.message);
    process.exit(1);
});