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
    console.log("🔍 FINDING THE REAL MANIFEST\n");
    
    const knownToken1TX = "fjHKZi8HUJVkhPD6ft6JKn0nmymkaG5sFsgjv-DIpiw";
    
    console.log("We know Token #1 TX:", knownToken1TX);
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("INSTRUCTIONS");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    console.log("In your ArDrive (https://app.ardrive.io):\n");
    console.log("1. Navigate to your metadata folder");
    console.log("2. Find the file named 'manifest.json'");
    console.log("3. Click on it to open file details");
    console.log("4. Look for 'Data TX' or 'Arweave TX ID'");
    console.log("5. Copy that transaction ID (43 characters)\n");
    
    console.log("The TX ID should look like:");
    console.log("   lkl2l0GbCe2IzVWvLy7a6mOLMQb1hIYp3ZcqB1aypek");
    console.log("   (exactly 43 characters, alphanumeric with - and _)\n");
    
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("TESTING KNOWN GOOD TOKEN");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    
    console.log("Verifying Token #1 works correctly:");
    try {
        const result = await fetchData(`https://arweave.net/${knownToken1TX}`);
        if (result.json && result.json.name) {
            console.log("✅ Token #1:", result.json.name);
            console.log("   Image:", result.json.image || "N/A");
            console.log("   Attributes:", result.json.attributes?.length || 0);
            
            if (result.json.image) {
                console.log("\n📋 Expected manifest structure should map:");
                console.log(`   1.json → ${knownToken1TX}`);
                console.log("   2.json → [different TX]");
                console.log("   ...");
                console.log("   500.json → [different TX]");
            }
        }
    } catch (e) {
        console.log("❌ Error:", e.message);
    }
    
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("ONCE YOU HAVE THE MANIFEST TX ID:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    console.log("Update line 16 in test-ardrive-structure.js:");
    console.log('   const MANIFEST_TX = "YOUR_MANIFEST_TX_HERE";\n');
    console.log("Then run: node scripts/test-ardrive-structure.js");
}

main().catch(console.error);