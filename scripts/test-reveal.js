/**
 * Test Reveal Process
 * This will reveal the collection and verify metadata resolves correctly
 */

const { ethers } = require('ethers');
require('dotenv').config();

const CONTRACT_ADDRESS = '0xf14F75aEDBbDE252616410649f4dd7C1963191c4';
const SEPOLIA_RPC = process.env.SEPOLIA_RPC_URL || 'https://eth-sepolia.public.blastapi.io';
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const CONTRACT_ABI = [
    "function reveal() external",
    "function revealed() view returns (bool)",
    "function tokenURI(uint256 tokenId) view returns (string)",
    "function totalSupply() view returns (uint256)",
    "function owner() view returns (address)"
];

async function testMetadataURL(url, tokenId) {
    try {
        const fetch = (await import('node-fetch')).default;
        const arweaveUrl = url.replace('ar://', 'https://arweave.net/');
        
        console.log(`\n🔍 Testing Token #${tokenId}:`);
        console.log('   URI:', url);
        console.log('   Arweave URL:', arweaveUrl);
        
        const response = await fetch(arweaveUrl);
        console.log('   Status:', response.status);
        console.log('   Content-Type:', response.headers.get('content-type'));
        
        if (response.ok) {
            const metadata = await response.json();
            console.log('   ✅ Metadata loaded successfully!');
            console.log('   Name:', metadata.name);
            console.log('   Description:', metadata.description ? metadata.description.substring(0, 60) + '...' : 'N/A');
            
            if (metadata.image) {
                const imageUrl = metadata.image.replace('ar://', 'https://arweave.net/');
                console.log('   Image:', metadata.image);
                console.log('   Image URL:', imageUrl);
                
                // Test image accessibility
                const imageResponse = await fetch(imageUrl);
                console.log('   Image Status:', imageResponse.status);
                console.log('   Image Type:', imageResponse.headers.get('content-type'));
                
                if (imageResponse.ok) {
                    console.log('   ✅ Image accessible!');
                } else {
                    console.log('   ⚠️  Image not accessible yet');
                }
            }
            
            if (metadata.attributes && metadata.attributes.length > 0) {
                console.log('   Attributes:', metadata.attributes.length);
                metadata.attributes.slice(0, 3).forEach(attr => {
                    console.log(`      - ${attr.trait_type}: ${attr.value}`);
                });
            }
            
            return true;
        } else {
            console.log('   ⚠️  Metadata not accessible (Status:', response.status + ')');
            console.log('   This may be normal if Arweave is still propagating');
            return false;
        }
        
    } catch (error) {
        console.log('   ❌ Error:', error.message);
        return false;
    }
}

async function main() {
    console.log('🎭 Testing NFT Reveal & Metadata Resolution\n');
    console.log('='.repeat(70));
    console.log('📍 Contract:', CONTRACT_ADDRESS);
    console.log('='.repeat(70));

    if (!PRIVATE_KEY) {
        console.error('\n❌ Error: PRIVATE_KEY not found in .env file');
        process.exit(1);
    }

    // Setup
    const provider = new ethers.providers.JsonRpcProvider(SEPOLIA_RPC);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

    console.log('\n👤 Your Address:', wallet.address);

    // Check ownership
    const owner = await contract.owner();
    console.log('👑 Contract Owner:', owner);

    if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
        console.log('\n❌ ERROR: You are not the contract owner!');
        process.exit(1);
    }
    console.log('✅ Ownership verified');

    // Check current state
    const totalSupply = await contract.totalSupply();
    const isRevealed = await contract.revealed();
    
    console.log('\n📊 Current State:');
    console.log('├── Total Supply:', totalSupply.toString());
    console.log('└── Revealed:', isRevealed);

    // Test unrevealed metadata first
    console.log('\n' + '='.repeat(70));
    console.log('STEP 1: Testing UNREVEALED Metadata');
    console.log('='.repeat(70));
    
    const unrevealedURI = await contract.tokenURI(1);
    await testMetadataURL(unrevealedURI, 1);

    if (isRevealed) {
        console.log('\n⚠️  Collection is already revealed!');
        console.log('Testing revealed metadata...\n');
        
        // Test a few revealed tokens
        for (let i = 1; i <= Math.min(3, totalSupply); i++) {
            const uri = await contract.tokenURI(i);
            await testMetadataURL(uri, i);
        }
        
        console.log('\n✅ Metadata testing complete!');
        return;
    }

    // Ask for confirmation to reveal
    console.log('\n' + '='.repeat(70));
    console.log('⚠️  WARNING: Reveal is PERMANENT and IRREVERSIBLE!');
    console.log('='.repeat(70));
    console.log('\nThis will reveal the collection on testnet.');
    console.log('All', totalSupply.toString(), 'NFTs will switch from unrevealed to revealed metadata.');
    console.log('\nProceed with reveal? (Edit this script to confirm)');
    
    const CONFIRM_REVEAL = true; // Change to true to proceed
    
    if (!CONFIRM_REVEAL) {
        console.log('\n⏸️  Reveal cancelled. Change CONFIRM_REVEAL to true to proceed.');
        console.log('\nTo test reveal, update this script and run again.');
        process.exit(0);
    }

    // Reveal the collection
    console.log('\n' + '='.repeat(70));
    console.log('STEP 2: Revealing Collection');
    console.log('='.repeat(70));
    
    console.log('\n⏳ Sending reveal transaction...');
    
    const tx = await contract.reveal({
        gasLimit: 100000
    });

    console.log('✅ Transaction sent:', tx.hash);
    console.log('⏳ Waiting for confirmation...');

    const receipt = await tx.wait();
    console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
    console.log('⛽ Gas used:', receipt.gasUsed.toString());

    // Verify reveal
    const nowRevealed = await contract.revealed();
    console.log('\n📊 Reveal Status:', nowRevealed ? 'REVEALED ✅' : 'NOT REVEALED ❌');

    // Test revealed metadata
    console.log('\n' + '='.repeat(70));
    console.log('STEP 3: Testing REVEALED Metadata');
    console.log('='.repeat(70));

    let successCount = 0;
    const testCount = Math.min(5, totalSupply);
    
    for (let i = 1; i <= testCount; i++) {
        const uri = await contract.tokenURI(i);
        const success = await testMetadataURL(uri, i);
        if (success) successCount++;
    }

    console.log('\n' + '='.repeat(70));
    console.log('🎉 REVEAL TEST COMPLETE!');
    console.log('='.repeat(70));
    console.log(`\n📊 Results: ${successCount}/${testCount} tokens resolved successfully`);
    console.log('\n🔗 View on Etherscan:');
    console.log(`   https://sepolia.etherscan.io/tx/${tx.hash}`);
    console.log('\n💡 Next steps:');
    console.log('   1. Check my-nfts.html to see revealed metadata');
    console.log('   2. Verify images are loading correctly');
    console.log('   3. If metadata not loading, wait 5-10 minutes for Arweave');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('\n❌ Script error:', error.message);
        process.exit(1);
    });
