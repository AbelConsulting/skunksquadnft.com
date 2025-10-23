const hre = require("hardhat");

async function main() {
    console.log("🚀 Deploying SkunkSquadNFT Simple Contract...\n");

    // Get deployer
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying from:", deployer.address);
    
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Balance:", hre.ethers.utils.formatEther(balance), "ETH\n");

    // Contract parameters
    const NAME = "Skunk Squad";
    const SYMBOL = "SKUNK";
    const BASE_URI = "ar://zSIUpHcbgIPHN9zu38dyX-cm7-9yoXevvQTpyhMq_TA/";

    console.log("Contract Configuration:");
    console.log("- Name:", NAME);
    console.log("- Symbol:", SYMBOL);
    console.log("- Base URI:", BASE_URI);
    console.log("- Max Supply: 10,000");
    console.log("- Mint Price: 0.01 ETH");
    console.log("- Max Per Wallet: 20");
    console.log("- Max Per TX: 10\n");

    // Deploy
    console.log("Deploying contract...");
    const SkunkSquadNFT = await hre.ethers.getContractFactory("SkunkSquadNFTSimple");
    const contract = await SkunkSquadNFT.deploy(NAME, SYMBOL, BASE_URI);
    
    await contract.deployed();
    const address = contract.address;

    console.log("\n✅ Contract deployed successfully!");
    console.log("📍 Contract Address:", address);
    console.log("\n🔗 Etherscan:", `https://sepolia.etherscan.io/address/${address}`);

    // Wait for confirmations
    console.log("\n⏳ Waiting for block confirmations...");
    await contract.deployTransaction.wait(5);
    
    console.log("✅ Confirmed!\n");

    // Verify initial state
    console.log("📊 Contract State:");
    const totalSupply = await contract.totalSupply();
    const mintingEnabled = await contract.mintingEnabled();
    const mintPrice = await contract.mintPrice();
    
    console.log("- Total Supply:", totalSupply.toString());
    console.log("- Minting Enabled:", mintingEnabled);
    console.log("- Mint Price:", hre.ethers.utils.formatEther(mintPrice), "ETH");

    console.log("\n📝 Next Steps:");
    console.log("1. Verify contract on Etherscan");
    console.log("2. Run: npx hardhat run scripts/enable-minting.js --network sepolia");
    console.log("3. Run: npx hardhat run scripts/test-mint-simple.js --network sepolia");

    // Save deployment info
    const fs = require('fs');
    const deploymentInfo = {
        network: "sepolia",
        contractAddress: address,
        deployer: deployer.address,
        deploymentTime: new Date().toISOString(),
        baseURI: BASE_URI,
        txHash: contract.deployTransaction.hash
    };
    
    fs.writeFileSync(
        'deployments/simple-deployment.json',
        JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log("\n💾 Deployment info saved to deployments/simple-deployment.json");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
