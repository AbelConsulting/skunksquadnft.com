const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Diagnosing Contract State...\n");

    const contractAddress = "0xBC00f05B9918B6B529d7edd33d89b4fB7016F6aF";
    const [signer] = await ethers.getSigners();
    
    // Minimal ABI to check contract state
    const abi = [
        "function totalSupply() view returns (uint256)",
        "function maxSupply() view returns (uint256)",
        "function getCurrentSmartPrice() view returns (uint256)",
        "function owner() view returns (address)",
        "function paused() view returns (bool)",
        "function publicMint(uint256 quantity) payable",
        "function setMintPhase(uint8 phase)"
    ];
    
    const contract = new ethers.Contract(contractAddress, abi, signer);
    
    try {
        console.log("📊 Contract Information:");
        console.log("   Address:", contractAddress);
        console.log("   Your account:", signer.address);
        
        const owner = await contract.owner();
        console.log("   Owner:", owner);
        console.log("   You are owner:", owner.toLowerCase() === signer.address.toLowerCase());
        
        const totalSupply = await contract.totalSupply();
        console.log("\n📈 Supply Information:");
        console.log("   Total Supply:", totalSupply.toString());
        
        try {
            const maxSupply = await contract.maxSupply();
            console.log("   Max Supply:", maxSupply.toString());
        } catch (e) {
            console.log("   Max Supply: Could not fetch");
        }
        
        const smartPrice = await contract.getCurrentSmartPrice();
        console.log("\n💰 Pricing:");
        console.log("   Smart Price:", ethers.utils.formatEther(smartPrice), "ETH");
        
        try {
            const isPaused = await contract.paused();
            console.log("\n⏸️  Pause Status:", isPaused ? "PAUSED" : "ACTIVE");
        } catch (e) {
            console.log("\n⏸️  Pause Status: Could not fetch");
        }
        
        // Try a simple public mint instead
        console.log("\n🧪 Attempting simple publicMint (1 NFT)...");
        const quantity = 1;
        const cost = smartPrice.mul(quantity);
        
        console.log("   Quantity:", quantity);
        console.log("   Cost:", ethers.utils.formatEther(cost), "ETH");
        
        try {
            const tx = await contract.publicMint(quantity, {
                value: cost,
                gasLimit: 300000
            });
            
            console.log("   ✅ Transaction submitted:", tx.hash);
            console.log("   ⏳ Waiting for confirmation...");
            
            const receipt = await tx.wait();
            
            if (receipt.status === 1) {
                console.log("   ✅ MINT SUCCESSFUL!");
                console.log("   ⛽ Gas used:", receipt.gasUsed.toString());
                
                const newSupply = await contract.totalSupply();
                console.log("   📊 New supply:", newSupply.toString());
                
                console.log("\n   🔗 View on Etherscan:");
                console.log("   ", `https://sepolia.etherscan.io/tx/${receipt.transactionHash}`);
            } else {
                console.log("   ❌ Transaction failed");
            }
        } catch (mintError) {
            console.log("   ❌ Mint failed:", mintError.message.split('\n')[0]);
            
            if (mintError.message.includes("CALL_EXCEPTION")) {
                console.log("\n   💡 The contract rejected the transaction. Possible reasons:");
                console.log("      - Contract might not have publicMint function");
                console.log("      - Minting might be disabled");
                console.log("      - There might be a bug in the contract");
                console.log("\n   🔍 Check the contract on Etherscan:");
                console.log("      https://sepolia.etherscan.io/address/" + contractAddress);
            }
        }
        
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
