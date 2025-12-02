/**
 * SkunkSquad NFT - Wallet Balance Checker
 * Check ETH balance and NFT holdings
 */

console.log('💳 Loading wallet balance checker...');

class WalletBalanceChecker {
    constructor() {
        this.web3 = null;
        this.balances = {
            eth: null,
            nfts: []
        };
        this.contract = null;
        this.isInitialized = false;
    }

    /**
     * Initialize the balance checker
     */
    async init() {
        if (this.isInitialized) return;
        
        // Wait for wallet manager
        await this.waitForWallet();
        
        // Listen for wallet connection events
        window.addEventListener('walletConnected', (e) => {
            this.checkBalances(e.detail.address);
        });
        
        // Check if already connected
        if (window.walletManager?.isConnected && window.walletManager.accounts[0]) {
            await this.checkBalances(window.walletManager.accounts[0]);
        }
        
        this.isInitialized = true;
        console.log('✅ Wallet balance checker initialized');
    }

    /**
     * Wait for wallet manager to be ready
     */
    async waitForWallet() {
        const maxAttempts = 20;
        let attempts = 0;
        
        while (attempts < maxAttempts) {
            if (window.walletManager?.web3) {
                this.web3 = window.walletManager.web3;
                
                // Get contract instance
                const contractAddress = window.CONFIG?.CONTRACT_ADDRESS || '0xAa5C50099bEb130c8988324A0F6Ebf65979f10EF';
                const abi = window.CONFIG?.CONTRACT_ABI || window.walletManager.contractABI;
                
                if (abi) {
                    this.contract = new this.web3.eth.Contract(abi, contractAddress);
                }
                
                console.log('✅ Web3 available for balance checking');
                return;
            }
            
            await new Promise(resolve => setTimeout(resolve, 500));
            attempts++;
        }
        
        console.warn('⚠️ Web3 not available for balance checking');
    }

    /**
     * Check all balances for an address
     */
    async checkBalances(address) {
        if (!this.web3 || !address) return;
        
        console.log('💳 Checking balances for:', address);
        
        try {
            // Check ETH balance
            await this.checkEthBalance(address);
            
            // Check NFT balance
            await this.checkNftBalance(address);
            
            // Dispatch event
            window.dispatchEvent(new CustomEvent('balancesChecked', {
                detail: {
                    address: address,
                    eth: this.balances.eth,
                    nfts: this.balances.nfts
                }
            }));
            
            return this.balances;
        } catch (error) {
            console.error('❌ Error checking balances:', error);
            return null;
        }
    }

    /**
     * Check ETH balance
     */
    async checkEthBalance(address) {
        try {
            const balance = await this.web3.eth.getBalance(address);
            const ethBalance = this.web3.utils.fromWei(balance, 'ether');
            
            this.balances.eth = {
                wei: balance,
                eth: parseFloat(ethBalance),
                formatted: parseFloat(ethBalance).toFixed(4)
            };
            
            console.log('💰 ETH Balance:', this.balances.eth.formatted, 'ETH');
            
            // Update UI elements
            this.updateEthDisplay();
            
            return this.balances.eth;
        } catch (error) {
            console.error('❌ Error checking ETH balance:', error);
            return null;
        }
    }

    /**
     * Check NFT balance (SkunkSquad NFTs owned)
     */
    async checkNftBalance(address) {
        if (!this.contract) {
            console.warn('⚠️ Contract not available for NFT balance check');
            return null;
        }
        
        try {
            // Get balance of SkunkSquad NFTs
            const balance = await this.contract.methods.balanceOf(address).call();
            const nftCount = parseInt(balance);
            
            console.log('🎨 NFT Balance:', nftCount, 'SkunkSquad NFTs');
            
            // If user owns NFTs, get token IDs (if method exists)
            if (nftCount > 0) {
                this.balances.nfts = {
                    count: nftCount,
                    tokens: [] // Would need to implement token enumeration
                };
            } else {
                this.balances.nfts = {
                    count: 0,
                    tokens: []
                };
            }
            
            // Update UI elements
            this.updateNftDisplay();
            
            return this.balances.nfts;
        } catch (error) {
            console.error('❌ Error checking NFT balance:', error);
            return null;
        }
    }

    /**
     * Update ETH balance displays
     */
    updateEthDisplay() {
        const elements = document.querySelectorAll('[data-eth-balance]');
        
        elements.forEach(element => {
            const format = element.dataset.ethBalanceFormat || 'eth';
            
            if (!this.balances.eth) {
                element.textContent = '...';
                return;
            }
            
            switch (format) {
                case 'eth':
                    element.textContent = `${this.balances.eth.formatted} ETH`;
                    break;
                    
                case 'number':
                    element.textContent = this.balances.eth.formatted;
                    break;
                    
                case 'usd':
                    if (window.ethPrice?.currentPrice) {
                        const usdValue = this.balances.eth.eth * window.ethPrice.currentPrice;
                        element.textContent = `$${usdValue.toFixed(2)}`;
                    }
                    break;
                    
                case 'full':
                    const usd = window.ethPrice?.currentPrice ? 
                        ` (~$${(this.balances.eth.eth * window.ethPrice.currentPrice).toFixed(2)})` : '';
                    element.textContent = `${this.balances.eth.formatted} ETH${usd}`;
                    break;
            }
        });
    }

    /**
     * Update NFT balance displays
     */
    updateNftDisplay() {
        const elements = document.querySelectorAll('[data-nft-balance]');
        
        elements.forEach(element => {
            if (!this.balances.nfts) {
                element.textContent = '...';
                return;
            }
            
            const count = this.balances.nfts.count || 0;
            element.textContent = count === 1 ? '1 NFT' : `${count} NFTs`;
            
            // Add visual indicator
            if (count > 0) {
                element.classList.add('has-nfts');
            } else {
                element.classList.remove('has-nfts');
            }
        });
    }

    /**
     * Check if wallet has sufficient balance for minting
     */
    canAffordMint(quantity = 1) {
        if (!this.balances.eth) return null;
        
        const mintPrice = 0.01; // ETH
        const gasEstimate = 0.002; // Rough estimate
        const totalNeeded = (mintPrice * quantity) + gasEstimate;
        
        const canAfford = this.balances.eth.eth >= totalNeeded;
        
        return {
            canAfford: canAfford,
            balance: this.balances.eth.eth,
            needed: totalNeeded,
            shortfall: canAfford ? 0 : totalNeeded - this.balances.eth.eth
        };
    }

    /**
     * Show balance warning if insufficient
     */
    checkMintAffordability(quantity = 1) {
        const check = this.canAffordMint(quantity);
        
        if (!check) return null;
        
        if (!check.canAfford && window.notifications) {
            window.notifications.warning(
                `Insufficient balance! You need ${check.needed.toFixed(4)} ETH but have ${check.balance.toFixed(4)} ETH`,
                {
                    title: '💰 Low Balance',
                    duration: 7000
                }
            );
        }
        
        return check;
    }

    /**
     * Get current balances
     */
    getBalances() {
        return this.balances;
    }

    /**
     * Refresh balances
     */
    async refresh() {
        if (!window.walletManager?.isConnected || !window.walletManager.accounts[0]) {
            console.log('⚠️ No wallet connected to refresh balances');
            return null;
        }
        
        console.log('🔄 Refreshing balances...');
        return await this.checkBalances(window.walletManager.accounts[0]);
    }

    /**
     * Create a balance widget
     */
    createWidget(containerId = 'balance-widget') {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const update = () => {
            if (!this.balances.eth && !this.balances.nfts) {
                container.innerHTML = '<div class="balance-widget">Connect wallet to see balances</div>';
                return;
            }
            
            const ethBalance = this.balances.eth?.formatted || '0.0000';
            const nftCount = this.balances.nfts?.count || 0;
            const usdValue = window.ethPrice?.currentPrice && this.balances.eth ? 
                (this.balances.eth.eth * window.ethPrice.currentPrice).toFixed(2) : '0.00';
            
            container.innerHTML = `
                <div class="balance-widget">
                    <div class="balance-item">
                        <div class="balance-label">ETH Balance</div>
                        <div class="balance-value">
                            <span class="balance-eth">${ethBalance} ETH</span>
                            <span class="balance-usd">≈ $${usdValue}</span>
                        </div>
                    </div>
                    <div class="balance-item">
                        <div class="balance-label">SkunkSquad NFTs</div>
                        <div class="balance-value">
                            <span class="balance-nfts">${nftCount}</span>
                        </div>
                    </div>
                </div>
            `;
        };
        
        // Update on balance changes
        window.addEventListener('balancesChecked', update);
        window.addEventListener('ethPriceUpdated', update);
        
        // Initial render
        update();
    }

    /**
     * Format ETH amount
     */
    formatEth(amount) {
        return parseFloat(amount).toFixed(4);
    }
}

// Create global instance
window.balanceChecker = new WalletBalanceChecker();

// Auto-initialize
window.addEventListener('load', () => {
    setTimeout(() => {
        if (window.balanceChecker) {
            window.balanceChecker.init();
        }
    }, 1500);
});

console.log('✅ Wallet balance checker loaded');
