const { ethers } = require("hardhat");

async function main() {
    console.log("🚨 MAINNET UPDATE - Updating Live Contract URIs\n");
    
    const CONTRACT_ADDRESS = "0x6BA18b88b64af8898bbb42262ED18EC13DC81315";
    const NEW_BASE_URI = "https://arweave.net/CP7hoS7Dpke7RXxnTmosH6N3P3_-adXN2NFaIhw54do/";
    
    const [deployer] = await ethers.getSigners();
    const network = await ethers.provider.getNetwork();
    
    console.log("⚠️  ⚠️  ⚠️  MAINNET UPDATE ⚠️  ⚠️  ⚠️");
    console.log("├── Network:", network.name);
    console.log("├── Chain ID:", network.chainId.toString());
    console.log("├── Contract:", CONTRACT_ADDRESS);
    console.log("└── Your Address:", deployer.address);
    
    if (network.chainId !== 1n) {
        console.log("\n❌ ERROR: Not connected to mainnet!");
        console.log("   This script should only run on mainnet.");
        process.exit(1);
    }
    
    console.log("\n⏰ You have 10 seconds to cancel (Ctrl+C)...\n");
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    const SkunkSquad = await ethers.getContractAt("SkunkSquadNFT", CONTRACT_ADDRESS);
    
    // Step 1: Check current state
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("1️⃣  CURRENT STATE");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    try {
        const totalSupply = await SkunkSquad.totalSupply();
        console.log("Total Supply:", totalSupply.toString());
        
        const contractURI = await SkunkSquad.contractURI();
        console.log("Contract URI:", contractURI);
        
        if (totalSupply > 0n) {
            const tokenURI = await SkunkSquad.tokenURI(1);
            console.log("Token #1 URI:", tokenURI);
        }
    } catch (e) {
        console.log("Error reading state:", e.message);
    }
    
    // Step 2: Update Contract URI
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("2️⃣  UPDATING CONTRACT URI");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    const NEW_CONTRACT_URI = "https://arweave.net/wpuACWSswfMtCiUp0Wv_cbpzdIm6kkbAHw_gZ_ZJ3Tc";
    
    try {
        console.log("Setting Contract URI to:", NEW_CONTRACT_URI);
        const tx1 = await SkunkSquad.setContractURI(NEW_CONTRACT_URI);
        console.log("⏳ TX:", tx1.hash);
        await tx1.wait();
        console.log("✅ Contract URI updated!");
    } catch (e) {
        console.log("❌ Failed:", e.message);
    }
    
    // Step 3: Reveal with new base URI
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("3️⃣  REVEALING COLLECTION");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    try {
        console.log("Revealing with Base URI:", NEW_BASE_URI);
        const tx2 = await SkunkSquad.reveal(NEW_BASE_URI);
        console.log("⏳ TX:", tx2.hash);
        await tx2.wait();
        console.log("✅ Collection revealed!");
    } catch (e) {
        console.log("❌ Failed:", e.message);
    }
    
    // Step 4: Verify
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("4️⃣  VERIFICATION");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    try {
        const totalSupply = await SkunkSquad.totalSupply();
        if (totalSupply > 0n) {
            const tokenURI = await SkunkSquad.tokenURI(1);
            console.log("Token #1 URI:", tokenURI);
            
            const isCorrect = tokenURI.includes("CP7hoS7Dpke7RXxnTmosH6N3P3_-adXN2NFaIhw54do");
            console.log("\n✅ Status:", isCorrect ? "SUCCESS! Live on Arweave ✅" : "Incorrect ❌");
        }
        
        const contractURI = await SkunkSquad.contractURI();
        console.log("\nContract URI:", contractURI);
        
    } catch (e) {
        console.log("Error verifying:", e.message);
    }
    
    console.log("\n🎉 MAINNET UPDATE COMPLETE!");
    console.log("\nView on Etherscan:");
    console.log(`https://etherscan.io/address/${CONTRACT_ADDRESS}`);
    
    process.exit(0);
}

main().catch((error) => {
    console.error("\n❌ Failed:", error.message);
    process.exit(1);
});