/**
 * Update Wallet Integration with Correct ABI
 * 
 * This script automatically updates your wallet.js with:
 * - Correct contract address (Sepolia: 0xf14F75aEDBbDE252616410649f4dd7C1963191c4)
 * - Full contract ABI from abi_sepolia.json
 * - Fixed function names (mintNFT instead of publicMint)
 * - Correct pricing (0.01 ETH fixed instead of dynamic)
 * 
 * Usage: node update_wallet_integration.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n🦨 SkunkSquad NFT - Wallet Integration Updater\n');

// Configuration
const SEPOLIA_CONTRACT = '0xf14F75aEDBbDE252616410649f4dd7C1963191c4';
const MAINNET_CONTRACT = '0x6BA18b88b64af8898bbb42262ED18EC13DC81315';
const ABI_FILE = 'abi_sepolia.json';
const WALLET_FILES = [
    'src/js/wallet.js',
    'website/src/js/wallet.js'
];

// Step 1: Load the ABI
console.log('📂 Step 1: Loading ABI...');
let contractABI;

try {
    if (!fs.existsSync(ABI_FILE)) {
        console.error(`❌ Error: ${ABI_FILE} not found!`);
        console.log('💡 Run this first: node extract_abi_from_contract.js');
        process.exit(1);
    }

    const abiContent = fs.readFileSync(ABI_FILE, 'utf8');
    contractABI = JSON.parse(abiContent);
    console.log(`✅ Loaded ABI with ${contractABI.length} functions\n`);
    
} catch (error) {
    console.error('❌ Failed to load ABI:', error.message);
    process.exit(1);
}

// Step 2: Update wallet files
console.log('🔧 Step 2: Updating wallet integration files...\n');

WALLET_FILES.forEach(walletFile => {
    if (!fs.existsSync(walletFile)) {
        console.log(`⚠️  Skipping ${walletFile} (not found)`);
        return;
    }

    try {
        console.log(`📝 Updating: ${walletFile}`);
        
        // Create backup
        const backupFile = walletFile + '.backup.' + Date.now();
        fs.copyFileSync(walletFile, backupFile);
        console.log(`   💾 Backup created: ${backupFile}`);
        
        // Read current content
        let content = fs.readFileSync(walletFile, 'utf8');
        
        // Update contract address (Sepolia)
        content = content.replace(
            /contractAddress\s*[:=]\s*['"][^'"]*['"]/g,
            `contractAddress: '${SEPOLIA_CONTRACT}'`
        );
        console.log(`   ✅ Updated contract address to Sepolia: ${SEPOLIA_CONTRACT}`);
        
        // Replace the ABI
        // Find the contractABI declaration and replace it
        const abiPattern = /contractABI\s*[:=]\s*\[[\s\S]*?\]\s*[,;]/;
        const abiReplacement = `contractABI: ${JSON.stringify(contractABI, null, 8).replace(/\n/g, '\n        ')},`;
        
        if (abiPattern.test(content)) {
            content = content.replace(abiPattern, abiReplacement);
            console.log(`   ✅ Replaced ABI with full contract ABI (${contractABI.length} functions)`);
        } else {
            console.log(`   ⚠️  Could not find contractABI pattern to replace`);
        }
        
        // Fix function names: publicMint → mintNFT
        const publicMintCount = (content.match(/\.publicMint\(/g) || []).length;
        if (publicMintCount > 0) {
            content = content.replace(/\.publicMint\(/g, '.mintNFT(');
            console.log(`   ✅ Fixed ${publicMintCount} publicMint() calls → mintNFT()`);
        }
        
        // Fix pricing calls
        content = content.replace(/getCurrentSmartPrice\(\)/g, 'PRICE()');
        content = content.replace(/MINT_PRICE\(\)/g, 'PRICE()');
        console.log(`   ✅ Updated price method calls`);
        
        // Add comment about fixed pricing
        const fixedPriceNote = `
            // Note: This contract has FIXED pricing at 0.01 ETH per NFT
            // Use contract.methods.PRICE().call() to get the price
            const pricePerNFT = this.web3.utils.toWei('0.01', 'ether'); // Fixed: 0.01 ETH`;
        
        // Replace dynamic pricing logic with fixed pricing
        content = content.replace(
            /const price = await this\.contract\.methods\.[^)]+\(\)\.call\(\);[\s\S]*?const totalCost/,
            fixedPriceNote + '\n            const totalCost'
        );
        
        // Update Etherscan links to Sepolia
        content = content.replace(
            /etherscan\.io\/tx\//g,
            'sepolia.etherscan.io/tx/'
        );
        console.log(`   ✅ Updated Etherscan links to Sepolia`);
        
        // Write updated content
        fs.writeFileSync(walletFile, content, 'utf8');
        console.log(`   ✅ File updated successfully\n`);
        
    } catch (error) {
        console.error(`   ❌ Failed to update ${walletFile}:`, error.message);
    }
});

// Step 3: Create integration summary
console.log('📊 Step 3: Creating integration summary...\n');

const summary = {
    network: 'Sepolia Testnet',
    chainId: 11155111,
    contractAddress: SEPOLIA_CONTRACT,
    explorerUrl: `https://sepolia.etherscan.io/address/${SEPOLIA_CONTRACT}`,
    price: '0.01 ETH',
    maxSupply: 10000,
    functions: {
        mint: 'mintNFT(quantity)',
        totalSupply: 'totalSupply()',
        price: 'PRICE()',
        revealed: 'revealed()',
        withdraw: 'withdraw() [owner only]'
    },
    updatedFiles: WALLET_FILES.filter(f => fs.existsSync(f)),
    timestamp: new Date().toISOString()
};

fs.writeFileSync('integration-summary.json', JSON.stringify(summary, null, 2));
console.log('✅ Integration summary saved to: integration-summary.json\n');

// Display summary
console.log('═══════════════════════════════════════════════════');
console.log('🎉 INTEGRATION UPDATE COMPLETE!');
console.log('═══════════════════════════════════════════════════\n');
console.log('📋 Summary:');
console.log(`   Network: ${summary.network}`);
console.log(`   Chain ID: ${summary.chainId}`);
console.log(`   Contract: ${summary.contractAddress}`);
console.log(`   Explorer: ${summary.explorerUrl}`);
console.log(`   Mint Price: ${summary.price}`);
console.log(`   Max Supply: ${summary.maxSupply}`);
console.log(`\n✅ Updated Files: ${summary.updatedFiles.length}`);
summary.updatedFiles.forEach(file => {
    console.log(`   • ${file}`);
});

console.log('\n🧪 Next Steps:');
console.log('   1. Get Sepolia testnet ETH: https://sepoliafaucet.com/');
console.log('   2. Open your website in a browser');
console.log('   3. Connect MetaMask (switch to Sepolia network)');
console.log('   4. Test minting an NFT (0.01 ETH + gas)');
console.log(`   5. View transaction: ${summary.explorerUrl}#internaltx`);

console.log('\n📖 Full Guide: See IMPLEMENTATION_GUIDE.md');
console.log('\n✨ Happy minting! 🦨\n');
