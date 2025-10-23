const { ethers } = require("hardhat");

async function main() {
    console.log("🎨 Minting Test NFT...\n");
    
    const CONTRACT_ADDRESS = "0xf14F75aEDBbDE252616410649f4dd7C1963191c4";
    const QUANTITY = 1;
    
    const [minter] = await ethers.getSigners();
    console.log("👤 Minting with account:", minter.address);
    
    const balanceBefore = await minter.getBalance();
    console.log("💰 Balance before:", ethers.utils.formatEther(balanceBefore), "ETH\n");
    
    // Connect to the deployed contract
    const contract = await ethers.getContractAt("SkunkSquadNFT", CONTRACT_ADDRESS);
    
    // Get mint price
    const price = await contract.PRICE();
    const totalCost = price.mul(QUANTITY);
    
    console.log("🔧 Mint Configuration:");
    console.log("├── Quantity:", QUANTITY);
    console.log("├── Price per NFT:", ethers.utils.formatEther(price), "ETH");
    console.log("└── Total Cost:", ethers.utils.formatEther(totalCost), "ETH\n");
    
    // Check current supply
    const supplyBefore = await contract.totalSupply();
    console.log("📊 Supply before mint:", supplyBefore.toString());
    
    try {
        console.log("\n🚀 Minting", QUANTITY, "NFT(s)...");
        
        const tx = await contract.mintNFT(QUANTITY, {
            value: totalCost
        });
        
        console.log("⏳ Transaction sent:", tx.hash);
        console.log("   Waiting for confirmation...");
        
        const receipt = await tx.wait();
        
        console.log("\n✅ MINT SUCCESSFUL!");
        console.log("╔════════════════════════════════════════════════════╗");
        console.log("║              MINT TRANSACTION DETAILS             ║");
        console.log("╠════════════════════════════════════════════════════╣");
        console.log("║ Transaction Hash:", tx.hash.substring(0, 20) + "...║");
        console.log("║ Block Number:    ", receipt.blockNumber.toString().padEnd(28), "║");
        console.log("║ Gas Used:        ", receipt.gasUsed.toString().padEnd(28), "║");
        console.log("╚════════════════════════════════════════════════════╝");
        
        // Get updated supply
        const supplyAfter = await contract.totalSupply();
        console.log("\n📊 Supply after mint:", supplyAfter.toString());
        console.log("🆕 Newly minted token IDs:", supplyBefore.add(1).toString(), "to", supplyAfter.toString());
        
        // Get balance of minter
        const balance = await contract.balanceOf(minter.address);
        console.log("👛 Your NFT balance:", balance.toString());
        
        // Get token URI (will show unrevealed URI)
        const firstTokenId = supplyBefore.add(1);
        const tokenURI = await contract.tokenURI(firstTokenId);
        console.log("\n🖼️  Token #" + firstTokenId.toString() + " URI:");
        console.log("   ", tokenURI);
        
        // Check if token exists
        const exists = await contract.exists(firstTokenId);
        console.log("   Exists:", exists ? "✅" : "❌");
        
        // Get final balance
        const balanceAfter = await minter.getBalance();
        const spent = balanceBefore.sub(balanceAfter);
        
        console.log("\n💸 Transaction Cost:");
        console.log("├── Mint Price:", ethers.utils.formatEther(totalCost), "ETH");
        console.log("├── Gas Cost:", ethers.utils.formatEther(spent.sub(totalCost)), "ETH");
        console.log("├── Total Spent:", ethers.utils.formatEther(spent), "ETH");
        console.log("└── Balance after:", ethers.utils.formatEther(balanceAfter), "ETH");
        
        console.log("\n🔗 View on Etherscan:");
        console.log("   Contract:", `https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`);
        console.log("   Transaction:", `https://sepolia.etherscan.io/tx/${tx.hash}`);
        console.log("   Token:", `https://testnets.opensea.io/assets/sepolia/${CONTRACT_ADDRESS}/${firstTokenId}`);
        
        console.log("\n✨ Mint test completed successfully!");
        
    } catch (error) {
        console.error("\n❌ MINT FAILED!");
        console.error("Error:", error.message);
        
        if (error.reason) {
            console.error("Reason:", error.reason);
        }
        
        process.exit(1);
    }
}

main().catch((error) => {
    console.error("Script error:", error);
    process.exit(1);
});