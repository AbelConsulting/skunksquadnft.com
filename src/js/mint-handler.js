/**
 * SkunkSquad NFT - Mint Handler
 * Centralized minting logic with two-click flow
 */

console.log('🦨 mint-handler.js loading...');

(function() {
    'use strict';

    // ========================================
    // REMOVE THIS INFINITE LOOP SECTION:
    // ========================================
    /*
    // OLD CODE - DELETE THIS:
    function waitForDependencies() {
        console.log('⏳ Waiting for dependencies...');
        if (typeof Web3 === 'undefined' || !window.walletManager) {
            setTimeout(waitForDependencies, 100);
            return;
        }
        // ...
    }
    waitForDependencies();
    */

    // ========================================
    // NEW CODE - USE THIS INSTEAD:
    // ========================================
    
    // Initialize mint handler (don't wait for dependencies)
    window.mintHandler = {
        async handleMint(quantity) {
            console.log('🦨 handleMint called with quantity:', quantity);
            
            // Check dependencies at execution time, not load time
            if (typeof Web3 === 'undefined') {
                console.error('❌ Web3 not loaded');
                alert('Web3 library not loaded. Please refresh the page.');
                return;
            }
            
            if (!window.walletManager) {
                console.error('❌ Wallet manager not initialized');
                alert('Wallet manager not ready. Please refresh the page.');
                return;
            }
            
            if (!window.walletManager.isConnected) {
                console.log('⚠️ Wallet not connected, connecting now...');
                const connected = await window.walletManager.connectWallet();
                if (!connected) {
                    console.error('❌ Failed to connect wallet');
                    return;
                }
            }
            
            try {
                console.log('🚀 Starting mint process...');
                
                // Show loading state
                const mintBtn = document.getElementById('wmc-mint-btn');
                const mintBtnText = document.getElementById('wmc-mint-btn-text');
                const mintBtnSpinner = document.getElementById('wmc-mint-btn-spinner');
                
                if (mintBtn) {
                    mintBtn.disabled = true;
                    mintBtn.classList.add('loading');
                }
                if (mintBtnText) mintBtnText.textContent = 'Minting...';
                if (mintBtnSpinner) mintBtnSpinner.style.display = 'inline-block';
                
                // Get contract instance
                const contract = window.walletManager.contract;
                if (!contract) {
                    throw new Error('Contract not initialized');
                }
                
                // Calculate total cost
                const pricePerNFT = await contract.methods.PRICE().call();
                const totalCost = BigInt(pricePerNFT) * BigInt(quantity);
                
                console.log('💰 Price per NFT:', pricePerNFT);
                console.log('💰 Total cost:', totalCost.toString());
                
                // Send transaction
                const accounts = window.walletManager.accounts;
                const txHash = await contract.methods.mint(quantity).send({
                    from: accounts[0],
                    value: totalCost.toString(),
                    gas: 300000 * quantity
                });
                
                console.log('✅ Mint successful! TX Hash:', txHash);
                
                // Update UI
                if (mintBtnText) mintBtnText.textContent = '✅ Minted!';
                
                // Show success message
                setTimeout(() => {
                    alert(`✅ Successfully minted ${quantity} NFT${quantity > 1 ? 's' : ''}!`);
                    window.closeWalletMintCard();
                    
                    // Reset button
                    if (mintBtn) {
                        mintBtn.disabled = false;
                        mintBtn.classList.remove('loading');
                    }
                    if (mintBtnText) mintBtnText.textContent = '🚀 Mint Now';
                    if (mintBtnSpinner) mintBtnSpinner.style.display = 'none';
                }, 1000);
                
            } catch (error) {
                console.error('❌ Mint error:', error);
                
                // Reset button
                const mintBtn = document.getElementById('wmc-mint-btn');
                const mintBtnText = document.getElementById('wmc-mint-btn-text');
                const mintBtnSpinner = document.getElementById('wmc-mint-btn-spinner');
                
                if (mintBtn) {
                    mintBtn.disabled = false;
                    mintBtn.classList.remove('loading');
                }
                if (mintBtnText) mintBtnText.textContent = '🚀 Mint Now';
                if (mintBtnSpinner) mintBtnSpinner.style.display = 'none';
                
                // Show error
                if (error.message.includes('User denied')) {
                    alert('❌ Transaction rejected');
                } else if (error.message.includes('insufficient funds')) {
                    alert('❌ Insufficient funds');
                } else {
                    alert('❌ Mint failed: ' + error.message);
                }
            }
        }
    };
    
    console.log('✅ Mint handler loaded');
})();

class MintHandler {
    constructor(walletManager, uiManager) {
        this.wallet = walletManager;
        this.ui = uiManager;
        this.config = window.SkunkSquadConfig;
    }

    /**
     * Main mint handler with two-click flow:
     * 1st click: Connect wallet
     * 2nd click: Mint NFT
     */
    async handleMint(quantity = 1) {
        console.log('🦨 Mint handler called');

        try {
            // Validate MetaMask
            if (typeof window.ethereum === 'undefined') {
                this.ui.showError(this.config.errors.noMetaMask);
                window.open('https://metamask.io/download/', '_blank');
                return false;
            }

            // Validate quantity
            if (quantity < 1 || quantity > this.config.contract.maxPerTransaction) {
                this.ui.showError(this.config.errors.invalidQuantity);
                return false;
            }

            // Wait for wallet manager if not ready
            if (!this.wallet) {
                console.log('⏳ Waiting for wallet manager...');
                await new Promise(resolve => setTimeout(resolve, 500));
                if (window.walletManager) {
                    this.wallet = window.walletManager;
                } else {
                    this.ui.showError(this.config.errors.walletManagerUnavailable || "Wallet manager is unavailable. Please try again later.");
                    return false;
                }
            }

            // Check if connected
            if (!this.wallet.isConnected) {
                return await this.connectAndNotify();
            } else {
                return await this.mintNFT(quantity);
            }

        } catch (error) {
            console.error('❌ Mint handler error:', error);
            this.ui.updateButton('connectBuyBtn', 'error');
            this.ui.showTransactionError(error);
            
            // Reset button after delay
            setTimeout(() => {
                this.ui.updateButton('connectBuyBtn', 
                    this.wallet.isConnected ? 'connected' : 'initial'
                );
            }, 3000);
            
            return false;
        }
    }

    /**
     * Connect wallet and show notification
     */
    async connectAndNotify() {
        console.log('🦨 Connecting wallet...');
        
        this.ui.updateButton('connectBuyBtn', 'connecting');
        
        const connected = await this.wallet.connectWallet();
        
        if (connected) {
            console.log('✅ Wallet connected');
            this.ui.updateButton('connectBuyBtn', 'connected');
            this.ui.showSuccess(this.config.messages.connected);
            return true;
        } else {
            console.error('❌ Connection failed');
            this.ui.updateButton('connectBuyBtn', 'initial');
            this.ui.showError(this.config.errors.connectionFailed);
            return false;
        }
    }

    /**
     * Execute NFT mint transaction
     */
    async mintNFT(quantity) {
        console.log(`🦨 Minting ${quantity} NFT(s)...`);
        
        this.ui.updateButton('connectBuyBtn', 'minting');
        
        const result = await this.wallet.mintNFT(quantity);
        
        if (result && result.transactionHash) {
            console.log('✅ Mint successful:', result.transactionHash);
            
            this.ui.updateButton('connectBuyBtn', 'success');
            this.ui.showTransactionSuccess(result.transactionHash);
            
            // Reset button after delay
            setTimeout(() => {
                this.ui.updateButton('connectBuyBtn', 'connected');
            }, 3000);
            
            return true;
        } else {
            throw new Error('Mint transaction failed');
        }
    }

    /**
     * Quick connect function (for header/nav buttons)
     */
    async quickConnect() {
        if (this.wallet.isConnected) {
            this.ui.showInfo(`✅ Already Connected\n\n${this.config.utils.formatAddress(this.wallet.accounts[0])}`);
            return true;
        }
        
        return await this.connectAndNotify();
    }

    /**
     * Modal-based minting (from payment modal)
     */
    async mintFromModal() {
        const quantity = parseInt(this.ui.elements.quantityInput?.value) || 1;
        
        this.ui.closeModal();
        
        // Use main mint handler
        return await this.handleMint(quantity);
    }
}

// Initialize mint handler when wallet manager is ready
let mintHandler = null;

function initMintHandler() {
    if (window.walletManager && window.uiManager) {
        mintHandler = new MintHandler(window.walletManager, window.uiManager);
        window.mintHandler = mintHandler;
        console.log('✅ Mint Handler Initialized');
    } else {
        console.log('⏳ Waiting for dependencies...');
        setTimeout(initMintHandler, 100);
    }
}

// Start initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMintHandler);
} else {
    initMintHandler();
}
