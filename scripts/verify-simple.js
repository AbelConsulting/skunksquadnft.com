const hre = require("hardhat");
const fs = require('fs');

async function main() {
    console.log("🔍 Verifying Contract on Etherscan...\n");

    // Load deployment info
    const deployment = JSON.parse(
        fs.readFileSync('deployments/simple-deployment.json', 'utf8')
    );
    
    const contractAddress = deployment.contractAddress;
    const baseURI = deployment.baseURI;

    console.log("Contract Address:", contractAddress);
    console.log("Network:", deployment.network);
    console.log("Base URI:", baseURI);
    console.log("\nVerifying...\n");

    try {
        await hre.run("verify:verify", {
            address: contractAddress,
            constructorArguments: [
                "Skunk Squad",
                "SKUNK",
                baseURI
            ],
        });

        console.log("\n✅ Contract verified successfully!");
        console.log(`🔗 View on Etherscan: https://sepolia.etherscan.io/address/${contractAddress}#code`);
        
    } catch (error) {
        if (error.message.includes("Already Verified")) {
            console.log("\n✅ Contract is already verified!");
            console.log(`🔗 View on Etherscan: https://sepolia.etherscan.io/address/${contractAddress}#code`);
        } else {
            console.error("\n❌ Verification failed:");
            console.error(error.message);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
