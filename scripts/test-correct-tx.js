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
                    console.log(`   → Redirect: ${redirectUrl}`);
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
    console.log("🔍 Testing Correct Metadata Transaction\n");
    
    const CORRECT_TX = "iqKl2q48_BO-L9SjGYOW7VQd_0AoSScR12IVdzjsZlQ";
    
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Step 1: Verify Manifest Structure");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    console.log("Transaction ID:", CORRECT_TX);
    console.log("Base URL:", `https://arweave.net/${CORRECT_TX}/\n`);
    
    // Test token #1
    console.log("Testing Token #1...");
    const token1Url = `https://arweave.net/${CORRECT_TX}/1.json`;
    console.log("URL:", token1Url);
    console.log("\n📥 Fetching...\n");
    
    try {
        const result = await fetchData(token1Url);
        
        if (result.status === 200 && result.data) {
            console.log("✅ ✅ ✅ SUCCESS! ✅ ✅ ✅\n");
            console.log("📄 Token #1 Metadata:");
            console.log("├── name:", result.data.name);
            console.log("├── description:", result.data.description ? "✅ Present" : "❌ Missing");
            console.log("├── image:", result.data.image || "❌ Missing");
            console.log("└── attributes:", result.data.attributes ? `✅ ${result.data.attributes.length} traits` : "❌ Missing");
            
            if (result.data.attributes && result.data.attributes.length > 0) {
                console.log("\n🎨 Sample Attributes:");
                result.data.attributes.slice(0, 5).forEach(attr => {
                    console.log(`   ├── ${attr.trait_type}: ${attr.value}`);
                });
            }
        }
        
        // Test token #2
        console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("Step 2: Verify Token #2");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        
        const token2Url = `https://arweave.net/${CORRECT_TX}/2.json`;
        console.log("URL:", token2Url);
        console.log("\n📥 Fetching...\n");
        
        const result2 = await fetchData(token2Url);
        
        if (result2.status === 200 && result2.data) {
            console.log("✅ Token #2 also works!\n");
            console.log("├── name:", result2.data.name);
            console.log("└── image:", result2.data.image ? "✅" : "❌");
        }
        
        console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.log("🎯 FINAL ANSWER");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        console.log("✅ Your correct Base URI is:\n");
        console.log(`   https://arweave.net/${CORRECT_TX}/\n`);
        console.log("Update your contract with:");
        console.log(`├── Base URI: https://arweave.net/${CORRECT_TX}/`);
        console.log(`└── Contract URI: https://arweave.net/wpuACWSswfMtCiUp0Wv_cbpzdIm6kkbAHw_gZ_ZJ3Tc\n`);
        
        console.log("🚀 Ready to update Sepolia & Mainnet!");
        
    } catch (e) {
        console.log("❌ Error:", e.message);
    }
    
    process.exit(0);
}

main().catch(console.error);