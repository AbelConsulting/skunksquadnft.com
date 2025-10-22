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
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve({ rawData: data });
                }
            });
        }).on('error', reject);
    });
}

async function findManifest() {
    console.log("🔍 SEARCHING FOR MANIFEST TX ID\n");
    
    // We know token #1 TX ID
    const token1TX = "fjHKZi8HUJVkhPD6ft6JKn0nmymkaG5sFsgjv-DIpiw";
    
    console.log("Known Token #1 TX:", token1TX);
    console.log("\nLooking for patterns...\n");
    
    // Strategy: Check if there's a parent folder or manifest pattern
    // Often manifests are in the same folder structure
    
    console.log("Please check your ArDrive and look for:");
    console.log("1. A file named 'manifest.json' or similar");
    console.log("2. A folder containing all 500 token JSON files");
    console.log("3. The folder's TX ID (not individual files)\n");
    
    console.log("To find it in ArDrive:");
    console.log("├── Open your ArDrive folder with the 500 tokens");
    console.log("├── Look for a 'Share' or 'Get Link' button on the FOLDER");
    console.log("└── The TX ID in that link is your manifest TX\n");
    
    console.log("The manifest TX should allow paths like:");
    console.log("https://arweave.net/[MANIFEST_TX]/1.json");
    console.log("https://arweave.net/[MANIFEST_TX]/2.json");
    console.log("https://arweave.net/[MANIFEST_TX]/500.json\n");
    
    // Let's also try some common patterns
    console.log("Testing common manifest patterns...\n");
    
    // Try to find index.json or similar
    const testPaths = [
        'index.json',
        'manifest.json', 
        '0.json',
        ''  // Root
    ];
    
    for (const path of testPaths) {
        const testURL = path ? 
            `https://arweave.net/${token1TX}/${path}` : 
            `https://arweave.net/${token1TX}`;
        
        console.log(`Trying: ${testURL}`);
        try {
            const result = await fetchData(testURL);
            if (result.manifest === "arweave/paths") {
                console.log("✅ FOUND MANIFEST!");
                console.log("Manifest TX:", token1TX);
                return;
            }
        } catch (e) {
            console.log(`   ❌ ${e.message}`);
        }
    }
    
    console.log("\n" + "=".repeat(60));
    console.log("NEXT STEPS:");
    console.log("=".repeat(60));
    console.log("\n1. Log into ArDrive at https://app.ardrive.io");
    console.log("2. Navigate to your Skunk Squad folder");
    console.log("3. Find the folder containing all 500 JSON files");
    console.log("4. Click 'Share' or 'Get Info' on the FOLDER (not a file)");
    console.log("5. Copy the Transaction ID");
    console.log("6. Reply with that TX ID and I'll verify it");
}

findManifest().catch(console.error);