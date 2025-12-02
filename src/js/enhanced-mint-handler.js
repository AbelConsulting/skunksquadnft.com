/**
 * SkunkSquad NFT - Enhanced Mint Handler with All New Features
 * This example shows how to integrate all new functionality
 */

console.log('🦨 enhanced-mint-handler.js loading...');

(function() {
    'use strict';

    // Enhanced mint handler with all features integrated
    window.enhancedMintHandler = {
        async handleMint(quantity) {
            console.log('🦨 Enhanced mint starting with quantity:', quantity);
            
            // ===== STEP 1: Validate Web3 =====
            if (typeof Web3 === 'undefined') {
                window.notifications?.error('Web3 library not loaded. Please refresh the page.', {
                    title: '❌ Error'
                });
                return;
            }
            
            if (!window.walletManager) {
                window.notifications?.error('Wallet manager not initialized. Please refresh the page.', {
                    title: '❌ Error'
                });
                return;
            }
            
            // ===== STEP 2: Check Wallet Connection =====
            if (!window.walletManager.isConnected) {
                window.notifications?.info('Please connect your wallet first', {
                    title: 'ℹ️ Connect Wallet'
                });
                
                window.loadingOverlay?.connecting();
                
                try {
                    const connected = await window.walletManager.connectWallet();
                    window.loadingOverlay?.hide();
                    
                    if (!connected) {
                        window.notifications?.error('Failed to connect wallet', {
                            title: '❌ Connection Failed'
                        });
                        return;
                    }
                } catch (error) {
                    window.loadingOverlay?.hide();
                    window.notifications?.error('Wallet connection error: ' + error.message, {
                        title: '❌ Error'
                    });
                    return;
                }
            }
            
            // ===== STEP 3: Check Balance =====
            if (window.balanceChecker) {
                const affordabilityCheck = window.balanceChecker.canAffordMint(quantity);
                
                if (affordabilityCheck && !affordabilityCheck.canAfford) {
                    window.notifications?.error(
                        `You need ${affordabilityCheck.needed.toFixed(4)} ETH but have ${affordabilityCheck.balance.toFixed(4)} ETH`,
                        {
                            title: '💰 Insufficient Funds',
                            duration: 7000
                        }
                    );
                    return;
                }
            }
            
            // ===== STEP 4: Check Supply =====
            if (window.supplyCounter) {
                const supplyData = window.supplyCounter.getSupplyData();
                
                if (supplyData.isSoldOut) {
                    window.notifications?.error('Collection is sold out!', {
                        title: '🚫 Sold Out',
                        duration: 5000
                    });
                    return;
                }
                
                if (supplyData.remaining < quantity) {
                    window.notifications?.warning(
                        `Only ${supplyData.remaining} NFTs remaining! Please reduce quantity.`,
                        {
                            title: '⚠️ Limited Supply',
                            duration: 7000
                        }
                    );
                    return;
                }
            }
            
            // ===== STEP 5: Show Minting Overlay =====
            window.loadingOverlay?.minting(quantity);
            
            try {
                // ===== STEP 6: Get Contract and Calculate Cost =====
                const contract = window.walletManager.contract;
                if (!contract) {
                    throw new Error('Contract not initialized');
                }
                
                const pricePerNFT = await contract.methods.PRICE().call();
                const totalCost = BigInt(pricePerNFT) * BigInt(quantity);
                
                console.log('💰 Mint cost:', {
                    pricePerNFT,
                    quantity,
                    totalCost: totalCost.toString()
                });
                
                // Show price in notification
                if (window.ethPrice) {
                    const ethAmount = parseFloat(window.walletManager.web3.utils.fromWei(totalCost.toString(), 'ether'));
                    const usdAmount = window.ethPrice.ethToUsd(ethAmount);
                    
                    window.notifications?.info(
                        `Minting ${quantity} NFT${quantity > 1 ? 's' : ''} for ${ethAmount.toFixed(4)} ETH (~$${usdAmount?.toFixed(2) || '?'})`,
                        {
                            title: '💰 Cost',
                            duration: 5000
                        }
                    );
                }
                
                // ===== STEP 7: Update Loading Message =====
                window.loadingOverlay?.updateMessage(
                    'Confirm in Wallet',
                    'Please approve the transaction in MetaMask...'
                );
                
                // ===== STEP 8: Send Transaction =====
                const accounts = window.walletManager.accounts;
                const receipt = await contract.methods.mintNFT(quantity).send({
                    from: accounts[0],
                    value: totalCost.toString(),
                    gas: 300000 * quantity
                });
                
                const txHash = receipt.transactionHash || receipt;
                console.log('✅ Transaction sent:', txHash);
                
                // ===== STEP 9: Track Transaction =====
                if (window.txTracker) {
                    window.txTracker.track(txHash, {
                        type: 'mint',
                        quantity: quantity,
                        cost: totalCost.toString(),
                        from: accounts[0]
                    });
                }
                
                // ===== STEP 10: Update Loading =====
                window.loadingOverlay?.updateMessage(
                    'Transaction Submitted',
                    'Waiting for confirmation...'
                );
                
                // ===== STEP 11: Wait for Confirmation =====
                await this.waitForConfirmation(txHash);
                
                // ===== STEP 12: Hide Loading =====
                window.loadingOverlay?.hide();
                
                // ===== STEP 13: Show Success =====
                const explorerLink = window.SkunkSquadConfig?.utils.getTxLink(txHash) || 
                                    `https://etherscan.io/tx/${txHash}`;
                
                window.notifications?.success(
                    `Successfully minted ${quantity} NFT${quantity > 1 ? 's' : ''}!`,
                    {
                        title: '🎉 Mint Successful',
                        duration: 10000,
                        link: {
                            url: explorerLink,
                            text: 'View on Etherscan →'
                        }
                    }
                );
                
                // ===== STEP 14: Refresh Data =====
                setTimeout(() => {
                    // Refresh supply counter
                    if (window.supplyCounter) {
                        window.supplyCounter.refresh();
                    }
                    
                    // Refresh balance
                    if (window.balanceChecker) {
                        window.balanceChecker.refresh();
                    }
                }, 5000);
                
                // ===== STEP 15: Close Modal =====
                if (window.closeWalletMintCard) {
                    setTimeout(() => {
                        window.closeWalletMintCard();
                    }, 2000);
                }
                
                return { success: true, txHash, quantity };
                
            } catch (error) {
                console.error('❌ Mint error:', error);
                
                // Hide loading
                window.loadingOverlay?.hide();
                
                // Show appropriate error message
                let errorMessage = 'Minting failed';
                let errorTitle = '❌ Mint Failed';
                
                if (error.code === 4001 || error.message?.includes('User denied')) {
                    errorMessage = 'You rejected the transaction';
                    errorTitle = '⛔ Transaction Rejected';
                } else if (error.message?.includes('insufficient funds')) {
                    errorMessage = 'Insufficient ETH in your wallet';
                    errorTitle = '💰 Insufficient Funds';
                } else if (error.message?.includes('exceeds max supply')) {
                    errorMessage = 'Not enough NFTs remaining';
                    errorTitle = '🚫 Supply Exceeded';
                } else if (error.message) {
                    errorMessage = error.message;
                }
                
                window.notifications?.error(errorMessage, {
                    title: errorTitle,
                    duration: 7000
                });
                
                return { success: false, error };
            }
        },
        
        /**
         * Wait for transaction confirmation
         */
        async waitForConfirmation(txHash, maxWait = 300000) {
            if (!window.walletManager?.web3) return;
            
            const startTime = Date.now();
            const checkInterval = 3000; // Check every 3 seconds
            
            while (Date.now() - startTime < maxWait) {
                try {
                    const receipt = await window.walletManager.web3.eth.getTransactionReceipt(txHash);
                    
                    if (receipt) {
                        const success = receipt.status === true || receipt.status === '0x1';
                        
                        if (success) {
                            console.log('✅ Transaction confirmed:', txHash);
                            return receipt;
                        } else {
                            throw new Error('Transaction failed on blockchain');
                        }
                    }
                } catch (error) {
                    console.error('Error checking transaction:', error);
                    throw error;
                }
                
                // Wait before next check
                await new Promise(resolve => setTimeout(resolve, checkInterval));
            }
            
            throw new Error('Transaction confirmation timeout');
        },
        
        /**
         * Estimate gas cost for mint
         */
        async estimateGasCost(quantity) {
            if (!window.walletManager?.contract) return null;
            
            try {
                const contract = window.walletManager.contract;
                const accounts = window.walletManager.accounts;
                const pricePerNFT = await contract.methods.PRICE().call();
                const totalCost = BigInt(pricePerNFT) * BigInt(quantity);
                
                const gasEstimate = await contract.methods.mintNFT(quantity).estimateGas({
                    from: accounts[0],
                    value: totalCost.toString()
                });
                
                const gasPrice = await window.walletManager.web3.eth.getGasPrice();
                const gasCost = BigInt(gasEstimate) * BigInt(gasPrice);
                const gasCostEth = parseFloat(window.walletManager.web3.utils.fromWei(gasCost.toString(), 'ether'));
                
                return {
                    gasEstimate,
                    gasPrice,
                    gasCost: gasCost.toString(),
                    gasCostEth,
                    gasCostUsd: window.ethPrice ? window.ethPrice.ethToUsd(gasCostEth) : null
                };
            } catch (error) {
                console.error('Error estimating gas:', error);
                return null;
            }
        }
    };
    
    console.log('✅ Enhanced mint handler loaded');
})();
