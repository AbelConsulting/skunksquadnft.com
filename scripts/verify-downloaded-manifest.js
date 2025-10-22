const fs = require('fs');
const https = require('https');

function fetchData(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                let redirectUrl = res.headers.location;
                if (redirectUrl.startsWith('/')) redirectUrl = 'https://arweave.net' + redirectUrl;
                return fetchData(redirectUrl).then(resolve).catch(reject);
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve({ json: JSON.parse(data), raw: data }); }
                catch (e) { resolve({ raw: data }); }
            });
        }).on('error', reject);
    });
}

async function main() {
    console.log("🔍 VERIFYING DOWNLOADED MANIFEST\n");
    
    const manifestPath = 'C:\\Users\\marcf\\Downloads\\metadata_manifest_final.json';
    
    console.log("Reading manifest from:", manifestPath, "\n");
    
    try {
        const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
        const manifest = JSON.parse(manifestContent);
        
        console.log("✅ Manifest loaded successfully!");
        
        const totalPaths = Object.keys(manifest.paths).length;
        console.log(`📊 Total paths: ${totalPaths}\n`);
        
        if (totalPaths !== 10000) {
            console.log(`⚠️  WARNING: Expected 10,000 tokens but found ${totalPaths}!\n`);
        } else {
            console.log(`✅ Correct! Contains all 10,000 tokens\n`);
        }
        
        // Analyze path structure
        const paths = Object.keys(manifest.paths);
        const firstPath = paths[0];
        const lastPath = paths[paths.length - 1];
        
        console.log("Path structure:");
        console.log(`├── First: ${firstPath} → ${manifest.paths[firstPath].id}`);
        console.log(`├── Last: ${lastPath} → ${manifest.paths[lastPath].id}`);
        console.log(`└── Format: ${firstPath.includes('.json') ? 'With .json extension' : 'Without .json extension'}\n`);
        
        // Show sample entries
        console.log("Sample entries:");
        paths.slice(0, 5).forEach(path => {
            console.log(`   ${path} → ${manifest.paths[path].id}`);
        });
        
        console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("TESTING TOKEN ACCESS");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        
        // Test multiple tokens
        const testTokens = ["1", "1000", "5000", "10000"];
        
        for (const tokenNum of testTokens) {
            const tokenPath = manifest.paths[tokenNum];
            if (tokenPath) {
                console.log(`Testing Token #${tokenNum} (TX: ${tokenPath.id})...`);
                try {
                    const result = await fetchData(`https://arweave.net/${tokenPath.id}`);
                    
                    if (result.json && result.json.name) {
                        console.log(`✅ ${result.json.name}`);
                        console.log(`   Image: ${result.json.image ? '✅' : '❌'}`);
                        console.log(`   Attributes: ${result.json.attributes?.length || 0}`);
                    } else {
                        console.log(`❌ Invalid response`);
                    }
                } catch (e) {
                    console.log(`❌ Error: ${e.message}`);
                }
                console.log();
            } else {
                console.log(`❌ Token #${tokenNum} not found in manifest\n`);
            }
        }
        
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("NEXT STEP: GET MANIFEST TX ID FROM ARDRIVE");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        
        console.log("This manifest file needs to be on Arweave.\n");
        console.log("In ArDrive:");
        console.log("1. Find 'metadata_manifest_final.json'");
        console.log("2. Click on it and get the 'Data TX' or 'Transaction ID'");
        console.log("3. That TX ID is your BASE URI\n");
        
        console.log("Expected base URI format:");
        console.log("   https://arweave.net/[MANIFEST_TX]/1");
        console.log("   https://arweave.net/[MANIFEST_TX]/10000");
        
    } catch (e) {
        console.error("❌ Error:", e.message);
        
        if (e.code === 'ENOENT') {
            console.log("\nFile not found. Please verify the path:");
            console.log("C:\\Users\\marcf\\Downloads\\metadata_manifest_final.json");
        }
    }
}

main().catch(console.error);