/**
 * SkunkSquad NFT - Supply Counter with Live Updates
 * Real-time tracking of NFT supply from smart contract
 */

console.log('📊 Loading supply counter...');

class SupplyCounter {
    constructor() {
        this.currentSupply = 0;
        this.maxSupply = 10000;
        this.updateInterval = null;
        this.elements = [];
        this.isInitialized = false;
        this.contract = null;
    }

    /**
     * Initialize the supply counter
     */
    async init() {
        if (this.isInitialized) return;
        
        // Find all supply display elements
        this.elements = document.querySelectorAll('[data-supply-counter]');
        
        if (this.elements.length === 0) {
            console.log('ℹ️ No supply counter elements found');
            return;
        }
        
        console.log(`📊 Found ${this.elements.length} supply counter element(s)`);
        
        // Get contract instance
        await this.waitForContract();
        
        // Initial fetch
        await this.updateSupply();
        
        // Set up auto-refresh every 30 seconds
        this.updateInterval = setInterval(() => {
            this.updateSupply();
        }, 30000);
        
        this.isInitialized = true;
        console.log('✅ Supply counter initialized');
    }

    /**
     * Wait for wallet manager and contract to be ready
     */
    async waitForContract() {
        const maxAttempts = 20;
        let attempts = 0;
        
        while (attempts < maxAttempts) {
            if (window.walletManager?.web3) {
                try {
                    // Create contract instance even if not connected
                    const web3 = window.walletManager.web3;
                    const contractAddress = window.CONFIG?.CONTRACT_ADDRESS || '0xAa5C50099bEb130c8988324A0F6Ebf65979f10EF';
                    const abi = window.CONFIG?.CONTRACT_ABI || window.walletManager.contractABI;
                    
                    if (abi) {
                        this.contract = new web3.eth.Contract(abi, contractAddress);
                        console.log('✅ Contract instance created for supply counter');
                        return;
                    }
                } catch (error) {
                    console.warn('⚠️ Error creating contract instance:', error);
                }
            }
            
            await new Promise(resolve => setTimeout(resolve, 500));
            attempts++;
        }
        
        console.warn('⚠️ Could not get contract instance after 10 seconds');
    }

    /**
     * Fetch current supply from contract
     */
    async updateSupply() {
        if (!this.contract) {
            console.log('⚠️ Contract not available for supply check');
            return;
        }
        
        try {
            // Fetch total supply
            const supply = await this.contract.methods.totalSupply().call();
            const supplyNum = parseInt(supply);
            
            // Only update if changed
            if (supplyNum !== this.currentSupply) {
                const previous = this.currentSupply;
                this.currentSupply = supplyNum;
                
                console.log(`📊 Supply updated: ${previous} → ${supplyNum}`);
                
                // Update all displays
                this.render();
                
                // Dispatch event
                window.dispatchEvent(new CustomEvent('supplyUpdated', {
                    detail: {
                        current: supplyNum,
                        max: this.maxSupply,
                        previous: previous
                    }
                }));
            }
        } catch (error) {
            console.error('❌ Error fetching supply:', error);
        }
    }

    /**
     * Render the supply counter in all elements
     */
    render() {
        const remaining = this.maxSupply - this.currentSupply;
        const percentage = ((this.currentSupply / this.maxSupply) * 100).toFixed(1);
        
        this.elements.forEach(element => {
            const format = element.dataset.supplyFormat || 'full';
            
            switch (format) {
                case 'current':
                    element.textContent = this.formatNumber(this.currentSupply);
                    break;
                    
                case 'remaining':
                    element.textContent = this.formatNumber(remaining);
                    break;
                    
                case 'percentage':
                    element.textContent = `${percentage}%`;
                    break;
                    
                case 'fraction':
                    element.textContent = `${this.formatNumber(this.currentSupply)}/${this.formatNumber(this.maxSupply)}`;
                    break;
                    
                case 'full':
                default:
                    element.innerHTML = this.getFullHTML();
                    break;
            }
            
            // Add animated class for visual feedback
            element.classList.add('supply-updated');
            setTimeout(() => {
                element.classList.remove('supply-updated');
            }, 1000);
        });
    }

    /**
     * Get full HTML for supply display
     */
    getFullHTML() {
        const remaining = this.maxSupply - this.currentSupply;
        const percentage = (this.currentSupply / this.maxSupply) * 100;
        
        return `
            <div class="supply-counter-display">
                <div class="supply-stats">
                    <div class="supply-stat">
                        <span class="supply-label">Minted</span>
                        <span class="supply-value">${this.formatNumber(this.currentSupply)}</span>
                    </div>
                    <div class="supply-divider">/</div>
                    <div class="supply-stat">
                        <span class="supply-label">Total</span>
                        <span class="supply-value">${this.formatNumber(this.maxSupply)}</span>
                    </div>
                </div>
                <div class="supply-progress">
                    <div class="supply-progress-bar" style="width: ${percentage}%"></div>
                </div>
                <div class="supply-remaining">
                    ${this.formatNumber(remaining)} remaining
                </div>
            </div>
        `;
    }

    /**
     * Format number with commas
     */
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    /**
     * Force refresh supply
     */
    async refresh() {
        console.log('🔄 Manually refreshing supply...');
        await this.updateSupply();
    }

    /**
     * Stop auto-refresh
     */
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        this.isInitialized = false;
        console.log('🛑 Supply counter stopped');
    }

    /**
     * Get current supply data
     */
    getSupplyData() {
        return {
            current: this.currentSupply,
            max: this.maxSupply,
            remaining: this.maxSupply - this.currentSupply,
            percentage: ((this.currentSupply / this.maxSupply) * 100).toFixed(2),
            isSoldOut: this.currentSupply >= this.maxSupply
        };
    }
}

// Create global instance
window.supplyCounter = new SupplyCounter();

// Auto-initialize when wallet manager is ready
window.addEventListener('load', () => {
    setTimeout(() => {
        if (window.supplyCounter) {
            window.supplyCounter.init();
        }
    }, 1000);
});

// Also initialize when wallet connects
window.addEventListener('walletConnected', () => {
    if (window.supplyCounter && !window.supplyCounter.isInitialized) {
        window.supplyCounter.init();
    }
});

console.log('✅ Supply counter loaded');
