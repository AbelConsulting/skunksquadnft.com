const { ethers } = require("hardhat");

async function main() {
  console.log("🔧 Updating Skunk Squad NFT tiered pricing...");
  console.log("- Presale & Whitelist: 0.005 ETH");
  console.log("- Public: 0.01 ETH (unchanged)");
  
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
  
  // New pricing structure
  const presalePrice = ethers.utils.parseEther("0.005");  // 0.005 ETH
  const whitelistPrice = ethers.utils.parseEther("0.005"); // 0.005 ETH
  // Public stays at 0.01 ETH (already set)
  
  console.log("\n📊 Current Phase Configurations:");
  
  // Check current configurations
  const presaleConfig = await contract.phaseConfigs(1); // PRESALE
  const whitelistConfig = await contract.phaseConfigs(2); // WHITELIST
  const publicConfig = await contract.phaseConfigs(3); // PUBLIC
  
  console.log("- Presale: Price:", ethers.utils.formatEther(presaleConfig.price), "ETH, Max/Wallet:", presaleConfig.maxPerWallet.toString());
  console.log("- Whitelist: Price:", ethers.utils.formatEther(whitelistConfig.price), "ETH, Max/Wallet:", whitelistConfig.maxPerWallet.toString());
  console.log("- Public: Price:", ethers.utils.formatEther(publicConfig.price), "ETH, Max/Wallet:", publicConfig.maxPerWallet.toString());
  
  console.log("\n🔄 Updating presale and whitelist to 0.005 ETH...");
  
  // Update Presale pricing
  console.log("- Updating Presale phase to 0.005 ETH...");
  const presaleTx = await contract.setPhaseConfig(
    1, // PRESALE
    presalePrice, // 0.005 ETH
    presaleConfig.maxPerWallet, // Keep same wallet limit (2)
    presaleConfig.maxPerTx // Keep same transaction limit (2)
  );
  await presaleTx.wait();
  console.log("  ✅ Presale updated");
  
  // Update Whitelist pricing
  console.log("- Updating Whitelist phase to 0.005 ETH...");
  const whitelistTx = await contract.setPhaseConfig(
    2, // WHITELIST
    whitelistPrice, // 0.005 ETH
    whitelistConfig.maxPerWallet, // Keep same wallet limit (3)
    whitelistConfig.maxPerTx // Keep same transaction limit (3)
  );
  await whitelistTx.wait();
  console.log("  ✅ Whitelist updated");
  
  console.log("- Public phase unchanged (stays at 0.01 ETH)");
  
  console.log("\n✅ Tiered pricing updated successfully!");
  
  // Verify new configurations
  console.log("\n📊 New Tiered Phase Configurations:");
  const newPresaleConfig = await contract.phaseConfigs(1);
  const newWhitelistConfig = await contract.phaseConfigs(2);
  const newPublicConfig = await contract.phaseConfigs(3);
  
  console.log("- Presale: Price:", ethers.utils.formatEther(newPresaleConfig.price), "ETH, Max/Wallet:", newPresaleConfig.maxPerWallet.toString(), "💎 EARLY BIRD");
  console.log("- Whitelist: Price:", ethers.utils.formatEther(newWhitelistConfig.price), "ETH, Max/Wallet:", newWhitelistConfig.maxPerWallet.toString(), "🎫 WHITELIST");
  console.log("- Public: Price:", ethers.utils.formatEther(newPublicConfig.price), "ETH, Max/Wallet:", newPublicConfig.maxPerWallet.toString(), "🌍 PUBLIC");
  
  console.log("\n🎯 Tiered Pricing Strategy:");
  console.log("- Early supporters get 50% discount (0.005 vs 0.01 ETH)");
  console.log("- Creates incentive for presale and whitelist participation");
  console.log("- Public sale maintains standard pricing");
  console.log("- Perfect for testing tiered launch strategy!");
  
  return {
    presaleTx: presaleTx.hash,
    whitelistTx: whitelistTx.hash
  };
}

// Handle script execution
if (require.main === module) {
  main()
    .then((result) => {
      console.log("\n📝 Transaction Hashes:");
      console.log("- Presale update:", result.presaleTx);
      console.log("- Whitelist update:", result.whitelistTx);
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Tiered pricing update failed:", error);
      process.exit(1);
    });
}

module.exports = main;