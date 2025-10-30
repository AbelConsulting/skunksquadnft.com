/**
 * SkunkSquad NFT Website - Main JavaScript
 * Handles navigation, interactions, and UI functionality
 */

console.log('🦨 SkunkSquad Main JS Loading...');

// Performance monitoring
const performanceMonitor = {
    init() {
        // Monitor page load time
        window.addEventListener('load', () => {
            const loadTime = performance.now();
            console.log(`🚀 Page loaded in ${loadTime.toFixed(2)}ms`);
            
            // Optimize images after load
            this.optimizeImages();
            
            // Initialize lazy loading
            this.initLazyLoading();
        });
        
        // Monitor connection
        if ('connection' in navigator) {
            const connection = navigator.connection;
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                console.log('📱 Slow connection detected, optimizing...');
                this.enableLowDataMode();
            }
        }
    },
    
    optimizeImages() {
        // Add loading=lazy to images that don't have it
        const images = document.querySelectorAll('img:not([loading])');
        images.forEach(img => {
            if (!img.hasAttribute('loading')) {
                img.setAttribute('loading', 'lazy');
            }
        });
    },
    
    initLazyLoading() {
        // Intersection Observer for lazy loading
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        observer.unobserve(img);
                    }
                });
            });
            
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    },
    
    enableLowDataMode() {
        // Disable animations for slow connections
        document.body.classList.add('low-data-mode');
        
        // Add CSS for low data mode
        const style = document.createElement('style');
        style.textContent = `
            .low-data-mode * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
            .low-data-mode .hero-background,
            .low-data-mode .floating-cards,
            .low-data-mode .hero-glow {
                display: none !important;
            }
        `;
        document.head.appendChild(style);
    }
};

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
        // Always connect wallet first, then show popup card for quantity selection
        let walletConnected = false;
        if (window.walletManager && window.walletManager.isConnected) {
            walletConnected = true;
        } else if (window.mintHandler) {
            // Try to connect wallet using mintHandler
            walletConnected = await window.mintHandler.connectAndNotify();
        } else if (window.walletManager) {
            walletConnected = await window.walletManager.connectWallet();
        }
        // After wallet is connected, show popup card
        if (walletConnected) {
            window.showWalletMintCard();
            // Set up mint button in popup to trigger mint
            const mintBtn = document.getElementById('wmc-mint-btn');
            if (mintBtn) {
                mintBtn.onclick = async function() {
                    const qtyInput = document.getElementById('wmc-quantity');
                    const quantity = qtyInput ? parseInt(qtyInput.value) : 1;
                    if (window.mintHandler) {
                        await window.mintHandler.handleMint(quantity);
                    } else if (window.walletManager) {
                        await window.walletManager.mintNFT(quantity);
                    }
                };
            }
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
        const navSecondary = document.querySelector('.nav-secondary');
        
        if (hamburger && navMenu && navSecondary) {
            hamburger.addEventListener('click', (e) => {
                e.stopPropagation();
                navMenu.classList.toggle('active');
                navSecondary.classList.toggle('active');
                hamburger.classList.toggle('active');
                
                // Prevent body scroll when menu is open
                if (navSecondary.classList.contains('active')) {
                    document.body.style.overflow = 'hidden';
                } else {
                    document.body.style.overflow = '';
                }
            });
            
            // Close menu when clicking on nav links
            navMenu.addEventListener('click', (e) => {
                if (e.target.classList.contains('nav-link')) {
                    navMenu.classList.remove('active');
                    navSecondary.classList.remove('active');
                    hamburger.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!navSecondary.contains(e.target) && !hamburger.contains(e.target)) {
                    navMenu.classList.remove('active');
                    navSecondary.classList.remove('active');
                    hamburger.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
            
            // Close menu on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && navSecondary.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    navSecondary.classList.remove('active');
                    hamburger.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        }
        
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
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
        const total = (0.01 * quantity).toFixed(3);
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


// Unified Wallet & Mint Card Logic (moved from index.html inline script)
window.showWalletMintCard = function() {
    try {
        const overlay = document.getElementById('wallet-mint-card-overlay');
        if (overlay) {
            overlay.style.display = 'flex';
            overlay.setAttribute('aria-hidden', 'false');
        }

        // Initialize wallet manager if an initializer is provided by external scripts
        if (!window.walletManager && typeof window.initWalletManager === 'function') {
            window.initWalletManager();
        }

        // If walletManager exposes a method to fetch price, update visible price elements
        if (window.walletManager && typeof window.walletManager.getPrice === 'function') {
            window.walletManager.getPrice().then(priceEth => {
                if (priceEth) {
                    document.querySelectorAll('.price-eth').forEach(el => el.textContent = priceEth + ' ETH');
                }
            }).catch(err => {
                console.debug('Price update skipped:', err);
            });
        }
    } catch (error) {
        console.error('Error showing wallet mint card:', error);
    }
};

window.handleConnectAndBuy = async function() {
    // Always show the popup card overlay for quantity selection and wallet connect
    const overlay = document.getElementById('wallet-mint-card-overlay');
    if (overlay) {
        overlay.style.display = 'flex';
        overlay.setAttribute('aria-hidden', 'false');
    }
    window.showWalletMintCard();
    // When user confirms quantity in popup, call mintHandler.handleMint with correct quantity
    const mintBtn = document.getElementById('wmc-mint-btn');
    if (mintBtn) {
        mintBtn.onclick = async function() {
            const qtyInput = document.getElementById('wmc-quantity');
            const quantity = qtyInput ? parseInt(qtyInput.value) : 1;
            if (window.mintHandler) {
                await window.mintHandler.handleMint(quantity);
            } else if (window.walletManager) {
                await window.walletManager.mintNFT(quantity);
            }
        };
    }
};

// Global functions for HTML onclick handlers
window.updateQuantity = (change) => window.quantityManager.updateQuantity(change);
window.closeModal = () => window.skunkSquadWebsite.closeModal();
window.showPaymentModal = () => window.skunkSquadWebsite.showPaymentModal();
window.mintWithEth = () => window.walletManager?.mintNFT();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    performanceMonitor.init();
    window.skunkSquadWebsite.init();
    window.quantityManager.init();
});

console.log('✅ SkunkSquad Main JS Loaded');