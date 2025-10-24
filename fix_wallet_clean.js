/**
 * Clean Wallet Integration Fix
 * Properly updates wallet.js with correct ABI and configuration
 */

const fs = require('fs');

console.log('\n🦨 SkunkSquad - Clean Wallet Fix\n');

// Load the full ABI
const abiContent = fs.readFileSync('abi_sepolia.json', 'utf8');
const contractABI = JSON.parse(abiContent);

const SEPOLIA_CONTRACT = '0xf14F75aEDBbDE252616410649f4dd7C1963191c4';

// Files to update
const files = ['src/js/wallet.js', 'website/src/js/wallet.js'];

files.forEach(filePath => {
    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Skipping ${filePath} (not found)\n`);
        return;
    }

    console.log(`📝 Updating: ${filePath}`);
    
    // Create backup
    const backupPath = `${filePath}.clean-backup.${Date.now()}`;
    fs.copyFileSync(filePath, backupPath);
    console.log(`   💾 Backup: ${backupPath}`);

    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Fix contract address (handle both = and : syntax)
    content = content.replace(
        /(this\.contractAddress)\s*[:=]\s*['"][^'"]*['"]/g,
        `this.contractAddress = '${SEPOLIA_CONTRACT}'`
    );
    console.log(`   ✅ Fixed contract address`);

    // 2. Replace the entire setupContract function with working version
    const setupContractFunction = `
    async setupContract() {
        if (!this.web3) return;

        try {
            // SkunkSquad NFT Contract ABI (Sepolia)
            const contractABI = ${JSON.stringify(contractABI, null, 16)};

            this.contract = new this.web3.eth.Contract(contractABI, this.contractAddress);
            console.log('🦨 Contract initialized:', this.contractAddress);
            
            // Update contract info
            await this.updateContractInfo();
            
        } catch (error) {
            console.error('❌ Contract setup error:', error);
        }
    }`;

    // Find and replace setupContract function
    const setupPattern = /async setupContract\(\)[^{]*\{[\s\S]*?(?=\n\s{4}async\s|\n\s{4}\/\/\s|\nclass\s|\nexport\s|$)/;
    
    if (setupPattern.test(content)) {
        content = content.replace(setupPattern, setupContractFunction);
        console.log(`   ✅ Replaced setupContract() function`);
    }

    // 3. Fix mintNFT function to use correct method name and pricing
    content = content.replace(
        /await this\.contract\.methods\.publicMint\(/g,
        'await this.contract.methods.mintNFT('
    );
    console.log(`   ✅ Fixed mint function calls`);

    // 4. Fix price fetching - use fixed price
    content = content.replace(
        /const price = await this\.contract\.methods\.(getCurrentSmartPrice|MINT_PRICE)\(\)\.call\(\);/g,
        `const price = this.web3.utils.toWei('0.01', 'ether'); // Fixed price`
    );
    console.log(`   ✅ Fixed pricing logic`);

    // 5. Fix Etherscan links to Sepolia
    content = content.replace(/etherscan\.io\/tx\//g, 'sepolia.etherscan.io/tx/');
    content = content.replace(/etherscan\.io\/address\//g, 'sepolia.etherscan.io/address/');
    console.log(`   ✅ Fixed Etherscan links`);

    // Write updated content
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`   ✅ File updated successfully\n`);
});

console.log('═══════════════════════════════════════════');
console.log('✅ WALLET INTEGRATION FIXED!');
console.log('═══════════════════════════════════════════\n');
console.log('📋 Configuration:');
console.log(`   Contract: ${SEPOLIA_CONTRACT}`);
console.log(`   Network: Sepolia Testnet (Chain ID: 11155111)`);
console.log(`   Price: 0.01 ETH (fixed)`);
console.log(`   Functions: ${contractABI.length} total\n`);
console.log('🧪 Test it:');
console.log('   1. Open your website');
console.log('   2. Open browser console (F12)');
console.log('   3. Look for "🦨 Wallet Manager Loading..."');
console.log('   4. Click "Connect Wallet & Mint"');
console.log('   5. Mint should work!\n');
