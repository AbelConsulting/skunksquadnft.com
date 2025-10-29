/**
 * Withdraw Contract Funds
 * Withdraws all ETH from the contract to the owner's wallet
 */

const { ethers } = require('ethers');
require('dotenv').config();

const CONTRACT_ADDRESS = '0xAa5C50099bEb130c8988324A0F6Ebf65979f10EF';
const SEPOLIA_RPC = process.env.SEPOLIA_RPC_URL || 'https://eth-sepolia.public.blastapi.io';
const PRIVATE_KEY = process.env.PRIVATE_KEY;

const CONTRACT_ABI = [
    "function withdraw() external",
    "function owner() view returns (address)",
    "function totalSupply() view returns (uint256)"
];

async function main() {
    console.log('💰 Contract Withdrawal Test\n');
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
    try {
        const owner = await contract.owner();
        console.log('👑 Contract Owner:', owner);

        if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
            console.log('\n❌ ERROR: You are not the contract owner!');
            console.log('Only the owner can withdraw funds.');
            process.exit(1);
        }
        console.log('✅ Ownership verified');
    } catch (e) {
        console.log('⚠️  Could not verify ownership:', e.message);
    }

    // Check balances before withdrawal
    const contractBalance = await provider.getBalance(CONTRACT_ADDRESS);
    const walletBalanceBefore = await provider.getBalance(wallet.address);
    
    console.log('\n📊 Current Balances:');
    console.log('├── Contract Balance:', ethers.utils.formatEther(contractBalance), 'ETH');
    console.log('└── Your Wallet:', ethers.utils.formatEther(walletBalanceBefore), 'ETH');

    if (contractBalance.eq(0)) {
        console.log('\n⚠️  Contract has no funds to withdraw');
        process.exit(0);
    }

    // Get total supply for context
    const totalSupply = await contract.totalSupply();
    console.log('\n🎨 Collection Stats:');
    console.log('└── Total Minted:', totalSupply.toString(), 'NFTs');

    // Withdraw
    console.log('\n⏳ Withdrawing funds...');
    console.log('   Sending transaction...');

    try {
        const tx = await contract.withdraw({
            gasLimit: 100000
        });

        console.log('✅ Transaction sent:', tx.hash);
        console.log('⏳ Waiting for confirmation...');

        const receipt = await tx.wait();
        console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
        console.log('⛽ Gas used:', receipt.gasUsed.toString());

        // Check balances after withdrawal
        const contractBalanceAfter = await provider.getBalance(CONTRACT_ADDRESS);
        const walletBalanceAfter = await provider.getBalance(wallet.address);
        const received = walletBalanceAfter.sub(walletBalanceBefore);

        console.log('\n💰 Withdrawal Results:');
        console.log('├── Contract Balance After:', ethers.utils.formatEther(contractBalanceAfter), 'ETH');
        console.log('├── Your Wallet After:', ethers.utils.formatEther(walletBalanceAfter), 'ETH');
        console.log('└── Net Received (after gas):', ethers.utils.formatEther(received), 'ETH');

        console.log('\n🎉 WITHDRAWAL COMPLETE!');
        console.log('='.repeat(70));
        console.log('🔗 View transaction:');
        console.log(`   https://sepolia.etherscan.io/tx/${tx.hash}`);

    } catch (error) {
        console.error('\n❌ Withdrawal failed!');
        console.error('Error:', error.message);

        if (error.reason) {
            console.error('Reason:', error.reason);
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
