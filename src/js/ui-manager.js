/**
 * SkunkSquad NFT - UI Manager
 * Centralized UI state management and updates
 */

class UIManager {
    constructor() {
        this.elements = {};
        this.state = {
            isConnected: false,
            isMinting: false,
            currentAccount: null,
            currentNetwork: null
        };
        this.init();
    }

    init() {
        console.log('🎨 Initializing UI Manager...');
        this.cacheElements();
        this.setupEventListeners();
    }

    // Cache DOM elements for better performance
    cacheElements() {
        this.elements = {
            // Buttons
            connectBtn: document.getElementById('connectBuyBtn'),
            buyNowBtn: document.getElementById('buyNowBtn'),
            
            // Modals
            paymentModal: document.getElementById('paymentModal'),
            
            // Price displays
            priceDisplays: document.querySelectorAll('.price-eth'),
            priceUSDDisplays: document.querySelectorAll('.price-usd'),
            totalEth: document.getElementById('total-eth'),
            
            // Quantity
            quantityInput: document.getElementById('mint-quantity'),
            
            // Wallet info
            walletAddress: document.querySelector('.wallet-address'),
            networkDisplay: document.querySelector('.network-display')
        };
    }

    setupEventListeners() {
        // Close modal when clicking outside
        if (this.elements.paymentModal) {
            this.elements.paymentModal.addEventListener('click', (e) => {
                if (e.target === this.elements.paymentModal) {
                    this.closeModal();
                }
            });
        }

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.elements.paymentModal?.style.display === 'flex') {
                this.closeModal();
            }
        });

        // Update total when quantity changes
        if (this.elements.quantityInput) {
            this.elements.quantityInput.addEventListener('input', () => {
                this.updateTotal();
            });
        }
    }

    // Button State Management
    updateButton(elementId, state) {
        const button = document.getElementById(elementId);
        if (!button) return;

        const config = window.SkunkSquadConfig;
        button.innerHTML = config.utils.getButtonHTML(state);
        
        // Disable button for certain states
        button.disabled = ['connecting', 'minting'].includes(state);
    }

    // Modal Management
    showModal() {
        if (this.elements.paymentModal) {
            this.elements.paymentModal.style.display = 'flex';
            this.elements.paymentModal.focus();
        }
    }

    closeModal() {
        if (this.elements.paymentModal) {
            this.elements.paymentModal.style.display = 'none';
        }
    }

    // Price Updates
    updatePrices() {
        const config = window.SkunkSquadConfig;
        const ethPrice = config.contract.mintPrice;
        const usdPrice = Math.round(parseFloat(ethPrice) * 2400); // ~$2400/ETH

        // Update ETH prices
        if (this.elements.priceDisplays) {
            this.elements.priceDisplays.forEach(el => {
                el.textContent = `${ethPrice} ETH`;
            });
        }

        // Update USD prices
        if (this.elements.priceUSDDisplays) {
            this.elements.priceUSDDisplays.forEach(el => {
                el.textContent = `(~$${usdPrice})`;
            });
        }
    }

    updateTotal() {
        const config = window.SkunkSquadConfig;
        const quantity = parseInt(this.elements.quantityInput?.value || 1);
        const total = config.utils.calculateTotal(quantity);

        if (this.elements.totalEth) {
            this.elements.totalEth.textContent = `${total} ETH`;
        }
    }

    // Wallet Display Updates
    updateWalletDisplay(address, network) {
        this.state.isConnected = !!address;
        this.state.currentAccount = address;
        this.state.currentNetwork = network;

        const config = window.SkunkSquadConfig;

        if (this.elements.walletAddress && address) {
            this.elements.walletAddress.textContent = config.utils.formatAddress(address);
        }

        if (this.elements.networkDisplay && network) {
            this.elements.networkDisplay.textContent = network;
        }
    }

    // Notifications
    showSuccess(message) {
        alert(message);
        // TODO: Replace with better notification system (toast/snackbar)
    }

    showError(message) {
        alert(message);
        // TODO: Replace with better error notification
    }

    showInfo(message) {
        alert(message);
        // TODO: Replace with better info notification
    }

    // Loading States
    showLoading(message = 'Loading...') {
        // TODO: Implement loading overlay
        console.log('⏳', message);
    }

    hideLoading() {
        // TODO: Hide loading overlay
        console.log('✅ Loading complete');
    }

    // Transaction Feedback
    showTransactionPending(txHash) {
        const config = window.SkunkSquadConfig;
        const explorerLink = config.utils.getTxLink(txHash);
        this.showInfo(`⏳ Transaction Pending\n\nView on Etherscan:\n${explorerLink}`);
    }

    showTransactionSuccess(txHash) {
        const config = window.SkunkSquadConfig;
        const message = config.messages.minted(txHash);
        this.showSuccess(message);
    }

    showTransactionError(error) {
        const config = window.SkunkSquadConfig;
        let message = config.errors.mintFailed;

        if (error.code === 4001) {
            message = config.errors.userRejected;
        } else if (error.message?.includes('insufficient funds')) {
            message = config.errors.insufficientFunds;
        }

        this.showError(message);
    }
}

// Make UI Manager globally available
window.uiManager = new UIManager();

console.log('✅ UI Manager Loaded');
