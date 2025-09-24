const { NFTStorage, File } = require('nft.storage');
const fs = require('fs');

async function uploadToNFTStorage() {
    console.log('🆓 Uploading SkunkSquad Test Collection to NFT.Storage...');
    console.log('🔑 Using fresh API key...');
    
    // Your NEW NFT.Storage API key
    const client = new NFTStorage({ token: 'd82eb48c.d7d69cf06dab4bbd89c1a9b7f9ce7089' });
    
    const results = {};
    let successCount = 0;
    
    try {
        // Test the API key first
        console.log('🧪 Testing API key...');
        
        for (let i = 1; i <= 100; i++) {
            const metadataPath = `test_collection/metadata/${i}.json`;
            
            if (!fs.existsSync(metadataPath)) {
                console.log(`⚠️ Skipping NFT #${i} - metadata file not found`);
                continue;
            }
            
            try {
                const metadata = fs.readFileSync(metadataPath, 'utf8');
                
                // Create file for NFT.Storage
                const file = new File([metadata], `skunksquad-test-${i}.json`, { 
                    type: 'application/json' 
                });
                
                // Upload to IPFS via NFT.Storage
                const cid = await client.storeBlob(file);
                
                results[i] = cid;
                successCount++;
                
                console.log(`✅ SkunkSquad Test #${i}: ipfs://${cid}`);
                
                // Small delay to be nice to the service
                await new Promise(resolve => setTimeout(resolve, 150));
                
            } catch (error) {
                console.error(`❌ NFT #${i} upload failed:`, error.message);
                
                // If we get API errors, stop and report
                if (error.message.includes('API') || error.message.includes('auth')) {
                    console.error('🚨 API Key issue detected. Stopping upload.');
                    break;
                }
            }
        }
        
        // Save all successful results
        if (successCount > 0) {
            fs.writeFileSync('test_collection/ipfs-results.json', JSON.stringify(results, null, 2));
            
            console.log('\n🎉 IPFS Upload Results:');
            console.log(`📊 Successfully uploaded ${successCount}/100 NFTs to IPFS`);
            console.log('📁 IPFS hashes saved to: test_collection/ipfs-results.json');
            console.log('🌐 Your NFTs are now permanently stored on IPFS!');
            
            // Show sample URLs
            const sampleResults = Object.entries(results).slice(0, 3);
            console.log('\n🔗 Sample IPFS URLs:');
            sampleResults.forEach(([id, cid]) => {
                console.log(`   NFT #${id}: https://ipfs.io/ipfs/${cid}`);
            });
            
            console.log('\n🚀 Next Steps:');
            console.log('   1. Test these URLs in your browser');
            console.log('   2. Update your smart contract baseURI');
            console.log('   3. Ready to scale to 10,000 when you want!');
        }
        
    } catch (error) {
        console.error('❌ Upload process failed:', error.message);
        console.log('💡 Make sure your NFT.Storage account is active');
    }
}

uploadToNFTStorage();