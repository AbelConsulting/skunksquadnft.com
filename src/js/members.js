/**
 * SkunkSquad Members Portal
 * Member-specific functionality and interactions
 */

// =============================================================================
// QUICK ACTION HANDLERS
// =============================================================================

function openNetworking() {
    window.location.href = '/networking.html';
}

function openRewards() {
    showFeatureModal(
        '🎁 Member Rewards Program',
        `<p><strong>Exclusive Benefits & Perks</strong></p>
        <ul style="text-align: left; margin: 1rem 0;">
            <li>💎 Monthly NFT airdrops</li>
            <li>🛍️ Exclusive merchandise</li>
            <li>🎫 VIP event tickets</li>
            <li>💰 Partnership discounts</li>
            <li>⭐ Loyalty rewards</li>
        </ul>
        <p class="text-muted">Earn points for holding, participating, and referring new members.</p>`,
        '🔜 Launching Soon'
    );
}

function openEvents() {
    showFeatureModal(
        '📅 Exclusive Events Calendar',
        `<p><strong>VIP Access & Premium Experiences</strong></p>
        <ul style="text-align: left; margin: 1rem 0;">
            <li>🍽️ Private networking dinners</li>
            <li>💼 Investment seminars</li>
            <li>🎤 Speaker series</li>
            <li>🌐 Virtual meetups</li>
            <li>✈️ Global conferences</li>
        </ul>
        <p class="text-muted">Join exclusive events designed for elite networking and growth.</p>`,
        '📆 Calendar Coming Soon'
    );
}

// =============================================================================
// UI COMPONENTS
// =============================================================================

function showFeatureModal(title, content, buttonText) {
    const existing = document.querySelector('.feature-modal');
    if (existing) existing.remove();
    
    const modal = document.createElement('div');
    modal.className = 'feature-modal';
    modal.innerHTML = `
        <div class="feature-modal-overlay" onclick="this.parentElement.remove()"></div>
        <div class="feature-modal-content">
            <button class="feature-modal-close" onclick="this.closest('.feature-modal').remove()">&times;</button>
            <div class="feature-modal-header">
                <h2>${title}</h2>
            </div>
            <div class="feature-modal-body">
                ${content}
            </div>
            <div class="feature-modal-footer">
                <button class="btn btn-secondary" onclick="this.closest('.feature-modal').remove()">Close</button>
                ${buttonText ? `<button class="btn btn-primary" onclick="this.disabled=true; this.textContent='✓ Noted'">${buttonText}</button>` : ''}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function copyToClipboard(text, successMessage = 'Copied!') {
    navigator.clipboard.writeText(text)
        .then(() => showToast(successMessage, 'success'))
        .catch(err => {
            console.error('Failed to copy:', err);
            showToast('Copy failed', 'error');
        });
}

// =============================================================================
// CHARTS & ANALYTICS
// =============================================================================

function initMemberCharts() {
    const portfolioCanvas = document.getElementById('portfolioChart');
    if (!portfolioCanvas || typeof Chart === 'undefined') return;
    
    new Chart(portfolioCanvas.getContext('2d'), {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Portfolio Value',
                data: [850, 920, 1050, 980, 1150, 1247.50],
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                borderWidth: 3,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: value => '$' + value
                    }
                }
            }
        }
    });
}

// =============================================================================
// MEMBER DATA
// =============================================================================

async function loadMemberNFTs() {
    const grid = document.getElementById('nftPreviewGrid');
    if (!grid) return;
    
    try {
        const CONTRACT_ADDRESS = '0xAa5C50099bEb130c8988324A0F6Ebf65979f10EF';
        const RPC_URL = 'https://ethereum.publicnode.com';
        
        // Check if Web3 is available
        if (typeof ethers === 'undefined') {
            console.error('Ethers.js not loaded');
            grid.innerHTML = '<div class="nft-preview-loading"><p>Loading library...</p></div>';
            return;
        }
        
        const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, [
            "function tokenURI(uint256 tokenId) view returns (string)",
            "function ownerOf(uint256 tokenId) view returns (address)",
            "function balanceOf(address owner) view returns (uint256)",
            "function totalSupply() view returns (uint256)"
        ], provider);
        
        // Get user's wallet address
        let userAddress = null;
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                userAddress = accounts[0] || null;
            } catch (e) {
                console.error('Error getting accounts:', e);
            }
        }
        
        if (!userAddress) {
            grid.innerHTML = `
                <div class="nft-preview-loading">
                    <p>Connect your wallet to view your NFT collection</p>
                    <button onclick="window.ethereum.request({ method: 'eth_requestAccounts' }).then(() => location.reload())" class="btn btn-primary" style="margin-top: 1rem;">
                        Connect Wallet
                    </button>
                </div>
            `;
            return;
        }
        
        // Get user's NFT count
        const balance = await contract.balanceOf(userAddress);
        const totalSupply = await contract.totalSupply();
        
        document.getElementById('totalNFTs').textContent = balance.toString();
        if (document.getElementById('nftCount')) {
            document.getElementById('nftCount').textContent = balance.toString();
        }
        
        if (balance.toNumber() === 0) {
            grid.innerHTML = `
                <div class="nft-preview-loading">
                    <p>You don't own any SkunkSquad NFTs yet.</p>
                    <a href="./index.html#home" class="btn btn-primary" style="margin-top: 1rem;">Mint Your First NFT</a>
                </div>
            `;
            return;
        }
        
        // Find user's NFTs (show max 6 in preview)
        const userNFTs = [];
        const maxToShow = Math.min(6, balance.toNumber());
        
        for (let tokenId = 1; tokenId <= totalSupply.toNumber() && userNFTs.length < maxToShow; tokenId++) {
            try {
                const owner = await contract.ownerOf(tokenId);
                if (owner.toLowerCase() === userAddress.toLowerCase()) {
                    const tokenURI = await contract.tokenURI(tokenId);
                    userNFTs.push({ tokenId, tokenURI });
                }
            } catch (e) {
                // Token doesn't exist or error, skip
            }
        }
        
        // Display NFT previews
        grid.innerHTML = '';
        
        for (const nft of userNFTs) {
            const card = await createNFTPreviewCard(nft);
            grid.appendChild(card);
        }
        
        // Show "View All" if they have more than 6
        if (balance.toNumber() > 6) {
            const viewAllCard = document.createElement('a');
            viewAllCard.href = './my-nfts.html';
            viewAllCard.className = 'nft-preview-card';
            viewAllCard.style.display = 'flex';
            viewAllCard.style.alignItems = 'center';
            viewAllCard.style.justifyContent = 'center';
            viewAllCard.style.background = 'rgba(139, 92, 246, 0.1)';
            viewAllCard.style.border = '2px dashed rgba(139, 92, 246, 0.5)';
            viewAllCard.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">➕</div>
                    <div style="font-weight: 600; color: #8b5cf6;">View All ${balance.toString()} NFTs</div>
                </div>
            `;
            grid.appendChild(viewAllCard);
        }
        
        // Calculate portfolio stats
        const floorPrice = 0.01; // ETH
        const portfolioValueETH = balance.toNumber() * floorPrice;
        const ethPrice = 4200; // Approximate USD
        const portfolioValueUSD = portfolioValueETH * ethPrice;
        
        if (document.getElementById('portfolioValue')) {
            document.getElementById('portfolioValue').textContent = `$${portfolioValueUSD.toLocaleString()}`;
        }
        if (document.getElementById('avgRarity')) {
            document.getElementById('avgRarity').textContent = '--';
        }
        if (document.getElementById('rarestNFT')) {
            document.getElementById('rarestNFT').textContent = userNFTs.length > 0 ? `#${userNFTs[0].tokenId}` : '--';
        }
        
    } catch (error) {
        console.error('Error loading NFTs:', error);
        grid.innerHTML = '<div class="nft-preview-loading"><p style="color: #ef4444;">Error loading NFTs. Please try again.</p></div>';
    }
}

async function createNFTPreviewCard(nft) {
    const card = document.createElement('a');
    card.href = './my-nfts.html';
    card.className = 'nft-preview-card';
    
    // Fetch metadata
    let metadata = { name: `SkunkSquad #${nft.tokenId}`, image: '' };
    try {
        const metadataURL = nft.tokenURI.replace('ar://', 'https://arweave.net/');
        const response = await fetch(metadataURL);
        if (response.ok) {
            const data = await response.json();
            
            if (data.manifest === 'arweave/paths' && data.paths) {
                const tokenKey = nft.tokenId.toString();
                if (data.paths[tokenKey] && data.paths[tokenKey].id) {
                    const actualURL = `https://arweave.net/${data.paths[tokenKey].id}`;
                    const metaResponse = await fetch(actualURL);
                    if (metaResponse.ok) {
                        metadata = await metaResponse.json();
                    }
                }
            } else if (data.name || data.image) {
                metadata = data;
            }
        }
    } catch (e) {
        console.error('Error fetching metadata:', e);
    }
    
    const imageURL = metadata.image ? metadata.image.replace('ar://', 'https://arweave.net/') : './assets/charlesskunk.webp';
    
    card.innerHTML = `
        <img src="${imageURL}" alt="${metadata.name}" class="nft-preview-image" onerror="this.src='./assets/charlesskunk.webp'" loading="lazy">
        <div class="nft-preview-info">
            <div class="nft-preview-title">${metadata.name}</div>
            <div class="nft-preview-id">#${nft.tokenId}</div>
        </div>
    `;
    
    return card;
}

function updateMemberActivity() {
    const lastActive = new Date().toLocaleTimeString();
    console.log('Member activity updated:', lastActive);
}

// =============================================================================
// INITIALIZATION
// =============================================================================

function initMemberPortal() {
    console.log('🦨 Initializing member portal features...');
    
    initMemberCharts();
    loadMemberNFTs();
    
    // Load badges
    if (window.BadgeSystem) {
        window.BadgeSystem.init().then(() => {
            const badgesContainer = document.getElementById('dashboardBadges');
            if (badgesContainer) {
                window.BadgeSystem.renderBadgeList('dashboardBadges', { limit: 6 });
            }
        });
    }
    
    // Activity tracking
    setInterval(updateMemberActivity, 60000);
    
    console.log('✅ Member portal features initialized');
}

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMemberPortal);
} else {
    initMemberPortal();
}

// =============================================================================
// GLOBAL API
// =============================================================================

window.MembersPortal = {
    openNetworking,
    openRewards,
    openEvents,
    copyToClipboard,
    showToast,
    showFeatureModal
};
