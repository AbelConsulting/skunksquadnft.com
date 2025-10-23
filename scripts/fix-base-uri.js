const { ethers } = require("hardhat");

async function main() {
    const contractAddress = "0xBC00f05B9918B6B529d7edd33d89b4fB7016F6aF";
    const manifestTxId = "zSIUpHcbgIPHN9zu38dyX-cm7-9yoXevvQTpyhMq_TA";
    
    console.log("🦨 Fixing Base URI (removing /metadata/ suffix)...\n");
    console.log(`Contract: ${contractAddress}`);
    console.log(`Manifest TXID: ${manifestTxId}`);
    
    const [signer] = await ethers.getSigners();
    
    const minimalABI = [
        "function setBaseURI(string memory newBaseURI)"
    ];
    
    const contract = new ethers.Contract(contractAddress, minimalABI, signer);
    
    // Set base URI WITHOUT /metadata/ suffix
    // Contract will add tokenId + ".json", which matches manifest paths
    const newBaseURI = `ar://${manifestTxId}/`;
    
    console.log(`🆕 New Base URI: ${newBaseURI}`);
    console.log(`   Contract will create URIs like: ar://${manifestTxId}/1.json`);
    console.log(`   Manifest has paths like: 1.json ✓`);
    
    const tx = await contract.setBaseURI(newBaseURI);
    console.log(`\n📤 Transaction submitted: ${tx.hash}`);
    console.log("⏳ Waiting for confirmation...");
    
    const receipt = await tx.wait();
    
    if (receipt.status === 1) {
        console.log("✅ Base URI updated successfully!");
        console.log(`⛽ Gas used: ${receipt.gasUsed.toString()}`);
        console.log(`\n🔗 View on Etherscan:`);
        console.log(`   https://sepolia.etherscan.io/tx/${receipt.transactionHash}`);
        console.log(`\n✅ NOW TRY MINTING!`);
    } else {
        console.log("❌ Transaction failed!");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
