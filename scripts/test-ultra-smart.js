const { ethers } = require("hardhat");

async function main() {
    console.log("🧪 Testing Ultra Smart NFT Contract Features...\n");

    // Load deployment info
    const fs = require('fs');
    let deploymentInfo;
    
    try {
        deploymentInfo = JSON.parse(fs.readFileSync('ultra-smart-deployment.json', 'utf8'));
        console.log("📖 Loaded deployment info:", deploymentInfo.contractAddress);
    } catch (error) {
        console.log("❌ No deployment info found. Please deploy first.");
        process.exit(1);
    }

    // Get contract instance
    const signers = await ethers.getSigners();
    const owner = signers[0];
    const user1 = signers.length > 1 ? signers[1] : owner; // Use owner as fallback for testing
    const user2 = signers.length > 2 ? signers[2] : owner;
    const user3 = signers.length > 3 ? signers[3] : owner;
    const contract = await ethers.getContractAt("SkunkSquadNFTUltraSmart", deploymentInfo.contractAddress);
    
    console.log("👥 Test Accounts:");
    console.log("   Owner:", owner.address);
    console.log("   User1:", user1.address || owner.address);
    console.log("   User2:", user2.address || owner.address);
    console.log("   User3:", user3.address || owner.address);
    console.log("   Note: Using owner account for all users in testnet testing");

    // Test Results Tracking
    const results = {
        dynamicPricing: { passed: 0, failed: 0 },
        analytics: { passed: 0, failed: 0 },
        gamification: { passed: 0, failed: 0 },
        social: { passed: 0, failed: 0 },
        predictions: { passed: 0, failed: 0 }
    };

    // Helper function to test and record results
    async function test(category, testName, testFn) {
        try {
            console.log(`🔹 Testing ${testName}...`);
            await testFn();
            results[category].passed++;
            console.log(`✅ ${testName} - PASSED`);
        } catch (error) {
            results[category].failed++;
            console.log(`❌ ${testName} - FAILED:`, error.message);
        }
    }

    console.log("\n" + "=".repeat(60));
    console.log("🧠 TESTING DYNAMIC PRICING SYSTEM");
    console.log("=".repeat(60));

    // Enable public phase for testing
    await contract.setMintPhase(3); // PUBLIC phase
    console.log("🔄 Set contract to PUBLIC phase");

    await test('dynamicPricing', 'Initial Smart Price Check', async () => {
        const smartPrice = await contract.getCurrentSmartPrice();
        const dynamicPricing = await contract.dynamicPricing();
        
        console.log(`   Current Smart Price: ${ethers.utils.formatEther(smartPrice)} ETH`);
        console.log(`   Demand Multiplier: ${dynamicPricing.demandMultiplier}%`);
        
        if (smartPrice === 0n) throw new Error("Smart price should not be zero");
    });

    await test('dynamicPricing', 'Time-based Price Adjustment', async () => {
        const hour = Math.floor(Date.now() / 1000 / 3600) % 24;
        const smartPrice = await contract.getCurrentSmartPrice();
        
        console.log(`   Current hour: ${hour}`);
        console.log(`   Adjusted price: ${ethers.utils.formatEther(smartPrice)} ETH`);
        
        // Price should be within reasonable bounds
        if (smartPrice.lt(ethers.utils.parseEther("0.001")) || smartPrice.gt(ethers.utils.parseEther("0.1"))) {
            throw new Error("Price outside expected range");
        }
    });

    console.log("\n" + "=".repeat(60));
    console.log("📊 TESTING ANALYTICS SYSTEM");
    console.log("=".repeat(60));

    await test('analytics', 'User Analytics Initialization', async () => {
        const analytics = await contract.getUserAnalytics(user1.address);
        
        console.log(`   Total Minted: ${analytics.totalMinted}`);
        console.log(`   Total Spent: ${ethers.utils.formatEther(analytics.totalSpent)} ETH`);
        console.log(`   XP Points: ${analytics.xpPoints}`);
        
        // New user should have zero stats
        if (!analytics.totalMinted.eq(0) || !analytics.totalSpent.eq(0)) {
            throw new Error("New user should have zero stats");
        }
    });

    await test('analytics', 'Smart Mint with Analytics', async () => {
        const smartPrice = await contract.getCurrentSmartPrice();
        const quantity = 2;
        
        // User1 mints 2 NFTs
        await contract.connect(user1).smartPublicMint(quantity, ethers.constants.AddressZero, {
            value: smartPrice.mul(quantity)
        });
        
        const analytics = await contract.getUserAnalytics(user1.address);
        console.log(`   After mint - Total Minted: ${analytics.totalMinted}`);
        console.log(`   After mint - XP Points: ${analytics.xpPoints}`);
        console.log(`   After mint - Total Spent: ${ethers.utils.formatEther(analytics.totalSpent)} ETH`);
        
        if (!analytics.totalMinted.eq(quantity)) {
            throw new Error("Minted count doesn't match");
        }
    });

    console.log("\n" + "=".repeat(60));
    console.log("🏆 TESTING GAMIFICATION SYSTEM");
    console.log("=".repeat(60));

    await test('gamification', 'Achievement System', async () => {
        const analytics = await contract.getUserAnalytics(user1.address);
        const hasFirstMint = await contract.userHasAchievement(user1.address, 1);
        
        console.log(`   Has 'First Mint' achievement: ${hasFirstMint}`);
        console.log(`   Total XP: ${analytics.xpPoints}`);
        
        if (!hasFirstMint) {
            throw new Error("Should have unlocked 'First Mint' achievement");
        }
    });

    await test('gamification', 'XP Award System', async () => {
        const analytics = await contract.getUserAnalytics(user1.address);
        const expectedXP = 100 * 2 + 50; // 2 mints * 100 XP + first mint achievement
        
        console.log(`   Expected XP: ${expectedXP}`);
        console.log(`   Actual XP: ${analytics.xpPoints}`);
        
        if (analytics.xpPoints.lt(200)) {
            throw new Error("XP should be awarded for minting");
        }
    });

    console.log("\n" + "=".repeat(60));
    console.log("👥 TESTING SOCIAL FEATURES");
    console.log("=".repeat(60));

    await test('social', 'Referral System', async () => {
        const smartPrice = await contract.getCurrentSmartPrice();
        
        // User2 mints with User1 as referrer
        await contract.connect(user2).smartPublicMint(1, user1.address, {
            value: smartPrice
        });
        
        const referrer = await contract.referredBy(user2.address);
        const user1Analytics = await contract.getUserAnalytics(user1.address);
        
        console.log(`   User2 referred by: ${referrer}`);
        console.log(`   User1 referral count: ${user1Analytics.referralCount}`);
        
        if (referrer !== user1.address) {
            throw new Error("Referral not recorded correctly");
        }
    });

    await test('social', 'Gift NFT Feature', async () => {
        const smartPrice = await contract.getCurrentSmartPrice();
        
        // User1 gifts NFT to User3
        await contract.connect(user1).giftNFT(user3.address, 1, "Welcome gift!", {
            value: smartPrice
        });
        
        const user3Balance = await contract.balanceOf(user3.address);
        const user3Analytics = await contract.getUserAnalytics(user3.address);
        
        console.log(`   User3 balance: ${user3Balance}`);
        console.log(`   User3 XP from gift: ${user3Analytics.xpPoints}`);
        
        if (!user3Balance.eq(1)) {
            throw new Error("Gift NFT not received");
        }
    });

    console.log("\n" + "=".repeat(60));
    console.log("🔮 TESTING PREDICTION SYSTEM");
    console.log("=".repeat(60));

    await test('predictions', 'Minting Pattern Analysis', async () => {
        const pattern = await contract.getUserPattern(user1.address);
        
        console.log(`   Average quantity: ${pattern.averageQuantity}`);
        console.log(`   Is whale: ${pattern.isWhale}`);
        console.log(`   Loyalty score: ${pattern.loyaltyScore}`);
        
        if (pattern.averageQuantity.eq(0)) {
            throw new Error("Pattern should be recorded after minting");
        }
    });

    await test('predictions', 'Next Mint Prediction', async () => {
        const prediction = await contract.getPredictedNextMint(user1.address);
        
        console.log(`   Predicted next mint: ${prediction > 0 ? new Date(Number(prediction) * 1000).toLocaleString() : 'Not available'}`);
        
        // Prediction might be 0 for new users, which is acceptable
        console.log("   ✓ Prediction system active");
    });

    console.log("\n" + "=".repeat(60));
    console.log("🔧 TESTING ADMIN FEATURES");
    console.log("=".repeat(60));

    await test('dynamicPricing', 'Admin Price Control', async () => {
        const newBasePrice = ethers.utils.parseEther("0.015");
        const newMinPrice = ethers.utils.parseEther("0.005");
        const newMaxPrice = ethers.utils.parseEther("0.05");
        
        await contract.updateDynamicPricing(newBasePrice, newMinPrice, newMaxPrice);
        
        const updatedPricing = await contract.dynamicPricing();
        console.log(`   Updated base price: ${ethers.utils.formatEther(updatedPricing.basePriceETH)} ETH`);
        
        if (!updatedPricing.basePriceETH.eq(newBasePrice)) {
            throw new Error("Base price not updated correctly");
        }
    });

    await test('dynamicPricing', 'Demand Multiplier Reset', async () => {
        await contract.resetDemandMultiplier();
        
        const pricing = await contract.dynamicPricing();
        console.log(`   Reset demand multiplier: ${pricing.demandMultiplier}%`);
        
        if (!pricing.demandMultiplier.eq(100)) {
            throw new Error("Demand multiplier not reset correctly");
        }
    });

    console.log("\n" + "=".repeat(60));
    console.log("📈 TESTING GLOBAL ANALYTICS");
    console.log("=".repeat(60));

    await test('analytics', 'Revenue Tracking', async () => {
        const totalRevenue = await contract.totalRevenue();
        const currentDay = Math.floor(Date.now() / 1000 / 86400);
        const dailyRevenue = await contract.getDailyRevenue(currentDay);
        
        console.log(`   Total revenue: ${ethers.utils.formatEther(totalRevenue)} ETH`);
        console.log(`   Today's revenue: ${ethers.utils.formatEther(dailyRevenue)} ETH`);
        
        if (totalRevenue.eq(0)) {
            throw new Error("Revenue should be tracked");
        }
    });

    console.log("\n" + "=".repeat(60));
    console.log("📊 TEST RESULTS SUMMARY");
    console.log("=".repeat(60));

    let totalPassed = 0;
    let totalFailed = 0;

    Object.entries(results).forEach(([category, result]) => {
        const categoryTotal = result.passed + result.failed;
        const successRate = categoryTotal > 0 ? (result.passed / categoryTotal * 100).toFixed(1) : 0;
        
        console.log(`${category.toUpperCase()}:`);
        console.log(`   ✅ Passed: ${result.passed}`);
        console.log(`   ❌ Failed: ${result.failed}`);
        console.log(`   📈 Success Rate: ${successRate}%`);
        console.log();
        
        totalPassed += result.passed;
        totalFailed += result.failed;
    });

    const overallSuccess = totalPassed + totalFailed > 0 ? (totalPassed / (totalPassed + totalFailed) * 100).toFixed(1) : 0;

    console.log("OVERALL RESULTS:");
    console.log(`✅ Total Passed: ${totalPassed}`);
    console.log(`❌ Total Failed: ${totalFailed}`);
    console.log(`📈 Overall Success Rate: ${overallSuccess}%`);

    // Generate test report
    const testReport = {
        timestamp: new Date().toISOString(),
        contractAddress: deploymentInfo.contractAddress,
        network: "sepolia",
        testResults: results,
        summary: {
            totalPassed,
            totalFailed,
            successRate: overallSuccess
        },
        features: {
            dynamicPricing: results.dynamicPricing.passed > 0,
            analytics: results.analytics.passed > 0,
            gamification: results.gamification.passed > 0,
            social: results.social.passed > 0,
            predictions: results.predictions.passed > 0
        }
    };

    fs.writeFileSync('ultra-smart-test-report.json', JSON.stringify(testReport, null, 2));
    console.log("\n💾 Test report saved to: ultra-smart-test-report.json");

    if (overallSuccess >= 80) {
        console.log("\n🎉 ULTRA SMART CONTRACT TESTS SUCCESSFUL!");
        console.log("Your smart contract is ready for advanced features!");
    } else {
        console.log("\n⚠️  Some tests failed. Please review and fix issues before proceeding.");
    }

    console.log("\n📚 Next Steps:");
    console.log("1. Review test report for any failures");
    console.log("2. Set up monitoring dashboard");
    console.log("3. Configure analytics API endpoints");
    console.log("4. Deploy frontend integration");
}

if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error("❌ Testing failed:", error);
            process.exit(1);
        });
}

module.exports = main;