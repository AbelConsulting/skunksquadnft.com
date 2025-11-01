/**
 * SkunkSquad NFT Website - Main Application
 */

console.log('🦨 SkunkSquad Main JS Loading...');

(function() {
    'use strict';

    const PRICE_PER_NFT = 0.01; // ETH
    let currentEthPrice = 2400; // USD

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
                        if (window.walletManager) {
                            const connected = await window.walletManager.connectWallet();
                            if (connected) updateWalletCardUI();
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
    // HIDE ANY ROGUE ELEMENTS
    // ========================================
    
    function hideRogueElements() {
        console.log('🔍 Searching for rogue mint cards...');
        
        // Look for any visible elements that might be blocking
        document.querySelectorAll('*').forEach(el => {
            const text = el.textContent.toLowerCase();
            if (text.includes('skunksquad mint') && el.id !== 'wallet-mint-card-overlay') {
                console.warn('⚠️ Found rogue element:', el);
                el.style.display = 'none';
                console.log('✅ Hidden rogue element');
            }
        });
    }

    // ========================================
    // INITIALIZATION - MULTIPLE ATTEMPTS
    // ========================================
    
    // Immediate
    if (document.readyState === 'interactive' || document.readyState === 'complete') {
        initializeButtons();
        hideRogueElements();
    }
    
    // DOM Ready
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📄 DOM Ready');
        initializeButtons();
        hideRogueElements();
    });
    
    // Window Load
    window.addEventListener('load', () => {
        console.log('🪟 Window Loaded');
        initializeButtons();
        hideRogueElements();
    });
    
    // Delayed attempts
    setTimeout(() => {
        console.log('⏱️ Delayed init (500ms)');
        initializeButtons();
        hideRogueElements();
    }, 500);
    
    setTimeout(() => {
        console.log('⏱️ Delayed init (2000ms)');
        initializeButtons();
        hideRogueElements();
    }, 2000);
    
    // Make available globally
    window.initializeButtons = initializeButtons;
    window.hideRogueElements = hideRogueElements;
    window.testModal = () => window.showWalletMintCard();
    
    console.log('✅ SkunkSquad Main JS Loaded');
    console.log('🧪 Test with: window.testModal()');
})();