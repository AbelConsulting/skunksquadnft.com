const { ethers } = require("hardhat");

async function main() {
    console.log("🦨 Minting Test NFT on Sepolia...\n");

    const contractAddress = "0xBC00f05B9918B6B529d7edd33d89b4fB7016F6aF";
    
    // Get signer
    const [signer] = await ethers.getSigners();
    console.log("👤 Minting from account:", signer.address);
    
    // Get contract
    const contract = await ethers.getContractAt("SkunkSquadNFTUltraSmart", contractAddress);
    
    try {
        // Get current supply
        const totalSupply = await contract.totalSupply();
        console.log("📊 Current supply:", totalSupply.toString());
        
        // Get current smart price
        const smartPrice = await contract.getCurrentSmartPrice();
        console.log("💰 Current smart price:", ethers.utils.formatEther(smartPrice), "ETH");
        
        // Check mint phase
        const mintPhase = await contract.mintPhase();
        const phases = ["PAUSED", "PRESALE", "WHITELIST", "PUBLIC"];
        console.log("🔄 Mint phase:", phases[mintPhase] || "UNKNOWN");
        
        if (mintPhase === 0) {
            console.log("\n⚠️  Contract is paused. Setting to PUBLIC phase...");
            const phaseTx = await contract.setMintPhase(3);
            await phaseTx.wait();
            console.log("✅ Set to PUBLIC phase");
        }
        
        // Mint quantity
        const quantity = 2;
        const totalCost = smartPrice.mul(quantity);
        
        console.log(`\n🎨 Minting ${quantity} NFTs...`);
        console.log("💵 Total cost:", ethers.utils.formatEther(totalCost), "ETH");
        
        // Mint
        const tx = await contract.smartPublicMint(
            quantity,
            ethers.constants.AddressZero, // no referrer
            { value: totalCost }
        );
        
        console.log("📤 Transaction submitted:", tx.hash);
        console.log("⏳ Waiting for confirmation...");
        
        const receipt = await tx.wait();
        
        if (receipt.status === 1) {
            console.log("✅ Mint successful!");
            console.log("⛽ Gas used:", receipt.gasUsed.toString());
            
            // Get new total supply
            const newSupply = await contract.totalSupply();
            console.log("📊 New total supply:", newSupply.toString());
            
            // Calculate token IDs minted
            const firstTokenId = newSupply.sub(quantity).add(1);
            console.log(`\n🎉 Minted tokens: #${firstTokenId.toString()} to #${newSupply.toString()}`);
            
            // Get token URIs
            console.log("\n🔗 Token URIs:");
            for (let i = 0; i < quantity; i++) {
                const tokenId = firstTokenId.add(i);
                try {
                    const tokenURI = await contract.tokenURI(tokenId);
                    console.log(`   Token #${tokenId}: ${tokenURI}`);
                    
                    // Test if URI is accessible
                    const httpUrl = tokenURI.replace('ar://', 'https://arweave.net/');
                    console.log(`   Test URL: ${httpUrl}`);
                } catch (error) {
                    console.log(`   Token #${tokenId}: Error getting URI -`, error.message);
                }
            }
            
            // Check owner
            const owner = await contract.ownerOf(firstTokenId);
            console.log(`\n👤 Token #${firstTokenId} owner:`, owner);
            console.log("✅ Verified ownership:", owner === signer.address);
            
            console.log("\n📍 View on Etherscan:");
            console.log(`   https://sepolia.etherscan.io/tx/${receipt.transactionHash}`);
            
            console.log("\n🌐 View on OpenSea (may take a few minutes to index):");
            console.log(`   https://testnets.opensea.io/assets/sepolia/${contractAddress}/${firstTokenId}`);
            
        } else {
            console.log("❌ Mint failed!");
        }
        
    } catch (error) {
        console.error("❌ Error minting:", error.message);
        
        if (error.message.includes("insufficient funds")) {
            console.log("💡 Need more Sepolia ETH. Get some from:");
            console.log("   https://sepoliafaucet.com/");
            console.log("   https://www.alchemy.com/faucets/ethereum-sepolia");
        } else if (error.message.includes("Max supply reached")) {
            console.log("💡 Maximum supply already minted");
        } else if (error.message.includes("Minting is paused")) {
            console.log("💡 Contract is paused. Owner needs to unpause it.");
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
