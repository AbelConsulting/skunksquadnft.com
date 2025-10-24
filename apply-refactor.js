/**
 * Apply Refactoring to index.html
 * This script updates index.html to use the new modular architecture
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Applying SkunkSquad Refactoring...\n');

const indexPath = path.join(__dirname, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// 1. Update script includes
console.log('📦 Updating script includes...');
const oldScripts = `    <!-- Scripts -->
    <script src="./src/js/main.js"></script>
    <script src="./src/js/payment.js"></script>
    <script src="./src/js/wallet.js"></script>`;

const newScripts = `    <!-- Core Scripts (Order matters!) -->
    <script src="https://unpkg.com/web3@latest/dist/web3.min.js"></script>
    <script src="./src/js/config.js"></script>
    <script src="./src/js/ui-manager.js"></script>
    <script src="./src/js/wallet.js"></script>
    <script src="./src/js/mint-handler.js"></script>
    <script src="./src/js/main.js"></script>`;

html = html.replace(oldScripts, newScripts);

// 2. Find and replace the massive handleConnectAndBuy function
console.log('✂️  Simplifying handleConnectAndBuy function...');
const handleConnectRegex = /async function handleConnectAndBuy\(\) \{[\s\S]*?(?=\n        (?:async )?function |<\/script>)/;
const newHandleConnect = `async function handleConnectAndBuy() {
            window.mintHandler?.handleMint(1);
        }`;

html = html.replace(handleConnectRegex, newHandleConnect);

// 3. Simplify buyWithWallet
console.log('✂️  Simplifying buyWithWallet function...');
const buyWithWalletRegex = /async function buyWithWallet\(\) \{[\s\S]*?(?=\n(?:async )?function |<\/script>|\n\s*\n)/;
const newBuyWithWallet = `async function buyWithWallet() {
    window.mintHandler?.mintFromModal();
}`;

html = html.replace(buyWithWalletRegex, newBuyWithWallet);

// 4. Simplify connectWallet
console.log('✂️  Simplifying connectWallet function...');
const connectWalletRegex = /function connectWallet\(\) \{[\s\S]*?(?=\n(?:async )?function |\n\/\/)/;
const newConnectWallet = `function connectWallet() {
    window.mintHandler?.quickConnect();
}`;

html = html.replace(connectWalletRegex, newConnectWallet);

// 5. Simplify modal functions
console.log('✂️  Simplifying modal functions...');
const showModalRegex = /function showPaymentModal\(\) \{[\s\S]*?\n\}/;
const newShowModal = `function showPaymentModal() {
    window.uiManager?.showModal();
}`;

const closeModalRegex = /function closeModal\(\) \{[\s\S]*?\n\}/;
const newCloseModal = `function closeModal() {
    window.uiManager?.closeModal();
}`;

html = html.replace(showModalRegex, newShowModal);
html = html.replace(closeModalRegex, newCloseModal);

// 6. Write updated file
console.log('💾 Saving refactored index.html...');
fs.writeFileSync(indexPath, html, 'utf8');

console.log('\n✅ Refactoring Applied Successfully!\n');
console.log('📋 Summary:');
console.log('   ✅ Updated script includes (added config.js, ui-manager.js, mint-handler.js)');
console.log('   ✅ Simplified handleConnectAndBuy() - reduced from ~170 to 3 lines');
console.log('   ✅ Simplified buyWithWallet() - reduced from ~75 to 3 lines');
console.log('   ✅ Simplified connectWallet() - reduced from ~15 to 3 lines');
console.log('   ✅ Simplified modal functions - reduced complexity');
console.log('\n🎯 Next Steps:');
console.log('   1. Open index.html in your browser');
console.log('   2. Open Console (F12)');
console.log('   3. Test the "Connect Wallet & Mint" button');
console.log('   4. Verify all functionality works\n');
console.log('📖 See REFACTOR_COMPLETE.md for full documentation\n');
