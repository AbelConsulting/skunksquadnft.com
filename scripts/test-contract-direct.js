/**
 * Direct Contract Testing using ethers.js
 * Tests the Skunk Squad contract without hardhat
 */

const { ethers } = require('ethers');
require('dotenv').config();

const CONTRACT_ADDRESS = '0xf14F75aEDBbDE252616410649f4dd7C1963191c4';
const SEPOLIA_RPC = process.env.SEPOLIA_RPC_URL || 'https://eth-sepolia.public.blastapi.io';

// Minimal ABI for testing common functions
const MINIMAL_ABI = [
    "function owner() view returns (address)",
    "function totalSupply() view returns (uint256)",
    "function MAX_SUPPLY() view returns (uint256)",
    "function PUBLIC_PRICE() view returns (uint256)",
    "function publicMintActive() view returns (bool)",
    "function whitelistMintActive() view returns (bool)",
    "function revealed() view returns (bool)",
    "function baseURI() view returns (string)",
    "function contractURI() view returns (string)",
    "function tokenURI(uint256 tokenId) view returns (string)",
    "function balanceOf(address owner) view returns (uint256)",
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function name() view returns (string)",
    "function symbol() view returns (string)"
];

async function main() {
    console.log('🦨 Skunk Squad Contract Direct Test\n');
    console.log('=' .repeat(60));
    
    // Setup provider (ethers v5 syntax)
    const provider = new ethers.providers.JsonRpcProvider(SEPOLIA_RPC);
    console.log('📡 Connected to Sepolia RPC');
    
    // Get contract instance
    const contract = new ethers.Contract(CONTRACT_ADDRESS, MINIMAL_ABI, provider);
    console.log('📍 Contract Address:', CONTRACT_ADDRESS);
    console.log('=' .repeat(60));
    
    console.log('\n📋 BASIC INFO:');
    try {
        const name = await contract.name();
        const symbol = await contract.symbol();
        console.log('├── Name:', name);
        console.log('└── Symbol:', symbol);
    } catch (e) {
        console.log('❌ Could not read name/symbol:', e.message);
    }
    
    console.log('\n👤 OWNERSHIP:');
    try {
        const owner = await contract.owner();
        console.log('└── Owner:', owner);
    } catch (e) {
        console.log('❌ Could not read owner:', e.message);
    }
    
    console.log('\n📊 SUPPLY INFO:');
    try {
        const maxSupply = await contract.MAX_SUPPLY();
        console.log('├── Max Supply:', maxSupply.toString());
    } catch (e) {
        console.log('├── Max Supply: ❌', e.message);
    }
    
    try {
        const totalSupply = await contract.totalSupply();
        console.log('└── Total Minted:', totalSupply.toString());
    } catch (e) {
        console.log('└── Total Minted: ❌', e.message);
    }
    
    console.log('\n⚙️  MINT STATUS:');
    try {
        const publicActive = await contract.publicMintActive();
        console.log('├── Public Mint:', publicActive ? '✅ ACTIVE' : '❌ INACTIVE');
    } catch (e) {
        console.log('├── Public Mint: ❌', e.message);
    }
    
    try {
        const whitelistActive = await contract.whitelistMintActive();
        console.log('└── Whitelist Mint:', whitelistActive ? '✅ ACTIVE' : '❌ INACTIVE');
    } catch (e) {
        console.log('└── Whitelist Mint: ❌', e.message);
    }
    
    console.log('\n💰 PRICING:');
    try {
        const price = await contract.PUBLIC_PRICE();
        console.log('└── Public Price:', ethers.utils.formatEther(price), 'ETH');
    } catch (e) {
        console.log('└── Public Price: ❌', e.message);
    }
    
    console.log('\n🔗 METADATA:');
    try {
        const revealed = await contract.revealed();
        console.log('├── Revealed:', revealed ? '✅ YES' : '❌ NO');
    } catch (e) {
        console.log('├── Revealed: ❌', e.message);
    }
    
    try {
        const baseURI = await contract.baseURI();
        console.log('├── Base URI:', baseURI || '(empty)');
    } catch (e) {
        console.log('├── Base URI: ❌', e.message);
    }
    
    try {
        const contractURI = await contract.contractURI();
        console.log('└── Contract URI:', contractURI || '(empty)');
    } catch (e) {
        console.log('└── Contract URI: ❌', e.message);
    }
    
    // Test tokenURI if any tokens exist
    console.log('\n🎨 TOKEN URI TEST:');
    try {
        const totalSupply = await contract.totalSupply();
        if (totalSupply > 0) {
            const tokenURI = await contract.tokenURI(1);
            console.log('├── Token #1 URI:', tokenURI);
        } else {
            console.log('└── No tokens minted yet');
        }
    } catch (e) {
        console.log('└── ❌', e.message);
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('✅ Contract test complete!');
    console.log('\n💡 Next Steps:');
    console.log('   • Verify contract on Etherscan');
    console.log('   • Test minting functionality');
    console.log('   • Update metadata URIs if needed');
    console.log('   • Enable public mint when ready');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    });
