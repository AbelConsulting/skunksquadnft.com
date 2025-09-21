const { ethers } = require("hardhat");

async function main() {
  console.log("🔧 Updating Skunk Squad NFT pricing to 0.01 ETH...");
  
  // Contract address from deployment
  const CONTRACT_ADDRESS = "0x6BA18b88b64af8898bbb42262ED18EC13DC81315";
  
  // Get the deployed contract
  const [owner] = await ethers.getSigners();
  console.log("- Owner address:", owner.address);
  
  const SkunkSquadNFT = await ethers.getContractFactory("SkunkSquadNFTEnhanced");
  const contract = SkunkSquadNFT.attach(CONTRACT_ADDRESS);
  
  console.log("- Contract address:", CONTRACT_ADDRESS);
  console.log("- Network:", hre.network.name);
  
  // Check current owner
  const contractOwner = await contract.owner();
  console.log("- Contract owner:", contractOwner);
  
  if (owner.address.toLowerCase() !== contractOwner.toLowerCase()) {
    throw new Error("❌ Only contract owner can update pricing");
  }
  
  // New pricing: 0.01 ETH for all phases
  const newPrice = ethers.utils.parseEther("0.01");
  
  console.log("\n📊 Current Phase Configurations:");
  
  // Check current configurations
  const presaleConfig = await contract.phaseConfigs(1); // PRESALE
  const whitelistConfig = await contract.phaseConfigs(2); // WHITELIST
  const publicConfig = await contract.phaseConfigs(3); // PUBLIC
  
  console.log("- Presale: Price:", ethers.utils.formatEther(presaleConfig.price), "ETH, Max/Wallet:", presaleConfig.maxPerWallet.toString());
  console.log("- Whitelist: Price:", ethers.utils.formatEther(whitelistConfig.price), "ETH, Max/Wallet:", whitelistConfig.maxPerWallet.toString());
  console.log("- Public: Price:", ethers.utils.formatEther(publicConfig.price), "ETH, Max/Wallet:", publicConfig.maxPerWallet.toString());
  
  console.log("\n🔄 Updating all phases to 0.01 ETH...");
  
  // Update Presale pricing
  console.log("- Updating Presale phase...");
  const presaleTx = await contract.setPhaseConfig(
    1, // PRESALE
    newPrice, // 0.01 ETH
    presaleConfig.maxPerWallet, // Keep same wallet limit (2)
    presaleConfig.maxPerTx // Keep same transaction limit (2)
  );
  await presaleTx.wait();
  console.log("  ✅ Presale updated");
  
  // Update Whitelist pricing
  console.log("- Updating Whitelist phase...");
  const whitelistTx = await contract.setPhaseConfig(
    2, // WHITELIST
    newPrice, // 0.01 ETH
    whitelistConfig.maxPerWallet, // Keep same wallet limit (3)
    whitelistConfig.maxPerTx // Keep same transaction limit (3)
  );
  await whitelistTx.wait();
  console.log("  ✅ Whitelist updated");
  
  // Update Public pricing
  console.log("- Updating Public phase...");
  const publicTx = await contract.setPhaseConfig(
    3, // PUBLIC
    newPrice, // 0.01 ETH
    publicConfig.maxPerWallet, // Keep same wallet limit (10)
    publicConfig.maxPerTx // Keep same transaction limit (5)
  );
  await publicTx.wait();
  console.log("  ✅ Public updated");
  
  console.log("\n✅ All pricing updated successfully!");
  
  // Verify new configurations
  console.log("\n📊 New Phase Configurations:");
  const newPresaleConfig = await contract.phaseConfigs(1);
  const newWhitelistConfig = await contract.phaseConfigs(2);
  const newPublicConfig = await contract.phaseConfigs(3);
  
  console.log("- Presale: Price:", ethers.utils.formatEther(newPresaleConfig.price), "ETH, Max/Wallet:", newPresaleConfig.maxPerWallet.toString());
  console.log("- Whitelist: Price:", ethers.utils.formatEther(newWhitelistConfig.price), "ETH, Max/Wallet:", newWhitelistConfig.maxPerWallet.toString());
  console.log("- Public: Price:", ethers.utils.formatEther(newPublicConfig.price), "ETH, Max/Wallet:", newPublicConfig.maxPerWallet.toString());
  
  console.log("\n🎯 Pricing Update Summary:");
  console.log("- All phases now cost: 0.01 ETH");
  console.log("- Wallet limits unchanged");
  console.log("- Transaction limits unchanged");
  console.log("- Ready for testing at lower price point!");
  
  return {
    presaleTx: presaleTx.hash,
    whitelistTx: whitelistTx.hash,
    publicTx: publicTx.hash
  };
}

// Handle script execution
if (require.main === module) {
  main()
    .then((result) => {
      console.log("\n📝 Transaction Hashes:");
      console.log("- Presale update:", result.presaleTx);
      console.log("- Whitelist update:", result.whitelistTx);
      console.log("- Public update:", result.publicTx);
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Pricing update failed:", error);
      process.exit(1);
    });
}

module.exports = main;