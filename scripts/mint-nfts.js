/**
 * Mint NFTs from SkunkSquad Contract
 * Owner minting function
 */

const { ethers } = require('ethers');
require('dotenv').config();

const CONTRACT_ADDRESS = '0xf14F75aEDBbDE252616410649f4dd7C1963191c4';
const SEPOLIA_RPC = process.env.SEPOLIA_RPC_URL || 'https://eth-sepolia.public.blastapi.io';
const PRIVATE_KEY = process.env.PRIVATE_KEY;

// Contract ABI - just the functions we need
const CONTRACT_ABI = [
    "function ownerMint(address to, uint256 quantity) external",
    "function mintNFT(uint256 quantity) external payable",
    "function totalSupply() view returns (uint256)",
    "function balanceOf(address owner) view returns (uint256)",
    "function PRICE() view returns (uint256)"
];

async function main() {
    console.log('🦨 Minting SkunkSquad NFTs\n');
    console.log('=' .repeat(60));
    
    if (!PRIVATE_KEY) {
        console.error('❌ Error: PRIVATE_KEY not found in .env file');
        process.exit(1);
    }
    
    // Setup provider and wallet
    const provider = new ethers.providers.JsonRpcProvider(SEPOLIA_RPC);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
    
    console.log('📍 Contract:', CONTRACT_ADDRESS);
    console.log('👤 Your Address:', wallet.address);
    console.log('🌐 Network: Sepolia');
    console.log('=' .repeat(60));
    
    // Get current state
    try {
        const balance = await provider.getBalance(wallet.address);
        console.log('\n💰 Wallet Balance:', ethers.utils.formatEther(balance), 'ETH');
        
        const totalSupply = await contract.totalSupply();
        console.log('📊 Current Total Supply:', totalSupply.toString());
        
        const yourBalance = await contract.balanceOf(wallet.address);
        console.log('🎨 Your NFT Balance:', yourBalance.toString());
        
    } catch (e) {
        console.log('⚠️  Could not read contract state:', e.message);
    }
    
    // Mint NFTs
    const quantity = 2;
    console.log('\n⏳ Minting', quantity, 'NFTs...');
    
    try {
        // Try owner mint first (free for owner)
        console.log('Attempting owner mint (free)...');
        const tx = await contract.ownerMint(wallet.address, quantity, {
            gasLimit: 500000
        });
        
        console.log('✅ Transaction sent:', tx.hash);
        console.log('⏳ Waiting for confirmation...');
        
        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
        console.log('⛽ Gas used:', receipt.gasUsed.toString());
        
        // Get updated balances
        const newTotalSupply = await contract.totalSupply();
        const newYourBalance = await contract.balanceOf(wallet.address);
        
        console.log('\n🎉 MINTING SUCCESSFUL!');
        console.log('=' .repeat(60));
        console.log('📊 New Total Supply:', newTotalSupply.toString());
        console.log('🎨 Your NFT Balance:', newYourBalance.toString());
        console.log('🔗 View on Etherscan:');
        console.log(`   https://sepolia.etherscan.io/tx/${tx.hash}`);
        
    } catch (error) {
        console.log('\n❌ Owner mint failed, trying public mint...');
        
        try {
            // Try public mint with payment
            const price = await contract.PRICE();
            const totalCost = price.mul(quantity);
            
            console.log('💰 Cost:', ethers.utils.formatEther(totalCost), 'ETH');
            
            const tx = await contract.mintNFT(quantity, {
                value: totalCost,
                gasLimit: 500000
            });
            
            console.log('✅ Transaction sent:', tx.hash);
            console.log('⏳ Waiting for confirmation...');
            
            const receipt = await tx.wait();
            console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
            console.log('⛽ Gas used:', receipt.gasUsed.toString());
            
            // Get updated balances
            const newTotalSupply = await contract.totalSupply();
            const newYourBalance = await contract.balanceOf(wallet.address);
            
            console.log('\n🎉 MINTING SUCCESSFUL!');
            console.log('=' .repeat(60));
            console.log('📊 New Total Supply:', newTotalSupply.toString());
            console.log('🎨 Your NFT Balance:', newYourBalance.toString());
            console.log('🔗 View on Etherscan:');
            console.log(`   https://sepolia.etherscan.io/tx/${tx.hash}`);
            
        } catch (publicError) {
            console.error('\n❌ Minting failed!');
            console.error('Error:', publicError.message);
            
            if (publicError.reason) {
                console.error('Reason:', publicError.reason);
            }
            
            if (publicError.error && publicError.error.message) {
                console.error('Details:', publicError.error.message);
            }
            
            process.exit(1);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('\n❌ Script error:', error.message);
        process.exit(1);
    });
