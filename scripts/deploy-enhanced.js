const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting Enhanced Skunk Squad NFT deployment...");
  
  // Get deployment parameters from environment or use defaults
  const CONTRACT_NAME = process.env.CONTRACT_NAME || "Skunk Squad";
  const CONTRACT_SYMBOL = process.env.CONTRACT_SYMBOL || "SKUNK";
  // Use placeholder URIs for testnet - will be updated after artwork upload
  const BASE_URI = process.env.BASE_URI || "https://api.skunksquadnft.com/metadata/";
  const CONTRACT_URI = process.env.CONTRACT_URI || "https://api.skunksquadnft.com/contract.json";
  const UNREVEALED_URI = process.env.UNREVEALED_URI || "https://api.skunksquadnft.com/unrevealed.json";
  
  // Get deployer account
  const [deployer] = await ethers.getSigners();
  const royaltyRecipient = process.env.ROYALTY_RECIPIENT || deployer.address;
  const royaltyFee = 250; // 2.5% in basis points
  
  console.log("📋 Enhanced Deployment Configuration:");
  console.log("- Contract Name:", CONTRACT_NAME);
  console.log("- Contract Symbol:", CONTRACT_SYMBOL);
  console.log("- Base URI:", BASE_URI);
  console.log("- Contract URI:", CONTRACT_URI);
  console.log("- Unrevealed URI:", UNREVEALED_URI);
  console.log("- Deployer Address:", deployer.address);
  console.log("- Royalty Recipient:", royaltyRecipient);
  console.log("- Royalty Fee:", royaltyFee / 100, "%");
  console.log("- Network:", hre.network.name);
  
  // Check deployer balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("- Deployer Balance:", ethers.formatEther(balance), "ETH");
  
  if (balance < ethers.parseEther("0.1")) {
    console.warn("⚠️  Warning: Low deployer balance. Make sure you have enough ETH for deployment and gas fees.");
  }
  
  console.log("\n🔨 Deploying SkunkSquadNFTEnhanced contract...");
  
  // Get contract factory
  const SkunkSquadNFTEnhanced = await ethers.getContractFactory("SkunkSquadNFTEnhanced");
  
  // Deploy contract
  const contract = await SkunkSquadNFTEnhanced.deploy(
    CONTRACT_NAME,
    CONTRACT_SYMBOL,
    BASE_URI,
    CONTRACT_URI,
    UNREVEALED_URI,
    royaltyRecipient,
    royaltyFee
  );
  
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();
  
  console.log("✅ SkunkSquadNFTEnhanced deployed to:", contractAddress);
  console.log("📝 Transaction hash:", contract.deploymentTransaction().hash);
  
  // Wait for block confirmations on live networks
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("⏳ Waiting for block confirmations...");
    await contract.deploymentTransaction().wait(5);
    console.log("✅ Contract confirmed on blockchain");
  }
  
  // Verify enhanced contract configuration
  console.log("\n🔍 Verifying enhanced contract configuration...");
  try {
    const maxSupply = await contract.MAX_SUPPLY();
    const teamReserve = await contract.TEAM_RESERVE();
    const currentPhase = await contract.currentPhase();
    const owner = await contract.owner();
    const name = await contract.name();
    const symbol = await contract.symbol();
    
    console.log("- Name:", name);
    console.log("- Symbol:", symbol);
    console.log("- Max Supply:", maxSupply.toString());
    console.log("- Team Reserve:", teamReserve.toString());
    console.log("- Current Phase:", ["CLOSED", "PRESALE", "WHITELIST", "PUBLIC"][currentPhase]);
    console.log("- Owner:", owner);
    
    // Check phase configurations
    const presaleConfig = await contract.phaseConfigs(1); // PRESALE
    const whitelistConfig = await contract.phaseConfigs(2); // WHITELIST
    const publicConfig = await contract.phaseConfigs(3); // PUBLIC
    
    console.log("\n📊 Phase Configurations:");
    console.log("- Presale: Price:", ethers.formatEther(presaleConfig.price), "ETH, Max/Wallet:", presaleConfig.maxPerWallet.toString());
    console.log("- Whitelist: Price:", ethers.formatEther(whitelistConfig.price), "ETH, Max/Wallet:", whitelistConfig.maxPerWallet.toString());
    console.log("- Public: Price:", ethers.formatEther(publicConfig.price), "ETH, Max/Wallet:", publicConfig.maxPerWallet.toString());
    
    // Check royalty info
    const [royaltyReceiver, royaltyAmount] = await contract.royaltyInfo(1, ethers.parseEther("1"));
    console.log("\n💰 Royalty Configuration:");
    console.log("- Royalty Recipient:", royaltyReceiver);
    console.log("- Royalty Fee:", ethers.formatEther(royaltyAmount * 100n), "%");
    
    // Check security features
    const operatorFilteringEnabled = await contract.operatorFilteringEnabled();
    const emergencyPaused = await contract.emergencyPaused();
    const paused = await contract.paused();
    
    console.log("\n🛡️ Security Features:");
    console.log("- Operator Filtering:", operatorFilteringEnabled ? "Enabled" : "Disabled");
    console.log("- Emergency Paused:", emergencyPaused ? "Yes" : "No");
    console.log("- Contract Paused:", paused ? "Yes" : "No");
    
  } catch (error) {
    console.error("❌ Error verifying contract configuration:", error.message);
  }
  
  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    contractName: "SkunkSquadNFTEnhanced",
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
      royaltyRecipient: royaltyRecipient,
      royaltyFee: royaltyFee
    },
    features: [
      "Multi-phase minting",
      "Configurable pricing",
      "Enhanced security",
      "Operator filtering",
      "Emergency controls",
      "Split withdrawals",
      "Advanced analytics"
    ]
  };
  
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const deploymentFile = path.join(deploymentsDir, `${hre.network.name}-enhanced.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  
  console.log("📄 Enhanced deployment info saved to:", deploymentFile);
  
  // Contract verification instructions
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n🔐 Contract Verification:");
    console.log("Run the following command to verify the contract on Etherscan:");
    console.log(`npx hardhat verify --network ${hre.network.name} ${contractAddress} "${CONTRACT_NAME}" "${CONTRACT_SYMBOL}" "${BASE_URI}" "${CONTRACT_URI}" "${UNREVEALED_URI}" "${royaltyRecipient}" ${royaltyFee}`);
  }
  
  // Enhanced setup instructions
  console.log("\n🎯 Enhanced Setup Instructions:");
  console.log("1. Configure mint phases:");
  console.log("   - await contract.setMintPhase(1) // Enable PRESALE");
  console.log("   - await contract.setMerkleRoot(1, presaleMerkleRoot)");
  console.log("   - await contract.setMerkleRoot(2, whitelistMerkleRoot)");
  console.log("");
  console.log("2. Optional configurations:");
  console.log("   - await contract.setPhaseConfig(phase, price, maxPerWallet, maxPerTx)");
  console.log("   - await contract.setOperatorBlocked(operatorAddress, true)");
  console.log("");
  console.log("3. Test minting functions:");
  console.log("   - presaleMint(quantity, merkleProof)");
  console.log("   - whitelistMint(quantity, merkleProof)");
  console.log("   - publicMint(quantity)");
  console.log("");
  console.log("4. Use enhanced features:");
  console.log("   - withdrawSplit([addr1, addr2], [7000, 3000]) // 70%/30% split");
  console.log("   - getRemainingMints(userAddress)");
  console.log("   - getMintStats(userAddress)");
  
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
      console.error("❌ Enhanced deployment failed:", error);
      process.exit(1);
    });
}

module.exports = main;