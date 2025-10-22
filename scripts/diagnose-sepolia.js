const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Diagnosing Sepolia Contract Issues...\n");

    // Load deployment info
    const fs = require('fs');
    let deploymentInfo;
    
    try {
        deploymentInfo = JSON.parse(fs.readFileSync('ultra-smart-deployment.json', 'utf8'));
        console.log("📖 Contract Address:", deploymentInfo.contractAddress);
    } catch (error) {
        console.log("❌ No deployment info found");
        return;
    }

    // Get contract instance
    const [owner] = await ethers.getSigners();
    const contract = await ethers.getContractAt("SkunkSquadNFTUltraSmart", deploymentInfo.contractAddress);
    
    console.log("👤 Owner Address:", owner.address);
    console.log("💰 Owner Balance:", ethers.utils.formatEther(await owner.getBalance()), "ETH");

    try {
        console.log("\n" + "=".repeat(50));
        console.log("📋 CONTRACT BASIC INFO");
        console.log("=".repeat(50));

        const name = await contract.name();
        const symbol = await contract.symbol();
        const totalSupply = await contract.totalSupply();
        const maxSupply = await contract.maxSupply();
        
        console.log("Name:", name);
        console.log("Symbol:", symbol);
        console.log("Total Supply:", totalSupply.toString());
        console.log("Max Supply:", maxSupply.toString());

        console.log("\n" + "=".repeat(50));
        console.log("⚙️  CONTRACT CONFIGURATION");
        console.log("=".repeat(50));

        const mintPhase = await contract.currentMintPhase();
        const mintPhases = ["NOT_STARTED", "WHITELIST", "PUBLIC", "SOLD_OUT"];
        console.log("Current Phase:", mintPhases[mintPhase] || `Unknown (${mintPhase})`);

        const paused = await contract.paused();
        console.log("Contract Paused:", paused);

        const revealed = await contract.revealed();
        console.log("Revealed:", revealed);

        // Check URIs
        const baseURI = await contract.baseURI();
        const contractURI = await contract.contractURIString();
        const unrevealedURI = await contract.unrevealedURI();
        
        console.log("Base URI:", baseURI || "Not set");
        console.log("Contract URI:", contractURI || "Not set");
        console.log("Unrevealed URI:", unrevealedURI || "Not set");

        console.log("\n" + "=".repeat(50));
        console.log("💰 PRICING CONFIGURATION");
        console.log("=".repeat(50));

        const pricing = await contract.dynamicPricing();
        console.log("Base Price:", ethers.utils.formatEther(pricing.basePriceETH), "ETH");
        console.log("Min Price:", ethers.utils.formatEther(pricing.minPriceETH), "ETH");
        console.log("Max Price:", ethers.utils.formatEther(pricing.maxPriceETH), "ETH");
        console.log("Demand Multiplier:", pricing.demandMultiplier.toString() + "%");

        const smartPrice = await contract.getCurrentSmartPrice();
        console.log("Current Smart Price:", ethers.utils.formatEther(smartPrice), "ETH");

        console.log("\n" + "=".repeat(50));
        console.log("🎯 MINT LIMITS");
        console.log("=".repeat(50));

        const publicLimit = await contract.PUBLIC_MINT_LIMIT_PER_WALLET();
        console.log("Public Mint Limit:", publicLimit.toString());

        const userMinted = await contract.publicMinted(owner.address);
        console.log("Owner Already Minted:", userMinted.toString());

        console.log("\n" + "=".repeat(50));
        console.log("🧪 TESTING SIMPLE MINT");
        console.log("=".repeat(50));

        if (mintPhase !== 2) { // Not PUBLIC
            console.log("⚠️  Setting mint phase to PUBLIC for testing...");
            try {
                const tx = await contract.setMintPhase(2);
                await tx.wait();
                console.log("✅ Mint phase set to PUBLIC");
            } catch (error) {
                console.log("❌ Failed to set mint phase:", error.message);
                return;
            }
        }

        if (paused) {
            console.log("⚠️  Contract is paused. Unpausing for testing...");
            try {
                const tx = await contract.unpause();
                await tx.wait();
                console.log("✅ Contract unpaused");
            } catch (error) {
                console.log("❌ Failed to unpause:", error.message);
                return;
            }
        }

        // Try a simple mint
        console.log("\n🔄 Attempting to mint 1 NFT...");
        try {
            const quantity = 1;
            const value = smartPrice.mul(quantity);
            
            console.log("Mint quantity:", quantity);
            console.log("Required value:", ethers.utils.formatEther(value), "ETH");
            
            // Check if we can mint (dry run)
            const gasEstimate = await contract.estimateGas.smartPublicMint(
                quantity, 
                ethers.constants.AddressZero, 
                { value }
            );
            
            console.log("Estimated gas:", gasEstimate.toString());
            
            // Actually mint
            const tx = await contract.smartPublicMint(quantity, ethers.constants.AddressZero, { 
                value,
                gasLimit: gasEstimate.mul(120).div(100) // 20% buffer
            });
            
            console.log("Transaction hash:", tx.hash);
            console.log("Waiting for confirmation...");
            
            const receipt = await tx.wait();
            console.log("✅ Mint successful! Gas used:", receipt.gasUsed.toString());
            
            const newTotalSupply = await contract.totalSupply();
            console.log("New total supply:", newTotalSupply.toString());
            
        } catch (error) {
            console.log("❌ Mint failed:", error.message);
            
            // Check for specific error codes
            if (error.message.includes("0x7f0efd85")) {
                console.log("💡 This error suggests contract logic is preventing the mint");
                console.log("   Possible causes:");
                console.log("   - Wallet already at mint limit");
                console.log("   - Supply would exceed maximum");
                console.log("   - Phase restrictions");
                console.log("   - Custom validation logic");
            }
        }

        console.log("\n" + "=".repeat(50));
        console.log("📊 CURRENT STATE SUMMARY");
        console.log("=".repeat(50));

        const finalSupply = await contract.totalSupply();
        const finalPhase = await contract.currentMintPhase();
        const finalPaused = await contract.paused();
        
        console.log("Final Total Supply:", finalSupply.toString());
        console.log("Final Phase:", mintPhases[finalPhase]);
        console.log("Final Paused State:", finalPaused);
        
        console.log("\n🎯 RECOMMENDATIONS:");
        
        if (baseURI === "") {
            console.log("⚠️  Set base URI for metadata");
        }
        
        if (finalSupply.eq(0)) {
            console.log("⚠️  No NFTs have been minted yet");
        }
        
        console.log("💡 Contract appears to be deployed and accessible");
        console.log("💡 Consider minting a few test NFTs manually via Etherscan");

    } catch (error) {
        console.log("❌ Diagnostic failed:", error.message);
    }
}

if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error("❌ Diagnostic failed:", error);
            process.exit(1);
        });
}

module.exports = main;