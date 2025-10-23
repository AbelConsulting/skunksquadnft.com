const hre = require("hardhat");
const fs = require('fs');

async function main() {
    console.log("🧪 Testing Simple Mint...\n");

    // Load deployment info
    const deployment = JSON.parse(
        fs.readFileSync('deployments/simple-deployment.json', 'utf8')
    );
    
    console.log("Contract Address:", deployment.contractAddress);

    // Get signer
    const [signer] = await hre.ethers.getSigners();
    console.log("Minting from:", signer.address);
    
    const balance = await hre.ethers.provider.getBalance(signer.address);
    console.log("Balance:", hre.ethers.utils.formatEther(balance), "ETH\n");

    // Get contract
    const contract = await hre.ethers.getContractAt(
        "SkunkSquadNFTSimple",
        deployment.contractAddress
    );

    // Check state
    console.log("📊 Contract State:");
    const totalSupply = await contract.totalSupply();
    const mintingEnabled = await contract.mintingEnabled();
    const mintPrice = await contract.mintPrice();
    const walletMints = await contract.walletMints(signer.address);
    
    console.log("- Total Supply:", totalSupply.toString());
    console.log("- Minting Enabled:", mintingEnabled);
    console.log("- Mint Price:", hre.ethers.utils.formatEther(mintPrice), "ETH");
    console.log("- Your Mints:", walletMints.toString(), "\n");

    if (!mintingEnabled) {
        console.log("❌ Minting is not enabled!");
        console.log("Run: npx hardhat run scripts/enable-minting.js --network sepolia");
        return;
    }

    // Test canMint
    const quantity = 2;
    const canMint = await contract.canMint(signer.address, quantity);
    console.log(`Can mint ${quantity} NFTs:`, canMint);
    
    if (!canMint) {
        console.log("❌ Cannot mint at this time");
        return;
    }

    // Calculate payment
    const totalCost = mintPrice.mul(quantity);
    console.log("\n💰 Minting Details:");
    console.log("- Quantity:", quantity);
    console.log("- Price per NFT:", hre.ethers.utils.formatEther(mintPrice), "ETH");
    console.log("- Total Cost:", hre.ethers.utils.formatEther(totalCost), "ETH");

    // Mint
    console.log("\n🎨 Minting NFTs...");
    try {
        const tx = await contract.mint(quantity, {
            value: totalCost,
            gasLimit: 300000
        });
        
        console.log("Transaction hash:", tx.hash);
        console.log("⏳ Waiting for confirmation...");
        
        const receipt = await tx.wait();
        console.log("\n✅ Mint successful!");
        console.log("Gas used:", receipt.gasUsed.toString());
        
        // Check new state
        const newSupply = await contract.totalSupply();
        const newWalletMints = await contract.walletMints(signer.address);
        
        console.log("\n📊 Updated State:");
        console.log("- Total Supply:", newSupply.toString());
        console.log("- Your Mints:", newWalletMints.toString());
        
        // Get token IDs
        const startTokenId = Number(newSupply) - quantity + 1;
        const tokenIds = Array.from(
            { length: quantity }, 
            (_, i) => startTokenId + i
        );
        
        console.log("\n🎉 Minted Token IDs:", tokenIds.join(", "));
        
        // Test tokenURI
        console.log("\n🔗 Testing Token URIs:");
        for (const tokenId of tokenIds) {
            const uri = await contract.tokenURI(tokenId);
            console.log(`Token #${tokenId}:`, uri);
        }
        
        console.log("\n✅ ALL TESTS PASSED!");
        
    } catch (error) {
        console.error("\n❌ Mint failed:");
        console.error(error.message);
        
        if (error.transaction) {
            console.log("\n📍 Failed transaction:", error.transaction.hash);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
