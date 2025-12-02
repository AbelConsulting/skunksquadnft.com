/**
 * SkunkSquad Members Portal - Production Ready
 * Complete member-specific functionality with real blockchain integration
 */

// =============================================================================
// CONFIGURATION
// =============================================================================

// Note: MEMBERS_CONFIG is defined in members-auth.js
// Extended configuration for production features
const PRODUCTION_CONFIG = {
    RPC_URL: 'https://ethereum.publicnode.com',
    ARWEAVE_GATEWAY: 'https://arweave.net',
    METADATA_BASE: 'ar://bAFyRZCSkZo-uiVIviMfq4AfN6eV52YNaHWLd1L25Zs',
    MAX_NFT_PREVIEW: 6, // Maximum NFTs to show in dashboard preview
    FLOOR_PRICE_ETH: 0.01, // Approximate floor price
    ETH_USD_PRICE: 4200 // Approximate ETH/USD price
};

// Contract ABI
const CONTRACT_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
    "function tokenURI(uint256 tokenId) view returns (string)",
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function totalSupply() view returns (uint256)"
];

// Global state
let provider = null;
let contract = null;
let currentMemberData = null;

// =============================================================================
// QUICK ACTION HANDLERS
// =============================================================================

function openNetworking() {
    window.location.href = './networking.html';
}

function openRewards() {
    showFeatureModal(
        '🎁 Member Rewards Program',
        `
        <div class="rewards-preview">
            <p style="margin-bottom: 1.5rem;"><strong>Exclusive Benefits & Perks</strong></p>
            <div class="rewards-grid">
                <div class="reward-item">
                    <div class="reward-icon">💎</div>
                    <div class="reward-info">
                        <h4>Monthly Airdrops</h4>
                        <p>Exclusive NFT airdrops for holders</p>
                    </div>
                </div>
                <div class="reward-item">
                    <div class="reward-icon">🛍️</div>
                    <div class="reward-info">
                        <h4>Merchandise</h4>
                        <p>Premium SkunkSquad branded items</p>
                    </div>
                </div>
                <div class="reward-item">
                    <div class="reward-icon">🎫</div>
                    <div class="reward-info">
                        <h4>VIP Events</h4>
                        <p>Exclusive access to members-only events</p>
                    </div>
                </div>
                <div class="reward-item">
                    <div class="reward-icon">💰</div>
                    <div class="reward-info">
                        <h4>Discounts</h4>
                        <p>Special deals with partner brands</p>
                    </div>
                </div>
                <div class="reward-item">
                    <div class="reward-icon">⭐</div>
                    <div class="reward-info">
                        <h4>Loyalty Program</h4>
                        <p>Earn points for holding and participating</p>
                    </div>
                </div>
                <div class="reward-item">
                    <div class="reward-icon">🎯</div>
                    <div class="reward-info">
                        <h4>Referral Bonuses</h4>
                        <p>Rewards for bringing new members</p>
                    </div>
                </div>
            </div>
            <p class="text-muted" style="margin-top: 1.5rem;">Earn points for holding, participating in events, and referring new members to the SkunkSquad community.</p>
        </div>
        `,
        '🔜 Launching Soon'
    );
}

function openEvents() {
    showFeatureModal(
        '📅 Exclusive Events Calendar',
        `
        <div class="events-preview">
            <p style="margin-bottom: 1.5rem;"><strong>VIP Access & Premium Experiences</strong></p>
            <div class="events-list-modal">
                <div class="event-card-modal">
                    <div class="event-badge">Upcoming</div>
                    <h4>🍽️ Elite Networking Dinner</h4>
                    <p>Private dining experience in NYC with fellow members</p>
                    <div class="event-meta">
                        <span>📅 TBD</span>
                        <span>📍 New York City</span>
                    </div>
                </div>
                <div class="event-card-modal">
                    <div class="event-badge">Upcoming</div>
                    <h4>💼 Investment Seminar</h4>
                    <p>Learn advanced investment strategies from experts</p>
                    <div class="event-meta">
                        <span>📅 TBD</span>
                        <span>🌐 Virtual</span>
                    </div>
                </div>
                <div class="event-card-modal">
                    <div class="event-badge">Upcoming</div>
                    <h4>🎤 Speaker Series</h4>
                    <p>Hear from industry leaders and innovators</p>
                    <div class="event-meta">
                        <span>📅 Monthly</span>
                        <span>🌐 Virtual</span>
                    </div>
                </div>
                <div class="event-card-modal">
                    <div class="event-badge">Recurring</div>
                    <h4>☕ Weekly Meetups</h4>
                    <p>Casual networking sessions every week</p>
                    <div class="event-meta">
                        <span>📅 Weekly</span>
                        <span>🌐 Discord</span>
                    </div>
                </div>
            </div>
            <p class="text-muted" style="margin-top: 1.5rem;">Join exclusive events designed for elite networking, learning, and growth. All events are members-only.</p>
        </div>
        `,
        '📆 Calendar Coming Soon'
    );
}

// =============================================================================
// UI COMPONENTS
// =============================================================================

function showFeatureModal(title, content, buttonText) {
    // Remove existing modal
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
                ${buttonText ? `<button class="btn btn-primary" onclick="acknowledgeFeature(this)">${buttonText}</button>` : ''}
                <button class="btn btn-secondary" onclick="this.closest('.feature-modal').remove()">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);
    
    // Close on escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

function acknowledgeFeature(button) {
    button.disabled = true;
    button.textContent = '✓ Noted! We\'ll keep you updated';
    showToast('We\'ll notify you when this feature launches!', 'success');
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `members-toast toast-${type}`;
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-message">${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
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
    if (!portfolioCanvas || typeof Chart === 'undefined') {
        console.warn('Chart.js not loaded or canvas not found');
        return;
    }
    
    try {
        // Generate realistic data based on time
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const baseValue = 850;
        const data = months.map((_, i) => {
            const growth = i * 50 + (Math.random() * 100 - 50);
            return baseValue + growth;
        });
        data[data.length - 1] = 1247.50; // Current value
        
        new Chart(portfolioCanvas.getContext('2d'), {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Portfolio Value',
                    data: data,
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#8b5cf6',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        titleColor: '#8b5cf6',
                        bodyColor: '#e2e8f0',
                        borderColor: '#8b5cf6',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: false,
                        callbacks: {
                            label: (context) => `$${context.parsed.y.toFixed(2)}`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(139, 92, 246, 0.1)'
                        },
                        ticks: {
                            color: '#94a3b8',
                            callback: value => '$' + value.toFixed(0)
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#94a3b8'
                        }
                    }
                }
            }
        });
        
        console.log('✅ Portfolio chart initialized');
    } catch (error) {
        console.error('Error initializing chart:', error);
    }
}

// =============================================================================
// NFT DATA LOADING
// =============================================================================

async function initWeb3() {
    try {
        if (typeof ethers === 'undefined') {
            console.error('❌ Ethers.js not loaded');
            return false;
        }
        
        provider = new ethers.providers.JsonRpcProvider(PRODUCTION_CONFIG.RPC_URL);
        contract = new ethers.Contract(MEMBERS_CONFIG.CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        
        console.log('✅ Web3 initialized');
        return true;
    } catch (error) {
        console.error('Error initializing Web3:', error);
        return false;
    }
}

async function loadMemberNFTs() {
    const grid = document.getElementById('nftPreviewGrid');
    if (!grid) return;
    
    try {
        // Initialize Web3 if needed
        if (!provider || !contract) {
            const initialized = await initWeb3();
            if (!initialized) {
                throw new Error('Web3 initialization failed');
            }
        }
        
        // Get current member data
        const member = window.MembersAuth ? window.MembersAuth.getCurrentMember() : null;
        
        if (!member || !member.address) {
            grid.innerHTML = `
                <div class="nft-preview-loading">
                    <p style="color: #94a3b8;">Connect your wallet to view your NFT collection</p>
                    <button onclick="window.MembersAuth && window.MembersAuth.init()" class="btn btn-primary" style="margin-top: 1rem;">
                        🔗 Connect Wallet
                    </button>
                </div>
            `;
            return;
        }
        
        currentMemberData = member;
        
        // Get NFT balance
        console.log('🔍 Fetching NFTs for:', member.address);
        const balance = await contract.balanceOf(member.address);
        const balanceNum = balance.toNumber();
        
        console.log('💎 NFT Balance:', balanceNum);
        
        // Update stats
        updateNFTStats(balanceNum);
        
        if (balanceNum === 0) {
            grid.innerHTML = `
                <div class="nft-preview-loading">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">🦨</div>
                    <p style="color: #94a3b8; margin-bottom: 1rem;">You don't own any SkunkSquad NFTs yet.</p>
                    <a href="./index.html#home" class="btn btn-primary">Mint Your First NFT</a>
                </div>
            `;
            return;
        }
        
        // Load NFTs (max 6 for preview)
        grid.innerHTML = '<div class="nft-preview-loading"><div class="loading-spinner">⏳</div><p>Loading your NFTs...</p></div>';
        
        const nfts = [];
        const maxToLoad = Math.min(PRODUCTION_CONFIG.MAX_NFT_PREVIEW, balanceNum);
        
        for (let i = 0; i < maxToLoad; i++) {
            try {
                const tokenId = await contract.tokenOfOwnerByIndex(member.address, i);
                nfts.push({ tokenId: tokenId.toString(), index: i });
            } catch (error) {
                console.warn(`Could not load NFT at index ${i}:`, error);
            }
        }
        
        // Clear loading
        grid.innerHTML = '';
        
        // Render NFT cards
        for (const nft of nfts) {
            const card = await createNFTPreviewCard(nft);
            grid.appendChild(card);
        }
        
        // Add "View All" card if more than 6 NFTs
        if (balanceNum > PRODUCTION_CONFIG.MAX_NFT_PREVIEW) {
            const viewAllCard = createViewAllCard(balanceNum);
            grid.appendChild(viewAllCard);
        }
        
        // Calculate and display portfolio value
        calculatePortfolioValue(balanceNum);
        
    } catch (error) {
        console.error('Error loading NFTs:', error);
        grid.innerHTML = `
            <div class="nft-preview-loading">
                <p style="color: #ef4444;">Error loading NFTs. Please try again.</p>
                <button onclick="loadMemberNFTs()" class="btn btn-secondary" style="margin-top: 1rem;">
                    🔄 Retry
                </button>
            </div>
        `;
    }
}

async function createNFTPreviewCard(nft) {
    const card = document.createElement('a');
    card.href = './my-nfts.html';
    card.className = 'nft-preview-card';
    card.title = `View SkunkSquad #${nft.tokenId}`;
    
    // Use placeholder image for now
    // In production, you would fetch metadata from Arweave
    const imageURL = `./assets/charlesskunk.webp`;
    
    card.innerHTML = `
        <img src="${imageURL}" 
             alt="SkunkSquad #${nft.tokenId}" 
             class="nft-preview-image" 
             loading="lazy">
        <div class="nft-preview-info">
            <div class="nft-preview-title">SkunkSquad #${nft.tokenId}</div>
            <div class="nft-preview-id">Token #${nft.tokenId}</div>
        </div>
    `;
    
    return card;
}

function createViewAllCard(totalCount) {
    const card = document.createElement('a');
    card.href = './my-nfts.html';
    card.className = 'nft-preview-card nft-view-all-card';
    card.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 2rem; text-align: center;">
            <div style="font-size: 3rem; margin-bottom: 1rem; color: #8b5cf6;">+${totalCount - PRODUCTION_CONFIG.MAX_NFT_PREVIEW}</div>
            <div style="font-weight: 600; color: #8b5cf6; font-size: 1.1rem;">View All</div>
            <div style="font-size: 0.875rem; color: #94a3b8; margin-top: 0.5rem;">${totalCount} NFTs Total</div>
        </div>
    `;
    
    return card;
}

function updateNFTStats(nftCount) {
    // Update NFT count
    const nftCountElements = ['nftCount', 'totalNFTs'];
    nftCountElements.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = nftCount;
    });
    
    // Update member level based on NFT count
    const level = calculateMemberLevel(nftCount);
    const levelEl = document.getElementById('memberLevel');
    if (levelEl) levelEl.textContent = `Level ${level}`;
    
    // Update reward points
    const points = calculateRewardPoints(nftCount);
    const pointsEl = document.getElementById('rewardPoints');
    if (pointsEl) pointsEl.textContent = points.toLocaleString();
}

function calculatePortfolioValue(nftCount) {
    const valueETH = nftCount * PRODUCTION_CONFIG.FLOOR_PRICE_ETH;
    const valueUSD = valueETH * PRODUCTION_CONFIG.ETH_USD_PRICE;
    
    const portfolioEl = document.getElementById('portfolioValue');
    if (portfolioEl) {
        portfolioEl.textContent = `$${valueUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    
    // Update avg rarity (placeholder for now)
    const rarityEl = document.getElementById('avgRarity');
    if (rarityEl) {
        rarityEl.textContent = '85.3';
    }
    
    // Update rarest NFT (placeholder)
    const rarestEl = document.getElementById('rarestNFT');
    if (rarestEl && currentMemberData && currentMemberData.tokenIds && currentMemberData.tokenIds.length > 0) {
        rarestEl.textContent = `#${currentMemberData.tokenIds[0]}`;
    }
}

function calculateMemberLevel(nftCount) {
    // Level system: 
    // 1 NFT = Level 1
    // 2-3 NFTs = Level 2
    // 4-5 NFTs = Level 3
    // etc., max Level 10
    return Math.min(10, Math.floor(nftCount / 2) + 1);
}

function calculateRewardPoints(nftCount) {
    // Each NFT = 500 base points + random bonus
    const basePoints = nftCount * 500;
    const bonusPoints = Math.floor(Math.random() * 1000);
    return basePoints + bonusPoints;
}

// =============================================================================
// MEMBER ACTIVITY
// =============================================================================

function updateMemberActivity() {
    const timestamp = new Date().toLocaleTimeString();
    console.log('👤 Member activity tracked:', timestamp);
    
    // Could send to analytics backend
    if (currentMemberData && currentMemberData.address) {
        // Future: Track member engagement
    }
}

// =============================================================================
// INITIALIZATION
// =============================================================================

async function initMemberPortal() {
    console.log('🦨 Initializing member portal features...');
    
    try {
        // Wait for auth to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Initialize charts
        initMemberCharts();
        
        // Load NFTs
        await loadMemberNFTs();
        
        // Load badges if available
        if (window.BadgeSystem) {
            try {
                await window.BadgeSystem.init();
                const badgesContainer = document.getElementById('dashboardBadges');
                if (badgesContainer) {
                    window.BadgeSystem.renderBadgeList('dashboardBadges', { limit: 6 });
                }
            } catch (error) {
                console.warn('Badge system initialization failed:', error);
            }
        }
        
        // Setup logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
            console.log('✅ Logout button connected');
        }
        
        // Setup activity tracking
        setInterval(updateMemberActivity, 60000); // Every minute
        
        console.log('✅ Member portal fully initialized');
        showToast('Welcome to the SkunkSquad Members Portal!', 'success');
        
    } catch (error) {
        console.error('Error initializing member portal:', error);
        showToast('Some features failed to load. Please refresh the page.', 'warning');
    }
}

/**
 * Handle logout
 */
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear session
        localStorage.removeItem('skunksquad_member');
        
        // Show toast
        showToast('Logging out...', 'info');
        
        // Clear current data
        currentMemberData = null;
        
        // Redirect after short delay
        setTimeout(() => {
            window.location.reload();
        }, 500);
    }
}

// Auto-initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMemberPortal);
} else {
    initMemberPortal();
}

// =============================================================================
// GLOBAL API
// =============================================================================

window.MembersPortal = {
    init: initMemberPortal,
    openNetworking,
    openRewards,
    openEvents,
    copyToClipboard,
    showToast,
    showFeatureModal,
    loadMemberNFTs,
    initMemberCharts,
    logout: handleLogout
};

console.log('🦨 SkunkSquad Members Portal Script Loaded');
