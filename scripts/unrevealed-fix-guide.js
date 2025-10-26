/**
 * Upload Unrevealed JSON to Arweave and Update Contract
 * Step-by-step guide for fixing the unrevealed metadata
 */

console.log('📋 UNREVEALED METADATA FIX GUIDE\n');
console.log('=' .repeat(70));

console.log('\n🎯 OBJECTIVE:');
console.log('Upload proper unrevealed JSON to Arweave and update contract');

console.log('\n❌ CURRENT PROBLEM:');
console.log('Contract unrevealed URI points to: ar://j57ibv2QPVURMDTsJp271LSUfRdZtx_632Wy31fLT6E/unrevealed.json');
console.log('But this returns a PNG image, not JSON metadata!');

console.log('\n✅ SOLUTION - Upload Fixed JSON:');
console.log('File ready: metadata/unrevealed-fixed.json');
console.log('Content:');
console.log(JSON.stringify({
  "name": "Skunk Squad NFT - Unrevealed",
  "description": "This Skunk Squad NFT has not been revealed yet. Each NFT is hand-drawn in Procreate by MontanaDad over 6 years of dedicated work. Stay tuned for the big reveal!",
  "image": "ar://j57ibv2QPVURMDTsJp271LSUfRdZtx_632Wy31fLT6E",
  "external_url": "https://skunksquadnft.com",
  "attributes": [
    {
      "trait_type": "Status",
      "value": "Unrevealed"
    },
    {
      "trait_type": "Collection",
      "value": "Skunk Squad"
    }
  ]
}, null, 2));

console.log('\n📤 UPLOAD STEPS:');
console.log('=' .repeat(70));

console.log('\nOPTION 1: ArDrive (Recommended - You have experience with this)');
console.log('─'.repeat(70));
console.log('1. Open ArDrive web app: https://app.ardrive.io/');
console.log('2. Navigate to your "metadata" folder');
console.log('3. Upload: metadata/unrevealed-fixed.json');
console.log('   - Name it: unrevealed.json');
console.log('4. After upload completes, get the Transaction ID (TXID)');
console.log('5. Test the URL: https://arweave.net/[YOUR_TXID]');
console.log('6. Save the TXID for the next step');

console.log('\nOPTION 2: Arweave CLI (If you have it installed)');
console.log('─'.repeat(70));
console.log('$ arweave deploy metadata/unrevealed-fixed.json \\');
console.log('  --key-file path/to/wallet.json \\');
console.log('  --content-type application/json');

console.log('\nOPTION 3: Bundlr/Turbo (Fast, paid service)');
console.log('─'.repeat(70));
console.log('Visit: https://turbo.ardrive.io/');
console.log('Upload: metadata/unrevealed-fixed.json');

console.log('\n🔄 AFTER UPLOAD - UPDATE CONTRACT:');
console.log('=' .repeat(70));
console.log('\nOnce you have the new TXID, run:');
console.log('$ node scripts/update-unrevealed-uri.js [NEW_TXID]');
console.log('\nThis will:');
console.log('1. Connect to your contract');
console.log('2. Call setUnrevealedURI() function');
console.log('3. Update to: ar://[NEW_TXID]');
console.log('4. Verify the update worked');

console.log('\n💡 QUICK CHECK:');
console.log('After uploading, verify your JSON is correct:');
console.log('$ curl https://arweave.net/[YOUR_TXID] | jq');

console.log('\n📊 EXPECTED RESULT:');
console.log('─'.repeat(70));
console.log('All 3 NFTs will show:');
console.log('• Name: "Skunk Squad NFT - Unrevealed"');
console.log('• Image: The unrevealed skunk image');
console.log('• Status: "Unrevealed" attribute');
console.log('• Properly displays on OpenSea');

console.log('\n🚀 READY TO START?');
console.log('=' .repeat(70));
console.log('File to upload: metadata/unrevealed-fixed.json');
console.log('Current location:', __dirname + '/../metadata/unrevealed-fixed.json');
