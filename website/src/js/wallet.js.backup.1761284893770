/**
 * SkunkSquad NFT Website - Wallet Integration
 * Handles Web3 wallet connections and blockchain interactions
 */

class WalletManager {
    constructor() {
        this.web3 = null;
        this.accounts = [];
        this.networkId = null;
        this.isConnected = false;
        this.contract = null;
        this.contractAddress = '0x6BA18b88b64af8898bbb42262ED18EC13DC81315'; // Ethereum Mainnet
        this.init();
    }

    async init() {
        console.log('🦨 Initializing Wallet Manager...');
        
        try {
            // Check if Web3 is available
            if (typeof window.ethereum !== 'undefined') {
                this.web3 = new Web3(window.ethereum);
                
                // Setup event listeners
                this.setupEventListeners();
                
                // Check if already connected
                await this.checkConnection();
                
                // Setup contract interaction
                await this.setupContract();
                
            } else if (typeof window.web3 !== 'undefined') {
                // Legacy dapp browsers
                this.web3 = new Web3(window.web3.currentProvider);
                console.log('🦨 Using legacy Web3 provider');
            } else {
                console.log('🦨 No Web3 provider detected');
                this.showWeb3Instructions();
            }
            
        } catch (error) {
            console.error('❌ Wallet manager initialization failed:', error);
        }
    }

    setupEventListeners() {
        if (window.ethereum) {
            // Account changes
            window.ethereum.on('accountsChanged', (accounts) => {
                console.log('🦨 Accounts changed:', accounts);
                this.handleAccountsChanged(accounts);
            });

            // Network changes
            window.ethereum.on('chainChanged', (chainId) => {
                console.log('🦨 Network changed:', chainId);
                this.handleNetworkChanged(chainId);
            });

            // Connection events
            window.ethereum.on('connect', (connectInfo) => {
                console.log('🦨 Wallet connected:', connectInfo);
                this.handleConnect(connectInfo);
            });

            window.ethereum.on('disconnect', (error) => {
                console.log('🦨 Wallet disconnected:', error);
                this.handleDisconnect(error);
            });
        }
    }

    async checkConnection() {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                this.accounts = accounts;
                this.isConnected = true;
                this.updateUI();
                console.log('🦨 Wallet already connected:', accounts[0]);
            }
        } catch (error) {
            console.error('❌ Check connection error:', error);
        }
    }

    async connectWallet() {
        try {
            if (!window.ethereum) {
                this.showWeb3Instructions();
                return false;
            }

            console.log('🦨 Requesting wallet connection...');
            
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            if (accounts.length > 0) {
                this.accounts = accounts;
                this.isConnected = true;
                this.updateUI();
                
                // Get network info
                await this.getNetworkInfo();
                
                // Auto-fill wallet address in forms
                this.autoFillWalletAddress(accounts[0]);
                
                console.log('✅ Wallet connected successfully:', accounts[0]);
                
                if (window.skunkSquadWebsite) {
                    window.skunkSquadWebsite.showNotification(
                        `Wallet connected: ${this.shortenAddress(accounts[0])}`,
                        'success'
                    );
                }
                
                return true;
            }
            
        } catch (error) {
            console.error('❌ Wallet connection error:', error);
            
            if (window.skunkSquadWebsite) {
                window.skunkSquadWebsite.showNotification(
                    'Failed to connect wallet. Please try again.',
                    'error'
                );
            }
            
            return false;
        }
    }

    async getNetworkInfo() {
        try {
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            this.networkId = parseInt(chainId, 16);
            
            console.log('🦨 Connected to network:', this.networkId);
            
            // Check if on correct network (Sepolia testnet = 11155111, Mainnet = 1)
            const expectedNetworks = [1, 11155111]; // Mainnet and Sepolia
            
            if (!expectedNetworks.includes(this.networkId)) {
                this.showNetworkWarning();
            }
            
            return this.networkId;
            
        } catch (error) {
            console.error('❌ Get network info error:', error);
            return null;
        }
    }

    async setupContract() {
        if (!this.web3) return;

        try {
            // SkunkSquad NFT Ultra Smart Contract ABI
            const contractABI = [
                {
                    "inputs": [{"internalType": "uint256", "name": "quantity", "type": "uint256"}],
                    "name": "publicMint",
                    "outputs": [],
                    "stateMutability": "payable",
                    "type": "function"
                },
                {
                    "inputs": [],
                    "name": "getCurrentSmartPrice",
                    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [],
                    "name": "totalSupply",
                    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
                    "name": "balanceOf",
                    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [],
                    "name": "MAX_SUPPLY",
                    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [],
                    "name": "currentPhase",
                    "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
                    "stateMutability": "view",
                    "type": "function"
                },
                {
                    "inputs": [{"internalType": "address", "name": "recipient", "type": "address"}, {"internalType": "uint256", "name": "quantity", "type": "uint256"}, {"internalType": "string", "name": "message", "type": "string"}],
                    "name": "giftNFT",
                    "outputs": [],
                    "stateMutability": "payable",
                    "type": "function"
                },
                {
                    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
                    "name": "userAnalytics",
                    "outputs": [
                        {"internalType": "uint256", "name": "totalMinted", "type": "uint256"},
                        {"internalType": "uint256", "name": "totalSpent", "type": "uint256"},
                        {"internalType": "uint256", "name": "firstMintTime", "type": "uint256"},
                        {"internalType": "uint256", "name": "lastMintTime", "type": "uint256"},
                        {"internalType": "uint256", "name": "averageTimeBeweenMints", "type": "uint256"},
                        {"internalType": "uint256", "name": "xpPoints", "type": "uint256"},
                        {"internalType": "uint256", "name": "referralCount", "type": "uint256"},
                        {"internalType": "uint256", "name": "referralEarnings", "type": "uint256"}
                    ],
                    "stateMutability": "view",
                    "type": "function"
                }
            ];

            this.contract = new this.web3.eth.Contract(contractABI, this.contractAddress);
            console.log('🦨 Contract initialized:', this.contractAddress);
            
            // Update pricing from contract
            await this.updateContractInfo();
            
        } catch (error) {
            console.error('❌ Contract setup error:', error);
        }
    }

    async updateContractInfo() {
        if (!this.contract) return;

        try {
            // Get current smart price (dynamic pricing)
            const price = await this.contract.methods.getCurrentSmartPrice().call();
            const priceInEth = this.web3.utils.fromWei(price, 'ether');
            
            // Get total supply
            const totalSupply = await this.contract.methods.totalSupply().call();
            
            console.log('🦨 Contract info updated:', { smartPrice: priceInEth, totalSupply });
            
            // Update UI elements
            this.updatePricingDisplay(priceInEth);
            this.updateSupplyDisplay(totalSupply);
            
        } catch (error) {
            console.error('❌ Update contract info error:', error);
        }
    }

    async mintNFT(quantity = 1) {
        if (!this.isConnected) {
            const connected = await this.connectWallet();
            if (!connected) return false;
        }

        if (!this.contract) {
            console.error('❌ Contract not initialized');
            return false;
        }

        try {
            console.log('🦨 Minting NFT...', { quantity, account: this.accounts[0] });
            
            // Get current smart price (dynamic pricing)
            const price = await this.contract.methods.getCurrentSmartPrice().call();
            const totalCost = this.web3.utils.toBN(price).mul(this.web3.utils.toBN(quantity));
            
            // Estimate gas for publicMint function
            const gasEstimate = await this.contract.methods.publicMint(quantity).estimateGas({
                from: this.accounts[0],
                value: totalCost
            });
            
            // Add 20% buffer to gas estimate
            const gasLimit = Math.floor(gasEstimate * 1.2);
            
            // Send transaction using publicMint
            const transaction = await this.contract.methods.publicMint(quantity).send({
                from: this.accounts[0],
                value: totalCost,
                gas: gasLimit
            });
            
            console.log('✅ NFT minted successfully:', transaction.transactionHash);
            
            if (window.skunkSquadWebsite) {
                window.skunkSquadWebsite.showNotification(
                    `🎉 Successfully minted ${quantity} NFT${quantity > 1 ? 's' : ''}!`,
                    'success'
                );
            }
            
            // Update contract info
            await this.updateContractInfo();
            
            return transaction;
            
        } catch (error) {
            console.error('❌ Mint NFT error:', error);
            
            let errorMessage = 'Failed to mint NFT. Please try again.';
            
            if (error.message.includes('insufficient funds')) {
                errorMessage = 'Insufficient ETH balance for minting.';
            } else if (error.message.includes('execution reverted')) {
                errorMessage = 'Transaction failed. Check if minting is still active.';
            } else if (error.code === 4001) {
                errorMessage = 'Transaction was rejected by user.';
            }
            
            if (window.skunkSquadWebsite) {
                window.skunkSquadWebsite.showNotification(errorMessage, 'error');
            }
            
            return false;
        }
    }

    async getBalance(address = null) {
        if (!this.web3) return '0';

        try {
            const account = address || this.accounts[0];
            if (!account) return '0';

            const balance = await this.web3.eth.getBalance(account);
            return this.web3.utils.fromWei(balance, 'ether');
            
        } catch (error) {
            console.error('❌ Get balance error:', error);
            return '0';
        }
    }

    async getNFTBalance(address = null) {
        if (!this.contract) return 0;

        try {
            const account = address || this.accounts[0];
            if (!account) return 0;

            const balance = await this.contract.methods.balanceOf(account).call();
            return parseInt(balance);
            
        } catch (error) {
            console.error('❌ Get NFT balance error:', error);
            return 0;
        }
    }

    // Event handlers
    handleAccountsChanged(accounts) {
        if (accounts.length === 0) {
            // User disconnected
            this.isConnected = false;
            this.accounts = [];
            this.updateUI();
            
            if (window.skunkSquadWebsite) {
                window.skunkSquadWebsite.showNotification(
                    'Wallet disconnected',
                    'info'
                );
            }
        } else {
            // User switched accounts
            this.accounts = accounts;
            this.isConnected = true;
            this.updateUI();
            this.autoFillWalletAddress(accounts[0]);
            
            if (window.skunkSquadWebsite) {
                window.skunkSquadWebsite.showNotification(
                    `Switched to account: ${this.shortenAddress(accounts[0])}`,
                    'info'
                );
            }
        }
    }

    async handleNetworkChanged(chainId) {
        this.networkId = parseInt(chainId, 16);
        console.log('🦨 Network changed to:', this.networkId);
        
        // Re-setup contract for new network
        await this.setupContract();
        
        // Check if on correct network
        const expectedNetworks = [1, 11155111]; // Mainnet and Sepolia
        if (!expectedNetworks.includes(this.networkId)) {
            this.showNetworkWarning();
        }
    }

    handleConnect(connectInfo) {
        console.log('🦨 Wallet connected:', connectInfo);
    }

    handleDisconnect(error) {
        console.log('🦨 Wallet disconnected:', error);
        this.isConnected = false;
        this.accounts = [];
        this.updateUI();
    }

    // UI update methods
    updateUI() {
        const connectButton = document.getElementById('connect-wallet');
        
        if (connectButton) {
            if (this.isConnected && this.accounts.length > 0) {
                connectButton.textContent = this.shortenAddress(this.accounts[0]);
                connectButton.classList.add('connected');
                connectButton.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
            } else {
                connectButton.textContent = 'Connect Wallet';
                connectButton.classList.remove('connected');
                connectButton.style.background = '';
            }
        }
        
        // Update wallet address in forms
        if (this.isConnected && this.accounts.length > 0) {
            this.autoFillWalletAddress(this.accounts[0]);
        }
    }

    autoFillWalletAddress(address) {
        const walletInput = document.getElementById('wallet-address');
        if (walletInput && !walletInput.value) {
            walletInput.value = address;
        }
    }

    updatePricingDisplay(priceInEth) {
        const priceElements = document.querySelectorAll('.price-value');
        const ethPrice = parseFloat(priceInEth).toFixed(4);
        
        priceElements.forEach(element => {
            element.textContent = `${ethPrice} ETH`;
        });
    }

    updateSupplyDisplay(totalSupply) {
        const supplyElements = document.querySelectorAll('.stat-number');
        const remaining = 10000 - parseInt(totalSupply);
        
        // Update minted count
        supplyElements.forEach(element => {
            if (element.parentElement.querySelector('.stat-label')?.textContent === 'Total Minted') {
                element.textContent = totalSupply;
            }
        });
    }

    // Utility methods
    shortenAddress(address) {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }

    isValidAddress(address) {
        return this.web3?.utils.isAddress(address) || false;
    }

    async addTokenToWallet() {
        try {
            const wasAdded = await window.ethereum.request({
                method: 'wallet_watchAsset',
                params: {
                    type: 'ERC721',
                    options: {
                        address: this.contractAddress,
                        symbol: 'SKUNK',
                        decimals: 0,
                        image: 'https://skunksquadnft.com/images/logo.png',
                    },
                },
            });

            if (wasAdded) {
                console.log('✅ Token added to wallet');
            }
        } catch (error) {
            console.error('❌ Add token to wallet error:', error);
        }
    }

    // Error/Warning displays
    showWeb3Instructions() {
        const message = `
            <div class="web3-instructions">
                <h3>🦊 Web3 Wallet Required</h3>
                <p>To interact with SkunkSquad NFTs, you need a Web3 wallet like MetaMask.</p>
                <a href="https://metamask.io/download/" target="_blank" class="btn btn-primary">
                    Install MetaMask
                </a>
            </div>
        `;
        
        if (window.skunkSquadWebsite) {
            window.skunkSquadWebsite.showNotification(
                'MetaMask or Web3 wallet required for NFT features',
                'info'
            );
        }
    }

    showNetworkWarning() {
        const networkNames = {
            1: 'Ethereum Mainnet',
            11155111: 'Sepolia Testnet'
        };
        
        const currentNetwork = networkNames[this.networkId] || `Network ${this.networkId}`;
        
        if (window.skunkSquadWebsite) {
            window.skunkSquadWebsite.showNotification(
                `Connected to ${currentNetwork}. For best experience, use Ethereum Mainnet or Sepolia Testnet.`,
                'info'
            );
        }
    }

    // Public methods for external use
    async switchToMainnet() {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x1' }], // Mainnet
            });
        } catch (error) {
            console.error('❌ Switch network error:', error);
        }
    }

    async switchToSepolia() {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0xaa36a7' }], // Sepolia
            });
        } catch (error) {
            console.error('❌ Switch network error:', error);
        }
    }
}

// Initialize wallet manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (typeof Web3 !== 'undefined') {
        window.walletManager = new WalletManager();
        
        // Override wallet connection button
        const connectButton = document.getElementById('connect-wallet');
        if (connectButton) {
            connectButton.addEventListener('click', async (e) => {
                e.preventDefault();
                
                if (window.walletManager.isConnected) {
                    // Show wallet info or disconnect options
                    window.walletManager.showWalletInfo();
                } else {
                    await window.walletManager.connectWallet();
                }
            });
        }
        
        // Override ETH purchase buttons
        const ethButtons = document.querySelectorAll('#buy-with-eth, #buy-with-eth-modal');
        ethButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                e.preventDefault();
                
                // Close modal if open
                if (window.skunkSquadWebsite) {
                    window.skunkSquadWebsite.closePurchaseModal();
                }
                
                // Get quantity (default to 1)
                let quantity = 1;
                const quantitySelect = document.getElementById('quantity');
                if (quantitySelect) {
                    quantity = parseInt(quantitySelect.value) || 1;
                }
                
                // Mint NFT
                await window.walletManager.mintNFT(quantity);
            });
        });
        
    } else {
        console.log('🦨 Web3 not loaded - wallet features disabled');
    }
});

export default WalletManager;