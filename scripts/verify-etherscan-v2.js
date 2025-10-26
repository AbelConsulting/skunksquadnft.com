const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const CONTRACT_ADDRESS = "0xf14F75aEDBbDE252616410649f4dd7C1963191c4";
const CHAIN_ID = "11155111"; // Sepolia
const API_KEY = process.env.ETHERSCAN_API_KEY;

async function verifyContractV2() {
    console.log("🔐 Attempting Etherscan V2 API Verification...\n");
    
    if (!API_KEY) {
        console.error("❌ ETHERSCAN_API_KEY not found in .env file");
        process.exit(1);
    }
    
    // Read the flattened contract source
    const sourceCodePath = path.join(__dirname, '..', 'flattened-SkunkSquadNFT.sol');
    const sourceCode = fs.readFileSync(sourceCodePath, 'utf8');
    
    // Constructor arguments (ABI-encoded, without 0x prefix)
    // Generated from: encode-constructor-args.js with updated unrevealed URI
    const { ethers } = require('ethers');
    const abiCoder = new ethers.utils.AbiCoder();
    const constructorArgs = abiCoder.encode(
        ["string", "string", "string", "string", "string", "address", "uint96"],
        [
            "SkunkSquad NFT",
            "SKUNK",
            "ar://bAFyRZCSkZo-uiVIviMfq4AfN6eV52YNaHWLd1L25Zs/metadata/",
            "ar://wpuACWSswfMtCiUp0Wv_cbpzdIm6kkbAHw_gZ_ZJ3Tc/contract.json",
            "ar://xG-oU7mgfSQ9FjjArqodR1HY0jTiPC2FiZKyoUFdDKw", // Updated unrevealed URI
            "0x16Be43d7571Edf69cec8D6221044638d161aA994",
            250
        ]
    ).slice(2); // Remove 0x prefix
    
    // Prepare verification data as URL-encoded form data
    const formData = new URLSearchParams({
        codeformat: "solidity-single-file",
        sourceCode: sourceCode,
        contractaddress: CONTRACT_ADDRESS,
        contractname: "SkunkSquadNFT",
        compilerversion: "v0.8.20+commit.a1b79de6",
        optimizationUsed: "1",
        runs: "200",
        constructorArguements: constructorArgs,
        licenseType: "3" // MIT
    }).toString();
    
    const options = {
        hostname: 'api.etherscan.io',
        path: `/v2/api?chainid=${CHAIN_ID}&module=contract&action=verifysourcecode&apikey=${API_KEY}`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(formData)
        }
    };
    
    console.log("📋 Verification Details:");
    console.log("├── API Version: V2");
    console.log("├── Contract Address:", CONTRACT_ADDRESS);
    console.log("├── Chain ID:", CHAIN_ID, "(Sepolia)");
    console.log("├── Compiler: v0.8.20+commit.a1b79de6");
    console.log("├── Optimization: Enabled (200 runs)");
    console.log("├── Contract Name: SkunkSquadNFT");
    console.log("└── Source: flattened-SkunkSquadNFT.sol");
    console.log();
    
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            
            console.log("📊 HTTP Status Code:", res.statusCode);
            console.log("📊 Response Headers:", JSON.stringify(res.headers, null, 2));
            console.log();
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log("📡 API Response:");
                console.log(data);
                console.log();
                
                try {
                    const response = JSON.parse(data);
                    
                    if (response.status === "1") {
                        console.log("✅ Verification submitted successfully!");
                        console.log("GUID:", response.result);
                        console.log("\n⏳ Checking verification status in 5 seconds...");
                        
                        setTimeout(() => {
                            checkVerificationStatus(response.result);
                        }, 5000);
                    } else {
                        console.log("❌ Verification failed:");
                        console.log("Message:", response.message);
                        console.log("Result:", response.result);
                        
                        if (response.message && response.message.includes("already verified")) {
                            console.log("\n✅ Contract is already verified!");
                            console.log("🔗 View: https://sepolia.etherscan.io/address/" + CONTRACT_ADDRESS + "#code");
                        }
                    }
                    resolve(response);
                } catch (e) {
                    console.error("❌ Failed to parse response:", e.message);
                    console.log("Raw response:", data);
                    reject(e);
                }
            });
        });
        
        req.on('error', (error) => {
            console.error("❌ Request error:", error.message);
            reject(error);
        });
        
        req.write(formData);
        req.end();
    });
}

function checkVerificationStatus(guid) {
    const options = {
        hostname: 'api.etherscan.io',
        path: `/v2/api?chainid=${CHAIN_ID}&module=contract&action=checkverifystatus&guid=${guid}&apikey=${API_KEY}`,
        method: 'GET'
    };
    
    const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const response = JSON.parse(data);
                console.log("\n📊 Verification Status:");
                console.log(JSON.stringify(response, null, 2));
                
                if (response.status === "1") {
                    console.log("\n✅ CONTRACT VERIFIED SUCCESSFULLY!");
                    console.log("🔗 View on Etherscan: https://sepolia.etherscan.io/address/" + CONTRACT_ADDRESS + "#code");
                } else if (response.result === "Pending in queue") {
                    console.log("\n⏳ Still pending... checking again in 5 seconds");
                    setTimeout(() => checkVerificationStatus(guid), 5000);
                } else {
                    console.log("\n⚠️ Status:", response.result);
                }
            } catch (e) {
                console.error("Failed to parse status response:", e.message);
                console.log("Raw response:", data);
            }
        });
    });
    
    req.on('error', (error) => {
        console.error("Status check error:", error.message);
    });
    
    req.end();
}

// Run verification
verifyContractV2().catch((error) => {
    console.error("Script error:", error);
    process.exit(1);
});
