const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting Skunk Squad NFT deployment...");
  
  // Get deployment parameters from environment or use defaults
  const CONTRACT_NAME = process.env.CONTRACT_NAME || "Skunk Squad";
  const CONTRACT_SYMBOL = process.env.CONTRACT_SYMBOL || "SKUNK";
  const BASE_URI = process.env.BASE_URI || "https://metadata.skunksquadnft.com/";
  const CONTRACT_URI = process.env.CONTRACT_URI || "https://metadata.skunksquadnft.com/contract.json";
  const UNREVEALED_URI = process.env.UNREVEALED_URI || "https://metadata.skunksquadnft.com/unrevealed.json";
  
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  const royaltyRecipient = process.env.ROYALTY_RECIPIENT || deployer.address;
  
  console.log("📋 Deployment Configuration:");
  console.log("- Contract Name:", CONTRACT_NAME);
  console.log("- Contract Symbol:", CONTRACT_SYMBOL);
  console.log("- Base URI:", BASE_URI);
  console.log("- Contract URI:", CONTRACT_URI);
  console.log("- Unrevealed URI:", UNREVEALED_URI);
  console.log("- Deployer Address:", deployer.address);
  console.log("- Royalty Recipient:", royaltyRecipient);
  console.log("- Network:", hre.network.name);
  
  // Check deployer balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("- Deployer Balance:", ethers.formatEther(balance), "ETH");
  
  if (balance < ethers.parseEther("0.1")) {
    console.warn("⚠️  Warning: Low deployer balance. Make sure you have enough ETH for deployment and gas fees.");
  }
  
  console.log("\n🔨 Deploying SkunkSquadNFT contract...");
  
  // Get contract factory
  const SkunkSquadNFT = await ethers.getContractFactory("SkunkSquadNFT");
  
  // Deploy contract
  const contract = await SkunkSquadNFT.deploy(
    CONTRACT_NAME,
    CONTRACT_SYMBOL,
    BASE_URI,
    CONTRACT_URI,
    UNREVEALED_URI,
    royaltyRecipient
  );
  
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  
  console.log("✅ SkunkSquadNFT deployed to:", contractAddress);
  console.log("📝 Transaction hash:", contract.deploymentTransaction().hash);
  
  // Wait for block confirmations on live networks
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("⏳ Waiting for block confirmations...");
    await contract.deploymentTransaction().wait(5);
    console.log("✅ Contract confirmed on blockchain");
  }
  
  // Verify contract configuration
  console.log("\n🔍 Verifying contract configuration...");
  try {
    const maxSupply = await contract.MAX_SUPPLY();
    const mintPrice = await contract.MINT_PRICE();
    const maxPerTx = await contract.MAX_PER_TX();
    const maxPerWalletWhitelist = await contract.MAX_PER_WALLET_WHITELIST();
    const maxPerWalletPublic = await contract.MAX_PER_WALLET_PUBLIC();
    const owner = await contract.owner();
    const name = await contract.name();
    const symbol = await contract.symbol();
    
    console.log("- Name:", name);
    console.log("- Symbol:", symbol);
    console.log("- Max Supply:", maxSupply.toString());
    console.log("- Mint Price:", ethers.formatEther(mintPrice), "ETH");
    console.log("- Max Per Transaction:", maxPerTx.toString());
    console.log("- Max Per Wallet (Whitelist):", maxPerWalletWhitelist.toString());
    console.log("- Max Per Wallet (Public):", maxPerWalletPublic.toString());
    console.log("- Owner:", owner);
    
    // Check royalty info
    const [royaltyReceiver, royaltyAmount] = await contract.royaltyInfo(1, ethers.parseEther("1"));
    console.log("- Royalty Recipient:", royaltyReceiver);
    console.log("- Royalty Fee:", ethers.formatEther(royaltyAmount * 100n), "%");
    
  } catch (error) {
    console.error("❌ Error verifying contract configuration:", error.message);
  }
  
  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    deployerAddress: deployer.address,
    deploymentTransaction: contract.deploymentTransaction().hash,
    deploymentBlock: await ethers.provider.getBlockNumber(),
    timestamp: new Date().toISOString(),
    configuration: {
      name: CONTRACT_NAME,
      symbol: CONTRACT_SYMBOL,
      baseURI: BASE_URI,
      contractURI: CONTRACT_URI,
      unrevealedURI: UNREVEALED_URI,
      royaltyRecipient: royaltyRecipient
    }
  };
  
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const deploymentFile = path.join(deploymentsDir, `${hre.network.name}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("📄 Deployment info saved to:", deploymentFile);
  
  // Contract verification instructions
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n🔐 Contract Verification:");
    console.log("Run the following command to verify the contract on Etherscan:");
    console.log(`npx hardhat verify --network ${hre.network.name} ${contractAddress} "${CONTRACT_NAME}" "${CONTRACT_SYMBOL}" "${BASE_URI}" "${CONTRACT_URI}" "${UNREVEALED_URI}" "${royaltyRecipient}"`);
  }
  
  // Next steps
  console.log("\n🎯 Next Steps:");
  console.log("1. Set up metadata hosting at:", BASE_URI);
  console.log("2. Generate whitelist merkle tree and set merkle root");
  console.log("3. Configure mint phases (whitelist/public)");
  console.log("4. Upload unrevealed metadata to:", UNREVEALED_URI);
  console.log("5. Test minting functions");
  
  return {
    contract,
    contractAddress,
    deploymentInfo
  };
}

// Handle script execution
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Deployment failed:", error);
      process.exit(1);
    });
}

module.exports = main;