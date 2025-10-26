/**
 * Review Minted NFTs - View token URIs and metadata
 */

const { ethers } = require('ethers');
require('dotenv').config();

const CONTRACT_ADDRESS = '0xf14F75aEDBbDE252616410649f4dd7C1963191c4';
const SEPOLIA_RPC = process.env.SEPOLIA_RPC_URL || 'https://eth-sepolia.public.blastapi.io';

const CONTRACT_ABI = [
    "function tokenURI(uint256 tokenId) view returns (string)",
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address owner) view returns (uint256)",
    "function revealed() view returns (bool)",
    "function contractURI() view returns (string)"
];

async function main() {
    console.log('🎨 Reviewing Minted SkunkSquad NFTs\n');
    console.log('=' .repeat(70));
    
    const provider = new ethers.providers.JsonRpcProvider(SEPOLIA_RPC);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    
    console.log('📍 Contract:', CONTRACT_ADDRESS);
    console.log('=' .repeat(70));
    
    // Get collection info
    const totalSupply = await contract.totalSupply();
    const revealed = await contract.revealed();
    const contractURI = await contract.contractURI();
    
    console.log('\n📊 COLLECTION INFO:');
    console.log('├── Total Minted:', totalSupply.toString(), 'NFTs');
    console.log('├── Revealed:', revealed ? '✅ YES' : '❌ NO (using unrevealed metadata)');
    console.log('└── Contract URI:', contractURI);
    
    console.log('\n🎨 YOUR MINTED NFTS:\n');
    
    // Check each token
    for (let tokenId = 1; tokenId <= totalSupply; tokenId++) {
        console.log('━'.repeat(70));
        console.log(`🦨 TOKEN #${tokenId}`);
        console.log('━'.repeat(70));
        
        try {
            const owner = await contract.ownerOf(tokenId);
            console.log('👤 Owner:', owner);
            
            const tokenURI = await contract.tokenURI(tokenId);
            console.log('🔗 Token URI:', tokenURI);
            
            // Try to fetch and display metadata
            if (tokenURI.startsWith('ar://')) {
                const arweaveUrl = tokenURI.replace('ar://', 'https://arweave.net/');
                console.log('🌐 Arweave URL:', arweaveUrl);
                
                try {
                    const fetch = (await import('node-fetch')).default;
                    const response = await fetch(arweaveUrl);
                    
                    if (response.ok) {
                        const metadata = await response.json();
                        console.log('\n📄 METADATA:');
                        console.log('   Name:', metadata.name || 'N/A');
                        console.log('   Description:', metadata.description ? metadata.description.substring(0, 100) + '...' : 'N/A');
                        
                        if (metadata.image) {
                            const imageUrl = metadata.image.startsWith('ar://') 
                                ? metadata.image.replace('ar://', 'https://arweave.net/')
                                : metadata.image;
                            console.log('   Image:', imageUrl);
                        }
                        
                        if (metadata.attributes && metadata.attributes.length > 0) {
                            console.log('\n   🏷️  Attributes:');
                            metadata.attributes.forEach(attr => {
                                console.log(`      • ${attr.trait_type}: ${attr.value}`);
                            });
                        }
                    } else {
                        console.log('   ⚠️  Metadata not yet available on Arweave');
                    }
                } catch (fetchError) {
                    console.log('   ℹ️  Metadata fetch:', fetchError.message);
                }
            } else {
                console.log('   ℹ️  Non-Arweave URI');
            }
            
        } catch (error) {
            console.log('❌ Error reading token:', error.message);
        }
        
        console.log();
    }
    
    console.log('=' .repeat(70));
    console.log('\n💡 View your NFTs:');
    console.log(`   • Etherscan: https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`);
    console.log(`   • OpenSea: https://testnets.opensea.io/assets/sepolia/${CONTRACT_ADDRESS.toLowerCase()}/1`);
    console.log('\n📊 Collection on OpenSea:');
    console.log(`   https://testnets.opensea.io/collection/skunksquad-nft`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    });
