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
    const TX = "fjHKZi8HUJVkhPD6ft6JKn0nmymkaG5sFsgjv-DIpiw";
    
    console.log("🔍 CHECKING WHAT THIS TX ACTUALLY CONTAINS\n");
    console.log("TX ID:", TX);
    console.log("URL: https://arweave.net/" + TX + "\n");
    
    try {
        const result = await fetchData(`https://arweave.net/${TX}`);
        
        if (result.json) {
            console.log("JSON Content:");
            console.log("━".repeat(60));
            console.log(JSON.stringify(result.json, null, 2));
            console.log("━".repeat(60));
            
            console.log("\nAnalysis:");
            console.log("├── Has 'manifest' field:", !!result.json.manifest);
            console.log("├── Has 'paths' field:", !!result.json.paths);
            console.log("├── Has 'name' field:", !!result.json.name);
            console.log("├── Has 'image' field:", !!result.json.image);
            console.log("└── Has 'attributes' field:", !!result.json.attributes);
            
            if (result.json.manifest === "arweave/paths") {
                console.log("\n✅ THIS IS A MANIFEST!");
                const paths = Object.keys(result.json.paths || {});
                console.log(`Contains ${paths.length} paths`);
            } else if (result.json.name && result.json.image) {
                console.log("\n❌ THIS IS TOKEN METADATA, NOT A MANIFEST!");
                console.log("This is:", result.json.name);
            }
        } else {
            console.log("Raw content (first 1000 chars):");
            console.log(result.raw.substring(0, 1000));
        }
        
    } catch (e) {
        console.log("❌ Error:", e.message);
    }
    
    console.log("\n" + "━".repeat(60));
    console.log("NEXT STEPS");
    console.log("━".repeat(60));
    console.log("\nIf this shows token metadata (not a manifest):");
    console.log("1. You need to CREATE a manifest.json file locally");
    console.log("2. Upload it to ArDrive");
    console.log("3. Get its TX ID");
    console.log("\nOR use the ArDrive folder structure directly without a manifest");
}

main().catch(console.error);