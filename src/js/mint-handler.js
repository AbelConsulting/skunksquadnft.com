/**
 * SkunkSquad NFT - Mint Handler
 * Centralized minting logic with two-click flow
 */

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
