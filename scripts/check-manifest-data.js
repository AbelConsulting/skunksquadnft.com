const https = require('https');

function fetchJSON(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                https.get(res.headers.location, (redirectRes) => {
                    let data = '';
                    redirectRes.on('data', chunk => data += chunk);
                    redirectRes.on('end', () => {
                        try {
                            resolve({ status: redirectRes.statusCode, data: JSON.parse(data) });
                        } catch (e) {
                            resolve({ status: redirectRes.statusCode, rawData: data });
                        }
                    });
                }).on('error', reject);
            } else {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        resolve({ status: res.statusCode, data: JSON.parse(data) });
                    } catch (e) {
                        resolve({ status: res.statusCode, rawData: data });
                    }
                });
            }
        }).on('error', reject);
    });
}

async function main() {
    console.log("🔍 Checking Actual Manifest Data Transaction\n");
    
    const MANIFEST_DATA_TX = "fjHKZi8HUJVkhPD6ft6JKn0nmymkaG5sFsgjv-DIpiw";
    const url = `https://arweave.net/${MANIFEST_DATA_TX}`;
    
    console.log("Manifest Data TX:", MANIFEST_DATA_TX);
    console.log("URL:", url);
    console.log("\n📥 Fetching...\n");
    
    try {
        const result = await fetchJSON(url);
        console.log("✅ Status:", result.status);
        
        if (result.data) {
            // Check if it's a proper Arweave manifest
            if (result.data.manifest === "arweave/paths") {
                console.log("\n🎉 FOUND IT! This is a proper Arweave manifest!\n");
                
                if (result.data.paths) {
                    const paths = Object.keys(result.data.paths);
                    console.log(`📁 Total files in manifest: ${paths.length}\n`);
                    
                    // Look for token JSON files
                    const tokenFiles = paths.filter(p => p.match(/^\d+\.json$/)).sort((a, b) => {
                        return parseInt(a) - parseInt(b);
                    });
                    
                    console.log(`🎨 Found ${tokenFiles.length} token JSON files\n`);
                    
                    if (tokenFiles.length > 0) {
                        console.log("First 10 token files:");
                        tokenFiles.slice(0, 10).forEach(path => {
                            const txId = result.data.paths[path].id;
                            console.log(`├── ${path} → ${txId}`);
                        });
                        
                        if (tokenFiles.length > 10) {
                            console.log(`└── ... and ${tokenFiles.length - 10} more\n`);
                        }
                        
                        // Test access to token #1
                        console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
                        console.log("Testing Token #1 Metadata");
                        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
                        
                        const token1Path = "1.json";
                        if (result.data.paths[token1Path]) {
                            const token1TxId = result.data.paths[token1Path].id;
                            const token1Url = `https://arweave.net/${token1TxId}`;
                            
                            console.log("Direct URL:", token1Url);
                            console.log("Via Manifest:", `https://arweave.net/${MANIFEST_DATA_TX}/1.json`);
                            console.log("\n📥 Fetching token #1 metadata...\n");
                            
                            const tokenResult = await fetchJSON(token1Url);
                            
                            if (tokenResult.status === 200 && tokenResult.data) {
                                console.log("✅ Token #1 metadata is valid!\n");
                                console.log("📄 Metadata:");
                                console.log("├── name:", tokenResult.data.name);
                                console.log("├── description:", tokenResult.data.description ? "✅" : "❌");
                                console.log("├── image:", tokenResult.data.image || "missing");
                                console.log("└── attributes:", tokenResult.data.attributes ? `✅ ${tokenResult.data.attributes.length} traits` : "❌");
                                
                                console.log("\n\n✅ ✅ ✅ SUCCESS! ✅ ✅ ✅");
                                console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
                                console.log("🎯 USE THIS BASE URI:\n");
                                console.log(`   https://arweave.net/${MANIFEST_DATA_TX}/`);
                                console.log("\nThis correctly resolves to:");
                                console.log(`├── Token #1: https://arweave.net/${MANIFEST_DATA_TX}/1.json`);
                                console.log(`├── Token #2: https://arweave.net/${MANIFEST_DATA_TX}/2.json`);
                                console.log(`└── Token #N: https://arweave.net/${MANIFEST_DATA_TX}/N.json`);
                                
                            } else {
                                console.log("❌ Failed to load token metadata");
                            }
                        }
                    }
                }
            } else {
                console.log("\n⚠️  Not a standard Arweave manifest");
                console.log("Structure:");
                console.log(JSON.stringify(result.data, null, 2).substring(0, 1000));
            }
        } else {
            console.log("Raw data:", result.rawData?.substring(0, 500));
        }
        
    } catch (e) {
        console.log("❌ Error:", e.message);
    }
    
    process.exit(0);
}

main().catch(console.error);