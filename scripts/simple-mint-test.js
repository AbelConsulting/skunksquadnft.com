const { ethers } = require("hardhat");

async function main() {
    console.log("🦨 Minting Test NFT on Sepolia...\n");

    const contractAddress = "0xBC00f05B9918B6B529d7edd33d89b4fB7016F6aF";
    
    // Get signer
    const [signer] = await ethers.getSigners();
    console.log("👤 Minting from account:", signer.address);
    
    // Get contract with minimal ABI
    const minimalABI = [
        "function totalSupply() view returns (uint256)",
        "function getCurrentSmartPrice() view returns (uint256)",
        "function smartPublicMint(uint256 quantity, address referrer) payable",
        "function tokenURI(uint256 tokenId) view returns (string)",
        "function ownerOf(uint256 tokenId) view returns (address)",
        "function setMintPhase(uint8 phase)",
        "function owner() view returns (address)"
    ];
    
    const contract = new ethers.Contract(contractAddress, minimalABI, signer);
    
    try {
        // Check if we're the owner
        const contractOwner = await contract.owner();
        const isOwner = contractOwner.toLowerCase() === signer.address.toLowerCase();
        console.log("🔑 Contract owner:", contractOwner);
        console.log("✅ You are owner:", isOwner);
        
        // Get current supply
        const totalSupply = await contract.totalSupply();
        console.log("\n📊 Current supply:", totalSupply.toString());
        
        // Get current smart price
        const smartPrice = await contract.getCurrentSmartPrice();
        console.log("💰 Current smart price:", ethers.utils.formatEther(smartPrice), "ETH");
        
        // Set to public phase (only if owner)
        if (isOwner) {
            console.log("\n🔄 Setting contract to PUBLIC phase...");
            try {
                const phaseTx = await contract.setMintPhase(3);
                await phaseTx.wait();
                console.log("✅ Set to PUBLIC phase");
            } catch (error) {
                console.log("⚠️  Phase already set or error:", error.message.split('\n')[0]);
            }
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
            { 
                value: totalCost,
                gasLimit: 500000 // Set explicit gas limit
            }
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
                    console.log(`\n   Token #${tokenId}:`);
                    console.log(`   URI: ${tokenURI}`);
                    
                    // Test if URI is accessible
                    const httpUrl = tokenURI.replace('ar://', 'https://arweave.net/');
                    console.log(`   Test: ${httpUrl}`);
                } catch (error) {
                    console.log(`   Token #${tokenId}: Error -`, error.message.split('\n')[0]);
                }
            }
            
            // Check owner
            const owner = await contract.ownerOf(firstTokenId);
            console.log(`\n👤 Token #${firstTokenId} owner:`, owner);
            console.log("✅ Verified ownership:", owner.toLowerCase() === signer.address.toLowerCase());
            
            console.log("\n📍 View on Etherscan:");
            console.log(`   https://sepolia.etherscan.io/tx/${receipt.transactionHash}`);
            
            console.log("\n🌐 View on OpenSea (may take a few minutes to index):");
            for (let i = 0; i < quantity; i++) {
                const tokenId = firstTokenId.add(i);
                console.log(`   Token #${tokenId}: https://testnets.opensea.io/assets/sepolia/${contractAddress}/${tokenId}`);
            }
            
            console.log("\n✅ TEST COMPLETE - Your NFTs are minted and metadata is working!");
            
        } else {
            console.log("❌ Mint failed!");
        }
        
    } catch (error) {
        console.error("❌ Error minting:", error.message);
        
        if (error.message.includes("insufficient funds")) {
            console.log("\n💡 Need more Sepolia ETH. Get some from:");
            console.log("   https://sepoliafaucet.com/");
            console.log("   https://www.alchemy.com/faucets/ethereum-sepolia");
        } else if (error.message.includes("Max supply")) {
            console.log("💡 Maximum supply already minted");
        } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
            console.log("\n💡 Transaction would fail. Possible reasons:");
            console.log("   - Contract is paused");
            console.log("   - Insufficient payment");
            console.log("   - Max supply reached");
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
