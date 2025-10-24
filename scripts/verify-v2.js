const hre = require("hardhat");

async function main() {
    console.log("🔐 Verifying Contract with Hardhat-Verify Plugin (V2)...\n");
    
    const contractAddress = "0xf14F75aEDBbDE252616410649f4dd7C1963191c4";
    
    const constructorArguments = [
        "SkunkSquad NFT",
        "SKUNK",
        "ar://bAFyRZCSkZo-uiVIviMfq4AfN6eV52YNaHWLd1L25Zs/metadata/",
        "ar://wpuACWSswfMtCiUp0Wv_cbpzdIm6kkbAHw_gZ_ZJ3Tc/contract.json",
        "ar://j57ibv2QPVURMDTsJp271LSUfRdZtx_632Wy31fLT6E/unrevealed.json",
        "0x16Be43d7571Edf69cec8D6221044638d161aA994",
        250
    ];
    
    console.log("📋 Verification Details:");
    console.log("├── Contract Address:", contractAddress);
    console.log("├── Network: Sepolia");
    console.log("├── Contract: contracts/SkunkSquadNFT.sol:SkunkSquadNFT");
    console.log("└── Compiler: v0.8.20 with optimizer (200 runs)");
    console.log();
    
    console.log("🔧 Constructor Arguments:");
    constructorArguments.forEach((arg, i) => {
        console.log(`├── [${i}]:`, arg);
    });
    console.log();
    
    try {
        console.log("⏳ Submitting to Etherscan via Hardhat-Verify...");
        
        await hre.run("verify:verify", {
            address: contractAddress,
            constructorArguments: constructorArguments,
            contract: "contracts/SkunkSquadNFT.sol:SkunkSquadNFT"
        });
        
        console.log("\n✅ CONTRACT VERIFIED SUCCESSFULLY!");
        console.log("🔗 View on Etherscan: https://sepolia.etherscan.io/address/" + contractAddress + "#code");
        
    } catch (error) {
        console.error("\n❌ Verification Error:");
        console.error("Message:", error.message);
        
        if (error.message.includes("Already Verified")) {
            console.log("\n✅ Contract is already verified on Etherscan!");
            console.log("🔗 View on Etherscan: https://sepolia.etherscan.io/address/" + contractAddress + "#code");
        } else if (error.message.includes("does not have bytecode")) {
            console.error("\n⚠️  Contract not found at this address. Check:");
            console.error("   - Address is correct");
            console.error("   - Network is correct (Sepolia)");
            console.error("   - Contract was deployed successfully");
        } else if (error.message.includes("Etherscan API")) {
            console.error("\n⚠️  Etherscan API Issue Detected");
            console.error("   This may be due to API V1→V2 migration issues.");
            console.error("\n📝 Fallback: Use Manual Verification");
            console.error("   Follow instructions in: FINAL_VERIFICATION_GUIDE.md");
            
            // Still try to provide helpful encoded args
            console.log("\n🔧 ABI-Encoded Constructor Arguments:");
            try {
                const { ethers } = require("hardhat");
                const abiCoder = ethers.AbiCoder || new ethers.utils.AbiCoder();
                const encoded = abiCoder.encode(
                    ["string", "string", "string", "string", "string", "address", "uint96"],
                    constructorArguments
                );
                console.log(encoded.slice(2)); // Remove 0x prefix
            } catch (encodeError) {
                console.error("   Unable to encode constructor arguments");
            }
        } else {
            console.error("\nFull error:", error);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Script execution error:", error);
        process.exit(1);
    });
