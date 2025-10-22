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
    console.log("🔍 Testing ArDrive File Structure\n");
    
    const FOLDER_TX = "iqKl2q48_BO-L9SjGYOW7VQd_0AoSScR12IVdzjsZlQ";
    const FILE_TX = "hzpuGdelIGntH_Vfk_KUqG5eBZCWQQT4WNX0aigaYiE";
    
    console.log("Folder TX:", FOLDER_TX);
    console.log("File TX:", FILE_TX);
    
    // Test 1: Direct file access
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Test 1: Direct File TX");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    const directUrl = `https://arweave.net/${FILE_TX}`;
    console.log("URL:", directUrl);
    console.log("📥 Fetching...\n");
    
    try {
        const result = await fetchData(directUrl);
        if (result.data) {
            console.log("✅ Got data!");
            console.log("Name:", result.data.name);
            console.log("Has attributes:", result.data.attributes ? "✅" : "❌");
            
            if (result.data.name && result.data.name.includes("Skunk Squad")) {
                console.log("\n🎉 This is individual file (token #1)");
                console.log("You need the MANIFEST that contains all tokens!");
            }
        }
    } catch (e) {
        console.log("❌", e.message);
    }
    
    // Test 2: Through folder manifest
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Test 2: Via Folder Manifest");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    const paths = [
        `${FOLDER_TX}/1.json`,
        `${FOLDER_TX}/${FILE_TX}`,
        `${FOLDER_TX}/metadata/1.json`
    ];
    
    for (const path of paths) {
        const url = `https://arweave.net/${path}`;
        console.log(`Testing: ${url}`);
        
        try {
            const result = await fetchData(url);
            if (result.data && result.data.name && result.data.name.includes("Skunk Squad")) {
                console.log("✅ FOUND IT! This path works!");
                console.log("   Name:", result.data.name);
                console.log("   Attributes:", result.data.attributes?.length);
                console.log("\n🎯 USE THIS BASE URI:");
                console.log(`   https://arweave.net/${path.replace('/1.json', '/')}\n`);
                break;
            } else {
                console.log("❌ Wrong structure\n");
            }
        } catch (e) {
            console.log(`❌ ${e.message}\n`);
        }
    }
    
    // Test 3: Check if it's a proper manifest
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Test 3: Check Manifest Structure");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    try {
        const manifestResult = await fetchData(`https://arweave.net/${FOLDER_TX}`);
        if (manifestResult.data && manifestResult.data.manifest) {
            console.log("✅ This IS a manifest!");
            if (manifestResult.data.paths) {
                const paths = Object.keys(manifestResult.data.paths);
                console.log(`Found ${paths.length} paths`);
                console.log("\nFirst 10 paths:");
                paths.slice(0, 10).forEach(p => console.log(`  - ${p}`));
            }
        }
    } catch (e) {
        console.log("Not a manifest");
    }
    
    process.exit(0);
}

main().catch(console.error);