const { ethers } = require("hardhat");

async function main() {
    const contractAddress = "0xBC00f05B9918B6B529d7edd33d89b4fB7016F6aF";
    
    console.log("🔍 Verifying Base URI Update...\n");
    console.log(`Contract: ${contractAddress}`);
    console.log(`Transaction: 0xf0af88277ebef81f28881fa5cd4a5def797116a4986bcbdfaec20ef9f06eefa7\n`);
    
    // Get transaction receipt
    const provider = ethers.provider;
    const receipt = await provider.getTransactionReceipt("0xf0af88277ebef81f28881fa5cd4a5def797116a4986bcbdfaec20ef9f06eefa7");
    
    if (receipt) {
        console.log("✅ Transaction Status:", receipt.status === 1 ? "SUCCESS" : "FAILED");
        console.log("⛽ Gas Used:", receipt.gasUsed.toString());
        console.log("📦 Block Number:", receipt.blockNumber);
        
        if (receipt.status === 1) {
            console.log("\n✅ BASE URI SUCCESSFULLY UPDATED!");
            console.log("🔗 New Base URI: ar://bAFyRZCSkZo-uiVIviMfq4AfN6eV52YNaHWLd1L25Zs/metadata/");
            console.log("\n📋 Your NFT metadata will now be accessed as:");
            console.log("   Token #1: ar://bAFyRZCSkZo-uiVIviMfq4AfN6eV52YNaHWLd1L25Zs/metadata/1");
            console.log("   Token #2: ar://bAFyRZCSkZo-uiVIviMfq4AfN6eV52YNaHWLd1L25Zs/metadata/2");
            console.log("   ...");
            console.log("\n🌐 View on Sepolia Etherscan:");
            console.log(`   https://sepolia.etherscan.io/tx/${receipt.transactionHash}`);
        }
    } else {
        console.log("⚠️ Transaction not found yet - may still be pending");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
