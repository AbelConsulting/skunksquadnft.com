/**
 * SkunkSquad NFT - Centralized Configuration
 * Single source of truth for all contract and network settings
 */

const SkunkSquadConfig = {
    // Contract Configuration
    contract: {
        address: '0xAa5C50099bEb130c8988324A0F6Ebf65979f10EF',
        abi: null, // Will be loaded from wallet.js
        mintPrice: '0.01', // ETH
        maxSupply: 10000,
        maxPerTransaction: 10
    },

    // Network Configuration
    network: {
        chainId: '0x1', // Ethereum Mainnet
        chainIdDecimal: 1,
        name: 'Ethereum',
        rpcUrl: 'https://mainnet.infura.io/v3/a2c6c1df8f4e4003bdd98abdec26ad64', // ✅ Use Infura for reliability
        explorer: 'https://etherscan.io',
        isTestnet: false
    },

    // UI Configuration
    ui: {
        defaultQuantity: 1,
        priceUpdateInterval: 30000, // 30 seconds
        transactionTimeout: 300000, // 5 minutes
        buttonStates: {
            initial: {
                icon: '🌟',
                text: 'Connect Wallet & Mint',
                price: '(0.01 ETH)'
            },
            connecting: {
                icon: '⏳',
                text: 'Connecting...',
                price: ''
            },
            connected: {
                icon: '⛏️',
                text: 'Mint NFT Now',
                price: '(0.01 ETH)'
            },
            minting: {
                icon: '⏳',
                text: 'Minting...',
                price: ''
            },
            success: {
                icon: '🎉',
                text: 'Minted!',
                price: ''
            },
            error: {
                icon: '❌',
                text: 'Failed - Try Again',
                price: ''
            }
        }
    },

    // Error Messages
    errors: {
        noMetaMask: '🦊 MetaMask Required!\n\nPlease install MetaMask to mint NFTs.\n\nVisit: https://metamask.io/',
        wrongNetwork: '⚠️ Wrong Network!\n\nPlease switch to Ethereum Mainnet in MetaMask.',
        connectionFailed: '❌ Failed to connect wallet. Please try again.',
        mintFailed: '❌ Minting failed. Please try again.',
        insufficientFunds: '💰 Insufficient ETH!\n\nYou need at least 0.01 ETH + gas fees.',
        userRejected: '⛔ Transaction rejected by user.',
        invalidQuantity: '⚠️ Invalid quantity. Please enter 1-10 NFTs.'
    },

    // Success Messages
    messages: {
        connected: '✅ Wallet Connected!\n\nClick the button again to mint your NFT.',
        minting: '⏳ Minting in progress...\n\nPlease wait for the transaction to complete.',
        minted: (txHash) => `🎉 NFT Minted Successfully!\n\nView on Etherscan:\n${SkunkSquadConfig.utils.getTxLink(txHash)}`
    },

    // Utility Functions
    utils: {
        // Get button state HTML
        getButtonHTML(state) {
            const s = SkunkSquadConfig.ui.buttonStates[state];
            return `
                <span class="btn-icon">${s.icon}</span>
                <span class="btn-text">${s.text}</span>
                ${s.price ? `<span class="btn-price">${s.price}</span>` : ''}
            `;
        },

        // Format wallet address
        formatAddress(address) {
            if (!address) return '';
            return `${address.slice(0, 6)}...${address.slice(-4)}`;
        },

        // Calculate total cost
        calculateTotal(quantity) {
            const price = parseFloat(SkunkSquadConfig.contract.mintPrice);
            return parseFloat((price * quantity).toFixed(4)).toString();
        },

        // Get explorer link
        getTxLink(txHash) {
            return `${SkunkSquadConfig.network.explorer}/tx/${txHash}`;
        },

        getAddressLink(address) {
            return `${SkunkSquadConfig.network.explorer}/address/${address}`;
        }
    }
};

const CONFIG = {
    // Infura Project ID
    INFURA_PROJECT_ID: 'a2c6c1df8f4e4003bdd98abdec26ad64',
    
    // ✅ MAINNET Contract
    CONTRACT_ADDRESS: '0xAa5C50099bEb130c8988324A0F6Ebf65979f10EF',
    
    // ✅ MAINNET Network Settings
    CHAIN_ID: 1, // Ethereum Mainnet
    NETWORK_NAME: 'Ethereum Mainnet',
    
    // ✅ MAINNET RPC URLs
    get RPC_URL() {
        return this.INFURA_PROJECT_ID 
            ? `https://mainnet.infura.io/v3/${this.INFURA_PROJECT_ID}`
            : null;
    },
    
    get WSS_URL() {
        return this.INFURA_PROJECT_ID 
            ? `wss://mainnet.infura.io/ws/v3/${this.INFURA_PROJECT_ID}`
            : null;
    },
    
    // ✅ MAINNET Block Explorer
    EXPLORER_URL: 'https://etherscan.io',
    
    // Contract ABI
    CONTRACT_ABI: [
        {
            "inputs": [{"internalType": "uint256", "name": "quantity", "type": "uint256"}],
            "name": "mint",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "PRICE",
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
            "inputs": [],
            "name": "MAX_SUPPLY",
            "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
            "stateMutability": "view",
            "type": "function"
        }
    ],
    
    // Pricing
    PRICE_PER_NFT: 0.01, // ETH
    MAX_MINT_PER_TX: 10,
    MAX_SUPPLY: 10000,
    
    // UI Settings
    ENABLE_ANIMATIONS: true,
    ENABLE_SOUND: false,
};

// Make globally available
window.CONFIG = CONFIG;
window.SkunkSquadConfig = SkunkSquadConfig;

// Validation
if (CONFIG.CHAIN_ID === 1) {
    console.log('✅ Config loaded for MAINNET');
    console.log('📍 Contract:', CONFIG.CONTRACT_ADDRESS);
    console.log('🔗 Explorer:', CONFIG.EXPLORER_URL);
    console.log('🌐 RPC:', CONFIG.RPC_URL);
} else {
    console.warn('⚠️ Not on Mainnet! Chain ID:', CONFIG.CHAIN_ID);
}

console.log('🔑 Infura:', CONFIG.INFURA_PROJECT_ID ? '✅ Connected' : '⚠️ Missing key');
console.log('✅ SkunkSquad Config Loaded');
