/**
 * SkunkSquad NFT Website - Main JavaScript
 * Handles navigation, interactions, and UI functionality
 */

console.log('🦨 SkunkSquad Main JS Loading...');

// Main Website Manager
window.skunkSquadWebsite = {
    init() {
        console.log('🦨 Initializing SkunkSquad Website...');
        this.setupEventListeners();
        this.initCountdown();
        this.initNavigation();
    },

    setupEventListeners() {
        // Hero buttons
        const buyWithCardBtn = document.getElementById('buy-with-card');
        const buyWithEthBtn = document.getElementById('buy-with-eth');
        const connectBuyBtn = document.getElementById('connectBuyBtn');

        if (buyWithCardBtn) {
            buyWithCardBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.buyWithCard();
            });
        }

        if (buyWithEthBtn) {
            buyWithEthBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showPaymentModal();
            });
        }

        if (connectBuyBtn) {
            connectBuyBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleConnectAndBuy();
            });
        }

        // Modal close functionality
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal') || e.target.classList.contains('modal-close')) {
                this.closeModal();
            }
        });

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    },

    showPaymentModal() {
        const modal = document.getElementById('paymentModal');
        if (modal) {
            modal.style.display = 'flex';
            this.trapFocus(modal);
            setTimeout(() => modal.focus(), 100);
        }
    },

    closeModal() {
        const modal = document.getElementById('paymentModal');
        if (modal) {
            modal.style.display = 'none';
        }
    },

    trapFocus(modal) {
        const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!focusable.length) return;
        
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        
        modal.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === first) {
                        last.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === last) {
                        first.focus();
                        e.preventDefault();
                    }
                }
            }
        });
        first.focus();
    },

    async handleConnectAndBuy() {
        if (typeof window.ethereum === 'undefined') {
            alert('🦊 MetaMask Required!\n\nPlease install MetaMask to mint NFTs.\n\nVisit: https://metamask.io/');
            return;
        }

        const button = document.getElementById('connectBuyBtn');
        
        try {
            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });
            
            button.innerHTML = `
                <span class="btn-icon">🎯</span>
                <span class="btn-text">Mint NFT</span>
                <span class="btn-price">(0.02 ETH)</span>
            `;
            
            this.showPaymentModal();
            
        } catch (error) {
            console.error('Connection failed:', error);
            button.innerHTML = `
                <span class="btn-icon">🦊</span>
                <span class="btn-text">Connect Wallet & Mint</span>
                <span class="btn-price">(0.02 ETH)</span>
            `;
            alert('❌ Connection failed: ' + error.message);
        }
    },

    buyWithCard() {
        alert('🚀 Credit Card Payment!\n\n✅ Stripe integration ready\n✅ Instant NFT delivery\n✅ Bank-level security\n\nComing soon!');
    },

    initCountdown() {
        const launchDate = new Date('October 10, 2025 18:10:00 EST').getTime();
        
        const updateCountdown = () => {
            const now = Date.now();
            const distance = launchDate - now;
            
            if (distance < 0) {
                const container = document.getElementById('countdown');
                if (container) {
                    container.innerHTML = '<div class="countdown-item"><span class="countdown-number">🚀</span><span class="countdown-unit">LIVE!</span></div>';
                }
                return;
            }
            
            const days = Math.floor(distance / 86400000);
            const hours = Math.floor((distance % 86400000) / 3600000);
            const minutes = Math.floor((distance % 3600000) / 60000);
            const seconds = Math.floor((distance % 60000) / 1000);
            
            const daysEl = document.getElementById('days');
            const hoursEl = document.getElementById('hours');
            const minutesEl = document.getElementById('minutes');
            const secondsEl = document.getElementById('seconds');
            
            if (daysEl) daysEl.textContent = days.toString().padStart(2, '0');
            if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
            if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');
            if (secondsEl) secondsEl.textContent = seconds.toString().padStart(2, '0');
        };
        
        updateCountdown();
        setInterval(updateCountdown, 1000);
    },

    initNavigation() {
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('nav-menu');
        
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                hamburger.classList.toggle('active');
            });
        }
    },

    showNotification(message, type = 'info') {
        // Simple notification system
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 1rem;
            border-radius: 8px;
            z-index: 10000;
            max-width: 400px;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
};

// Quantity Management
window.quantityManager = {
    updateQuantity(change) {
        const input = document.getElementById('mint-quantity');
        if (!input) return;
        
        let newVal = parseInt(input.value) + change;
        newVal = Math.max(1, Math.min(newVal, 10));
        input.value = newVal;
        this.updateTotal();
    },

    updateTotal() {
        const quantity = parseInt(document.getElementById('mint-quantity')?.value || 1);
        const total = (0.02 * quantity).toFixed(3);
        const totalElement = document.getElementById('total-eth');
        if (totalElement) {
            totalElement.textContent = `${total} ETH`;
        }
    },

    init() {
        const input = document.getElementById('mint-quantity');
        if (input) {
            input.addEventListener('input', () => this.updateTotal());
        }
    }
};

// Global functions for HTML onclick handlers
window.updateQuantity = (change) => window.quantityManager.updateQuantity(change);
window.closeModal = () => window.skunkSquadWebsite.closeModal();
window.showPaymentModal = () => window.skunkSquadWebsite.showPaymentModal();
window.handleConnectAndBuy = () => window.skunkSquadWebsite.handleConnectAndBuy();
window.mintWithEth = () => window.walletManager?.mintNFT();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.skunkSquadWebsite.init();
    window.quantityManager.init();
});

console.log('✅ SkunkSquad Main JS Loaded');