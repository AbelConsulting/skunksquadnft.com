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
                            resolve({ status: redirectRes.statusCode, rawData: data, error: e.message });
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
                        resolve({ status: res.statusCode, rawData: data, error: e.message });
                    }
                });
            }
        }).on('error', reject);
    });
}

async function main() {
    console.log("🔍 Inspecting Arweave Manifest\n");
    
    const MANIFEST_ID = "CP7hoS7Dpke7RXxnTmosH6N3P3_-adXN2NFaIhw54do";
    const BASE_URL = `https://arweave.net/${MANIFEST_ID}`;
    
    console.log("Manifest URL:", BASE_URL);
    
    // Test different paths
    const pathsToTest = [
        "",           // Root manifest
        "/1.json",    // Token 1
        "/2.json",    // Token 2
        "/1",         // Without .json
        "/manifest.json"  // Manifest file itself
    ];
    
    for (const path of pathsToTest) {
        console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`Testing: ${BASE_URL}${path}`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        
        try {
            const result = await fetchJSON(`${BASE_URL}${path}`);
            console.log("Status:", result.status);
            
            if (result.data) {
                console.log("\nData structure:");
                console.log(JSON.stringify(result.data, null, 2).substring(0, 500));
            } else if (result.rawData) {
                console.log("\nRaw data (first 200 chars):");
                console.log(result.rawData.substring(0, 200));
            }
        } catch (e) {
            console.log("Error:", e.message);
        }
    }
    
    console.log("\n\n💡 DIAGNOSIS:");
    console.log("Your manifest needs to be structured so:");
    console.log("├── /1.json → Token #1 metadata");
    console.log("├── /2.json → Token #2 metadata");
    console.log("└── etc...");
    
    process.exit(0);
}

main().catch(console.error);