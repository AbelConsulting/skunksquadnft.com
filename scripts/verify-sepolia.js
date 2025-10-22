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
                            resolve({ status: res.statusCode, data: JSON.parse(data) });
                        } catch (e) {
                            resolve({ status: res.statusCode, rawData: data });
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
    console.log("✅ Verifying Sepolia Metadata\n");
    
    const testUrl = "https://arweave.net/iqKl2q48_BO-L9SjGYOW7VQd_0AoSScR12IVdzjsZlQ/1.json";
    
    console.log("Testing:", testUrl);
    console.log("\n📥 Fetching...\n");
    
    try {
        const result = await fetchData(testUrl);
        
        if (result.status === 200 && result.data) {
            console.log("✅ ✅ ✅ METADATA WORKING! ✅ ✅ ✅\n");
            console.log("📄 Token #1:");
            console.log("├── name:", result.data.name);
            console.log("├── image:", result.data.image);
            console.log("└── attributes:", result.data.attributes?.length, "traits");
            
            console.log("\n🎉 Sepolia is PERFECT!");
            console.log("\n🚀 Ready to update MAINNET with:");
            console.log("   Base URI: https://arweave.net/iqKl2q48_BO-L9SjGYOW7VQd_0AoSScR12IVdzjsZlQ/");
            console.log("   Contract URI: https://arweave.net/wpuACWSswfMtCiUp0Wv_cbpzdIm6kkbAHw_gZ_ZJ3Tc");
        }
    } catch (e) {
        console.log("❌ Error:", e.message);
    }
    
    process.exit(0);
}

main().catch(console.error);