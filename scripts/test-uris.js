const { ethers } = require("hardhat");
const https = require('https');

async function fetchURL(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        resolve(data); // Return raw data if not JSON
                    }
                } else {
                    reject(new Error(`HTTP ${res.statusCode}`));
                }
            });
        }).on('error', reject);
    });
}

async function main() {
    console.log("🧪 Testing Skunk Squad NFT URIs Resolution...\n");
    
    const CONTRACT_ADDRESS = "0x6BA18b88b64af8898bbb42262ED18EC13DC81315";
    
    // Get contract instance
    const SkunkSquad = await ethers.getContractAt("SkunkSquadNFT", CONTRACT_ADDRESS);
    
    console.log("📋 Contract Address:", CONTRACT_ADDRESS);
    console.log("🔗 Network: Sepolia\n");
    
    // ============================================
    // 1. CHECK CONTRACT URIs
    // ============================================
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("1️⃣  CHECKING CONTRACT URIs");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    let contractURI, owner;
    
    // Try contractURI
    try {
        contractURI = await SkunkSquad.contractURI();
        console.log("✅ Contract URI:", contractURI);
    } catch (e) {
        console.log("❌ Contract URI: Error reading -", e.message);
    }
    
    // Try owner
    try {
        owner = await SkunkSquad.owner();
        console.log("✅ Owner:", owner);
    } catch (e) {
        console.log("❌ Owner: Error reading -", e.message);
    }
    
    // Try to get baseURI by calling tokenURI with token 0 (if any minted)
    try {
        const totalSupply = await SkunkSquad.totalSupply();
        console.log("✅ Total Supply:", totalSupply.toString());
        
        if (totalSupply > 0n) {
            const tokenURI = await SkunkSquad.tokenURI(1);
            // Extract baseURI from tokenURI (remove the token ID part)
            const baseURI = tokenURI.substring(0, tokenURI.lastIndexOf('/') + 1);
            console.log("✅ Base URI (derived from tokenURI):", baseURI);
        } else {
            console.log("⚠️  No tokens minted yet - cannot derive baseURI");
        }
    } catch (e) {
        console.log("⚠️  Base URI: Cannot derive -", e.message);
    }
    
    // ============================================
    // 2. TEST CONTRACT URI RESOLUTION
    // ============================================
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("2️⃣  TESTING CONTRACT URI RESOLUTION");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    if (contractURI) {
        console.log("📥 Fetching:", contractURI);
        try {
            const contractMetadata = await fetchURL(contractURI);
            console.log("✅ Contract metadata retrieved successfully!\n");
            console.log("📄 Contract Metadata:");
            console.log(JSON.stringify(contractMetadata, null, 2));
            
            // Validate expected fields
            console.log("\n🔍 Validation:");
            console.log("├── Name:", contractMetadata.name ? "✅" : "❌");
            console.log("├── Description:", contractMetadata.description ? "✅" : "❌");
            console.log("├── Image:", contractMetadata.image ? "✅" : "❌");
            console.log("├── External Link:", contractMetadata.external_link ? "✅" : "❌");
            console.log("└── Royalty Info:", contractMetadata.seller_fee_basis_points ? "✅" : "❌");
            
        } catch (e) {
            console.log("❌ Failed to fetch contract metadata:", e.message);
        }
    }
    
    // ============================================
    // 3. TEST TOKEN URI (if tokens minted)
    // ============================================
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("3️⃣  TESTING TOKEN URI RESOLUTION");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    try {
        const totalSupply = await SkunkSquad.totalSupply();
        
        if (totalSupply > 0n) {
            const tokenId = 1;
            console.log(`🔍 Testing Token #${tokenId}...`);
            
            const tokenURI = await SkunkSquad.tokenURI(tokenId);
            console.log("✅ Token URI:", tokenURI);
            
            console.log("\n📥 Fetching token metadata...");
            try {
                const tokenMetadata = await fetchURL(tokenURI);
                console.log("✅ Token metadata retrieved successfully!\n");
                console.log("📄 Token Metadata:");
                console.log(JSON.stringify(tokenMetadata, null, 2));
                
                // Validate token metadata
                console.log("\n🔍 Token Validation:");
                console.log("├── Name:", tokenMetadata.name ? "✅" : "❌");
                console.log("├── Description:", tokenMetadata.description ? "✅" : "❌");
                console.log("├── Image:", tokenMetadata.image ? "✅" : "❌");
                console.log("└── Attributes:", tokenMetadata.attributes ? "✅" : "❌");
                
            } catch (e) {
                console.log("❌ Failed to fetch token metadata:", e.message);
            }
        } else {
            console.log("⚠️  No tokens minted yet.");
            console.log("   To test token URIs, mint a token first:");
            console.log("   npx hardhat run scripts/mint-test.js --network sepolia");
        }
    } catch (e) {
        console.log("❌ Error:", e.message);
    }
    
    // ============================================
    // 4. SUMMARY
    // ============================================
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📊 SUMMARY");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    console.log("Expected Contract URI:");
    console.log("https://arweave.net/aBV9_oqfIkpLck1YxDwW6l1oCVE5BwxzuA7dhSBokX0");
    
    console.log("\nActual Contract URI:");
    console.log(contractURI === "https://arweave.net/aBV9_oqfIkpLck1YxDwW6l1oCVE5BwxzuA7dhSBokX0" ? "✅ CORRECT" : "❌ NEEDS UPDATE");
    
    console.log("\n🎉 Test Complete!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Test failed:", error);
        process.exit(1);
    });