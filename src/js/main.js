/**
 * SkunkSquad NFT Website - Main Application
 */

console.log('🦨 SkunkSquad Main JS Loading...');

(function() {
    'use strict';

    const PRICE_PER_NFT = 0.01; // ETH
    let currentEthPrice = 2400; // USD

    // ========================================
    // HAMBURGER MENU TOGGLE
    // ========================================
    
    function initHamburgerMenu() {
        const hamburger = document.getElementById('hamburger');
        const navSecondary = document.querySelector('.nav-secondary');
        const navMenu = document.getElementById('nav-menu');
        
        console.log('🍔 Initializing hamburger menu...', { 
            hamburger, 
            navSecondary, 
            navMenu,
            hamburgerDisplay: hamburger ? window.getComputedStyle(hamburger).display : 'not found',
            hamburgerVisible: hamburger ? hamburger.offsetParent !== null : false
        });
        
        if (hamburger && navSecondary) {
            // Remove any existing listeners first
            const newHamburger = hamburger.cloneNode(true);
            hamburger.parentNode.replaceChild(newHamburger, hamburger);
            
            // Add click listener to the new element
            newHamburger.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                
                console.log('🍔 Hamburger clicked!');
                
                const isActive = navSecondary.classList.contains('active');
                console.log('🍔 Current state:', isActive ? 'active' : 'inactive');
                
                // Toggle classes
                newHamburger.classList.toggle('active');
                navSecondary.classList.toggle('active');
                
                // Prevent body scroll when menu is open
                if (!isActive) {
                    document.body.style.overflow = 'hidden';
                    console.log('🍔 Menu OPENING');
                } else {
                    document.body.style.overflow = '';
                    console.log('🍔 Menu CLOSING');
                }
            }, { capture: true });
            
            // Add touch event for mobile
            newHamburger.addEventListener('touchstart', function(e) {
                e.stopPropagation();
                console.log('🍔 Hamburger touched!');
            }, { passive: false });
            
            // Close menu when clicking on nav-secondary background (with delay to avoid conflict)
            navSecondary.addEventListener('click', function(e) {
                if (e.target === navSecondary || e.target.classList.contains('nav-secondary-container')) {
                    setTimeout(() => {
                        newHamburger.classList.remove('active');
                        navSecondary.classList.remove('active');
                        document.body.style.overflow = '';
                        console.log('🍔 Menu closed by background click');
                    }, 100);
                }
            });
            
            // Close menu when clicking on a nav link
            if (navMenu) {
                const navLinks = navMenu.querySelectorAll('.nav-link');
                navLinks.forEach(link => {
                    link.addEventListener('click', function(e) {
                        e.stopPropagation();
                        setTimeout(() => {
                            newHamburger.classList.remove('active');
                            navSecondary.classList.remove('active');
                            document.body.style.overflow = '';
                            console.log('🍔 Menu closed by nav link click');
                        }, 100);
                    });
                });
            }
            
            console.log('✅ Hamburger menu initialized');
        } else {
            console.error('❌ Hamburger or nav-secondary not found!', {
                hamburger: !!hamburger,
                navSecondary: !!navSecondary
            });
        }
    }

    // ========================================
    // MODAL FUNCTIONS
    // ========================================
    
    window.showWalletMintCard = function() {
        console.log('🦨 showWalletMintCard called');
        const overlay = document.getElementById('wallet-mint-card-overlay');
        if (overlay) {
            overlay.style.display = 'flex';
            console.log('✅ Modal opened');
            setTimeout(updateWalletCardUI, 100);
        } else {
            console.error('❌ Modal overlay not found!');
        }
    };

    window.closeWalletMintCard = function() {
        console.log('🦨 closeWalletMintCard called');
        const overlay = document.getElementById('wallet-mint-card-overlay');
        if (overlay) {
            overlay.style.display = 'none';
            console.log('✅ Modal closed');
        }
    };

    window.handleConnectAndBuy = function() {
        console.log('🦨 handleConnectAndBuy called');
        window.showWalletMintCard();
    };

    // Update wallet card UI
    function updateWalletCardUI() {
        const walletSection = document.getElementById('wmc-wallet-section');
        const mintSection = document.getElementById('wmc-mint-section');
        const statusEl = document.getElementById('wmc-status');
        
        console.log('🔍 Modal elements:', { walletSection, mintSection, statusEl });
        
        if (!walletSection || !mintSection || !statusEl) {
            console.error('❌ Modal elements missing!');
            return;
        }

        if (window.walletManager && window.walletManager.isConnected) {
            console.log('✅ Wallet connected - showing mint section');
            statusEl.innerHTML = `<p style="color:#22c55e">✅ Wallet Connected: ${window.walletManager.shortenAddress(window.walletManager.accounts[0])}</p>`;
            walletSection.style.display = 'none';
            mintSection.style.display = 'block';
            updateWmcTotal(1);
        } else {
            console.log('⚠️ Wallet not connected - showing connect button');
            statusEl.innerHTML = `<p style="color:#f59e0b">⚠️ Please connect your wallet to mint</p>`;
            walletSection.innerHTML = `
                <button id="wmc-connect-btn" class="wmc-mint-btn" style="margin-bottom: 0;">
                    <span>🦊 Connect Wallet</span>
                </button>
            `;
            walletSection.style.display = 'block';
            mintSection.style.display = 'none';
            
            // Attach connect handler
            setTimeout(() => {
                const connectBtn = document.getElementById('wmc-connect-btn');
                if (connectBtn) {
                    connectBtn.onclick = async function() {
                        console.log('🦨 Modal connect button clicked');
                        
                        // 🔥 LAZY INIT - Create walletManager if it doesn't exist
                        if (!window.walletManager && typeof window.initWalletManager === 'function') {
                            console.log('🔧 Initializing walletManager...');
                            window.initWalletManager();
                        }
                        
                        // Check if walletManager exists
                        if (!window.walletManager) {
                            console.error('❌ walletManager not found!');
                            alert('⚠️ Wallet manager not loaded. Please refresh the page and try again.');
                            return;
                        }
                        
                        // Check if connectWallet function exists
                        if (typeof window.walletManager.connectWallet !== 'function') {
                            console.error('❌ connectWallet function not found!');
                            console.log('walletManager object:', window.walletManager);
                            alert('⚠️ Wallet connection function not available. Please refresh the page.');
                            return;
                        }
                        
                        console.log('✅ walletManager found, attempting to connect...');
                        
                        try {
                            const connected = await window.walletManager.connectWallet();
                            console.log('Connection result:', connected);
                            
                            if (connected) {
                                console.log('✅ Wallet connected successfully');
                                updateWalletCardUI();
                            } else {
                                console.warn('⚠️ Connection failed or was rejected');
                            }
                        } catch (error) {
                            console.error('❌ Error connecting wallet:', error);
                            alert('Failed to connect wallet: ' + error.message);
                        }
                    };
                }
            }, 100);
        }
    }

    // Quantity functions
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

    // ========================================
    // BUTTON INITIALIZATION - AGGRESSIVE APPROACH
    // ========================================
    
    function initializeButtons() {
        console.log('🔧 Initializing buttons...');
        
        // Find ALL possible button selectors
        const selectors = [
            '#connectBuyBtn',
            '#connect-wallet',
            'button[data-action="mint"]',
            'button[data-action="connect"]',
            '.btn-primary',
            '.nav-actions button'
        ];
        
        selectors.forEach(selector => {
            const buttons = document.querySelectorAll(selector);
            buttons.forEach((btn, index) => {
                console.log(`Found button: ${selector} [${index}]`, btn);
                
                // Remove existing handlers
                const newBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(newBtn, btn);
                
                // Add click handler
                newBtn.onclick = function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(`🦨 Button clicked: ${selector}`);
                    window.showWalletMintCard();
                };
                
                console.log(`✅ Handler attached to: ${selector} [${index}]`);
            });
        });
        
        // Modal controls
        const wmcClose = document.getElementById('wmc-close');
        if (wmcClose) {
            wmcClose.onclick = () => window.closeWalletMintCard();
            console.log('✅ Close button initialized');
        }
        
        const overlay = document.getElementById('wallet-mint-card-overlay');
        if (overlay) {
            overlay.onclick = (e) => {
                if (e.target === overlay) window.closeWalletMintCard();
            };
            console.log('✅ Overlay click handler initialized');
        }
        
        // Quantity controls
        const wmcQtyDec = document.getElementById('wmc-qty-dec');
        const wmcQtyInc = document.getElementById('wmc-qty-inc');
        const wmcQty = document.getElementById('wmc-quantity');
        
        if (wmcQtyDec) {
            wmcQtyDec.onclick = () => window.updateWmcQuantity(-1);
            console.log('✅ Decrease button initialized');
        }
        
        if (wmcQtyInc) {
            wmcQtyInc.onclick = () => window.updateWmcQuantity(1);
            console.log('✅ Increase button initialized');
        }
        
        if (wmcQty) {
            wmcQty.onchange = function() {
                const value = Math.max(1, Math.min(10, parseInt(this.value) || 1));
                this.value = value;
                updateWmcTotal(value);
            };
            console.log('✅ Quantity input initialized');
        }
        
        // Mint button
        const wmcMintBtn = document.getElementById('wmc-mint-btn');
        if (wmcMintBtn) {
            wmcMintBtn.onclick = async function() {
                const quantity = parseInt(document.getElementById('wmc-quantity')?.value || 1);
                console.log('🦨 Mint button clicked, quantity:', quantity);
                
                if (window.mintHandler && typeof window.mintHandler.handleMint === 'function') {
                    await window.mintHandler.handleMint(quantity);
                } else {
                    console.error('❌ Mint handler not available');
                    alert('Please wait for the page to fully load and try again.');
                }
            };
            console.log('✅ Mint button initialized');
        }
        
        console.log('✅ All buttons initialized');
    }

    // ========================================
    // INITIALIZATION - MULTIPLE ATTEMPTS
    // ========================================
    
    // Initialize WalletManager to make Web3 available
    function initWeb3() {
        if (typeof Web3 !== 'undefined' && typeof window.initWalletManager === 'function') {
            window.initWalletManager();
            console.log('✅ WalletManager initialized from main.js');
        } else {
            console.log('⏳ Waiting for Web3 and WalletManager...');
        }
    }
    
    // Immediate
    if (document.readyState === 'interactive' || document.readyState === 'complete') {
        initializeButtons();
        initWeb3();
    }
    
    // DOM Ready
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📄 DOM Ready');
        initializeButtons();
        initHamburgerMenu();
        setTimeout(initWeb3, 100);
    });
    
    // Window Load
    window.addEventListener('load', () => {
        console.log('🪟 Window Loaded');
        initializeButtons();
        initHamburgerMenu();
        setTimeout(initWeb3, 200);
    });
    
    // Delayed attempts
    setTimeout(() => {
        console.log('⏱️ Delayed init (500ms)');
        initializeButtons();
        initWeb3();
    }, 500);
    
    setTimeout(() => {
        console.log('⏱️ Delayed init (2000ms)');
        initializeButtons();
        initWeb3();
    }, 2000);
    
    // Make available globally
    window.initializeButtons = initializeButtons;
    window.testModal = () => window.showWalletMintCard();
    
    console.log('✅ SkunkSquad Main JS Loaded');
    console.log('🧪 Test with: window.testModal()');
})();