/**
 * SkunkSquad NFT - Loading Overlay Component
 * Full-screen loading overlay with spinner and messages
 */

console.log('⏳ Loading overlay system...');

class LoadingOverlay {
    constructor() {
        this.overlay = null;
        this.spinner = null;
        this.message = null;
        this.isVisible = false;
        this.init();
    }

    init() {
        // Create overlay element
        this.overlay = document.createElement('div');
        this.overlay.id = 'loading-overlay';
        this.overlay.className = 'loading-overlay';
        this.overlay.style.display = 'none';
        
        // Create overlay content
        this.overlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner">
                    <svg class="spinner-svg" viewBox="0 0 50 50">
                        <circle class="spinner-path" cx="25" cy="25" r="20" fill="none" stroke-width="4"></circle>
                    </svg>
                </div>
                <div class="loading-message">Loading...</div>
                <div class="loading-submessage"></div>
            </div>
        `;
        
        document.body.appendChild(this.overlay);
        
        // Cache elements
        this.spinner = this.overlay.querySelector('.loading-spinner');
        this.message = this.overlay.querySelector('.loading-message');
        this.submessage = this.overlay.querySelector('.loading-submessage');
        
        console.log('✅ Loading overlay initialized');
    }

    /**
     * Show loading overlay
     * @param {string} message - Main message
     * @param {string} submessage - Optional sub-message
     */
    show(message = 'Loading...', submessage = '') {
        if (this.isVisible) return;
        
        this.message.textContent = message;
        this.submessage.textContent = submessage;
        this.submessage.style.display = submessage ? 'block' : 'none';
        
        this.overlay.style.display = 'flex';
        
        // Trigger animation
        setTimeout(() => {
            this.overlay.classList.add('active');
        }, 10);
        
        this.isVisible = true;
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    /**
     * Update loading message
     */
    updateMessage(message, submessage = '') {
        if (!this.isVisible) return;
        
        this.message.textContent = message;
        this.submessage.textContent = submessage;
        this.submessage.style.display = submessage ? 'block' : 'none';
    }

    /**
     * Hide loading overlay
     */
    hide() {
        if (!this.isVisible) return;
        
        this.overlay.classList.remove('active');
        
        // Wait for animation to complete
        setTimeout(() => {
            this.overlay.style.display = 'none';
            this.isVisible = false;
            
            // Restore body scroll
            document.body.style.overflow = '';
        }, 300);
    }

    /**
     * Show with auto-hide after duration
     */
    showTimed(message, submessage = '', duration = 3000) {
        this.show(message, submessage);
        setTimeout(() => this.hide(), duration);
    }

    /**
     * Show with custom spinner color
     */
    showWithColor(message, submessage = '', color = '#8b5cf6') {
        this.show(message, submessage);
        const path = this.spinner.querySelector('.spinner-path');
        if (path) {
            path.style.stroke = color;
        }
    }

    // Preset loading states
    connecting(wallet = 'MetaMask') {
        this.show(
            'Connecting Wallet',
            `Please approve the connection in ${wallet}...`
        );
    }

    minting(quantity = 1) {
        this.show(
            '⛏️ Minting Your NFT' + (quantity > 1 ? 's' : ''),
            `Please confirm the transaction in your wallet...`
        );
    }

    processing() {
        this.show(
            'Processing Transaction',
            'This may take a minute...'
        );
    }

    loading() {
        this.show('Loading...', 'Please wait');
    }

    checkingBalance() {
        this.show(
            'Checking Balance',
            'Fetching your NFTs from the blockchain...'
        );
    }

    fetchingPrice() {
        this.show(
            'Fetching Price',
            'Getting latest ETH price...'
        );
    }

    verifyingOwnership() {
        this.show(
            'Verifying Ownership',
            'Checking your NFT holdings...'
        );
    }
}

// Create global instance
window.loadingOverlay = new LoadingOverlay();

// Convenience methods
window.showLoading = (message, submessage) => window.loadingOverlay.show(message, submessage);
window.hideLoading = () => window.loadingOverlay.hide();
window.updateLoading = (message, submessage) => window.loadingOverlay.updateMessage(message, submessage);

console.log('✅ Loading overlay ready');
