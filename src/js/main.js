/**
 * SkunkSquad NFT Website - Main Application
 */

console.log('🦨 SkunkSquad Main JS Loading...');

(function() {
    'use strict';

    const PRICE_PER_NFT = 0.01; // ETH
    let currentEthPrice = 2400; // USD

    // ========================================
    // MODAL FUNCTIONS (No dependencies needed)
    // ========================================
    
    window.showWalletMintCard = function() {
        console.log('🦨 showWalletMintCard called');
        const overlay = document.getElementById('wallet-mint-card-overlay');
        if (overlay) {
            overlay.style.display = 'flex';
            console.log('✅ Modal display set to flex');
            
            // Update UI based on wallet connection
            setTimeout(updateWalletCardUI, 100);
        } else {
            console.error('❌ Modal overlay not found!');
            console.log('Available elements:', {
                body: document.body,
                allDivs: document.querySelectorAll('div').length
            });
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

    // Test function
    window.testModal = function() {
        console.log('🧪 Testing modal...');
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
                        if (window.walletManager) {
                            const connected = await window.walletManager.connectWallet();
                            if (connected) updateWalletCardUI();
                        } else if (window.initWalletManager) {
                            window.initWalletManager();
                            setTimeout(async () => {
                                if (window.walletManager) {
                                    const connected = await window.walletManager.connectWallet();
                                    if (connected) updateWalletCardUI();
                                }
                            }, 500);
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
    // BUTTON INITIALIZATION
    // ========================================
    
    function initializeButtons() {
        console.log('🔧 Initializing buttons...');
        
        // Header buttons
        const connectBuyBtn = document.getElementById('connectBuyBtn');
        const connectWalletBtn = document.getElementById('connect-wallet');
        
        console.log('🔍 Found buttons:', { 
            connectBuyBtn: !!connectBuyBtn, 
            connectWalletBtn: !!connectWalletBtn 
        });
        
        if (connectBuyBtn) {
            connectBuyBtn.onclick = function(e) {
                e.preventDefault();
                console.log('🦨 Connect/Buy button clicked!');
                window.showWalletMintCard();
            };
            console.log('✅ Connect/Buy button initialized');
        } else {
            console.error('❌ connectBuyBtn not found');
        }
        
        if (connectWalletBtn) {
            connectWalletBtn.onclick = function(e) {
                e.preventDefault();
                console.log('🦨 Connect wallet button clicked!');
                window.showWalletMintCard();
            };
            console.log('✅ Connect wallet button initialized');
        } else {
            console.error('❌ connect-wallet button not found');
        }
        
        // Modal close button
        const wmcClose = document.getElementById('wmc-close');
        if (wmcClose) {
            wmcClose.onclick = function() {
                console.log('🦨 Close button clicked');
                window.closeWalletMintCard();
            };
            console.log('✅ Modal close button initialized');
        }
        
        // Overlay click to close
        const overlay = document.getElementById('wallet-mint-card-overlay');
        if (overlay) {
            overlay.onclick = function(e) {
                if (e.target === overlay) {
                    console.log('🦨 Overlay clicked');
                    window.closeWalletMintCard();
                }
            };
            console.log('✅ Overlay click handler initialized');
        }
        
        // Quantity buttons
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
        
        // Hamburger menu
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('nav-menu');
        
        if (hamburger && navMenu) {
            hamburger.onclick = function() {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
            };
            console.log('✅ Hamburger menu initialized');
        }
    }

    // ========================================
    // INITIALIZATION
    // ========================================
    
    // Try multiple initialization methods
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeButtons);
    } else {
        initializeButtons();
    }
    
    window.addEventListener('load', initializeButtons);
    
    // Backup initialization
    setTimeout(initializeButtons, 500);
    setTimeout(initializeButtons, 1000);
    
    // Make functions globally available
    window.initializeButtons = initializeButtons;
    
    console.log('✅ SkunkSquad Main JS Loaded');
})();