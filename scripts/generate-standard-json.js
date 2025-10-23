const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    console.log("🔧 Generating Standard JSON Input for Etherscan Verification\n");

    // Read the contract source
    const contractPath = "contracts/SkunkSquadNFTSimple.sol";
    const contractSource = fs.readFileSync(contractPath, 'utf8');

    // Create the standard input JSON
    const standardInput = {
        language: "Solidity",
        sources: {
            "contracts/SkunkSquadNFTSimple.sol": {
                content: contractSource
            }
        },
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            },
            outputSelection: {
                "*": {
                    "*": ["*"]
                }
            }
        }
    };

    // Write to file
    const outputPath = "standard-input.json";
    fs.writeFileSync(outputPath, JSON.stringify(standardInput, null, 2));

    console.log("✅ Standard JSON Input file created!");
    console.log(`📄 File location: ${path.resolve(outputPath)}\n`);

    console.log("📋 ETHERSCAN VERIFICATION STEPS:");
    console.log("=".repeat(60));
    console.log("1. Go to: https://sepolia.etherscan.io/address/0x384062E20B046B738D5b4A158E0D9541437c7a9A#code");
    console.log("2. Click 'Verify and Publish'");
    console.log("3. Select:");
    console.log("   - Compiler Type: Solidity (Standard-Json-Input)");
    console.log("   - Compiler Version: v0.8.20+commit.a1b79de6");
    console.log("   - Open Source License: MIT");
    console.log("4. Click Continue");
    console.log(`5. Upload file: ${outputPath}`);
    console.log("6. Contract Name: SkunkSquadNFTSimple");
    console.log("7. Constructor Arguments:");
    console.log("\n0000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000000b536b756e6b2053717561640000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005534b554e4b000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003161723a2f2f7a53495570486362674950484e397a7533386479582d636d372d39796f58657676515470796871684d715f54412f000000000000000000000000000000\n");
    console.log("8. Click 'Verify and Publish'");
    console.log("=".repeat(60));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
