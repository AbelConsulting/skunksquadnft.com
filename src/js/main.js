/**
 * SkunkSquad NFT Website - Main Application
 * Coordinates all modules and handles user interactions
 */

console.log('🦨 main.js loading...');

(function() {
    'use strict';

    // Initialize price from contract
    const PRICE_PER_NFT = 0.01; // ETH
    let currentEthPrice = 2400; // USD, will be updated

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

    // Wallet & Mint Card Management
    window.showWalletMintCard = function() {
        console.log('🦨 showWalletMintCard called');
        const overlay = document.getElementById('wallet-mint-card-overlay');
        if (overlay) {
            overlay.style.display = 'flex';
            updateWalletCardUI();
        }
    };

    window.closeWalletMintCard = function() {
        console.log('🦨 closeWalletMintCard called');
        const overlay = document.getElementById('wallet-mint-card-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    };

    // Update wallet card UI based on connection status
    function updateWalletCardUI() {
        const walletSection = document.getElementById('wmc-wallet-section');
        const mintSection = document.getElementById('wmc-mint-section');
        const statusEl = document.getElementById('wmc-status');
        
        if (!walletSection || !mintSection || !statusEl) return;

        if (window.walletManager && window.walletManager.isConnected) {
            // Wallet connected - show mint section
            statusEl.innerHTML = `<p style="color:#22c55e">✅ Wallet Connected: ${window.walletManager.shortenAddress(window.walletManager.accounts[0])}</p>`;
            walletSection.style.display = 'none';
            mintSection.style.display = 'block';
        } else {
            // Wallet not connected - show connect button
            statusEl.innerHTML = `<p style="color:#f59e0b">⚠️ Please connect your wallet to mint</p>`;
            walletSection.innerHTML = `
                <button id="wmc-connect-btn" class="wmc-mint-btn btn btn-primary">
                    <span>🦊 Connect Wallet</span>
                </button>
            `;
            walletSection.style.display = 'block';
            mintSection.style.display = 'none';
            
            // Attach connect button handler
            const connectBtn = document.getElementById('wmc-connect-btn');
            if (connectBtn) {
                connectBtn.addEventListener('click', async function() {
                    if (window.walletManager) {
                        const connected = await window.walletManager.connectWallet();
                        if (connected) {
                            updateWalletCardUI();
                        }
                    }
                });
            }
        }
    }

    // Quantity control functions
    window.updateWmcQuantity = function(delta) {
        const input = document.getElementById('wmc-quantity');
        if (!input) return;
        
        const current = parseInt(input.value) || 1;
        const newValue = Math.max(1, Math.min(current + delta, 10));
        input.value = newValue;
        updateWmcTotal(newValue);
    };

    function updateWmcTotal(quantity) {
        const totalEth = (PRICE_PER_NFT * quantity).toFixed(4);
        const totalUsd = (totalEth * currentEthPrice).toFixed(2);
        const totalEl = document.getElementById('wmc-total');
        
        if (totalEl) {
            totalEl.textContent = `${totalEth} ETH (~$${totalUsd} USD)`;
        }
    }

    // Handle wallet connect and mint
    window.handleConnectAndBuy = async function(quantity = 1) {
        console.log('🦨 handleConnectAndBuy called', { quantity });
        
        // Ensure wallet manager is initialized
        if (!window.walletManager) {
            console.log('Initializing wallet manager...');
            window.initWalletManager();
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        quantity = parseInt(quantity, 10) || 1;
        quantity = Math.max(1, Math.min(quantity, 10));
        
        if (window.mintHandler && typeof window.mintHandler.handleMint === 'function') {
            await window.mintHandler.handleMint(quantity);
        } else if (window.walletManager && typeof window.walletManager.connectWallet === 'function') {
            const connected = await window.walletManager.connectWallet();
            if (connected && window.mintHandler) {
                await window.mintHandler.handleMint(quantity);
            }
        } else {
            console.error('❌ No handlers available!');
            alert('Please wait a moment and try again. The page is still loading...');
        }
    };

    // Close modal functions (for backward compatibility)
    window.closeModal = function() {
        const modal = document.getElementById('paymentModal');
        if (modal) modal.style.display = 'none';
        
        const overlay = document.getElementById('wallet-mint-card-overlay');
        if (overlay) overlay.style.display = 'none';
    };

    window.updateQuantity = function(delta) {
        // For old payment modal (if still present)
        const input = document.getElementById('mint-quantity');
        if (input) {
            const current = parseInt(input.value) || 1;
            const newValue = Math.max(1, Math.min(current + delta, 10));
            input.value = newValue;
            
            const totalEl = document.getElementById('total-eth');
            if (totalEl) {
                const totalEth = (PRICE_PER_NFT * newValue).toFixed(4);
                totalEl.textContent = `${totalEth} ETH`;
            }
        }
    };

    // DOM Ready Event Listeners
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🦨 DOM Content Loaded - Setting up event listeners');
        
        // Wallet Mint Card - Close button
        const wmcClose = document.getElementById('wmc-close');
        if (wmcClose) {
            wmcClose.addEventListener('click', window.closeWalletMintCard);
            console.log('✅ WMC close button listener attached');
        }
        
        // Wallet Mint Card - Click overlay to close
        const overlay = document.getElementById('wallet-mint-card-overlay');
        if (overlay) {
            overlay.addEventListener('click', function(e) {
                if (e.target === overlay) {
                    window.closeWalletMintCard();
                }
            });
            console.log('✅ WMC overlay listener attached');
        }
        
        // Wallet Mint Card - Quantity controls
        const wmcQtyDec = document.getElementById('wmc-qty-dec');
        const wmcQtyInc = document.getElementById('wmc-qty-inc');
        const wmcQty = document.getElementById('wmc-quantity');
        
        if (wmcQtyDec) {
            wmcQtyDec.addEventListener('click', function() {
                window.updateWmcQuantity(-1);
            });
            console.log('✅ WMC decrease button listener attached');
        }
        
        if (wmcQtyInc) {
            wmcQtyInc.addEventListener('click', function() {
                window.updateWmcQuantity(1);
            });
            console.log('✅ WMC increase button listener attached');
        }
        
        if (wmcQty) {
            wmcQty.addEventListener('change', function() {
                const value = Math.max(1, Math.min(10, parseInt(this.value) || 1));
                this.value = value;
                updateWmcTotal(value);
            });
            console.log('✅ WMC quantity input listener attached');
        }
        
        // Wallet Mint Card - Mint button
        const wmcMintBtn = document.getElementById('wmc-mint-btn');
        if (wmcMintBtn) {
            wmcMintBtn.addEventListener('click', async function() {
                const quantity = parseInt(document.getElementById('wmc-quantity').value) || 1;
                await window.handleConnectAndBuy(quantity);
            });
            console.log('✅ WMC mint button listener attached');
        }
        
        // Header buttons - Remove inline onclick
        const connectBuyBtn = document.getElementById('connectBuyBtn');
        const connectWalletBtn = document.getElementById('connect-wallet');
        
        if (connectBuyBtn) {
            connectBuyBtn.addEventListener('click', () => window.handleConnectAndBuy());
            console.log('✅ Connect/Buy button listener attached');
        }
        
        if (connectWalletBtn) {
            connectWalletBtn.addEventListener('click', () => window.showWalletMintCard());
            console.log('✅ Connect wallet button listener attached');
        }
        
        // Mobile menu toggle
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('nav-menu');
        
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', function() {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
            });
        }
        
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#' || href === '#home') {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else if (href.startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            });
        });
        
        // Fetch ETH price for USD conversion
        fetchEthPrice();
        
        console.log('🦨 All event listeners attached successfully');
    });

    // Fetch ETH price from CoinGecko
    async function fetchEthPrice() {
        try {
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
            const data = await response.json();
            if (data && data.ethereum && data.ethereum.usd) {
                currentEthPrice = data.ethereum.usd;
                console.log('✅ ETH Price updated:', currentEthPrice);
                
                // Update all USD displays
                updateWmcTotal(parseInt(document.getElementById('wmc-quantity')?.value || 1));
            }
        } catch (error) {
            console.warn('⚠️ Could not fetch ETH price:', error);
        }
    }

    console.log('🦨 main.js loaded successfully');
})();