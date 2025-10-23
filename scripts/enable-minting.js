const hre = require("hardhat");
const fs = require('fs');

async function main() {
    console.log("🔓 Enabling Minting...\n");

    // Load deployment info
    const deployment = JSON.parse(
        fs.readFileSync('deployments/simple-deployment.json', 'utf8')
    );
    
    console.log("Contract Address:", deployment.contractAddress);

    // Get contract
    const contract = await hre.ethers.getContractAt(
        "SkunkSquadNFTSimple",
        deployment.contractAddress
    );

    // Check current state
    const currentState = await contract.mintingEnabled();
    console.log("Current minting state:", currentState);

    if (currentState) {
        console.log("\n✅ Minting is already enabled!");
        return;
    }

    // Enable minting
    console.log("\nEnabling minting...");
    const tx = await contract.toggleMinting();
    console.log("Transaction hash:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed!");
    console.log("Gas used:", receipt.gasUsed.toString());

    // Verify
    const newState = await contract.mintingEnabled();
    console.log("\n📊 New minting state:", newState);
    
    if (newState) {
        console.log("\n🎉 Minting is now ENABLED!");
        console.log("Ready to mint NFTs!");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
