/**
 * Check SkunkSquad NFT Contract State
 * This script checks the current state of your contract
 */

const { ethers } = require('ethers');
const fs = require('fs');

const CONTRACT_ADDRESS = '0xAa5C50099bEb130c8988324A0F6Ebf65979f10EF';
const RPC_URL = 'https://eth-mainnet.g.alchemy.com/v2/YOUR-API-KEY'; // Or use Infura

// Minimal ABI - just the functions we need
const ABI = [
    "function totalSupply() view returns (uint256)",
    "function revealed() view returns (bool)",
    "function tokenURI(uint256 tokenId) view returns (string)",
    "function contractURI() view returns (string)",
    "function owner() view returns (address)",
    "function royaltyInfo(uint256 tokenId, uint256 salePrice) view returns (address, uint256)"
];

async function checkContract() {
    console.log('🔍 Checking SkunkSquad NFT Contract State...\n');
    console.log('Contract:', CONTRACT_ADDRESS);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    try {
        // Try multiple RPC providers
        const providers = [
            'https://eth.llamarpc.com',
            'https://rpc.ankr.com/eth',
            'https://ethereum.publicnode.com'
        ];

        let provider;
        for (const rpcUrl of providers) {
            try {
                provider = new ethers.JsonRpcProvider(rpcUrl);
                await provider.getBlockNumber(); // Test connection
                console.log('✅ Connected to RPC:', rpcUrl, '\n');
                break;
            } catch (e) {
                console.log('❌ Failed to connect to:', rpcUrl);
            }
        }

        if (!provider) {
            throw new Error('Could not connect to any RPC provider');
        }

        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

        // Check total supply
        console.log('📊 Checking Total Supply...');
        const totalSupply = await contract.totalSupply();
        console.log('   Total Minted:', totalSupply.toString(), 'NFTs\n');

        // Check if revealed
        console.log('🎭 Checking Reveal Status...');
        try {
            const revealed = await contract.revealed();
            console.log('   Revealed:', revealed ? '✅ YES' : '❌ NO (Still hidden)\n');
        } catch (e) {
            console.log('   ⚠️  Reveal function not available or contract doesn\'t have this function\n');
        }

        // Check contract owner
        console.log('👤 Checking Contract Owner...');
        const owner = await contract.owner();
        console.log('   Owner:', owner, '\n');

        // Check tokenURI for minted tokens
        if (totalSupply > 0) {
            console.log('🔗 Checking Token URIs...');
            for (let i = 0; i < Math.min(3, Number(totalSupply)); i++) {
                try {
                    const uri = await contract.tokenURI(i);
                    console.log(`   Token #${i}:`, uri);
                } catch (e) {
                    console.log(`   Token #${i}:`, '❌ Error:', e.message);
                }
            }
            console.log('');
        }

        // Check contract URI
        console.log('📋 Checking Contract URI...');
        try {
            const contractURI = await contract.contractURI();
            console.log('   Contract URI:', contractURI, '\n');
        } catch (e) {
            console.log('   ⚠️  Contract URI not available\n');
        }

        // Check royalty info
        console.log('💎 Checking Royalty Info...');
        try {
            const [recipient, amount] = await contract.royaltyInfo(0, ethers.parseEther('1'));
            const percentage = (Number(amount) / Number(ethers.parseEther('1'))) * 100;
            console.log('   Royalty Recipient:', recipient);
            console.log('   Royalty Percentage:', percentage.toFixed(2) + '%\n');
        } catch (e) {
            console.log('   ⚠️  Royalty info not available\n');
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ Contract check complete!\n');

        // Test metadata accessibility
        if (totalSupply > 0) {
            console.log('🌐 Testing Metadata Accessibility...\n');
            try {
                const uri = await contract.tokenURI(0);
                const httpUrl = uri.replace('ar://', 'https://arweave.net/');
                console.log('   Testing URL:', httpUrl);
                
                const response = await fetch(httpUrl);
                if (response.ok) {
                    const metadata = await response.json();
                    console.log('   ✅ Metadata is accessible!');
                    console.log('   Name:', metadata.name);
                    console.log('   Image:', metadata.image);
                    if (metadata.attributes) {
                        console.log('   Traits:', metadata.attributes.length, 'attributes');
                    }
                } else {
                    console.log('   ❌ Metadata not accessible. Status:', response.status);
                }
            } catch (e) {
                console.log('   ❌ Error accessing metadata:', e.message);
            }
            console.log('');
        }

        // OpenSea links
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔗 OpenSea Links:\n');
        console.log('Collection:', `https://opensea.io/assets/ethereum/${CONTRACT_ADDRESS}`);
        if (totalSupply > 0) {
            console.log('First NFT:', `https://opensea.io/assets/ethereum/${CONTRACT_ADDRESS}/0`);
        }
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Recommendations
        console.log('💡 Next Steps for OpenSea:\n');
        if (totalSupply == 0) {
            console.log('   1. ⚠️  No NFTs minted yet - mint at least one NFT');
        } else {
            console.log('   1. ✅ NFTs are minted');
        }
        console.log('   2. Force refresh on OpenSea using: ./refresh-opensea.ps1');
        console.log('   3. Wait 15-30 minutes for OpenSea cache to update');
        console.log('   4. Check individual NFT pages on OpenSea');
        console.log('   5. If still not showing, click "Refresh metadata" button on each NFT\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('\nFull error:', error);
    }
}

checkContract();
