/**
 * Update Unrevealed URI on Contract
 * Usage: node scripts/update-unrevealed-uri.js [ARWEAVE_TXID]
 */

const { ethers } = require('ethers');
require('dotenv').config();

const CONTRACT_ADDRESS = '0xf14F75aEDBbDE252616410649f4dd7C1963191c4';
const SEPOLIA_RPC = process.env.SEPOLIA_RPC_URL || 'https://eth-sepolia.public.blastapi.io';
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const CONTRACT_ABI = [
    "function setUnrevealedURI(string memory newURI) external",
    "function tokenURI(uint256 tokenId) view returns (string)",
    "function owner() view returns (address)",
    "function revealed() view returns (bool)"
];

async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log('❌ Error: Missing Arweave Transaction ID');
        console.log('\nUsage:');
        console.log('  node scripts/update-unrevealed-uri.js [ARWEAVE_TXID]');
        console.log('\nExample:');
        console.log('  node scripts/update-unrevealed-uri.js abc123xyz...');
        console.log('\nThis will update the unrevealed URI to: ar://abc123xyz...');
        process.exit(1);
    }
    
    const txid = args[0];
    const newUnrevealedURI = `ar://${txid}`;
    
    console.log('🔄 Updating Unrevealed URI\n');
    console.log('=' .repeat(70));
    console.log('📍 Contract:', CONTRACT_ADDRESS);
    console.log('🆕 New Unrevealed URI:', newUnrevealedURI);
    console.log('=' .repeat(70));
    
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
    try {
        const owner = await contract.owner();
        console.log('👑 Contract Owner:', owner);
        
        if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
            console.log('\n❌ ERROR: You are not the contract owner!');
            console.log('Only the owner can update the unrevealed URI.');
            process.exit(1);
        }
        console.log('✅ Ownership verified');
    } catch (e) {
        console.log('⚠️  Could not verify ownership:', e.message);
    }
    
    // Check current state
    try {
        const revealed = await contract.revealed();
        console.log('\n📊 Current State:');
        console.log('├── Revealed:', revealed ? 'YES' : 'NO');
        
        const currentTokenURI = await contract.tokenURI(1);
        console.log('└── Token #1 URI:', currentTokenURI);
        
    } catch (e) {
        console.log('⚠️  Could not read current state:', e.message);
    }
    
    // Update the URI
    console.log('\n⏳ Updating unrevealed URI...');
    console.log('   Sending transaction...');
    
    try {
        const tx = await contract.setUnrevealedURI(newUnrevealedURI, {
            gasLimit: 200000
        });
        
        console.log('✅ Transaction sent:', tx.hash);
        console.log('⏳ Waiting for confirmation...');
        
        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
        console.log('⛽ Gas used:', receipt.gasUsed.toString());
        
        // Verify the update
        console.log('\n🔍 Verifying update...');
        const newTokenURI = await contract.tokenURI(1);
        console.log('├── New Token #1 URI:', newTokenURI);
        
        if (newTokenURI === newUnrevealedURI) {
            console.log('└── ✅ SUCCESS! URI updated correctly');
        } else {
            console.log('└── ⚠️  URI changed but may not match exactly');
        }
        
        // Test the new URI
        console.log('\n🌐 Testing Arweave URL...');
        const arweaveUrl = newUnrevealedURI.replace('ar://', 'https://arweave.net/');
        console.log('URL:', arweaveUrl);
        
        try {
            const fetch = (await import('node-fetch')).default;
            const response = await fetch(arweaveUrl);
            
            if (response.ok) {
                const metadata = await response.json();
                console.log('\n📄 Metadata Preview:');
                console.log('   Name:', metadata.name);
                console.log('   Description:', metadata.description ? metadata.description.substring(0, 80) + '...' : 'N/A');
                console.log('   Image:', metadata.image);
                console.log('   ✅ Metadata is valid JSON!');
            } else {
                console.log('   ⚠️  Arweave URL not yet accessible (Status:', response.status + ')');
                console.log('   This is normal - it may take a few minutes to propagate');
            }
        } catch (fetchError) {
            console.log('   ℹ️  Could not fetch metadata yet:', fetchError.message);
            console.log('   Wait a few minutes and check:', arweaveUrl);
        }
        
        console.log('\n🎉 UPDATE COMPLETE!');
        console.log('=' .repeat(70));
        console.log('🔗 View transaction:');
        console.log(`   https://sepolia.etherscan.io/tx/${tx.hash}`);
        console.log('\n💡 Next steps:');
        console.log('   1. Wait 5-10 minutes for Arweave to propagate');
        console.log('   2. Check OpenSea to see updated metadata');
        console.log('   3. Refresh metadata if needed (Force Update button)');
        
    } catch (error) {
        console.error('\n❌ Update failed!');
        console.error('Error:', error.message);
        
        if (error.reason) {
            console.error('Reason:', error.reason);
        }
        
        if (error.message.includes('setUnrevealedURI')) {
            console.log('\n💡 The contract may not have a setUnrevealedURI() function.');
            console.log('Check if your contract has this function available.');
            console.log('\nAlternative: You may need to reveal the collection instead.');
        }
        
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('\n❌ Script error:', error.message);
        process.exit(1);
    });
