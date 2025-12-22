/**
 * Withdraw Contract Funds (Mainnet-aware)
 * Safe: Requires explicit confirmation when running against mainnet
 */

const { ethers } = require('ethers');
require('dotenv').config();
const readline = require('readline');

const CONTRACT_ADDRESS = '0xAa5C50099bEb130c8988324A0F6Ebf65979f10EF';
const PRIVATE_KEY = process.env.PRIVATE_KEY;
// Prefer an explicit RPC URL. Useful env vars: RPC_URL, MAINNET_RPC_URL, SEPOLIA_RPC_URL
const RPC_URL = process.env.RPC_URL || process.env.MAINNET_RPC_URL || process.env.SEPOLIA_RPC_URL || 'https://rpc.ankr.com/eth';

const CONTRACT_ABI = [
    "function withdraw() external",
    "function owner() view returns (address)",
    "function totalSupply() view returns (uint256)"
];

function ask(question) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => rl.question(question, (ans) => { rl.close(); resolve(ans); }));
}

async function main() {
    console.log('💰 Contract Withdrawal (Hardened)\n');
    console.log('='.repeat(70));
    console.log('📍 Contract:', CONTRACT_ADDRESS);
    console.log('='.repeat(70));

    const args = process.argv.slice(2);
    const AUTO_YES = args.includes('--yes');
    const SIMULATE = args.includes('--simulate');
    const CONFIRM_MAINNET_FLAG = args.includes('--confirm-mainnet');
    const confirmationsArg = args.find(a => a.startsWith('--confirmations='));
    const CONFIRMATIONS = confirmationsArg ? parseInt(confirmationsArg.split('=')[1], 10) || 1 : 1;
    const SHOW_HELP = args.includes('--help') || args.includes('-h');

    if (SHOW_HELP) {
        console.log('\nUsage: node withdraw-funds.js [--yes] [--simulate] [--confirm-mainnet] [--confirmations=N]');
        console.log('  --yes           skip interactive confirmation');
        console.log('  --simulate      run checks but do not send the transaction');
        console.log('  --confirm-mainnet  additional safety gate to allow running on mainnet');
        console.log('  --confirmations=N  wait for N confirmations (default: 1)');
        process.exit(0);
    }

    if (!PRIVATE_KEY) {
        console.error('\n❌ Error: PRIVATE_KEY not found in .env file');
        process.exit(1);
    }

    // Setup provider (RPC URL selected from env)
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const network = await provider.getNetwork();
    console.log('\n🔗 Connected network:', network.name, `(chainId: ${network.chainId})`);

    // If mainnet, require explicit confirmation flag OR typing CONFIRM-MAINNET interactively
    if (network.chainId === 1 && !CONFIRM_MAINNET_FLAG) {
        console.log('\n⚠️  You are connected to MAINNET. This script will move real funds.');
        const answer = await ask('Type CONFIRM-MAINNET to proceed (or anything else to abort): ');
        if (answer !== 'CONFIRM-MAINNET') {
            console.error('Aborted: mainnet confirmation not provided. To skip this prompt use --confirm-mainnet (careful!)');
            process.exit(1);
        }
    }

    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);

    console.log('\n👤 Your Address:', wallet.address);

    // Check ownership (fail hard if we can't verify)
    let owner;
    try {
        owner = await contract.owner();
        console.log('👑 Contract Owner:', owner);
    } catch (e) {
        console.error('\n❌ Failed to read contract owner:', e.stack || e.message);
        process.exit(1);
    }

    if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
        console.error('\n❌ ERROR: You are not the contract owner! Only the owner can withdraw funds.');
        process.exit(1);
    }
    console.log('✅ Ownership verified');

    // Check balances before withdrawal
    const contractBalanceBefore = await provider.getBalance(CONTRACT_ADDRESS);
    const walletBalanceBefore = await provider.getBalance(wallet.address);

    console.log('\n📊 Current Balances:');
    console.log('├── Contract Balance:', ethers.utils.formatEther(contractBalanceBefore), 'ETH');
    console.log('└── Your Wallet:', ethers.utils.formatEther(walletBalanceBefore), 'ETH');

    if (contractBalanceBefore.eq(0)) {
        console.log('\n⚠️  Contract has no funds to withdraw');
        process.exit(0);
    }

    // Get total supply for context (best effort)
    try {
        const totalSupply = await contract.totalSupply();
        console.log('\n🎨 Collection Stats:');
        console.log('└── Total Minted:', totalSupply.toString(), 'NFTs');
    } catch (e) {
        console.warn('\n⚠️  Could not read totalSupply:', e.message);
    }

    // Confirm action (unless auto-approved)
    console.log('\n⏳ Withdrawal preview:');
    console.log(`   Will attempt to withdraw ${ethers.utils.formatEther(contractBalanceBefore)} ETH to ${wallet.address}`);
    if (SIMULATE) {
        console.log('   (Simulation mode: no transaction will be sent)');
    }

    if (!AUTO_YES && !SIMULATE) {
        const ans = await ask('Proceed with withdrawal? (y/N): ');
        if (!/^y(es)?$/i.test(ans)) {
            console.log('Aborted by user.');
            process.exit(0);
        }
    }

    if (SIMULATE) {
        console.log('\n✅ Simulation complete — no transaction sent.');
        process.exit(0);
    }

    // Prepare transaction options: estimate gas + EIP-1559 fields when available
    let txOptions = {};
    try {
        const gasEstimate = await contract.estimateGas.withdraw();
        const feeData = await provider.getFeeData();

        // Add a small buffer to gas estimate
        txOptions.gasLimit = gasEstimate.mul(12).div(10); // +20%

        if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
            txOptions.maxFeePerGas = feeData.maxFeePerGas;
            txOptions.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
        } else if (feeData.gasPrice) {
            txOptions.gasPrice = feeData.gasPrice;
        }

        console.log('\n🔧 Transaction options:');
        console.log('├── Estimated gas (with buffer):', txOptions.gasLimit.toString());
        if (txOptions.maxFeePerGas) {
            console.log('├── maxFeePerGas:', txOptions.maxFeePerGas.toString());
            console.log('└── maxPriorityFeePerGas:', txOptions.maxPriorityFeePerGas.toString());
        } else {
            console.log('└── gasPrice:', txOptions.gasPrice ? txOptions.gasPrice.toString() : 'N/A');
        }
    } catch (e) {
        console.warn('\n⚠️  Could not estimate gas or fee data, proceeding with default options:', e.message);
        // leave txOptions empty; rely on defaults (riskier but still attempt)
    }

    // Withdraw
    console.log('\n⏳ Withdrawing funds...');
    console.log('   Sending transaction...');

    let tx;
    try {
        tx = await contract.withdraw(txOptions);
        console.log('✅ Transaction sent:', tx.hash);
        console.log(`⏳ Waiting for ${CONFIRMATIONS} confirmation(s)...`);
    } catch (error) {
        console.error('\n❌ Failed to send transaction:', error.stack || error.message);
        process.exit(1);
    }

    let receipt;
    try {
        receipt = await tx.wait(CONFIRMATIONS);
        if (receipt.status !== 1) {
            console.error('\n❌ Transaction failed (status !== 1). Receipt:', receipt);
            process.exit(1);
        }

        const effectiveGasPrice = receipt.effectiveGasPrice || tx.gasPrice || ethers.BigNumber.from(0);
        const gasCost = receipt.gasUsed.mul(effectiveGasPrice);

        console.log('✅ Transaction confirmed in block:', receipt.blockNumber);
        console.log('⛽ Gas used:', receipt.gasUsed.toString());
        if (effectiveGasPrice) {
            console.log('⛽ Effective gas price:', effectiveGasPrice.toString());
            console.log('⛽ Gas cost (ETH):', ethers.utils.formatEther(gasCost));
        }

        // Check balances after withdrawal
        const contractBalanceAfter = await provider.getBalance(CONTRACT_ADDRESS);
        const walletBalanceAfter = await provider.getBalance(wallet.address);

        const contractDecrease = contractBalanceBefore.sub(contractBalanceAfter);
        const walletIncrease = walletBalanceAfter.sub(walletBalanceBefore);

        console.log('\n💰 Withdrawal Results:');
        console.log('├── Contract Balance After:', ethers.utils.formatEther(contractBalanceAfter), 'ETH');
        console.log('├── Your Wallet After:', ethers.utils.formatEther(walletBalanceAfter), 'ETH');
        console.log('├── Contract decreased by:', ethers.utils.formatEther(contractDecrease), 'ETH');
        console.log('├── Your wallet increased by:', ethers.utils.formatEther(walletIncrease), 'ETH');
        console.log('└── Net Received (after gas):', ethers.utils.formatEther(walletIncrease.sub(gasCost)), 'ETH');

        console.log('\n🎉 WITHDRAWAL COMPLETE!');
        console.log('='.repeat(70));
        const explorerBase = network.chainId === 1 ? 'https://etherscan.io' : `https://${network.name}.etherscan.io`;
        console.log('🔗 View transaction:');
        console.log(`   ${explorerBase}/tx/${tx.hash}`);

    } catch (error) {
        console.error('\n❌ Withdrawal failed during confirmation/wait phase!');
        console.error('Error:', error.stack || error.message);
        if (receipt) console.error('Receipt (if any):', receipt);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('\n❌ Script error:', error.stack || error.message);
        process.exit(1);
    });
