// Check OpenSea Indexing Status
// Verify if your collection has been indexed by OpenSea

const https = require('https');

const CONTRACT_ADDRESS = '0xAa5C50099bEb130c8988324A0F6Ebf65979f10EF';

console.log('🌊 Checking OpenSea Indexing Status...\n');
console.log('Contract:', CONTRACT_ADDRESS);
console.log('Network: Ethereum Mainnet\n');

// Check if collection is indexed
const options = {
    hostname: 'opensea.io',
    path: `/assets/ethereum/${CONTRACT_ADDRESS}/1`,
    method: 'HEAD'
};

const req = https.request(options, (res) => {
    console.log('Status Code:', res.statusCode);
    
    if (res.statusCode === 200) {
        console.log('✅ Collection is INDEXED on OpenSea!\n');
        console.log('Your OpenSea Links:');
        console.log('━'.repeat(70));
        console.log('\n📍 First NFT:');
        console.log(`https://opensea.io/assets/ethereum/${CONTRACT_ADDRESS}/1`);
        console.log('\n📍 Collection Assets:');
        console.log(`https://opensea.io/assets/ethereum/${CONTRACT_ADDRESS}`);
        console.log('\n📍 OpenSea Studio (Customize):');
        console.log('https://opensea.io/studio');
        console.log('\n🎨 Next Steps:');
        console.log('1. Visit OpenSea Studio');
        console.log('2. Connect wallet: 0x897f6d5A329d9481bEF2EE10fD0a5628d1934266');
        console.log('3. Claim your collection');
        console.log('4. Add logo, banner, description');
        console.log('5. Verify royalties (should show 2.5%)');
        console.log('6. Launch! 🚀\n');
    } else if (res.statusCode === 404) {
        console.log('⏳ Collection NOT YET INDEXED\n');
        console.log('This is normal! Here\'s what to do:');
        console.log('━'.repeat(70));
        console.log('\n✅ If you haven\'t minted yet:');
        console.log('   Run: npx hardhat run scripts/mint-first-nft.js --network mainnet');
        console.log('\n⏱️  If you just minted:');
        console.log('   Wait 5-10 minutes for OpenSea to detect it');
        console.log('\n🔄 To check again:');
        console.log('   Run: node scripts/check-opensea.js');
        console.log('\n💡 Manual Import:');
        console.log('   Visit: https://opensea.io/studio');
        console.log('   Click: "Import an existing smart contract"');
        console.log('   Enter: ' + CONTRACT_ADDRESS);
        console.log('\n');
    } else {
        console.log('🤔 Unexpected status. OpenSea might be updating.\n');
        console.log('Try again in a few minutes or visit:');
        console.log(`https://opensea.io/assets/ethereum/${CONTRACT_ADDRESS}\n`);
    }
});

req.on('error', (error) => {
    console.error('❌ Error checking OpenSea:', error.message);
    console.log('\nThis might mean:');
    console.log('1. Network connection issue');
    console.log('2. OpenSea is temporarily down');
    console.log('3. Collection not yet indexed\n');
    console.log('Manual check: https://opensea.io/assets/ethereum/' + CONTRACT_ADDRESS);
});

req.end();
