/**
 * SkunkSquad NFT - ETH Price Fetcher
 * Real-time Ethereum price from multiple sources
 */

console.log('💰 Loading ETH price fetcher...');

class EthPriceFetcher {
    constructor() {
        this.currentPrice = null;
        this.lastUpdate = null;
        this.updateInterval = null;
        this.sources = {
            coingecko: 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
            fallback: 2400 // Fallback price if API fails
        };
        this.elements = [];
        this.isInitialized = false;
    }

    /**
     * Initialize the price fetcher
     */
    async init() {
        if (this.isInitialized) return;
        
        // Find all price display elements
        this.elements = document.querySelectorAll('[data-eth-price]');
        
        if (this.elements.length === 0) {
            console.log('ℹ️ No ETH price elements found');
        } else {
            console.log(`💰 Found ${this.elements.length} price element(s)`);
        }
        
        // Initial fetch
        await this.fetchPrice();
        
        // Update every 60 seconds
        this.updateInterval = setInterval(() => {
            this.fetchPrice();
        }, 60000);
        
        this.isInitialized = true;
        console.log('✅ ETH price fetcher initialized');
    }

    /**
     * Fetch current ETH price
     */
    async fetchPrice() {
        try {
            const response = await fetch(this.sources.coingecko);
            
            if (!response.ok) {
                throw new Error('API request failed');
            }
            
            const data = await response.json();
            const price = data.ethereum?.usd;
            
            if (price && typeof price === 'number') {
                this.currentPrice = price;
                this.lastUpdate = new Date();
                
                console.log(`💰 ETH Price: $${price.toFixed(2)}`);
                
                // Update displays
                this.render();
                
                // Dispatch event
                window.dispatchEvent(new CustomEvent('ethPriceUpdated', {
                    detail: {
                        price: this.currentPrice,
                        timestamp: this.lastUpdate
                    }
                }));
                
                return price;
            } else {
                throw new Error('Invalid price data');
            }
        } catch (error) {
            console.warn('⚠️ Error fetching ETH price:', error.message);
            
            // Use fallback price
            if (!this.currentPrice) {
                this.currentPrice = this.sources.fallback;
                this.render();
            }
            
            return this.currentPrice;
        }
    }

    /**
     * Render price in all elements
     */
    render() {
        if (!this.currentPrice) return;
        
        this.elements.forEach(element => {
            const format = element.dataset.ethPriceFormat || 'usd';
            const ethAmount = parseFloat(element.dataset.ethAmount || '0.01');
            
            switch (format) {
                case 'price':
                    // Just the ETH price
                    element.textContent = `$${this.formatPrice(this.currentPrice)}`;
                    break;
                    
                case 'usd':
                    // Convert ETH amount to USD
                    const usdValue = ethAmount * this.currentPrice;
                    element.textContent = `$${this.formatPrice(usdValue)}`;
                    break;
                    
                case 'conversion':
                    // Show both ETH and USD
                    const usdAmount = ethAmount * this.currentPrice;
                    element.textContent = `${ethAmount} ETH (~$${this.formatPrice(usdAmount)})`;
                    break;
                    
                case 'inline':
                    // Inline format with symbol
                    element.innerHTML = `<span class="eth-symbol">Ξ</span>${ethAmount} <span class="usd-value">≈ $${this.formatPrice(ethAmount * this.currentPrice)}</span>`;
                    break;
                    
                default:
                    element.textContent = `$${this.formatPrice(this.currentPrice)}`;
            }
            
            // Add updated class for animation
            element.classList.add('price-updated');
            setTimeout(() => {
                element.classList.remove('price-updated');
            }, 1000);
        });
        
        // Update mint price displays
        this.updateMintPrices();
    }

    /**
     * Update mint price displays throughout the site
     */
    updateMintPrices() {
        if (!this.currentPrice) return;
        
        // Update price USD displays
        const priceUsdElements = document.querySelectorAll('.price-usd');
        priceUsdElements.forEach(el => {
            const ethPrice = parseFloat(el.dataset.ethPrice || '0.01');
            const usdPrice = ethPrice * this.currentPrice;
            el.textContent = `(~$${Math.round(usdPrice)})`;
        });
        
        // Update total price in mint card
        const quantityInput = document.getElementById('wmc-quantity');
        if (quantityInput) {
            const quantity = parseInt(quantityInput.value) || 1;
            this.updateMintTotal(quantity);
        }
    }

    /**
     * Update mint total with current price
     */
    updateMintTotal(quantity) {
        const totalEth = (0.01 * quantity).toFixed(4);
        const totalUsd = (parseFloat(totalEth) * this.currentPrice).toFixed(2);
        const totalEl = document.getElementById('wmc-total');
        
        if (totalEl) {
            totalEl.textContent = `${totalEth} ETH (~$${totalUsd} USD)`;
        }
    }

    /**
     * Format price with appropriate decimals
     */
    formatPrice(price) {
        if (price >= 1000) {
            return price.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        } else if (price >= 100) {
            return price.toFixed(2);
        } else {
            return price.toFixed(2);
        }
    }

    /**
     * Get current price data
     */
    getPrice() {
        return {
            usd: this.currentPrice,
            lastUpdate: this.lastUpdate,
            isStale: this.lastUpdate ? (Date.now() - this.lastUpdate.getTime() > 120000) : true
        };
    }

    /**
     * Convert ETH to USD
     */
    ethToUsd(ethAmount) {
        if (!this.currentPrice) return null;
        return ethAmount * this.currentPrice;
    }

    /**
     * Convert USD to ETH
     */
    usdToEth(usdAmount) {
        if (!this.currentPrice) return null;
        return usdAmount / this.currentPrice;
    }

    /**
     * Force refresh price
     */
    async refresh() {
        console.log('🔄 Manually refreshing ETH price...');
        return await this.fetchPrice();
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
        console.log('🛑 ETH price fetcher stopped');
    }

    /**
     * Create a price widget
     */
    createWidget(containerId = 'eth-price-widget') {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const update = () => {
            if (!this.currentPrice) return;
            
            const change = this.calculateChange();
            const changeClass = change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral';
            
            container.innerHTML = `
                <div class="eth-price-widget">
                    <div class="eth-price-icon">Ξ</div>
                    <div class="eth-price-info">
                        <div class="eth-price-label">Ethereum</div>
                        <div class="eth-price-amount">$${this.formatPrice(this.currentPrice)}</div>
                    </div>
                    ${change !== null ? `
                        <div class="eth-price-change ${changeClass}">
                            ${change > 0 ? '+' : ''}${change.toFixed(2)}%
                        </div>
                    ` : ''}
                </div>
            `;
        };
        
        // Update on price changes
        window.addEventListener('ethPriceUpdated', update);
        
        // Initial render
        if (this.currentPrice) {
            update();
        }
    }

    /**
     * Calculate price change (placeholder for now)
     */
    calculateChange() {
        // This would require storing historical prices
        // For now, return null
        return null;
    }
}

// Create global instance
window.ethPrice = new EthPriceFetcher();

// Auto-initialize on page load
window.addEventListener('load', () => {
    setTimeout(() => {
        if (window.ethPrice) {
            window.ethPrice.init();
        }
    }, 1000);
});

// Update mint total when quantity changes
document.addEventListener('DOMContentLoaded', () => {
    const quantityInput = document.getElementById('wmc-quantity');
    if (quantityInput) {
        quantityInput.addEventListener('input', function() {
            if (window.ethPrice?.currentPrice) {
                window.ethPrice.updateMintTotal(parseInt(this.value) || 1);
            }
        });
    }
});

console.log('✅ ETH price fetcher loaded');
