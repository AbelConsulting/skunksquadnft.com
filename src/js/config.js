/**
 * SkunkSquad NFT - Centralized Configuration
 * Single source of truth for all contract and network settings
 */

const SkunkSquadConfig = {
    // Contract Configuration
    contract: {
        address: '0xf14F75aEDBbDE252616410649f4dd7C1963191c4',
        abi: null, // Will be loaded from wallet.js
        mintPrice: '0.01', // ETH
        maxSupply: 10000,
        maxPerTransaction: 10
    },

    // Network Configuration
    network: {
        chainId: '0xaa36a7', // Sepolia testnet (11155111)
        chainIdDecimal: 11155111,
        name: 'Sepolia',
        rpcUrl: 'https://sepolia.infura.io/v3/',
        explorer: 'https://sepolia.etherscan.io',
        isTestnet: true
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
        wrongNetwork: '⚠️ Wrong Network!\n\nPlease switch to Sepolia testnet in MetaMask.',
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
        minted: (txHash) => `🎉 NFT Minted Successfully!\n\nView on Etherscan:\n${SkunkSquadConfig.network.explorer}/tx/${txHash}`
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
            return `${address.substring(0, 6)}...${address.substring(38)}`;
        },

        // Calculate total cost
        calculateTotal(quantity) {
            const price = parseFloat(SkunkSquadConfig.contract.mintPrice);
            return (price * quantity).toFixed(4);
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

// Make config globally available
window.SkunkSquadConfig = SkunkSquadConfig;

console.log('✅ SkunkSquad Config Loaded');
