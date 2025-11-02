/**
 * SkunkSquad NFT Website - Wallet Integration
 * Handles Web3 wallet connections and blockchain interactions
 */

console.log('🦨 wallet.js loading...');

class WalletManager {
    constructor() {
        console.log('🦨 Initializing Wallet Manager...');
        
        // ✅ MODERN PROVIDER DETECTION
        this.web3 = null;
        this.accounts = [];
        this.contract = null;
        this.isConnected = false;
        this.currentNetwork = null;
        this.networkId = null;
        this.loading = false;
        this.walletInfoModal = null;
        
        // ✅ ADD CONTRACT ADDRESS from config
        this.contractAddress = window.SKUNKSQUAD_CONFIG?.CONTRACT_ADDRESS || '0xAa5C50099bEb130c8988324A0F6Ebf65979f10EF';
        
        console.log('📍 Contract address:', this.contractAddress);
        
        // Use modern provider (MetaMask's ethereum object)
        if (typeof window.ethereum !== 'undefined') {
            console.log('✅ MetaMask detected');
            this.provider = window.ethereum;
        } else {
            console.warn('⚠️ No Web3 provider detected');
            this.provider = null;
        }
        
        this.init();
    }

    async init() {
        console.log('🔧 Initializing Web3...');
        
        if (!this.provider) {
            console.error('❌ No Ethereum provider found. Please install MetaMask.');
            return;
        }
        
        try {
            // ✅ MODERN WEB3 INITIALIZATION
            this.web3 = new Web3(this.provider);
            console.log('✅ Web3 initialized with provider');
            
            // ✅ Check if already connected
            await this.checkConnection();
            
            // Setup event listeners for account/network changes
            this.setupEventListeners();
            
            // ✅ Setup contract immediately if connected
            if (this.isConnected) {
                await this.setupContract();
            }
            
        } catch (error) {
            console.error('❌ Error initializing Web3:', error);
        }
    }

    setupEventListeners() {
        if (!this.provider) return;
        
        console.log('🎧 Setting up event listeners...');
        
        // ✅ MODERN EVENT LISTENERS
        
        // Account changed
        this.provider.on('accountsChanged', async (accounts) => {
            console.log('🔄 Accounts changed:', accounts);
            
            if (accounts.length === 0) {
                console.log('⚠️ Wallet disconnected');
                this.isConnected = false;
                this.accounts = [];
                this.updateUI();
                window.dispatchEvent(new Event('walletDisconnected'));
            } else {
                console.log('✅ Account switched to:', accounts[0]);
                this.accounts = accounts;
                this.isConnected = true;
                await this.getNetworkInfo();
                await this.setupContract();
                this.updateUI();
                this.autoFillWalletAddress(accounts[0]);
                window.dispatchEvent(new CustomEvent('walletConnected', { 
                    detail: { address: accounts[0] } 
                }));
            }
        });
        
        // Chain changed
        this.provider.on('chainChanged', (chainId) => {
            console.log('🔄 Chain changed:', chainId);
            this.networkId = parseInt(chainId, 16);
            window.location.reload();
        });
        
        console.log('✅ Event listeners set up');
    }

    async checkConnection() {
        if (!this.provider) return;
        
        try {
            // ✅ MODERN METHOD - Check existing accounts
            const accounts = await this.provider.request({ 
                method: 'eth_accounts' 
            });
            
            if (accounts.length > 0) {
                console.log('🔗 Previously connected account found:', accounts[0]);
                this.accounts = accounts;
                this.isConnected = true;
                
                // Get network info
                await this.getNetworkInfo();
                
                // Update UI
                this.updateUI();
            } else {
                console.log('ℹ️ No previously connected accounts');
            }
        } catch (error) {
            console.error('❌ Check connection error:', error);
        }
    }

    async connectWallet() {
        console.log('🦨 connectWallet called');
        
        if (!this.provider) {
            alert('⚠️ Please install MetaMask to connect your wallet!');
            return false;
        }
        
        try {
            console.log('📱 Requesting account access...');
            
            // ✅ MODERN METHOD - Request accounts
            const accounts = await this.provider.request({ 
                method: 'eth_requestAccounts' 
            });
            
            console.log('✅ Accounts received:', accounts);
            
            this.accounts = accounts;
            this.isConnected = true;
            
            // Get network info
            await this.getNetworkInfo();
            
            // Setup contract
            await this.setupContract();
            
            console.log('✅ Wallet connected:', this.shortenAddress(accounts[0]));
            
            // Dispatch custom event
            window.dispatchEvent(new CustomEvent('walletConnected', { 
                detail: { address: accounts[0] } 
            }));
            
            return true;
            
        } catch (error) {
            console.error('❌ Error connecting wallet:', error);
            
            if (error.code === 4001) {
                console.log('⚠️ User rejected connection request');
                alert('Connection request rejected. Please try again.');
            } else {
                alert('Failed to connect wallet: ' + error.message);
            }
            
            return false;
        }
    }

    async getNetworkInfo() {
        try {
            // ✅ MODERN METHOD - Get chain ID
            const chainId = await this.provider.request({ 
                method: 'eth_chainId' 
            });
            
            const chainIdNum = parseInt(chainId, 16);
            console.log('🌐 Connected to chain ID:', chainIdNum);
            
            const networkNames = {
                1: 'Ethereum Mainnet',
                5: 'Goerli Testnet',
                11155111: 'Sepolia Testnet',
                137: 'Polygon Mainnet',
                80001: 'Mumbai Testnet'
            };
            
            this.currentNetwork = {
                chainId: chainIdNum,
                name: networkNames[chainIdNum] || `Chain ${chainIdNum}`
            };
            
            console.log('✅ Network:', this.currentNetwork.name);
            
            return this.currentNetwork;
            
        } catch (error) {
            console.error('❌ Error getting network info:', error);
            return null;
        }
    }

    
    async setupContract() {
        if (!this.web3) {
            console.warn('⚠️ Web3 not initialized, cannot setup contract');
            return;
        }

        try {
            console.log('📄 Setting up contract...');
            console.log('📍 Contract address:', this.contractAddress);
            
            // SkunkSquad NFT Contract ABI (Mainnet)
            const contractABI = [
                {
                    "inputs": [
                              {
                                        "internalType": "string",
                                        "name": "name",
                                        "type": "string"
                              },
                              {
                                        "internalType": "string",
                                        "name": "symbol",
                                        "type": "string"
                              },
                              {
                                        "internalType": "string",
                                        "name": "baseURI",
                                        "type": "string"
                              },
                              {
                                        "internalType": "string",
                                        "name": "contractURI_",
                                        "type": "string"
                              },
                              {
                                        "internalType": "string",
                                        "name": "unrevealedURI",
                                        "type": "string"
                              },
                              {
                                        "internalType": "address",
                                        "name": "royaltyRecipient_",
                                        "type": "address"
                              },
                              {
                                        "internalType": "uint96",
                                        "name": "royaltyFee_",
                                        "type": "uint96"
                              }
                    ],
                    "stateMutability": "nonpayable",
                    "type": "constructor"
          },
          {
                    "anonymous": false,
                    "inputs": [
                              {
                                        "indexed": true,
                                        "internalType": "address",
                                        "name": "owner",
                                        "type": "address"
                              },
                              {
                                        "indexed": true,
                                        "internalType": "address",
                                        "name": "approved",
                                        "type": "address"
                              },
                              {
                                        "indexed": true,
                                        "internalType": "uint256",
                                        "name": "tokenId",
                                        "type": "uint256"
                              }
                    ],
                    "name": "Approval",
                    "type": "event"
          },
          {
                    "anonymous": false,
                    "inputs": [
                              {
                                        "indexed": true,
                                        "internalType": "address",
                                        "name": "owner",
                                        "type": "address"
                              },
                              {
                                        "indexed": true,
                                        "internalType": "address",
                                        "name": "operator",
                                        "type": "address"
                              },
                              {
                                        "indexed": false,
                                        "internalType": "bool",
                                        "name": "approved",
                                        "type": "bool"
                              }
                    ],
                    "name": "ApprovalForAll",
                    "type": "event"
          },
          {
                    "anonymous": false,
                    "inputs": [
                              {
                                        "indexed": true,
                                        "internalType": "address",
                                        "name": "previousOwner",
                                        "type": "address"
                              },
                              {
                                        "indexed": true,
                                        "internalType": "address",
                                        "name": "newOwner",
                                        "type": "address"
                              }
                    ],
                    "name": "OwnershipTransferred",
                    "type": "event"
          },
          {
                    "anonymous": false,
                    "inputs": [
                              {
                                        "indexed": true,
                                        "internalType": "address",
                                        "name": "from",
                                        "type": "address"
                              },
                              {
                                        "indexed": true,
                                        "internalType": "address",
                                        "name": "to",
                                        "type": "address"
                              },
                              {
                                        "indexed": true,
                                        "internalType": "uint256",
                                        "name": "tokenId",
                                        "type": "uint256"
                              }
                    ],
                    "name": "Transfer",
                    "type": "event"
          },
          {
                    "inputs": [],
                    "name": "MAX_SUPPLY",
                    "outputs": [
                              {
                                        "internalType": "uint256",
                                        "name": "",
                                        "type": "uint256"
                              }
                    ],
                    "stateMutability": "view",
                    "type": "function"
          },
          {
                    "inputs": [],
                    "name": "PRICE",
                    "outputs": [
                              {
                                        "internalType": "uint256",
                                        "name": "",
                                        "type": "uint256"
                              }
                    ],
                    "stateMutability": "view",
                    "type": "function"
          },
          {
                    "inputs": [
                              {
                                        "internalType": "address",
                                        "name": "to",
                                        "type": "address"
                              },
                              {
                                        "internalType": "uint256",
                                        "name": "tokenId",
                                        "type": "uint256"
                              }
                    ],
                    "name": "approve",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
          },
          {
                    "inputs": [
                              {
                                        "internalType": "address",
                                        "name": "owner",
                                        "type": "address"
                              }
                    ],
                    "name": "balanceOf",
                    "outputs": [
                              {
                                        "internalType": "uint256",
                                        "name": "",
                                        "type": "uint256"
                              }
                    ],
                    "stateMutability": "view",
                    "type": "function"
          },
          {
                    "inputs": [],
                    "name": "contractURI",
                    "outputs": [
                              {
                                        "internalType": "string",
                                        "name": "",
                                        "type": "string"
                              }
                    ],
                    "stateMutability": "view",
                    "type": "function"
          },
          {
                    "inputs": [
                              {
                                        "internalType": "uint256",
                                        "name": "tokenId",
                                        "type": "uint256"
                              }
                    ],
                    "name": "exists",
                    "outputs": [
                              {
                                        "internalType": "bool",
                                        "name": "",
                                        "type": "bool"
                              }
                    ],
                    "stateMutability": "view",
                    "type": "function"
          },
          {
                    "inputs": [
                              {
                                        "internalType": "uint256",
                                        "name": "tokenId",
                                        "type": "uint256"
                              }
                    ],
                    "name": "getApproved",
                    "outputs": [
                              {
                                        "internalType": "address",
                                        "name": "",
                                        "type": "address"
                              }
                    ],
                    "stateMutability": "view",
                    "type": "function"
          },
          {
                    "inputs": [
                              {
                                        "internalType": "address",
                                        "name": "owner",
                                        "type": "address"
                              },
                              {
                                        "internalType": "address",
                                        "name": "operator",
                                        "type": "address"
                              }
                    ],
                    "name": "isApprovedForAll",
                    "outputs": [
                              {
                                        "internalType": "bool",
                                        "name": "",
                                        "type": "bool"
                              }
                    ],
                    "stateMutability": "view",
                    "type": "function"
          },
          {
                    "inputs": [
                              {
                                        "internalType": "uint256",
                                        "name": "quantity",
                                        "type": "uint256"
                              }
                    ],
                    "name": "mintNFT",
                    "outputs": [],
                    "stateMutability": "payable",
                    "type": "function"
          },
          {
                    "inputs": [],
                    "name": "name",
                    "outputs": [
                              {
                                        "internalType": "string",
                                        "name": "",
                                        "type": "string"
                              }
                    ],
                    "stateMutability": "view",
                    "type": "function"
          },
          {
                    "inputs": [],
                    "name": "owner",
                    "outputs": [
                              {
                                        "internalType": "address",
                                        "name": "",
                                        "type": "address"
                              }
                    ],
                    "stateMutability": "view",
                    "type": "function"
          },
          {
                    "inputs": [
                              {
                                        "internalType": "uint256",
                                        "name": "tokenId",
                                        "type": "uint256"
                              }
                    ],
                    "name": "ownerOf",
                    "outputs": [
                              {
                                        "internalType": "address",
                                        "name": "",
                                        "type": "address"
                              }
                    ],
                    "stateMutability": "view",
                    "type": "function"
          },
          {
                    "inputs": [],
                    "name": "renounceOwnership",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
          },
          {
                    "inputs": [],
                    "name": "reveal",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
          },
          {
                    "inputs": [],
                    "name": "revealed",
                    "outputs": [
                              {
                                        "internalType": "bool",
                                        "name": "",
                                        "type": "bool"
                              }
                    ],
                    "stateMutability": "view",
                    "type": "function"
          },
          {
                    "inputs": [],
                    "name": "royaltyFee",
                    "outputs": [
                              {
                                        "internalType": "uint96",
                                        "name": "",
                                        "type": "uint96"
                              }
                    ],
                    "stateMutability": "view",
                    "type": "function"
          },
          {
                    "inputs": [
                              {
                                        "internalType": "uint256",
                                        "name": "tokenId",
                                        "type": "uint256"
                              },
                              {
                                        "internalType": "uint256",
                                        "name": "salePrice",
                                        "type": "uint256"
                              }
                    ],
                    "name": "royaltyInfo",
                    "outputs": [
                              {
                                        "internalType": "address",
                                        "name": "receiver",
                                        "type": "address"
                              },
                              {
                                        "internalType": "uint256",
                                        "name": "royaltyAmount",
                                        "type": "uint256"
                              }
                    ],
                    "stateMutability": "view",
                    "type": "function"
          },
          {
                    "inputs": [],
                    "name": "royaltyRecipient",
                    "outputs": [
                              {
                                        "internalType": "address",
                                        "name": "",
                                        "type": "address"
                              }
                    ],
                    "stateMutability": "view",
                    "type": "function"
          },
          {
                    "inputs": [
                              {
                                        "internalType": "address",
                                        "name": "from",
                                        "type": "address"
                              },
                              {
                                        "internalType": "address",
                                        "name": "to",
                                        "type": "address"
                              },
                              {
                                        "internalType": "uint256",
                                        "name": "tokenId",
                                        "type": "uint256"
                              }
                    ],
                    "name": "safeTransferFrom",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
          },
          {
                    "inputs": [
                              {
                                        "internalType": "address",
                                        "name": "from",
                                        "type": "address"
                              },
                              {
                                        "internalType": "address",
                                        "name": "to",
                                        "type": "address"
                              },
                              {
                                        "internalType": "uint256",
                                        "name": "tokenId",
                                        "type": "uint256"
                              },
                              {
                                        "internalType": "bytes",
                                        "name": "data",
                                        "type": "bytes"
                              }
                    ],
                    "name": "safeTransferFrom",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
          },
          {
                    "inputs": [
                              {
                                        "internalType": "address",
                                        "name": "operator",
                                        "type": "address"
                              },
                              {
                                        "internalType": "bool",
                                        "name": "approved",
                                        "type": "bool"
                              }
                    ],
                    "name": "setApprovalForAll",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
          },
          {
                    "inputs": [
                              {
                                        "internalType": "string",
                                        "name": "baseURI",
                                        "type": "string"
                              }
                    ],
                    "name": "setBaseURI",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
          },
          {
                    "inputs": [
                              {
                                        "internalType": "string",
                                        "name": "uri",
                                        "type": "string"
                              }
                    ],
                    "name": "setContractURI",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
          },
          {
                    "inputs": [
                              {
                                        "internalType": "address",
                                        "name": "recipient",
                                        "type": "address"
                              },
                              {
                                        "internalType": "uint96",
                                        "name": "fee",
                                        "type": "uint96"
                              }
                    ],
                    "name": "setRoyaltyInfo",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
          },
          {
                    "inputs": [
                              {
                                        "internalType": "string",
                                        "name": "uri",
                                        "type": "string"
                              }
                    ],
                    "name": "setUnrevealedURI",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
          },
          {
                    "inputs": [
                              {
                                        "internalType": "bytes4",
                                        "name": "interfaceId",
                                        "type": "bytes4"
                              }
                    ],
                    "name": "supportsInterface",
                    "outputs": [
                              {
                                        "internalType": "bool",
                                        "name": "",
                                        "type": "bool"
                              }
                    ],
                    "stateMutability": "view",
                    "type": "function"
          },
          {
                    "inputs": [],
                    "name": "symbol",
                    "outputs": [
                              {
                                        "internalType": "string",
                                        "name": "",
                                        "type": "string"
                              }
                    ],
                    "stateMutability": "view",
                    "type": "function"
          },
          {
                    "inputs": [
                              {
                                        "internalType": "uint256",
                                        "name": "tokenId",
                                        "type": "uint256"
                              }
                    ],
                    "name": "tokenURI",
                    "outputs": [
                              {
                                        "internalType": "string",
                                        "name": "",
                                        "type": "string"
                              }
                    ],
                    "stateMutability": "view",
                    "type": "function"
          },
          {
                    "inputs": [],
                    "name": "totalSupply",
                    "outputs": [
                              {
                                        "internalType": "uint256",
                                        "name": "",
                                        "type": "uint256"
                              }
                    ],
                    "stateMutability": "view",
                    "type": "function"
          },
          {
                    "inputs": [
                              {
                                        "internalType": "address",
                                        "name": "from",
                                        "type": "address"
                              },
                              {
                                        "internalType": "address",
                                        "name": "to",
                                        "type": "address"
                              },
                              {
                                        "internalType": "uint256",
                                        "name": "tokenId",
                                        "type": "uint256"
                              }
                    ],
                    "name": "transferFrom",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
          },
          {
                    "inputs": [
                              {
                                        "internalType": "address",
                                        "name": "newOwner",
                                        "type": "address"
                              }
                    ],
                    "name": "transferOwnership",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
          },
          {
                    "inputs": [],
                    "name": "withdraw",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
          }
];

            this.contract = new this.web3.eth.Contract(contractABI, this.contractAddress);
            console.log('✅ Contract initialized:', this.contractAddress);
            
            // Update contract info
            await this.updateContractInfo();
            
        } catch (error) {
            console.error('❌ Contract setup error:', error);
        }
    }
    async updateContractInfo() {
        if (!this.contract) return;

        try {
            // Get current smart price (dynamic pricing)
            const price = this.web3.utils.toWei('0.01', 'ether'); // Fixed price
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
            this.showLoading('Preparing transaction...');
            
            // ✅ Price calculation
            const pricePerNFT = '0.01'; // 0.01 ETH per NFT
            const priceInWei = this.web3.utils.toWei(pricePerNFT, 'ether');
            const qty = BigInt(quantity);
            const pricePerNFTBigInt = BigInt(priceInWei);
            const totalCost = (pricePerNFTBigInt * qty).toString();
            
            console.log('🦨 Minting NFT...', { 
                quantity: quantity.toString(),
                pricePerNFT,
                totalCostWei: totalCost,
                totalCostEth: this.web3.utils.fromWei(totalCost, 'ether')
            });
            
            this.showLoading('Estimating gas...');
            
            // ✅ Gas estimation
            const gasEstimate = await this.contract.methods.mintNFT(quantity.toString()).estimateGas({
                from: this.accounts[0],
                value: totalCost
            });
            
            // ✅ Handle both BigInt and Number
            const gasEstimateNum = typeof gasEstimate === 'bigint' ? Number(gasEstimate) : parseInt(gasEstimate);
            const gasLimit = Math.floor(gasEstimateNum * 1.2);
            
            console.log('🦨 Gas estimate:', { 
                estimate: gasEstimateNum.toString(), 
                withBuffer: gasLimit.toString() 
            });
            
            this.showLoading('Waiting for wallet confirmation...');
            
            // ✅ Send transaction
            const sendTx = this.contract.methods.mintNFT(quantity.toString()).send({
                from: this.accounts[0],
                value: totalCost,
                gas: gasLimit.toString()
            });
            
            // Transaction status notifications
            sendTx.on('transactionHash', (hash) => {
                this.showLoading('Transaction submitted. Waiting for confirmation...');
                console.log('🦨 Transaction hash:', hash);
                if (window.skunkSquadWebsite) {
                    window.skunkSquadWebsite.showNotification(
                        `Transaction submitted: ${hash.slice(0, 10)}...`,
                        'info'
                    );
                }
            });
            
            sendTx.on('receipt', (receipt) => {
                this.hideLoading();
                console.log('✅ Transaction receipt:', receipt);
                if (window.skunkSquadWebsite) {
                    window.skunkSquadWebsite.showNotification(
                        `🎉 Successfully minted ${quantity} NFT${quantity > 1 ? 's' : ''}!`,
                        'success'
                    );
                }
            });
            
            sendTx.on('error', (error) => {
                this.hideLoading();
                console.error('❌ Transaction error:', error);
                this.handleMintError(error);
            });
            
            const transaction = await sendTx;
            
            // Update contract info
            await this.updateContractInfo();
            
            return transaction;
            
        } catch (error) {
            this.hideLoading();
            console.error('❌ Mint NFT error:', error);
            this.handleMintError(error);
            return false;
        }
    }

    // ✅ Add helper method for error handling
    handleMintError(error) {
        let errorMessage = 'Failed to mint NFT. Please try again.';
        
        if (error.message) {
            if (error.message.includes('insufficient funds')) {
                errorMessage = 'Insufficient ETH balance for minting + gas fees.';
            } else if (error.message.includes('execution reverted')) {
                errorMessage = 'Transaction reverted. Minting may be paused or sold out.';
            } else if (error.message.includes('gas required exceeds')) {
                errorMessage = 'Gas limit too low. Please try again.';
            } else if (error.message.includes('nonce')) {
                errorMessage = 'Transaction conflict. Please wait and try again.';
            }
        }
        
        if (error.code === 4001) {
            errorMessage = 'Transaction was rejected by user.';
        } else if (error.code === -32603) {
            errorMessage = 'Internal error. Please check your wallet and try again.';
        }
        
        if (window.skunkSquadWebsite && window.skunkSquadWebsite.showNotification) {
            window.skunkSquadWebsite.showNotification(errorMessage, 'error');
        } else {
            alert('❌ ' + errorMessage);
            console.error('❌ Mint error:', errorMessage);
        }
    }
    // Show wallet info modal
    async showWalletInfo() {
        if (!this.isConnected || !this.accounts[0]) return;
        // Create modal if not exists
        if (!this.walletInfoModal) {
            this.walletInfoModal = document.createElement('div');
            this.walletInfoModal.className = 'wallet-info-modal';
            this.walletInfoModal.innerHTML = `
                <div class="wallet-info-content">
                    <h3>Wallet Info</h3>
                    <div><strong>Address:</strong> <span id="wallet-info-address"></span></div>
                    <div><strong>ETH Balance:</strong> <span id="wallet-info-balance">...</span></div>
                    <div><strong>NFTs Owned:</strong> <span id="wallet-info-nft">...</span></div>
                    <button id="wallet-info-disconnect" class="btn btn-secondary">Disconnect</button>
                    <button id="wallet-info-close" class="btn btn-primary">Close</button>
                </div>
            `;
            document.body.appendChild(this.walletInfoModal);
            document.getElementById('wallet-info-close').onclick = () => {
                this.walletInfoModal.style.display = 'none';
            };
            document.getElementById('wallet-info-disconnect').onclick = () => {
                this.disconnectWallet();
                this.walletInfoModal.style.display = 'none';
            };
        }
        // Fill info
        document.getElementById('wallet-info-address').textContent = this.accounts[0];
        document.getElementById('wallet-info-balance').textContent = '...';
        document.getElementById('wallet-info-nft').textContent = '...';
        this.walletInfoModal.style.display = 'block';
        // Fetch balances
        this.getBalance().then(bal => {
            document.getElementById('wallet-info-balance').textContent = `${parseFloat(bal).toFixed(4)} ETH`;
        });
        this.getNFTBalance().then(nft => {
            document.getElementById('wallet-info-nft').textContent = nft;
        });
    }

    disconnectWallet() {
        this.isConnected = false;
        this.accounts = [];
        this.updateUI();
        if (window.skunkSquadWebsite) {
            window.skunkSquadWebsite.showNotification('Wallet disconnected', 'info');
        }
    }

    showLoading(message = 'Loading...') {
        let loader = document.getElementById('wallet-loading-indicator');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'wallet-loading-indicator';
            loader.style.position = 'fixed';
            loader.style.top = '0';
            loader.style.left = '0';
            loader.style.width = '100vw';
            loader.style.height = '100vh';
            loader.style.background = 'rgba(0,0,0,0.4)';
            loader.style.zIndex = '9999';
            loader.style.display = 'flex';
            loader.style.alignItems = 'center';
            loader.style.justifyContent = 'center';
            loader.innerHTML = `<div style="background:#fff;padding:2em;border-radius:8px;box-shadow:0 2px 8px #0002;text-align:center"><span class="loader-spinner" style="display:inline-block;width:32px;height:32px;border:4px solid #22c55e;border-top:4px solid #fff;border-radius:50%;animation:spin 1s linear infinite;margin-bottom:1em"></span><div>${message}</div></div>`;
            document.body.appendChild(loader);
            // Add spinner animation
            const style = document.createElement('style');
            style.innerHTML = `@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`;
            document.head.appendChild(style);
        } else {
            loader.querySelector('div > div').textContent = message;
            loader.style.display = 'flex';
        }
        this.loading = true;
    }

    hideLoading() {
        const loader = document.getElementById('wallet-loading-indicator');
        if (loader) loader.style.display = 'none';
        this.loading = false;
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
        console.log('🎨 Updating UI, connected:', this.isConnected, 'accounts:', this.accounts);  // ✅ ADD THIS LINE
    
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
                        address: this.contractAddress, // Contract address of the token
                        symbol: 'SKUNK', // Token symbol
                        decimals: 0, // Token decimals
                        image: 'https://example.com/token-image.png' // Token image (optional)
                    }
                }
            });
            
            if (wasAdded) {
                console.log('✅ Token successfully added to wallet');
                if (window.skunkSquadWebsite) {
                    window.skunkSquadWebsite.showNotification('Token added to wallet', 'success');
                }
            } else {
                console.log('⚠️ Token addition to wallet rejected');
            }
        } catch (error) {
            console.error('❌ Error adding token to wallet:', error);
            if (window.skunkSquadWebsite) {
                window.skunkSquadWebsite.showNotification('Failed to add token to wallet', 'error');
            }
        }
    }

    showNetworkWarning() {
        const expectedNetworks = [1, 11155111]; // Mainnet and Sepolia
        const currentNetwork = this.networkId;
        
        let networkName = 'Unknown Network';
        if (currentNetwork === 1) {
            networkName = 'Ethereum Mainnet';
        } else if (currentNetwork === 11155111) {
            networkName = 'Sepolia Testnet';
        }
        
        const message = `⚠️ You are currently connected to ${networkName}. Please switch to the Ethereum Mainnet or Sepolia Testnet.`;
        
        if (window.skunkSquadWebsite) {
            window.skunkSquadWebsite.showNotification(message, 'warning');
        } else {
            alert(message);
        }
    }
}

// ✅ NO AUTOMATIC INITIALIZATION - Use lazy init
// Global lazy WalletManager initialization
if (typeof window.initWalletManager !== 'function') {
    window.initWalletManager = function() {
        if (!window.walletManager && typeof Web3 !== 'undefined') {
            window.walletManager = new WalletManager();
            console.log('✅ WalletManager initialized (lazy load)');
        }
        return window.walletManager;
    };
}

console.log('✅ Wallet.js loaded - Use window.initWalletManager() to initialize');
