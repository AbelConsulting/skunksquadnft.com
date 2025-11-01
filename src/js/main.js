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
            overlay.classList.add('show');
            updateWalletCardUI();
        } else {
            console.error('❌ Wallet mint card overlay not found!');
        }
    };

    window.closeWalletMintCard = function() {
        console.log('🦨 closeWalletMintCard called');
        const overlay = document.getElementById('wallet-mint-card-overlay');
        if (overlay) {
            overlay.classList.remove('show');
        }
    };

    // Update wallet card UI based on connection status
    function updateWalletCardUI() {
        const walletSection = document.getElementById('wmc-wallet-section');
        const mintSection = document.getElementById('wmc-mint-section');
        const statusEl = document.getElementById('wmc-status');
        
        if (!walletSection || !mintSection || !statusEl) {
            console.error('❌ Wallet card elements not found');
            return;
        }

        if (window.walletManager && window.walletManager.isConnected) {
            // Wallet connected - show mint section
            statusEl.innerHTML = `<p style="color:#22c55e">✅ Wallet Connected: ${window.walletManager.shortenAddress(window.walletManager.accounts[0])}</p>`;
            walletSection.style.display = 'none';
            mintSection.style.display = 'block';
            updateWmcTotal(parseInt(document.getElementById('wmc-quantity')?.value || 1));
        } else {
            // Wallet not connected - show connect button
            statusEl.innerHTML = `<p style="color:#f59e0b">⚠️ Please connect your wallet to mint</p>`;
            walletSection.innerHTML = `
                <button id="wmc-connect-btn" class="wmc-mint-btn" style="margin-bottom: 0;">
                    <span>🦊 Connect Wallet</span>
                </button>
            `;
            walletSection.style.display = 'block';
            mintSection.style.display = 'none';
            
            // Attach connect button handler
            const connectBtn = document.getElementById('wmc-connect-btn');
            if (connectBtn) {
                connectBtn.addEventListener('click', async function() {
                    console.log('🦨 Connect button clicked in modal');
                    if (window.walletManager) {
                        const connected = await window.walletManager.connectWallet();
                        if (connected) {
                            updateWalletCardUI();
                        }
                    } else {
                        console.error('❌ Wallet manager not available');
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
        const PRICE_PER_NFT = 0.01; // ETH
        const currentEthPrice = 2400; // USD, should be fetched dynamically
        
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
        
        // Show the modal first
        window.showWalletMintCard();
        
        // Ensure wallet manager is initialized
        if (!window.walletManager) {
            console.log('Initializing wallet manager...');
            if (typeof window.initWalletManager === 'function') {
                window.initWalletManager();
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
        
        quantity = parseInt(quantity, 10) || 1;
        quantity = Math.max(1, Math.min(quantity, 10));
        
        // Try to connect wallet if not connected
        if (window.walletManager && !window.walletManager.isConnected) {
            console.log('🦨 Wallet not connected, attempting connection...');
            const connected = await window.walletManager.connectWallet();
            if (connected) {
                updateWalletCardUI(); // Update UI to show mint form
            }
            return; // Let user manually click mint after connecting
        }
        
        // If already connected and we have mint handler, proceed with mint
        if (window.mintHandler && typeof window.mintHandler.handleMint === 'function') {
            await window.mintHandler.handleMint(quantity);
        } else {
            console.error('❌ Mint handler not available!');
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
        console.log('🦨 DOM Content Loaded - Setting up wallet card event listeners');
        
        // Header buttons - THE CRITICAL FIX!
        const connectBuyBtn = document.getElementById('connectBuyBtn');
        const connectWalletBtn = document.getElementById('connect-wallet');
        
        if (connectBuyBtn) {
            connectBuyBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('🦨 Connect/Buy button clicked');
                window.handleConnectAndBuy();
            });
            console.log('✅ Connect/Buy button listener attached');
        } else {
            console.error('❌ connectBuyBtn not found!');
        }
        
        if (connectWalletBtn) {
            connectWalletBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('🦨 Connect wallet button clicked');
                window.showWalletMintCard();
            });
            console.log('✅ Connect wallet button listener attached');
        } else {
            console.error('❌ connect-wallet button not found!');
        }
        
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
                const quantity = parseInt(document.getElementById('wmc-quantity')?.value || 1);
                console.log('🦨 Mint button clicked in modal, quantity:', quantity);
                
                if (window.mintHandler && typeof window.mintHandler.handleMint === 'function') {
                    await window.mintHandler.handleMint(quantity);
                } else {
                    console.error('❌ Mint handler not available');
                    alert('Mint handler not ready. Please refresh the page and try