const hre = require("hardhat");

async function main() {
    console.log("🔐 Verifying SkunkSquadNFT Contract on Etherscan...\n");
    
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
    console.log("└── Contract: SkunkSquadNFT");
    console.log();
    
    console.log("🔧 Constructor Arguments:");
    console.log("├── Name:", constructorArguments[0]);
    console.log("├── Symbol:", constructorArguments[1]);
    console.log("├── Base URI:", constructorArguments[2]);
    console.log("├── Contract URI:", constructorArguments[3]);
    console.log("├── Unrevealed URI:", constructorArguments[4]);
    console.log("├── Royalty Recipient:", constructorArguments[5]);
    console.log("└── Royalty Fee:", constructorArguments[6], "(2.5%)");
    console.log();
    
    try {
        console.log("⏳ Submitting verification to Etherscan...");
        
        await hre.run("verify:verify", {
            address: contractAddress,
            constructorArguments: constructorArguments,
        });
        
        console.log("\n✅ CONTRACT VERIFIED SUCCESSFULLY!");
        console.log("🔗 View on Etherscan: https://sepolia.etherscan.io/address/" + contractAddress + "#code");
        
    } catch (error) {
        if (error.message.includes("Already Verified")) {
            console.log("\n✅ Contract is already verified on Etherscan!");
            console.log("🔗 View on Etherscan: https://sepolia.etherscan.io/address/" + contractAddress + "#code");
        } else {
            console.error("\n❌ Verification failed:");
            console.error(error.message);
            
            console.log("\n📝 Manual Verification Instructions:");
            console.log("═══════════════════════════════════════════════════════════");
            console.log("1. Go to: https://sepolia.etherscan.io/verifyContract");
            console.log("2. Enter Contract Address:", contractAddress);
            console.log("3. Select:");
            console.log("   - Compiler Type: Solidity (Single file)");
            console.log("   - Compiler Version: v0.8.20+commit.a1b79de6");
            console.log("   - License: MIT");
            console.log("4. Optimization: Yes (200 runs)");
            console.log("5. Upload the flattened file: flattened-SkunkSquadNFT.sol");
            console.log("6. Constructor Arguments (ABI-encoded hex):");
            
            // Encode constructor arguments
            const abiCoder = new hre.ethers.utils.AbiCoder();
            const encodedArgs = abiCoder.encode(
                ["string", "string", "string", "string", "string", "address", "uint96"],
                constructorArguments
            );
            console.log("   ", encodedArgs.slice(2)); // Remove 0x prefix
            console.log("═══════════════════════════════════════════════════════════");
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Script error:", error);
        process.exit(1);
    });
