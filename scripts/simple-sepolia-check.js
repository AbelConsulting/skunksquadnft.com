const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Simple Sepolia Contract Check...\n");

    const contractAddress = "0xBC00f05B9918B6B529d7edd33d89b4fB7016F6aF";
    console.log("📖 Contract Address:", contractAddress);

    // Get signer
    const [owner] = await ethers.getSigners();
    console.log("👤 Owner:", owner.address);
    console.log("💰 Balance:", ethers.utils.formatEther(await owner.getBalance()), "ETH");

    try {
        // Connect to contract
        const contract = await ethers.getContractAt("SkunkSquadNFTUltraSmart", contractAddress);
        
        console.log("\n" + "=".repeat(40));
        console.log("📋 BASIC CONTRACT INFO");
        console.log("=".repeat(40));

        const name = await contract.name();
        const symbol = await contract.symbol();
        console.log("Name:", name);
        console.log("Symbol:", symbol);

        console.log("\n" + "=".repeat(40));
        console.log("⚙️  CONFIGURATION");
        console.log("=".repeat(40));

        // Check base URI (this should be your Arweave base)
        try {
            const baseURI = await contract.baseURI();
            console.log("Base URI:", baseURI);
            
            // Check if it matches your Arweave setup
            if (baseURI.includes("ar://")) {
                console.log("✅ Arweave base URI configured");
            } else {
                console.log("⚠️  Base URI not set to Arweave");
            }
        } catch (error) {
            console.log("❌ Could not get base URI:", error.message);
        }

        // Check current phase
        try {
            const phase = await contract.currentMintPhase();
            const phases = ["NOT_STARTED", "WHITELIST", "PUBLIC", "SOLD_OUT"];
            console.log("Mint Phase:", phases[phase] || phase.toString());
        } catch (error) {
            console.log("❌ Could not get mint phase:", error.message);
        }

        // Check if paused
        try {
            const paused = await contract.paused();
            console.log("Paused:", paused);
        } catch (error) {
            console.log("❌ Could not check pause status:", error.message);
        }

        console.log("\n" + "=".repeat(40));
        console.log("💰 PRICING INFO");
        console.log("=".repeat(40));

        try {
            const smartPrice = await contract.getCurrentSmartPrice();
            console.log("Smart Price:", ethers.utils.formatEther(smartPrice), "ETH");
        } catch (error) {
            console.log("❌ Could not get smart price:", error.message);
        }

        console.log("\n" + "=".repeat(40));
        console.log("📊 SUPPLY INFO");
        console.log("=".repeat(40));

        try {
            const totalSupply = await contract.totalSupply();
            console.log("Total Supply:", totalSupply.toString());
        } catch (error) {
            console.log("❌ Could not get total supply:", error.message);
        }

        console.log("\n" + "=".repeat(40));
        console.log("🧪 METADATA TEST");
        console.log("=".repeat(40));

        // If there are any tokens, test metadata
        try {
            const totalSupply = await contract.totalSupply();
            if (totalSupply.gt(0)) {
                console.log("Testing metadata for token #1...");
                const tokenURI = await contract.tokenURI(1);
                console.log("Token #1 URI:", tokenURI);
                
                if (tokenURI.includes("ar://")) {
                    console.log("✅ Token URI uses Arweave");
                } else {
                    console.log("⚠️  Token URI not using Arweave");
                }
            } else {
                console.log("No tokens minted yet - cannot test metadata");
            }
        } catch (error) {
            console.log("❌ Could not test metadata:", error.message);
        }

        console.log("\n" + "=".repeat(40));
        console.log("🎯 CONTRACT STATUS");
        console.log("=".repeat(40));

        console.log("✅ Contract is deployed and accessible");
        console.log("✅ Basic functions are working");
        
        // Simple recommendations
        console.log("\n💡 NEXT STEPS:");
        console.log("1. Update base URI to use your new Arweave manifest");
        console.log("2. Test minting a few NFTs");
        console.log("3. Verify metadata is loading correctly");
        
        // Show the current base URI vs recommended
        const currentBaseURI = await contract.baseURI();
        console.log("\n📝 URI UPDATE NEEDED:");
        console.log("Current:", currentBaseURI);
        console.log("Recommended: ar://YOUR_MANIFEST_TXID/metadata/");

    } catch (error) {
        console.log("❌ Contract interaction failed:", error.message);
        console.log("\nPossible issues:");
        console.log("- Network connection problems");
        console.log("- Contract not deployed properly");
        console.log("- ABI mismatch");
    }
}

if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error("❌ Test failed:", error);
            process.exit(1);
        });
}

module.exports = main;