const fs = require('fs');
const readline = require('readline');

async function createManifest() {
    console.log("🔧 MANIFEST GENERATOR\n");
    console.log("This will create an Arweave paths manifest for your NFT collection.\n");
    
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));
    
    console.log("Do you have a CSV or list of all 500 token TX IDs?");
    console.log("Format should be: tokenNumber,txId");
    console.log("Example: 1,fjHKZi8HUJVkhPD6ft6JKn0nmymkaG5sFsgjv-DIpiw\n");
    
    const hasFile = await question("Do you have this file? (yes/no): ");
    
    if (hasFile.toLowerCase() === 'yes') {
        const filePath = await question("Enter the file path: ");
        
        try {
            const fileContent = fs.readFileSync(filePath.trim(), 'utf-8');
            const lines = fileContent.split('\n').filter(line => line.trim());
            
            const manifest = {
                "manifest": "arweave/paths",
                "version": "0.1.0",
                "index": {
                    "path": "1.json"
                },
                "paths": {}
            };
            
            for (const line of lines) {
                const [tokenNum, txId] = line.split(',').map(s => s.trim());
                if (tokenNum && txId) {
                    manifest.paths[`${tokenNum}.json`] = { id: txId };
                }
            }
            
            const outputPath = './metadata/manifest.json';
            fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2));
            
            console.log("\n✅ Manifest created successfully!");
            console.log(`📁 Saved to: ${outputPath}`);
            console.log(`📊 Contains ${Object.keys(manifest.paths).length} tokens\n`);
            console.log("Next steps:");
            console.log("1. Upload this manifest.json file to ArDrive");
            console.log("2. Get its Transaction ID");
            console.log("3. Use that TX ID as your base URI");
            
        } catch (e) {
            console.error("❌ Error reading file:", e.message);
        }
        
    } else {
        console.log("\n📋 TO CREATE THE MANIFEST, YOU NEED:\n");
        console.log("A list of all TX IDs from ArDrive. Here's how to get it:\n");
        console.log("Option 1 - Manual from ArDrive:");
        console.log("  1. Go to your metadata folder in ArDrive");
        console.log("  2. For each file (1.json, 2.json, ..., 500.json):");
        console.log("     - Click the file");
        console.log("     - Copy the 'Data TX' ID");
        console.log("     - Add to a CSV: tokenNum,txId\n");
        
        console.log("Option 2 - Export from ArDrive:");
        console.log("  1. Check if ArDrive has a 'Download Manifest' option");
        console.log("  2. Or export folder metadata\n");
        
        console.log("Option 3 - Use folder TX directly:");
        const folderTx = await question("\nDo you have the ArDrive folder TX ID? (enter or skip): ");
        
        if (folderTx.trim()) {
            console.log("\n⚠️  Using folder TX directly (without manifest):");
            console.log(`Base URI would be: https://arweave.net/${folderTx.trim()}/`);
            console.log("\nThis works IF ArDrive creates manifests automatically.");
            console.log("Test it by visiting:");
            console.log(`https://arweave.net/${folderTx.trim()}/1.json`);
        }
    }
    
    rl.close();
}

createManifest().catch(console.error);