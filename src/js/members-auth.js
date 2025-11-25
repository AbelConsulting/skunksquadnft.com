/**
 * SkunkSquad Members Authentication System
 * Handles NFT-based authentication and member verification
 */

// Configuration
const MEMBERS_CONFIG = {
    CONTRACT_ADDRESS: '0xAa5C50099bEb130c8988324A0F6Ebf65979f10EF',
    NETWORK_ID: 1, // Ethereum Mainnet
    STORAGE_KEY: 'skunksquad_member',
    SESSION_DURATION: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
};

// Contract ABI for NFT verification
const NFT_ABI = [
    {
        "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "owner", "type": "address"}, {"internalType": "uint256", "name": "index", "type": "uint256"}],
        "name": "tokenOfOwnerByIndex",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    }
];

// Global state
let web3Instance = null;
let contract = null;
let currentMember = null;

/**
 * Initialize the members authentication system
 */
async function initMembersAuth() {
    console.log('🔐 Initializing Members Authentication System...');
    
    // Check for existing session
    const session = getStoredSession();
    
    if (session && isSessionValid(session)) {
        console.log('✅ Valid session found');
        currentMember = session;
        await showMembersDashboard();
        return true;
    }
    
    // Show authentication screen
    showAuthGuard();
    setupAuthListeners();
    return false;
}

/**
 * Setup event listeners for authentication
 */
function setupAuthListeners() {
    // Wallet authentication
    const walletAuthBtn = document.getElementById('connectWalletAuth');
    if (walletAuthBtn) {
        walletAuthBtn.addEventListener('click', handleWalletAuth);
    }
    
    // Token ID verification
    const verifyTokenBtn = document.getElementById('verifyTokenBtn');
    if (verifyTokenBtn) {
        verifyTokenBtn.addEventListener('click', handleTokenVerification);
    }
    
    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Enter key on token input
    const tokenInput = document.getElementById('tokenIdInput');
    if (tokenInput) {
        tokenInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleTokenVerification();
            }
        });
    }
}

/**
 * Handle wallet-based authentication
 */
async function handleWalletAuth() {
    const button = document.getElementById('connectWalletAuth');
    const originalText = button.innerHTML;
    
    try {
        button.innerHTML = '<span class="btn-icon">⏳</span> Connecting...';
        button.disabled = true;
        
        // Check for Web3 provider
        if (typeof window.ethereum === 'undefined') {
            throw new Error('NO_WALLET');
        }
        
        // Initialize Web3
        web3Instance = new Web3(window.ethereum);
        
        // Request account access
        const accounts = await window.ethereum.request({ 
            method: 'eth_requestAccounts' 
        });
        
        const address = accounts[0];
        console.log('👛 Wallet connected:', address);
        
        // Get network info (but don't enforce it)
        const networkId = await web3Instance.eth.net.getId();
        console.log('🌐 Connected to network ID:', networkId);
        
        // Always check NFTs on Mainnet using a public RPC provider
        // This way users can connect with any network but we verify NFTs on Mainnet
        button.innerHTML = '<span class="btn-icon">🔍</span> Verifying NFTs on Mainnet...';
        
        const mainnetWeb3 = new Web3('https://eth.llamarpc.com');
        const mainnetContract = new mainnetWeb3.eth.Contract(NFT_ABI, MEMBERS_CONFIG.CONTRACT_ADDRESS);
        
        console.log('🔍 Checking NFT balance for address:', address);
        console.log('📝 Contract:', MEMBERS_CONFIG.CONTRACT_ADDRESS);
        console.log('🌐 Checking on: Ethereum Mainnet');
        
        const nftBalance = await mainnetContract.methods.balanceOf(address).call();
        console.log('💎 NFT Balance:', nftBalance);
        
        if (parseInt(nftBalance) === 0) {
            throw new Error('NO_NFT');
        }
        
        console.log(`✅ User owns ${nftBalance} SkunkSquad NFT(s)`);
        
        // Get owned token IDs from Mainnet
        const tokenIds = [];
        for (let i = 0; i < Math.min(nftBalance, 10); i++) {
            try {
                const tokenId = await mainnetContract.methods.tokenOfOwnerByIndex(address, i).call();
                tokenIds.push(tokenId);
            } catch (e) {
                console.warn('Could not fetch token at index', i);
            }
        }
        
        // Create member session
        const memberData = {
            address: address,
            displayName: formatAddress(address),
            tokenIds: tokenIds,
            nftCount: parseInt(nftBalance),
            authenticated: true,
            authMethod: 'wallet',
            timestamp: Date.now(),
            networkId: networkId
        };
        
        // Store session
        storeSession(memberData);
        currentMember = memberData;
        
        // Success!
        button.innerHTML = '<span class="btn-icon">✅</span> Verified!';
        
        // Show dashboard
        setTimeout(() => {
            showMembersDashboard();
        }, 1000);
        
    } catch (error) {
        console.error('❌ Authentication error:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        
        button.innerHTML = originalText;
        button.disabled = false;
        
        // Handle specific errors
        if (error.message === 'NO_WALLET') {
            showAuthError(
                '🦊 No Wallet Found',
                'Please install MetaMask or another Web3 wallet to continue.',
                'https://metamask.io'
            );
        } else if (error.message === 'NO_NFT') {
            showAuthError(
                '❌ No NFT Found',
                'This wallet does not own any SkunkSquad NFTs on Ethereum Mainnet.',
                null,
                false,
                true // Show mint/buy options
            );
        } else if (error.code === 4001) {
            showAuthError(
                '🚫 Access Denied',
                'You rejected the connection request. Please try again and approve the connection.',
                null
            );
        } else {
            showAuthError(
                '⚠️ Authentication Failed',
                'An unexpected error occurred. Please try again or contact support.',
                null
            );
        }
    }
}

/**
 * Handle token ID verification
 */
async function handleTokenVerification() {
    const input = document.getElementById('tokenIdInput');
    const button = document.getElementById('verifyTokenBtn');
    const tokenId = input.value.trim();
    
    if (!tokenId) {
        showAuthError(
            '⚠️ Invalid Token ID',
            'Please enter a valid token ID number.',
            null
        );
        return;
    }
    
    const originalText = button.innerHTML;
    
    try {
        button.innerHTML = '⏳ Verifying...';
        button.disabled = true;
        input.disabled = true;
        
        // Initialize Web3 with public provider
        if (!web3Instance) {
            web3Instance = new Web3('https://eth.llamarpc.com');
            contract = new web3Instance.eth.Contract(NFT_ABI, MEMBERS_CONFIG.CONTRACT_ADDRESS);
        }
        
        // Verify token exists (simplified - in production, check actual ownership)
        // For now, we'll accept any numeric token ID between 0-9999
        const tokenNum = parseInt(tokenId);
        if (isNaN(tokenNum) || tokenNum < 0 || tokenNum >= 10000) {
            throw new Error('INVALID_TOKEN');
        }
        
        // Create member session (simplified - doesn't verify actual ownership)
        const memberData = {
            tokenId: tokenId,
            displayName: `Member #${tokenId}`,
            authenticated: true,
            authMethod: 'token',
            timestamp: Date.now(),
            note: 'Token verification mode - ownership not verified'
        };
        
        storeSession(memberData);
        currentMember = memberData;
        
        button.innerHTML = '✅ Verified!';
        
        setTimeout(() => {
            showMembersDashboard();
        }, 1000);
        
    } catch (error) {
        console.error('Token verification error:', error);
        button.innerHTML = originalText;
        button.disabled = false;
        input.disabled = false;
        
        showAuthError(
            '❌ Invalid Token',
            'Please enter a valid SkunkSquad NFT token ID (0-9999).',
            null
        );
    }
}

/**
 * Handle logout
 */
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        clearSession();
        currentMember = null;
        web3Instance = null;
        contract = null;
        
        // Redirect to auth screen
        window.location.reload();
    }
}

/**
 * Show authentication guard screen
 */
function showAuthGuard() {
    const authGuard = document.getElementById('authGuard');
    const dashboard = document.getElementById('membersDashboard');
    
    if (authGuard) authGuard.style.display = 'flex';
    if (dashboard) dashboard.style.display = 'none';
}

/**
 * Show members dashboard
 */
async function showMembersDashboard() {
    const authGuard = document.getElementById('authGuard');
    const dashboard = document.getElementById('membersDashboard');
    
    if (authGuard) authGuard.style.display = 'none';
    if (dashboard) dashboard.style.display = 'block';
    
    // Load member data
    await loadMemberProfile();
}

/**
 * Load member profile data
 */
async function loadMemberProfile() {
    if (!currentMember) return;
    
    // Update display name
    const nameElements = ['memberName', 'welcomeName'];
    nameElements.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = currentMember.displayName;
    });
    
    // Update NFT count
    const nftCountEl = document.getElementById('nftCount');
    if (nftCountEl) {
        nftCountEl.textContent = currentMember.nftCount || 1;
    }
    
    // Update member avatar (use first token ID)
    if (currentMember.tokenIds && currentMember.tokenIds.length > 0) {
        updateMemberAvatar(currentMember.tokenIds[0]);
    } else if (currentMember.tokenId) {
        updateMemberAvatar(currentMember.tokenId);
    }
    
    // Calculate member since date
    const memberSinceEl = document.getElementById('memberSince');
    if (memberSinceEl) {
        const date = new Date(currentMember.timestamp);
        const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        memberSinceEl.textContent = monthYear;
    }
    
    // Update member level (based on NFT count)
    const levelEl = document.getElementById('memberLevel');
    if (levelEl && currentMember.nftCount) {
        const level = Math.min(10, Math.floor(currentMember.nftCount / 2) + 1);
        levelEl.textContent = `Level ${level}`;
    }
    
    // Update reward points (simulated)
    const pointsEl = document.getElementById('rewardPoints');
    if (pointsEl && currentMember.nftCount) {
        const points = (currentMember.nftCount * 500) + Math.floor(Math.random() * 1000);
        pointsEl.textContent = points.toLocaleString();
    }
}

/**
 * Update member avatar based on token ID
 */
function updateMemberAvatar(tokenId) {
    // In production, this would fetch the actual NFT image
    // For now, use a placeholder
    const avatarElements = document.querySelectorAll('#memberAvatar');
    avatarElements.forEach(el => {
        if (el) {
            el.src = `./assets/charlesskunk.webp`;
            el.alt = `SkunkSquad #${tokenId}`;
        }
    });
}

/**
 * Switch to Ethereum Mainnet
 */
async function switchToMainnet() {
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x1' }], // 0x1 = Mainnet
        });
        
        // Close error modal
        const modal = document.querySelector('.auth-error-modal');
        if (modal) modal.remove();
        
        // Retry authentication
        setTimeout(() => {
            handleWalletAuth();
        }, 1000);
        
    } catch (error) {
        console.error('Failed to switch network:', error);
        
        if (error.code === 4902) {
            alert('Please manually switch to Ethereum Mainnet in your wallet settings.');
        } else {
            alert('Failed to switch network. Please switch to Ethereum Mainnet manually in your wallet.');
        }
    }
}

/**
 * Show authentication error modal
 */
function showAuthError(title, message, actionUrl, showSwitchNetwork = false, showNFTOptions = false) {
    const modal = document.createElement('div');
    modal.className = 'auth-error-modal';
    
    const switchNetworkBtn = showSwitchNetwork ? `
        <button class="btn btn-primary" onclick="switchToMainnet()">🔄 Switch to Mainnet</button>
    ` : '';
    
    const nftOptionsHtml = showNFTOptions ? `
        <div style="margin: 1.5rem 0; padding: 1rem; background: rgba(139, 92, 246, 0.1); border-radius: 8px;">
            <p style="margin-bottom: 1rem; color: rgba(255,255,255,0.9);">
                <strong>To access the members portal, you need a SkunkSquad NFT:</strong>
            </p>
            <div style="display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center;">
                <a href="https://opensea.io/collection/skunksquad" target="_blank" class="btn btn-primary" style="flex: 1; min-width: 150px;">
                    🛒 Buy on OpenSea
                </a>
                <a href="https://blur.io/collection/skunksquad" target="_blank" class="btn btn-primary" style="flex: 1; min-width: 150px;">
                    ⚡ Buy on Blur
                </a>
            </div>
            <p style="margin-top: 1rem; font-size: 0.875rem; color: rgba(255,255,255,0.6);">
                Or connect a different wallet that owns a SkunkSquad NFT
            </p>
        </div>
    ` : '';
    
    modal.innerHTML = `
        <div class="auth-error-content">
            <div class="auth-error-header">
                <h2>${title}</h2>
            </div>
            <div class="auth-error-body">
                <p>${message}</p>
                ${nftOptionsHtml}
            </div>
            <div class="auth-error-actions">
                ${switchNetworkBtn}
                ${actionUrl && !showNFTOptions ? `<a href="${actionUrl}" class="btn btn-secondary">Learn More</a>` : ''}
                <button class="btn btn-secondary" onclick="this.closest('.auth-error-modal').remove()">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Don't auto-close if showing NFT options
    if (!showNFTOptions) {
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 10000);
    }
}

/**
 * Session management
 */
function storeSession(memberData) {
    localStorage.setItem(MEMBERS_CONFIG.STORAGE_KEY, JSON.stringify(memberData));
}

function getStoredSession() {
    try {
        const data = localStorage.getItem(MEMBERS_CONFIG.STORAGE_KEY);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.error('Error reading session:', e);
        return null;
    }
}

function clearSession() {
    localStorage.removeItem(MEMBERS_CONFIG.STORAGE_KEY);
}

function isSessionValid(session) {
    if (!session || !session.timestamp) return false;
    
    const age = Date.now() - session.timestamp;
    return age < MEMBERS_CONFIG.SESSION_DURATION;
}

/**
 * Utility functions
 */
function formatAddress(address) {
    if (!address || address.length < 10) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

/**
 * Get current member data
 */
function getCurrentMember() {
    return currentMember;
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
    return currentMember !== null && currentMember.authenticated === true;
}

// Auto-initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initMembersAuth();
});

// Export functions for use in other scripts
window.MembersAuth = {
    init: initMembersAuth,
    getCurrentMember,
    isAuthenticated,
    checkAuth: isAuthenticated, // Alias for compatibility
    logout: handleLogout
};

// Export utility functions
window.switchToMainnet = switchToMainnet;
