const { ethers } = require("hardhat");

async function main() {
  console.log("⛽ SkunkSquad NFT Gas Analysis...\n");
  
  // Contract address from your test
  const CONTRACT_ADDRESS = "0x6BA18b88b64af8898bbb42262ED18EC13DC81315";
  
  const [owner, user1, user2] = await ethers.getSigners();
  console.log("📋 Test Setup:");
  console.log("├── Contract:", CONTRACT_ADDRESS);
  console.log("├── Network:", hre.network.name);
  console.log("├── Owner:", owner.address);
  console.log("└── Test Users:", user1.address, user2.address);
  
  // Get contract instance
  const SkunkSquadNFT = await ethers.getContractFactory("SkunkSquadNFTEnhanced");
  const contract = SkunkSquadNFT.attach(CONTRACT_ADDRESS);
  
  // Get current gas price
  const gasPrice = await ethers.provider.getGasPrice();
  console.log("\n⛽ Current Gas Price:", ethers.formatUnits(gasPrice, "gwei"), "gwei");
  
  const gasResults = {};
  
  // =============================================================
  //                    DEPLOYMENT GAS COSTS
  // =============================================================
  
  console.log("\n🚀 DEPLOYMENT GAS ANALYSIS:");
  
  // Estimate deployment gas
  const SkunkSquadFactory = await ethers.getContractFactory("SkunkSquadNFTEnhanced");
  const deploymentData = SkunkSquadFactory.interface.encodeDeploy([
    "SkunkSquad NFT",
    "SKUNK", 
    "https://metadata.test/",
    "https://contract.test/",
    "https://unrevealed.test/",
    owner.address,
    250
  ]);
  
  try {
    const deploymentGas = await ethers.provider.estimateGas({
      data: deploymentData
    });
    gasResults.deployment = deploymentGas;
    const deploymentCost = deploymentGas * gasPrice;
    
    console.log("├── Deployment Gas:", deploymentGas.toString());
    console.log("├── Deployment Cost:", ethers.formatEther(deploymentCost), "ETH");
    console.log("└── USD Cost (ETH @ $2500):", "$" + (parseFloat(ethers.formatEther(deploymentCost)) * 2500).toFixed(2));
  } catch (error) {
    console.log("❌ Deployment estimation failed:", error.message);
  }
  
  // =============================================================
  //                    MINTING GAS COSTS
  // =============================================================
  
  console.log("\n🦨 MINTING GAS ANALYSIS:");
  
  // Ensure we're in public phase
  try {
    await contract.setMintPhase(3);
    console.log("✅ Set to PUBLIC phase for testing");
  } catch (error) {
    console.log("ℹ️  Phase already set or not owner");
  }
  
  // Test 1: Single mint gas
  try {
    const singleMintGas = await contract.publicMint.estimateGas(1, {
      value: ethers.parseEther("0.01")
    });
    gasResults.singleMint = singleMintGas;
    const singleMintCost = singleMintGas * gasPrice;
    
    console.log("├── Single Mint Gas:", singleMintGas.toString());
    console.log("├── Single Mint Cost:", ethers.formatEther(singleMintCost), "ETH");
    console.log("└── USD Cost:", "$" + (parseFloat(ethers.formatEther(singleMintCost)) * 2500).toFixed(2));
  } catch (error) {
    console.log("❌ Single mint estimation failed:", error.message);
  }
  
  // Test 2: Batch mint gas (5 NFTs)
  try {
    const batchMintGas = await contract.publicMint.estimateGas(5, {
      value: ethers.parseEther("0.05")
    });
    gasResults.batchMint5 = batchMintGas;
    const batchMintCost = batchMintGas * gasPrice;
    
    console.log("├── Batch Mint (5) Gas:", batchMintGas.toString());
    console.log("├── Batch Mint (5) Cost:", ethers.formatEther(batchMintCost), "ETH");
    console.log("├── Gas per NFT:", (batchMintGas / 5n).toString());
    console.log("└── USD Cost:", "$" + (parseFloat(ethers.formatEther(batchMintCost)) * 2500).toFixed(2));
  } catch (error) {
    console.log("❌ Batch mint estimation failed:", error.message);
  }
  
  // Test 3: Max mint gas (10 NFTs)
  try {
    const maxMintGas = await contract.publicMint.estimateGas(10, {
      value: ethers.parseEther("0.10")
    });
    gasResults.maxMint = maxMintGas;
    const maxMintCost = maxMintGas * gasPrice;
    
    console.log("├── Max Mint (10) Gas:", maxMintGas.toString());
    console.log("├── Max Mint (10) Cost:", ethers.formatEther(maxMintCost), "ETH");
    console.log("├── Gas per NFT:", (maxMintGas / 10n).toString());
    console.log("└── USD Cost:", "$" + (parseFloat(ethers.formatEther(maxMintCost)) * 2500).toFixed(2));
  } catch (error) {
    console.log("❌ Max mint estimation failed:", error.message);
  }
  
  // =============================================================
  //                    ADMIN FUNCTIONS GAS
  // =============================================================
  
  console.log("\n👑 ADMIN FUNCTIONS GAS ANALYSIS:");
  
  // Test team mint
  try {
    const teamMintGas = await contract.teamMint.estimateGas(user1.address, 1);
    gasResults.teamMint = teamMintGas;
    const teamMintCost = teamMintGas * gasPrice;
    
    console.log("├── Team Mint Gas:", teamMintGas.toString());
    console.log("├── Team Mint Cost:", ethers.formatEther(teamMintCost), "ETH");
    console.log("└── USD Cost:", "$" + (parseFloat(ethers.formatEther(teamMintCost)) * 2500).toFixed(2));
  } catch (error) {
    console.log("❌ Team mint estimation failed:", error.message);
  }
  
  // Test phase change
  try {
    const phaseChangeGas = await contract.setMintPhase.estimateGas(1);
    gasResults.phaseChange = phaseChangeGas;
    const phaseChangeCost = phaseChangeGas * gasPrice;
    
    console.log("├── Phase Change Gas:", phaseChangeGas.toString());
    console.log("├── Phase Change Cost:", ethers.formatEther(phaseChangeCost), "ETH");
    console.log("└── USD Cost:", "$" + (parseFloat(ethers.formatEther(phaseChangeCost)) * 2500).toFixed(2));
  } catch (error) {
    console.log("❌ Phase change estimation failed:", error.message);
  }
  
  // Test base URI update
  try {
    const setBaseURIGas = await contract.setBaseURI.estimateGas("https://newuri.test/");
    gasResults.setBaseURI = setBaseURIGas;
    const setBaseURICost = setBaseURIGas * gasPrice;
    
    console.log("├── Set Base URI Gas:", setBaseURIGas.toString());
    console.log("├── Set Base URI Cost:", ethers.formatEther(setBaseURICost), "ETH");
    console.log("└── USD Cost:", "$" + (parseFloat(ethers.formatEther(setBaseURICost)) * 2500).toFixed(2));
  } catch (error) {
    console.log("❌ Set Base URI estimation failed:", error.message);
  }
  
  // =============================================================
  //                    VIEW FUNCTIONS GAS
  // =============================================================
  
  console.log("\n👀 VIEW FUNCTIONS GAS ANALYSIS:");
  
  // These should be very low gas (read-only)
  try {
    const tokenURIGas = await contract.tokenURI.estimateGas(1);
    gasResults.tokenURI = tokenURIGas;
    console.log("├── Token URI Gas:", tokenURIGas.toString());
  } catch (error) {
    console.log("❌ Token URI estimation failed:", error.message);
  }
  
  try {
    const balanceOfGas = await contract.balanceOf.estimateGas(owner.address);
    gasResults.balanceOf = balanceOfGas;
    console.log("├── Balance Of Gas:", balanceOfGas.toString());
  } catch (error) {
    console.log("❌ Balance Of estimation failed:", error.message);
  }
  
  try {
    const remainingSupplyGas = await contract.getRemainingSupply.estimateGas();
    gasResults.remainingSupply = remainingSupplyGas;
    console.log("└── Remaining Supply Gas:", remainingSupplyGas.toString());
  } catch (error) {
    console.log("❌ Remaining Supply estimation failed:", error.message);
  }
  
  // =============================================================
  //                    GAS EFFICIENCY ANALYSIS
  // =============================================================
  
  console.log("\n📊 GAS EFFICIENCY ANALYSIS:");
  
  if (gasResults.singleMint && gasResults.batchMint5 && gasResults.maxMint) {
    const single = gasResults.singleMint;
    const batch5 = gasResults.batchMint5;
    const max = gasResults.maxMint;
    
    const gasPerNFTSingle = single;
    const gasPerNFTBatch5 = batch5 / 5n;
    const gasPerNFTMax = max / 10n;
    
    console.log("├── Gas per NFT (single):", gasPerNFTSingle.toString());
    console.log("├── Gas per NFT (batch 5):", gasPerNFTBatch5.toString());
    console.log("├── Gas per NFT (max 10):", gasPerNFTMax.toString());
    
    const savings5 = ((gasPerNFTSingle - gasPerNFTBatch5) * 100n) / gasPerNFTSingle;
    const savings10 = ((gasPerNFTSingle - gasPerNFTMax) * 100n) / gasPerNFTSingle;
    
    console.log("├── Batch 5 savings:", savings5.toString() + "%");
    console.log("└── Batch 10 savings:", savings10.toString() + "%");
  }
  
  // =============================================================
  //                    COST COMPARISON TABLE
  // =============================================================
  
  console.log("\n💰 COST COMPARISON (ETH @ $2500):");
  console.log("╔═══════════════════════════════════════════════════════════╗");
  console.log("║                    OPERATION COSTS                       ║");
  console.log("╠═══════════════════════════════════════════════════════════╣");
  
  for (const [operation, gas] of Object.entries(gasResults)) {
    if (gas) {
      const cost = gas * gasPrice;
      const ethCost = parseFloat(ethers.formatEther(cost));
      const usdCost = ethCost * 2500;
      
      const opName = operation.charAt(0).toUpperCase() + operation.slice(1);
      console.log(`║ ${opName.padEnd(20)} │ ${gas.toString().padStart(8)} gas │ $${usdCost.toFixed(2).padStart(6)} ║`);
    }
  }
  console.log("╚═══════════════════════════════════════════════════════════╝");
  
  // =============================================================
  //                    RECOMMENDATIONS
  // =============================================================
  
  console.log("\n💡 GAS OPTIMIZATION RECOMMENDATIONS:");
  
  if (gasResults.singleMint && gasResults.maxMint) {
    const single = Number(gasResults.singleMint);
    const max = Number(gasResults.maxMint);
    const perNFTMax = max / 10;
    
    if (single > perNFTMax * 1.5) {
      console.log("✅ Batch minting is highly recommended (significant gas savings)");
    } else {
      console.log("ℹ️  Batch minting provides moderate gas savings");
    }
  }
  
  if (gasResults.deployment) {
    const deploymentCost = Number(gasResults.deployment) * Number(gasPrice);
    const ethCost = parseFloat(ethers.formatEther(deploymentCost.toString()));
    
    if (ethCost > 0.05) {
      console.log("⚠️  High deployment cost - consider optimizing contract size");
    } else {
      console.log("✅ Reasonable deployment cost");
    }
  }
  
  console.log("📋 Best Practices:");
  console.log("├── Use batch minting for multiple NFTs");
  console.log("├── Deploy during low gas periods");
  console.log("├── Consider gas price when setting mint price");
  console.log("└── Monitor gas costs for admin operations");
  
  return gasResults;
}

// Handle script execution
if (require.main === module) {
  main()
    .then((results) => {
      console.log("\n✅ Gas analysis completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Gas analysis failed:", error);
      process.exit(1);
    });
}

module.exports = main;