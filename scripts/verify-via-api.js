require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');

async function verifyContract() {
    console.log("🔐 Verifying Contract via Etherscan API...\n");
    
    const apiKey = process.env.ETHERSCAN_API_KEY;
    if (!apiKey) {
        console.error("❌ ETHERSCAN_API_KEY not found in .env file");
        process.exit(1);
    }
    
    // Read the flattened contract
    const sourceCode = fs.readFileSync('flattened-SkunkSquadNFT.sol', 'utf8');
    
    const params = new URLSearchParams({
        apikey: apiKey,
        module: 'contract',
        action: 'verifysourcecode',
        contractaddress: '0xf14F75aEDBbDE252616410649f4dd7C1963191c4',
        sourceCode: sourceCode,
        codeformat: 'solidity-single-file',
        contractname: 'SkunkSquadNFT',
        compilerversion: 'v0.8.20+commit.a1b79de6',
        optimizationUsed: '1',
        runs: '200',
        constructorArguements: '00000000000000000000000000000000000000000000000000000000000000e000000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000160000000000000000000000000000000000000000000000000000000000000001c000000000000000000000000000000000000000000000000000000000000002200000000000000000000000016be43d7571edf69cec8d6221044638d161aa99400000000000000000000000000000000000000000000000000000000000000fa000000000000000000000000000000000000000000000000000000000000000e536b756e6b5371756164204e46540000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005534b554e4b000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003a61723a2f2f62414679525a43536b5a6f2d7569564976694d66713441664e3665563532594e6148574c64314c32355a732f6d657461646174612f000000000000000000000000000000000000000000000000000000000000000000000000003e61723a2f2f777075414357537377664d74436955703057765f6362707a64496d366b6b624148775f675a5f5a4a3354632f636f6e74726163742e6a736f6e0000000000000000000000000000000000000000000000000000000000000000004061723a2f2f6a35376962763251505655524d4454734a703237314c53556652645a74785f3633325779333166434c5436452f756e72657665616c65642e6a736f6e',
        licenseType: '3' // MIT
    });
    
    console.log("📤 Submitting verification request to Etherscan...");
    
    try {
        const response = await fetch('https://api-sepolia.etherscan.io/api/v2/contract/verify/solidity/json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contractAddress: '0xf14F75aEDBbDE252616410649f4dd7C1963191c4',
                sourceCode: sourceCode,
                contractName: 'SkunkSquadNFT',
                compilerVersion: 'v0.8.20+commit.a1b79de6',
                optimizationUsed: true,
                runs: 200,
                constructorArguments: '00000000000000000000000000000000000000000000000000000000000000e000000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000160000000000000000000000000000000000000000000000000000000000000001c000000000000000000000000000000000000000000000000000000000000002200000000000000000000000016be43d7571edf69cec8d6221044638d161aa99400000000000000000000000000000000000000000000000000000000000000fa000000000000000000000000000000000000000000000000000000000000000e536b756e6b5371756164204e46540000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000005534b554e4b000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000003a61723a2f2f62414679525a43536b5a6f2d7569564976694d66713441664e3665563532594e6148574c64314c32355a732f6d657461646174612f000000000000000000000000000000000000000000000000000000000000000000000000003e61723a2f2f777075414357537377664d74436955703057765f6362707a64496d366b6b624148775f675a5f5a4a3354632f636f6e74726163742e6a736f6e0000000000000000000000000000000000000000000000000000000000000000004061723a2f2f6a35376962763251505655524d4454734a703237314c53556652645a74785f3633325779333166434c5436452f756e72657665616c65642e6a736f6e',
                licenseType: 3,
                apiKey: apiKey
            })
        });
        
        const data = await response.json();
        
        if (data.status === '1') {
            console.log("✅ Verification submitted successfully!");
            console.log("📋 GUID:", data.result);
            console.log("\n⏳ Checking verification status in 15 seconds...");
            
            // Wait and check status
            await new Promise(resolve => setTimeout(resolve, 15000));
            
            const statusParams = new URLSearchParams({
                apikey: apiKey,
                module: 'contract',
                action: 'checkverifystatus',
                guid: data.result
            });
            
            const statusResponse = await fetch(`https://api-sepolia.etherscan.io/api?${statusParams}`);
            const statusData = await statusResponse.json();
            
            console.log("\n📊 Verification Status:");
            console.log(statusData);
            
            if (statusData.status === '1') {
                console.log("\n✅ CONTRACT SUCCESSFULLY VERIFIED!");
                console.log("🔗 View at: https://sepolia.etherscan.io/address/0xf14F75aEDBbDE252616410649f4dd7C1963191c4#code");
            } else {
                console.log("\n⏳ Verification pending. Check status at:");
                console.log("https://sepolia.etherscan.io/address/0xf14F75aEDBbDE252616410649f4dd7C1963191c4#code");
            }
            
        } else {
            console.error("\n❌ Verification failed:");
            console.error("Message:", data.message);
            console.error("Result:", data.result);
        }
        
    } catch (error) {
        console.error("\n❌ Error submitting verification:");
        console.error(error.message);
    }
}

verifyContract()
    .then(() => process.exit(0))
    .catch(error => {
        console.error("Script error:", error);
        process.exit(1);
    });
