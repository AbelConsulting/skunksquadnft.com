/**
 * SkunkSquad NFT - Transaction Status Tracker
 * Real-time transaction monitoring and status updates
 */

console.log('📡 Loading transaction tracker...');

class TransactionTracker {
    constructor() {
        this.pendingTransactions = new Map();
        this.web3 = null;
        this.checkInterval = null;
        this.storage = {
            key: 'skunksquad_pending_txs',
            save: () => {
                const data = Array.from(this.pendingTransactions.values());
                localStorage.setItem(this.storage.key, JSON.stringify(data));
            },
            load: () => {
                try {
                    const data = localStorage.getItem(this.storage.key);
                    return data ? JSON.parse(data) : [];
                } catch (error) {
                    console.error('Error loading transactions:', error);
                    return [];
                }
            },
            clear: () => {
                localStorage.removeItem(this.storage.key);
            }
        };
    }

    /**
     * Initialize the transaction tracker
     */
    async init() {
        console.log('📡 Initializing transaction tracker...');
        
        // Wait for Web3
        await this.waitForWeb3();
        
        // Load pending transactions from storage
        this.loadPendingTransactions();
        
        // Start checking for updates
        this.startChecking();
        
        console.log('✅ Transaction tracker initialized');
    }

    /**
     * Wait for Web3 to be available
     */
    async waitForWeb3() {
        const maxAttempts = 20;
        let attempts = 0;
        
        while (attempts < maxAttempts) {
            if (window.walletManager?.web3) {
                this.web3 = window.walletManager.web3;
                console.log('✅ Web3 available for transaction tracking');
                return;
            }
            
            await new Promise(resolve => setTimeout(resolve, 500));
            attempts++;
        }
        
        console.warn('⚠️ Web3 not available for transaction tracking');
    }

    /**
     * Load pending transactions from localStorage
     */
    loadPendingTransactions() {
        const saved = this.storage.load();
        saved.forEach(tx => {
            this.pendingTransactions.set(tx.hash, tx);
        });
        
        if (saved.length > 0) {
            console.log(`📡 Loaded ${saved.length} pending transaction(s)`);
        }
    }

    /**
     * Track a new transaction
     */
    track(txHash, metadata = {}) {
        const transaction = {
            hash: txHash,
            status: 'pending',
            timestamp: Date.now(),
            confirmations: 0,
            ...metadata
        };
        
        this.pendingTransactions.set(txHash, transaction);
        this.storage.save();
        
        console.log('📡 Tracking transaction:', txHash);
        
        // Dispatch event
        window.dispatchEvent(new CustomEvent('transactionAdded', {
            detail: transaction
        }));
        
        // Show notification
        if (window.notifications) {
            const toast = window.notifications.transaction(txHash, window.SkunkSquadConfig);
            transaction.toastId = toast;
        }
        
        return transaction;
    }

    /**
     * Start checking transaction statuses
     */
    startChecking() {
        if (this.checkInterval) return;
        
        // Check immediately
        this.checkAllTransactions();
        
        // Then check every 15 seconds
        this.checkInterval = setInterval(() => {
            this.checkAllTransactions();
        }, 15000);
        
        console.log('✅ Transaction checking started');
    }

    /**
     * Stop checking transaction statuses
     */
    stopChecking() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
            console.log('🛑 Transaction checking stopped');
        }
    }

    /**
     * Check all pending transactions
     */
    async checkAllTransactions() {
        if (!this.web3) return;
        if (this.pendingTransactions.size === 0) return;
        
        const promises = Array.from(this.pendingTransactions.keys()).map(hash => 
            this.checkTransaction(hash)
        );
        
        await Promise.all(promises);
    }

    /**
     * Check a specific transaction
     */
    async checkTransaction(txHash) {
        if (!this.web3) return;
        
        const tx = this.pendingTransactions.get(txHash);
        if (!tx) return;
        
        try {
            // Get transaction receipt
            const receipt = await this.web3.eth.getTransactionReceipt(txHash);
            
            if (receipt) {
                // Transaction is mined
                const success = receipt.status === true || receipt.status === '0x1';
                const newStatus = success ? 'confirmed' : 'failed';
                
                // Get confirmations
                const currentBlock = await this.web3.eth.getBlockNumber();
                const confirmations = currentBlock - receipt.blockNumber;
                
                // Update transaction
                tx.status = newStatus;
                tx.confirmations = confirmations;
                tx.blockNumber = receipt.blockNumber;
                tx.gasUsed = receipt.gasUsed;
                
                this.pendingTransactions.set(txHash, tx);
                
                // If enough confirmations, mark as complete
                if (confirmations >= 3 || !success) {
                    this.completeTransaction(txHash, success);
                } else {
                    this.storage.save();
                    
                    // Dispatch update event
                    window.dispatchEvent(new CustomEvent('transactionUpdated', {
                        detail: tx
                    }));
                }
            }
        } catch (error) {
            console.error('Error checking transaction:', error);
        }
    }

    /**
     * Complete a transaction (remove from tracking)
     */
    completeTransaction(txHash, success) {
        const tx = this.pendingTransactions.get(txHash);
        if (!tx) return;
        
        console.log(`${success ? '✅' : '❌'} Transaction ${success ? 'confirmed' : 'failed'}:`, txHash);
        
        // Update notification
        if (tx.toastId && window.notifications) {
            if (success) {
                window.notifications.transactionSuccess(
                    tx.toastId,
                    tx.type === 'mint' ? 
                        `Successfully minted ${tx.quantity || 1} NFT${(tx.quantity || 1) > 1 ? 's' : ''}!` :
                        'Transaction confirmed!'
                );
            } else {
                window.notifications.transactionError(
                    tx.toastId,
                    'Transaction failed'
                );
            }
        }
        
        // Remove from tracking
        this.pendingTransactions.delete(txHash);
        this.storage.save();
        
        // Dispatch completion event
        window.dispatchEvent(new CustomEvent('transactionCompleted', {
            detail: { ...tx, success }
        }));
        
        // Refresh supply if mint transaction
        if (success && tx.type === 'mint' && window.supplyCounter) {
            setTimeout(() => {
                window.supplyCounter.refresh();
            }, 5000);
        }
    }

    /**
     * Get all pending transactions
     */
    getPendingTransactions() {
        return Array.from(this.pendingTransactions.values());
    }

    /**
     * Get transaction by hash
     */
    getTransaction(txHash) {
        return this.pendingTransactions.get(txHash);
    }

    /**
     * Clear all completed transactions
     */
    clearCompleted() {
        const pending = Array.from(this.pendingTransactions.values())
            .filter(tx => tx.status === 'pending');
        
        this.pendingTransactions.clear();
        pending.forEach(tx => {
            this.pendingTransactions.set(tx.hash, tx);
        });
        
        this.storage.save();
        console.log('🧹 Cleared completed transactions');
    }

    /**
     * Get transaction status summary
     */
    getStatus() {
        const txs = this.getPendingTransactions();
        return {
            total: txs.length,
            pending: txs.filter(tx => tx.status === 'pending').length,
            confirmed: txs.filter(tx => tx.status === 'confirmed').length,
            failed: txs.filter(tx => tx.status === 'failed').length
        };
    }

    /**
     * Create a transaction tracker widget
     */
    createWidget() {
        const widget = document.createElement('div');
        widget.id = 'tx-tracker-widget';
        widget.className = 'tx-tracker-widget';
        widget.style.display = 'none';
        
        document.body.appendChild(widget);
        
        // Update widget when transactions change
        const updateWidget = () => {
            const txs = this.getPendingTransactions();
            
            if (txs.length === 0) {
                widget.style.display = 'none';
                return;
            }
            
            widget.style.display = 'block';
            widget.innerHTML = `
                <div class="tx-widget-header">
                    <span>⏳ ${txs.length} Pending Transaction${txs.length > 1 ? 's' : ''}</span>
                    <button onclick="window.txTracker.clearCompleted()">Clear</button>
                </div>
                <div class="tx-widget-list">
                    ${txs.map(tx => `
                        <div class="tx-widget-item" data-status="${tx.status}">
                            <span class="tx-icon">${this.getStatusIcon(tx.status)}</span>
                            <div class="tx-info">
                                <div class="tx-type">${tx.type || 'Transaction'}</div>
                                <div class="tx-hash">${tx.hash.substring(0, 10)}...</div>
                            </div>
                            <div class="tx-confirmations">${tx.confirmations || 0}/3</div>
                        </div>
                    `).join('')}
                </div>
            `;
        };
        
        window.addEventListener('transactionAdded', updateWidget);
        window.addEventListener('transactionUpdated', updateWidget);
        window.addEventListener('transactionCompleted', updateWidget);
        
        console.log('✅ Transaction widget created');
    }

    /**
     * Get status icon
     */
    getStatusIcon(status) {
        const icons = {
            pending: '⏳',
            confirmed: '✅',
            failed: '❌'
        };
        return icons[status] || '❓';
    }
}

// Create global instance
window.txTracker = new TransactionTracker();

// Auto-initialize when ready
window.addEventListener('load', () => {
    setTimeout(() => {
        if (window.txTracker) {
            window.txTracker.init();
        }
    }, 1500);
});

console.log('✅ Transaction tracker loaded');
