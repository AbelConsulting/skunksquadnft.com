const hre = require("hardhat");

async function main() {
    console.log("🚀 Deploying SkunkSquad Payment Gateway...");
    
    // Get the contract factory
    const PaymentGateway = await hre.ethers.getContractFactory("SkunkSquadPaymentGateway");
    
    // Deployment parameters
    const nftContractAddress = process.env.NFT_CONTRACT_ADDRESS || "0x7649366eeb2F996513C4A929d9A980779Cf2364C";
    const stripeValidatorAddress = process.env.STRIPE_VALIDATOR_ADDRESS; // Your backend wallet address
    const initialPriceUSD = hre.ethers.utils.parseUnits("50", 2); // $50.00 in cents (5000)
    
    if (!stripeValidatorAddress) {
        throw new Error("STRIPE_VALIDATOR_ADDRESS environment variable is required");
    }
    
    console.log("📋 Deployment Configuration:");
    console.log(`   NFT Contract: ${nftContractAddress}`);
    console.log(`   Stripe Validator: ${stripeValidatorAddress}`);
    console.log(`   Initial Price: $${hre.ethers.utils.formatUnits(initialPriceUSD, 2)}`);
    
    // Deploy the contract
    const paymentGateway = await PaymentGateway.deploy(
        nftContractAddress,
        stripeValidatorAddress,
        initialPriceUSD
    );
    
    await paymentGateway.deployed();
    
    console.log("✅ Payment Gateway deployed successfully!");
    console.log(`📍 Contract Address: ${paymentGateway.address}`);
    console.log(`🔗 Etherscan: https://${hre.network.name === 'mainnet' ? '' : hre.network.name + '.'}etherscan.io/address/${paymentGateway.address}`);
    
    // Verify contract on Etherscan (if not on localhost)
    if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
        console.log("⏳ Waiting for block confirmations...");
        await paymentGateway.deployTransaction.wait(6);
        
        console.log("🔍 Verifying contract on Etherscan...");
        try {
            await hre.run("verify:verify", {
                address: paymentGateway.address,
                constructorArguments: [
                    nftContractAddress,
                    stripeValidatorAddress,
                    initialPriceUSD
                ],
            });
            console.log("✅ Contract verified on Etherscan!");
        } catch (error) {
            console.log("❌ Verification failed:", error.message);
        }
    }
    
    // Test basic functionality
    console.log("\n🧪 Testing contract functionality...");
    
    try {
        const currentPrice = await paymentGateway.pricePerNFTUSD();
        const priceInETH = await paymentGateway.getPriceInETH();
        const totalFor5 = await paymentGateway.calculateTotalUSD(5);
        
        console.log(`💰 Current price per NFT: $${hre.ethers.utils.formatUnits(currentPrice, 2)}`);
        console.log(`⚡ Price in ETH: ${hre.ethers.utils.formatEther(priceInETH)} ETH`);
        console.log(`🎯 Total for 5 NFTs: $${hre.ethers.utils.formatUnits(totalFor5, 2)}`);
        
        console.log("✅ All tests passed!");
    } catch (error) {
        console.log("❌ Contract test failed:", error.message);
    }
    
    // Generate environment variables
    console.log("\n📝 Environment Variables for .env:");
    console.log(`PAYMENT_GATEWAY_ADDRESS=${paymentGateway.address}`);
    console.log(`NFT_CONTRACT_ADDRESS=${nftContractAddress}`);
    console.log(`STRIPE_VALIDATOR_ADDRESS=${stripeValidatorAddress}`);
    
    // Save deployment info
    const fs = require('fs');
    const deploymentInfo = {
        network: hre.network.name,
        paymentGatewayAddress: paymentGateway.address,
        nftContractAddress: nftContractAddress,
        stripeValidatorAddress: stripeValidatorAddress,
        initialPriceUSD: initialPriceUSD.toString(),
        deploymentTime: new Date().toISOString(),
        deploymentHash: paymentGateway.deployTransaction.hash
    };
    
    fs.writeFileSync(
        `deployments/payment-gateway-${hre.network.name}.json`,
        JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log(`💾 Deployment info saved to deployments/payment-gateway-${hre.network.name}.json`);
    console.log("\n🎉 Payment Gateway deployment complete!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });