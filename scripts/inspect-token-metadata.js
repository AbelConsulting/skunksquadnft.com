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
    console.log("🔍 Deep Inspection of Token Metadata\n");
    
    const testUrl = "https://arweave.net/iqKl2q48_BO-L9SjGYOW7VQd_0AoSScR12IVdzjsZlQ/1.json";
    
    console.log("URL:", testUrl);
    console.log("\n📥 Fetching full data...\n");
    
    try {
        const result = await fetchData(testUrl);
        
        console.log("✅ Status:", result.status);
        console.log("\n📄 Full JSON Response:");
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
        
        if (result.data) {
            console.log(JSON.stringify(result.data, null, 2));
            console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            console.log("\n🔍 Analysis:");
            console.log("├── Keys in object:", Object.keys(result.data).join(', '));
            console.log("├── Has 'name':", result.data.name ? "✅" : "❌");
            console.log("├── Has 'description':", result.data.description ? "✅" : "❌");
            console.log("├── Has 'image':", result.data.image ? "✅" : "❌");
            console.log("└── Has 'attributes':", result.data.attributes ? "✅" : "❌");
            
            // Test token #2 and #3
            console.log("\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            console.log("Testing Other Tokens");
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
            
            for (let i = 2; i <= 3; i++) {
                const tokenUrl = `https://arweave.net/iqKl2q48_BO-L9SjGYOW7VQd_0AoSScR12IVdzjsZlQ/${i}.json`;
                console.log(`Token #${i}:`, tokenUrl);
                
                try {
                    const tokenResult = await fetchData(tokenUrl);
                    if (tokenResult.data) {
                        console.log("├── name:", tokenResult.data.name);
                        console.log("├── image:", tokenResult.data.image ? "✅" : "❌");
                        console.log("└── attributes:", tokenResult.data.attributes?.length || 0);
                    }
                } catch (e) {
                    console.log("❌ Failed:", e.message);
                }
                console.log("");
            }
            
        } else if (result.rawData) {
            console.log("Raw data (first 1000 chars):");
            console.log(result.rawData.substring(0, 1000));
        }
    } catch (e) {
        console.log("❌ Error:", e.message);
    }
    
    process.exit(0);
}

main().catch(console.error);