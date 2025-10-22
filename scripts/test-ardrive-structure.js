const https = require('https');

function fetchData(url) {
    return new Promise((resolve, reject) => {
        const fetchRecursive = (currentUrl, depth = 0) => {
            if (depth > 5) {
                reject(new Error('Too many redirects'));
                return;
            }
            
            https.get(currentUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
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
                            resolve({ status: res.statusCode, data: parsed, rawData: data });
                        } catch (e) {
                            resolve({ status: res.statusCode, rawData: data, parseError: e.message });
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
    console.log("🔍 VERIFYING NEW MANIFEST TX\n");
    
    const MANIFEST_TX = "f-pfg0ZRYyNnRScrIlnIffIuBO1-hweqBNgzDUzYwCc";
    
    console.log("Testing Manifest TX:", MANIFEST_TX);
    console.log("Source: ArDrive folder link\n");
    
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("TEST 1: Direct Manifest Access");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    try {
        const manifestResult = await fetchData(`https://arweave.net/${MANIFEST_TX}`);
        
        console.log("Status:", manifestResult.status);
        console.log("Has JSON:", !!manifestResult.data);
        console.log("Parse Error:", manifestResult.parseError || "none");
        
        if (manifestResult.data) {
            console.log("\nManifest data:");
            console.log("├── Type:", manifestResult.data.manifest);
            console.log("├── Version:", manifestResult.data.version);
            console.log("├── Has paths:", !!manifestResult.data.paths);
            
            if (manifestResult.data.paths) {
                const paths = Object.keys(manifestResult.data.paths);
                const tokenFiles = paths.filter(p => p.match(/^\d+\.json$/));
                
                console.log(`└── Total paths: ${paths.length}`);
                console.log(`    └── Token files: ${tokenFiles.length}`);
                
                if (tokenFiles.length > 0) {
                    console.log("\n✅ This looks like a valid manifest!");
                    console.log("\nFirst 10 tokens:");
                    tokenFiles.sort((a, b) => parseInt(a) - parseInt(b))
                        .slice(0, 10)
                        .forEach(f => console.log(`   ${f}`));
                }
            }
        } else {
            console.log("\nRaw response (first 500 chars):");
            console.log(manifestResult.rawData?.substring(0, 500));
        }
        
    } catch (e) {
        console.log("❌ Error:", e.message);
    }
    
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("TEST 2: Token Access via Paths");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    for (const tokenNum of [1, 2, 100, 500]) {
        const url = `https://arweave.net/${MANIFEST_TX}/${tokenNum}.json`;
        console.log(`Testing token #${tokenNum}...`);
        
        try {
            const result = await fetchData(url);
            
            if (result.data && result.data.name) {
                console.log(`✅ Token #${tokenNum}: ${result.data.name}`);
                console.log(`   Image: ${result.data.image ? '✅' : '❌'}`);
                console.log(`   Attributes: ${result.data.attributes?.length || 0}`);
            } else {
                console.log(`❌ Token #${tokenNum}: Invalid response`);
            }
        } catch (e) {
            console.log(`❌ Token #${tokenNum}: ${e.message}`);
        }
        console.log();
    }
    
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("FINAL RESULT");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    console.log("If all tests passed, use this BASE URI:\n");
    console.log(`   https://arweave.net/${MANIFEST_TX}/\n`);
    console.log("This will resolve:");
    console.log(`   Token 1:   https://arweave.net/${MANIFEST_TX}/1.json`);
    console.log(`   Token 500: https://arweave.net/${MANIFEST_TX}/500.json`);
}

main().catch(console.error);