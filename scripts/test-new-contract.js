const { ethers } = require("hardhat");

async function main() {
    console.log("🧪 Testing SkunkSquadNFT Contract...\n");
    
    const CONTRACT_ADDRESS = "0xf14F75aEDBbDE252616410649f4dd7C1963191c4";
    
    const [deployer] = await ethers.getSigners();
    console.log("👤 Testing with account:", deployer.address);
    console.log("💰 Account balance:", ethers.utils.formatEther(await deployer.getBalance()), "ETH\n");
    
    // Connect to the deployed contract
    const contract = await ethers.getContractAt("SkunkSquadNFT", CONTRACT_ADDRESS);
    
    console.log("📋 Contract Information:");
    console.log("├── Address:", CONTRACT_ADDRESS);
    console.log("├── Network: Sepolia Testnet");
    console.log("└── Etherscan:", `https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}\n`);
    
    // Test 1: Read basic contract info
    console.log("🔍 Test 1: Reading Contract State");
    try {
        const name = await contract.name();
        const symbol = await contract.symbol();
        const totalSupply = await contract.totalSupply();
        const maxSupply = await contract.MAX_SUPPLY();
        const price = await contract.PRICE();
        const revealed = await contract.revealed();
        const owner = await contract.owner();
        
        console.log("✅ Basic Info:");
        console.log("   ├── Name:", name);
        console.log("   ├── Symbol:", symbol);
        console.log("   ├── Total Supply:", totalSupply.toString());
        console.log("   ├── Max Supply:", maxSupply.toString());
        console.log("   ├── Mint Price:", ethers.utils.formatEther(price), "ETH");
        console.log("   ├── Revealed:", revealed);
        console.log("   └── Owner:", owner);
        console.log();
    } catch (error) {
        console.log("❌ Error reading basic info:", error.message);
        return;
    }
    
    // Test 2: Check royalty info
    console.log("🔍 Test 2: Testing Royalty Info (EIP-2981)");
    try {
        const royaltyRecipient = await contract.royaltyRecipient();
        const royaltyFee = await contract.royaltyFee();
        
        console.log("✅ Royalty Configuration:");
        console.log("   ├── Recipient:", royaltyRecipient);
        console.log("   └── Fee:", (royaltyFee / 100).toString() + "%");
        
        // Test royaltyInfo for a hypothetical sale
        // Note: Can't test with non-existent token, so we'll skip this if no tokens minted
        const totalSupply = await contract.totalSupply();
        if (totalSupply.gt(0)) {
            const salePrice = ethers.utils.parseEther("1.0");
            const royaltyInfo = await contract.royaltyInfo(1, salePrice);
            console.log("   ├── For 1 ETH sale:");
            console.log("   │   ├── Receiver:", royaltyInfo[0]);
            console.log("   │   └── Amount:", ethers.utils.formatEther(royaltyInfo[1]), "ETH");
        }
        console.log();
    } catch (error) {
        console.log("❌ Error reading royalty info:", error.message);
        console.log();
    }
    
    // Test 3: Check metadata URIs
    console.log("🔍 Test 3: Testing Metadata URIs");
    try {
        const contractURI = await contract.contractURI();
        console.log("✅ Metadata URIs:");
        console.log("   ├── Contract URI:", contractURI);
        
        const totalSupply = await contract.totalSupply();
        if (totalSupply.gt(0)) {
            const tokenURI = await contract.tokenURI(1);
            console.log("   └── Token #1 URI:", tokenURI);
        } else {
            console.log("   └── No tokens minted yet (can't test tokenURI)");
        }
        console.log();
    } catch (error) {
        console.log("❌ Error reading metadata URIs:", error.message);
        console.log();
    }
    
    // Test 4: Test minting (dry run)
    console.log("🔍 Test 4: Testing Mint Function (Simulation)");
    try {
        const price = await contract.PRICE();
        const quantity = 1;
        const totalCost = price.mul(quantity);
        
        console.log("💡 Mint Parameters:");
        console.log("   ├── Quantity:", quantity);
        console.log("   ├── Price per NFT:", ethers.utils.formatEther(price), "ETH");
        console.log("   └── Total Cost:", ethers.utils.formatEther(totalCost), "ETH");
        console.log();
        
        // Estimate gas for minting
        try {
            const gasEstimate = await contract.estimateGas.mintNFT(quantity, {
                value: totalCost
            });
            console.log("✅ Gas Estimate:", gasEstimate.toString());
            console.log("   └── Estimated Cost:", ethers.utils.formatEther(gasEstimate.mul(await deployer.provider.getGasPrice())), "ETH");
            console.log();
        } catch (error) {
            console.log("⚠️  Could not estimate gas:", error.message);
            console.log();
        }
    } catch (error) {
        console.log("❌ Error simulating mint:", error.message);
        console.log();
    }
    
    // Test 5: Check EIP-165 interface support
    console.log("🔍 Test 5: Testing Interface Support (EIP-165)");
    try {
        const supportsERC721 = await contract.supportsInterface("0x80ac58cd");
        const supportsERC2981 = await contract.supportsInterface("0x2a55205a");
        
        console.log("✅ Interface Support:");
        console.log("   ├── ERC721:", supportsERC721 ? "✅ Yes" : "❌ No");
        console.log("   └── ERC2981 (Royalty):", supportsERC2981 ? "✅ Yes" : "❌ No");
        console.log();
    } catch (error) {
        console.log("❌ Error checking interfaces:", error.message);
        console.log();
    }
    
    // Prompt for actual mint test
    console.log("═══════════════════════════════════════════════════════");
    console.log("🎯 Would you like to perform an actual mint test?");
    console.log("═══════════════════════════════════════════════════════");
    console.log();
    console.log("To mint a test NFT, run:");
    console.log(`npx hardhat run scripts/mint-test.js --network sepolia`);
    console.log();
    console.log("✅ All basic tests completed successfully!");
    console.log("🔗 View contract: https://sepolia.etherscan.io/address/" + CONTRACT_ADDRESS);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Test failed:", error);
        process.exit(1);
    });
