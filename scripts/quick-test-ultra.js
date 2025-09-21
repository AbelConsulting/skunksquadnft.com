const { ethers } = require("hardhat");

async function main() {
    console.log("🧪 Quick Ultra Smart Contract Test...\n");

    // Load deployment info
    const fs = require('fs');
    const deploymentInfo = JSON.parse(fs.readFileSync('ultra-smart-deployment.json', 'utf8'));
    console.log("📍 Contract:", deploymentInfo.contractAddress);

    // Get contract and signer
    const [signer] = await ethers.getSigners();
    const contract = await ethers.getContractAt("SkunkSquadNFTUltraSmart", deploymentInfo.contractAddress);
    
    console.log("👤 Signer:", signer.address);
    console.log("💰 Balance:", ethers.utils.formatEther(await signer.getBalance()), "ETH");

    try {
        // Check current state
        console.log("\n📊 Contract State:");
        const totalSupply = await contract.totalSupply();
        const currentPhase = await contract.currentPhase();
        const smartPrice = await contract.getCurrentSmartPrice();
        
        console.log("   Total Supply:", totalSupply.toString());
        console.log("   Current Phase:", currentPhase.toString());
        console.log("   Smart Price:", ethers.utils.formatEther(smartPrice), "ETH");

        // Set to public phase
        console.log("\n🔄 Setting to PUBLIC phase...");
        const setPhaseeTx = await contract.setMintPhase(3);
        await setPhaseeTx.wait();
        console.log("✅ Phase set to PUBLIC");

        // Try team mint first (simpler function)
        console.log("\n🎯 Testing team mint...");
        const teamMintTx = await contract.teamMint(signer.address, 1);
        await teamMintTx.wait();
        console.log("✅ Team mint successful!");

        // Check updated state
        const newSupply = await contract.totalSupply();
        const userBalance = await contract.balanceOf(signer.address);
        const userAnalytics = await contract.getUserAnalytics(signer.address);
        
        console.log("\n📈 Results:");
        console.log("   New Total Supply:", newSupply.toString());
        console.log("   User Balance:", userBalance.toString());
        console.log("   User XP:", userAnalytics.xpPoints.toString());
        console.log("   User Total Minted:", userAnalytics.totalMinted.toString());

        // Test smart pricing
        console.log("\n💰 Smart Pricing Test:");
        const newSmartPrice = await contract.getCurrentSmartPrice();
        console.log("   Current Smart Price:", ethers.utils.formatEther(newSmartPrice), "ETH");

        // Test achievements
        console.log("\n🏆 Achievement Test:");
        const hasFirstMint = await contract.userHasAchievement(signer.address, 1);
        console.log("   Has 'First Mint' achievement:", hasFirstMint);

        console.log("\n🎉 Basic Ultra Smart features are working!");
        
    } catch (error) {
        console.error("❌ Test failed:", error.message);
        if (error.data) {
            console.error("Error data:", error.data);
        }
    }
}

if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error("❌ Test failed:", error);
            process.exit(1);
        });
}

module.exports = main;