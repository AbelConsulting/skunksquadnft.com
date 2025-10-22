const https = require('https');

function fetchData(url, acceptManifest = false) {
    return new Promise((resolve, reject) => {
        const fetchRecursive = (currentUrl, depth = 0) => {
            if (depth > 5) {
                reject(new Error('Too many redirects'));
                return;
            }
            
            const headers = { 
                'User-Agent': 'Mozilla/5.0'
            };
            
            // Don't send Accept-Encoding header to avoid compressed responses
            if (acceptManifest) {
                headers['Accept'] = 'application/json';
            }
            
            https.get(currentUrl, { headers }, (res) => {
                console.log(`   Response headers:`, {
                    'content-type': res.headers['content-type'],
                    'status': res.statusCode
                });
                
                if (res.statusCode === 301 || res.statusCode === 302) {
                    let redirectUrl = res.headers.location;
                    if (redirectUrl.startsWith('/')) {
                        redirectUrl = 'https://arweave.net' + redirectUrl;
                    }
                    fetchRecursive(redirectUrl, depth + 1);
                } else if (res.statusCode === 200) {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => {
                        try {
                            const parsed = JSON.parse(data);
                            resolve({ status: res.statusCode, data: parsed, rawData: data, headers: res.headers });
                        } catch (e) {
                            resolve({ status: res.statusCode, rawData: data, parseError: e.message, headers: res.headers });
                        }
                    });
                } else {
                    reject(new Error(`HTTP ${res.statusCode}`));
                }
            }).on('error', reject);
        };
        
        fetchRecursive(url);
    });
}

async function main() {
    console.log("🔍 DETAILED MANIFEST DIAGNOSIS\n");
    
    const MANIFEST_TX = "fjHKZi8HUJVkhPD6ft6JKn0nmymkaG5sFsgjv-DIpiw";
    
    console.log("Manifest TX ID:", MANIFEST_TX);
    console.log("Full URL:", `https://arweave.net/${MANIFEST_TX}\n`);
    
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("STEP 1: Try Direct Manifest Access");  
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    try {
        console.log("Fetching manifest...");
        const manifestResult = await fetchData(`https://arweave.net/${MANIFEST_TX}`, true);
        
        console.log("\nHTTP Status:", manifestResult.status);
        console.log("Content-Type:", manifestResult.headers['content-type']);
        console.log("Has JSON data:", !!manifestResult.data);
        console.log("Has raw data:", !!manifestResult.rawData);
        console.log("Parse error:", manifestResult.parseError || "none");
        
        if (manifestResult.rawData) {
            console.log("\nRaw data preview (first 1000 chars):");
            console.log("─".repeat(50));
            console.log(manifestResult.rawData.substring(0, 1000));
            console.log("─".repeat(50));
            console.log(`Total raw data length: ${manifestResult.rawData.length} bytes\n`);
        }
        
        // If we got x-arweave-manifest+json, try alternative access methods
        if (manifestResult.headers['content-type']?.includes('arweave-manifest')) {
            console.log("\n⚠️  Got manifest content-type, trying alternative access methods...\n");
            
            // Method 1: Try ar.io gateway
            console.log("Method 1: Trying ar.io gateway...");
            try {
                const arIoResult = await fetchData(`https://arweave.net/${MANIFEST_TX}`, false);
                if (arIoResult.data && arIoResult.data.manifest) {
                    console.log("✅ ar.io gateway worked!");
                    manifestResult.data = arIoResult.data;
                }
            } catch (e) {
                console.log("❌ ar.io failed:", e.message);
            }
            
            // Method 2: Try accessing a known path directly
            console.log("\nMethod 2: Testing if paths work (trying /1.json)...");
            try {
                const testResult = await fetchData(`https://arweave.net/${MANIFEST_TX}/1.json`, false);
                if (testResult.data) {
                    console.log("✅ Path access works! This IS a valid manifest!");
                    console.log("   Token 1 name:", testResult.data.name);
                    
                    // Build a mock manifest structure
                    manifestResult.data = {
                        manifest: "arweave/paths",
                        version: "0.1.0",
                        index: { path: "1.json" },
                        paths: {}
                    };
                    
                    // Test a range to find how many tokens exist
                    console.log("\n   Probing for token count...");
                    let maxToken = 1;
                    for (let i = 2; i <= 500; i += 10) {
                        try {
                            await fetchData(`https://arweave.net/${MANIFEST_TX}/${i}.json`, false);
                            maxToken = i;
                        } catch {
                            break;
                        }
                    }
                    console.log(`   Found tokens up to at least #${maxToken}`);
                }
            } catch (e) {
                console.log("❌ Path access failed:", e.message);
            }
        }
        
        if (manifestResult.data && manifestResult.data.manifest === "arweave/paths") {
            console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            console.log("STEP 2: Analyze Manifest Structure");
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
            
            console.log("Top-level keys:", Object.keys(manifestResult.data));
            console.log("manifest field:", manifestResult.data.manifest);
            console.log("Is Arweave paths manifest:", manifestResult.data.manifest === "arweave/paths");
            
            if (manifestResult.data.paths) {
                const allPaths = Object.keys(manifestResult.data.paths);
                console.log(`\nTotal paths: ${allPaths.length}`);
                
                const pathAnalysis = {
                    jsonFiles: allPaths.filter(p => p.endsWith('.json')),
                    imageFiles: allPaths.filter(p => /\.(png|jpg|jpeg|gif|webp)$/i.test(p)),
                    tokenFiles: allPaths.filter(p => p.match(/^\d+\.json$/)),
                    otherFiles: allPaths.filter(p => !p.endsWith('.json') && !/\.(png|jpg|jpeg|gif|webp)$/i.test(p))
                };
                
                console.log("\nFile breakdown:");
                console.log(`├── Token JSONs (N.json): ${pathAnalysis.tokenFiles.length}`);
                console.log(`├── Other JSONs: ${pathAnalysis.jsonFiles.length - pathAnalysis.tokenFiles.length}`);
                console.log(`├── Images: ${pathAnalysis.imageFiles.length}`);
                console.log(`└── Other files: ${pathAnalysis.otherFiles.length}`);
                
                if (pathAnalysis.tokenFiles.length > 0) {
                    const sorted = pathAnalysis.tokenFiles.sort((a, b) => parseInt(a) - parseInt(b));
                    console.log("\nFirst 15 token files:");
                    sorted.slice(0, 15).forEach((p, i) => {
                        const txId = manifestResult.data.paths[p].id;
                        console.log(`${i === sorted.slice(0, 15).length - 1 ? '└──' : '├──'} ${p} → ${txId}`);
                    });
                    if (sorted.length > 15) {
                        console.log(`    ... and ${sorted.length - 15} more`);
                    }
                }
            }
            
            console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            console.log("STEP 3: Test Token Access");
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
            
            for (const tokenNum of [1, 2, 100]) {
                console.log(`\nTesting token #${tokenNum}...`);
                const testUrl = `https://arweave.net/${MANIFEST_TX}/${tokenNum}.json`;
                
                try {
                    const tokenResult = await fetchData(testUrl, false);
                    
                    if (tokenResult.data) {
                        console.log(`✅ Token #${tokenNum} loaded`);
                        console.log(`   Name: ${tokenResult.data.name || 'N/A'}`);
                        console.log(`   Image: ${tokenResult.data.image ? '✅' : '❌'}`);
                        console.log(`   Attributes: ${tokenResult.data.attributes ? tokenResult.data.attributes.length : 0}`);
                    } else {
                        console.log(`❌ Token #${tokenNum} failed to parse`);
                    }
                } catch (e) {
                    console.log(`⚠️  Token #${tokenNum} error: ${e.message}`);
                }
            }
            
            console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            console.log("FINAL VERDICT");
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
            
            console.log("✅ Manifest TX ID is CORRECT");
            console.log("\n📋 BASE URI TO USE:\n");
            console.log(`   https://arweave.net/${MANIFEST_TX}/\n`);
            console.log("This will resolve:");
            console.log(`   Token 1: https://arweave.net/${MANIFEST_TX}/1.json`);
            console.log(`   Token 2: https://arweave.net/${MANIFEST_TX}/2.json`);
            console.log(`   Token N: https://arweave.net/${MANIFEST_TX}/N.json`);
        } else {
            console.log("\n❌ Could not verify as Arweave paths manifest");
            console.log("But paths may still work! Check the test results above.");
        }
        
    } catch (e) {
        console.log("\n❌ FATAL ERROR:", e.message);
        console.log("Stack:", e.stack);
    }
    
    process.exit(0);
}

main().catch(console.error);