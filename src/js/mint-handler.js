/**
 * SkunkSquad NFT - Mint Handler
 * Centralized minting logic with two-click flow
 */

console.log('🦨 mint-handler.js loading...');

(function() {
    'use strict';

    // Initialize mint handler immediately (NO WAITING LOOP!)
    window.mintHandler = {
        async handleMint(quantity) {
            console.log('🦨 handleMint called with quantity:', quantity);
            
            // Check dependencies ONLY when mint is clicked
            if (typeof Web3 === 'undefined') {
                console.error('❌ Web3 not loaded');
                alert('⚠️ Web3 library not loaded. Please refresh the page and try again.');
                return;
            }
            
            if (!window.walletManager) {
                console.error('❌ Wallet manager not initialized');
                alert('⚠️ Wallet manager not ready. Please refresh the page and try again.');
                return;
            }
            
            if (!window.walletManager.isConnected) {
                console.log('⚠️ Wallet not connected, connecting now...');
                const connected = await window.walletManager.connectWallet();
                if (!connected) {
                    console.error('❌ Failed to connect wallet');
                    return;
                }
            }
            
            try {
                console.log('🚀 Starting mint process...');
                
                // Show loading state
                const mintBtn = document.getElementById('wmc-mint-btn');
                const mintBtnText = document.getElementById('wmc-mint-btn-text');
                const mintBtnSpinner = document.getElementById('wmc-mint-btn-spinner');
                
                if (mintBtn) {
                    mintBtn.disabled = true;
                    mintBtn.classList.add('loading');
                }
                if (mintBtnText) mintBtnText.textContent = 'Minting...';
                if (mintBtnSpinner) mintBtnSpinner.style.display = 'inline-block';
                
                // Get contract instance
                const contract = window.walletManager.contract;
                if (!contract) {
                    throw new Error('Contract not initialized');
                }
                
                // Calculate total cost
                const pricePerNFT = await contract.methods.PRICE().call();
                const totalCost = BigInt(pricePerNFT) * BigInt(quantity);
                
                console.log('💰 Price per NFT:', pricePerNFT);
                console.log('💰 Total cost:', totalCost.toString());
                
                // Send transaction
                const accounts = window.walletManager.accounts;
                const txHash = await contract.methods.mintNFT(quantity).send({  // ✅ Changed from mint to mintNFT
                    from: accounts[0],
                    value: totalCost.toString(),
                    gas: 300000 * quantity
                });
                
                console.log('✅ Mint successful! TX Hash:', txHash);
                
                // Update UI
                if (mintBtnText) mintBtnText.textContent = '✅ Minted!';
                
                // Show success message
                setTimeout(() => {
                    alert(`✅ Successfully minted ${quantity} NFT${quantity > 1 ? 's' : ''}!\n\nTransaction: ${txHash.transactionHash || txHash}`);
                    if (window.closeWalletMintCard) {
                        window.closeWalletMintCard();
                    }
                    
                    // Reset button
                    if (mintBtn) {
                        mintBtn.disabled = false;
                        mintBtn.classList.remove('loading');
                    }
                    if (mintBtnText) mintBtnText.textContent = '🚀 Mint Now';
                    if (mintBtnSpinner) mintBtnSpinner.style.display = 'none';
                }, 1000);
                
            } catch (error) {
                console.error('❌ Mint error:', error);
                
                // Reset button
                const mintBtn = document.getElementById('wmc-mint-btn');
                const mintBtnText = document.getElementById('wmc-mint-btn-text');
                const mintBtnSpinner = document.getElementById('wmc-mint-btn-spinner');
                
                if (mintBtn) {
                    mintBtn.disabled = false;
                    mintBtn.classList.remove('loading');
                }
                if (mintBtnText) mintBtnText.textContent = '🚀 Mint Now';
                if (mintBtnSpinner) mintBtnSpinner.style.display = 'none';
                
                // Show error
                if (error.message && error.message.includes('User denied')) {
                    alert('❌ Transaction rejected by user');
                } else if (error.message && error.message.includes('insufficient funds')) {
                    alert('❌ Insufficient funds in wallet');
                } else {
                    alert('❌ Mint failed: ' + (error.message || 'Unknown error'));
                }
            }
        }
    };
    
    console.log('✅ Mint handler initialized');
})();

