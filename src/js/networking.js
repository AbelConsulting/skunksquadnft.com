// =============================================================================
// API INTEGRATION
// =============================================================================

const NetworkingPortal = {
    api: null,
    currentUser: null,
    useBackend: false,

    async init() {
        console.log('🚀 Initializing Networking Portal...');
        
        // Try to initialize API
        if (typeof NetworkingAPI !== 'undefined') {
            this.api = new NetworkingAPI();
            this.useBackend = true;
            console.log('✅ Backend API connected');
        } else {
            console.log('⚠️ Using sample data (backend not connected)');
        }
        
        // Get current user
        const member = window.MembersAuth?.getCurrentMember();
        if (member) {
            this.currentUser = {
                walletAddress: member.walletAddress,
                displayName: member.displayName
            };
        }
        
        // Load members
        await this.loadMembers();
        
        // Load connections
        await this.loadConnections();
        
        console.log('✅ Networking Portal initialized');
    },

    async loadMembers() {
        if (this.useBackend && this.api) {
            try {
                const members = await this.api.getMembers();
                if (members && members.length > 0) {
                    // Use backend members
                    console.log(`Loaded ${members.length} members from backend`);
                    filteredMembers = members.map(this.formatMember);
                    renderMemberGrid();
                    return;
                }
            } catch (error) {
                console.error('Error loading members from backend:', error);
            }
        }
        
        // Fallback to sample data
        filteredMembers = SAMPLE_MEMBERS;
        renderMemberGrid();
    },

    async loadConnections() {
        if (!this.useBackend || !this.api) {
            this.loadSampleConnections();
            return;
        }
        
        try {
            const connections = await this.api.getConnections();
            this.renderConnections(connections);
        } catch (error) {
            console.error('Error loading connections:', error);
            this.loadSampleConnections();
        }
    },

    async sendConnectionRequest(memberId) {
        if (!this.useBackend || !this.api) {
            showToast('Connection request sent! (Demo mode)', 'success');
            return true;
        }
        
        try {
            await this.api.sendConnectionRequest(memberId);
            showToast('Connection request sent! ✅', 'success');
            return true;
        } catch (error) {
            console.error('Error sending connection request:', error);
            showToast('Failed to send request. Please try again.', 'error');
            return false;
        }
    },

    async acceptConnectionRequest(requestId) {
        if (!this.useBackend || !this.api) {
            showToast('Connection accepted! (Demo mode)', 'success');
            return true;
        }
        
        try {
            await this.api.acceptConnection(requestId);
            showToast('Connection accepted! 🤝', 'success');
            await this.loadConnections();
            return true;
        } catch (error) {
            console.error('Error accepting connection:', error);
            showToast('Failed to accept connection. Please try again.', 'error');
            return false;
        }
    },

    async rejectConnectionRequest(requestId) {
        if (!this.useBackend || !this.api) {
            showToast('Connection rejected (Demo mode)', 'info');
            return true;
        }
        
        try {
            await this.api.rejectConnection(requestId);
            showToast('Connection request declined', 'info');
            await this.loadConnections();
            return true;
        } catch (error) {
            console.error('Error rejecting connection:', error);
            return false;
        }
    },

    formatMember(backendMember) {
        // Convert backend member format to frontend format
        return {
            id: backendMember.id,
            name: backendMember.display_name || backendMember.wallet_address?.substring(0, 8),
            title: backendMember.title || 'Member',
            location: backendMember.location || 'Unknown',
            region: backendMember.region || 'other',
            industry: backendMember.industry || 'other',
            avatar: backendMember.avatar_url || `https://i.pravatar.cc/150?u=${backendMember.wallet_address}`,
            bio: backendMember.bio || 'SkunkSquad member',
            interests: backendMember.interests || [],
            connections: backendMember.connection_count || 0,
            nfts: backendMember.nft_count || 1,
            joinDate: new Date(backendMember.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            verified: true,
            whale: backendMember.nft_count >= 5,
            online: backendMember.is_online || false,
            walletAddress: backendMember.wallet_address
        };
    },

    renderConnections(connections) {
        const connectionsList = document.getElementById('connectionsList');
        const pendingList = document.getElementById('pendingList');
        
        if (!connectionsList || !pendingList) return;
        
        // Filter connections
        const accepted = connections.filter(c => c.status === 'accepted');
        const pending = connections.filter(c => c.status === 'pending');
        
        if (accepted.length === 0) {
            connectionsList.innerHTML = '<p class="empty-state">No connections yet. Start networking!</p>';
        } else {
            connectionsList.innerHTML = accepted.map(conn => `
                <div class="connection-card">
                    <img src="${conn.avatar_url || 'https://i.pravatar.cc/150'}" alt="${conn.display_name}">
                    <div class="connection-info">
                        <h4>${conn.display_name}</h4>
                        <p>${conn.title || 'Member'}</p>
                    </div>
                    <button class="btn btn-sm btn-outline" onclick="handleMessage('${conn.id}')">💬</button>
                </div>
            `).join('');
        }
        
        if (pending.length === 0) {
            pendingList.innerHTML = '<p class="empty-state">No pending requests</p>';
        } else {
            pendingList.innerHTML = pending.map(req => `
                <div class="connection-card pending">
                    <img src="${req.avatar_url || 'https://i.pravatar.cc/150'}" alt="${req.display_name}">
                    <div class="connection-info">
                        <h4>${req.display_name}</h4>
                        <p>${req.title || 'Member'}</p>
                    </div>
                    <div class="pending-actions">
                        <button class="btn btn-sm btn-primary" onclick="acceptConnection('${req.id}')">✓</button>
                        <button class="btn btn-sm btn-outline" onclick="declineConnection('${req.id}')">✕</button>
                    </div>
                </div>
            `).join('');
        }
    },

    loadSampleConnections() {
        // Sample connections for demo
        const connectionsList = document.getElementById('connectionsList');
        if (connectionsList) {
            connectionsList.innerHTML = `
                <p class="empty-state">Connect with members to build your network!</p>
            `;
        }
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    NetworkingPortal.init();
});

// =============================================================================
// SAMPLE DATA
// =============================================================================

const SAMPLE_MEMBERS = [
    {
        id: 1,
        name: "Alex Rivera",
        title: "Blockchain Developer",
        location: "San Francisco, CA",
        region: "north-america",
        industry: "tech",
        avatar: "https://i.pravatar.cc/150?img=1",
        bio: "Building the future of Web3. Passionate about DeFi and NFT infrastructure.",
        interests: ["DeFi", "Smart Contracts", "Gaming", "DAOs"],
        connections: 142,
        nfts: 8,
        joinDate: "Jan 2024",
        verified: true,
        whale: true,
        online: true,
        twitter: "https://twitter.com/alexrivera",
        discord: "alexrivera#1234"
    },
    {
        id: 2,
        name: "Sarah Chen",
        title: "NFT Artist",
        location: "New York, NY",
        region: "north-america",
        industry: "creative",
        avatar: "https://i.pravatar.cc/150?img=5",
        bio: "Digital artist exploring the intersection of traditional and crypto art.",
        interests: ["Digital Art", "PFP Collections", "Generative Art"],
        connections: 89,
        nfts: 3,
        joinDate: "Feb 2024",
        verified: true,
        whale: false,
        online: true,
        twitter: "https://twitter.com/sarahchen",
        instagram: "https://instagram.com/sarahchen"
    },
    {
        id: 3,
        name: "Marcus Johnson",
        title: "Community Manager",
        location: "Los Angeles, CA",
        region: "north-america",
        industry: "crypto",
        avatar: "https://i.pravatar.cc/150?img=12",
        bio: "Helping Web3 communities grow and thrive. SkunkSquad forever!",
        interests: ["Community Building", "NFTs", "Metaverse", "Gaming"],
        connections: 256,
        nfts: 15,
        joinDate: "Jan 2024",
        verified: true,
        whale: true,
        founder: true,
        online: false,
        twitter: "https://twitter.com/marcusj",
        discord: "marcusj#5678"
    },
    {
        id: 4,
        name: "Emily Watson",
        title: "Crypto Investor",
        location: "London, UK",
        region: "europe",
        industry: "finance",
        avatar: "https://i.pravatar.cc/150?img=9",
        bio: "Early adopter. Investing in the future of digital ownership.",
        interests: ["DeFi", "Blue Chip NFTs", "Trading"],
        connections: 78,
        nfts: 22,
        joinDate: "Feb 2024",
        verified: true,
        whale: true,
        online: true,
        twitter: "https://twitter.com/emilyw"
    },
    {
        id: 5,
        name: "David Kim",
        title: "Game Developer",
        location: "Seoul, South Korea",
        region: "asia",
        industry: "tech",
        avatar: "https://i.pravatar.cc/150?img=14",
        bio: "Building play-to-earn games with real utility for NFT holders.",
        interests: ["GameFi", "Metaverse", "Unity", "Unreal Engine"],
        connections: 134,
        nfts: 6,
        joinDate: "Mar 2024",
        verified: true,
        whale: true,
        online: true,
        twitter: "https://twitter.com/davidkim",
        discord: "davidkim#9012"
    },
    {
        id: 6,
        name: "Jessica Martinez",
        title: "Marketing Strategist",
        location: "Miami, FL",
        region: "north-america",
        industry: "entrepreneur",
        avatar: "https://i.pravatar.cc/150?img=20",
        bio: "Helping Web3 projects reach their audience. NFT enthusiast.",
        interests: ["Marketing", "Branding", "Social Media", "NFTs"],
        connections: 201,
        nfts: 4,
        joinDate: "Jan 2024",
        verified: true,
        whale: false,
        online: false,
        twitter: "https://twitter.com/jessicam",
        linkedin: "https://linkedin.com/in/jessicamartinez"
    },
    {
        id: 7,
        name: "Ryan Thompson",
        title: "Full Stack Developer",
        location: "Austin, TX",
        region: "north-america",
        industry: "tech",
        avatar: "https://i.pravatar.cc/150?img=33",
        bio: "Building dApps and NFT marketplaces. Open source contributor.",
        interests: ["Web3", "React", "Node.js", "Smart Contracts"],
        connections: 167,
        nfts: 9,
        joinDate: "Feb 2024",
        verified: true,
        whale: true,
        online: true,
        twitter: "https://twitter.com/rthompson",
        github: "https://github.com/rthompson"
    },
    {
        id: 8,
        name: "Nicole Brown",
        title: "DAO Contributor",
        location: "Berlin, Germany",
        region: "europe",
        industry: "crypto",
        avatar: "https://i.pravatar.cc/150?img=25",
        bio: "Active in multiple DAOs. Governance and community advocate.",
        interests: ["DAOs", "Governance", "DeFi", "Community"],
        connections: 188,
        nfts: 11,
        joinDate: "Jan 2024",
        verified: true,
        whale: true,
        founder: true,
        online: true,
        twitter: "https://twitter.com/nicoleb",
        discord: "nicoleb#3456"
    }
];

// =============================================================================
// STATE MANAGEMENT
// =============================================================================

let allMembers = [...SAMPLE_MEMBERS];
let filteredMembers = [...SAMPLE_MEMBERS];
let currentFilter = 'all';
let searchTerm = '';
let myConnections = [2, 5];
let pendingRequests = [4];

// =============================================================================
// INITIALIZATION
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
    if (typeof MembersAuth === 'undefined' || !MembersAuth.isAuthenticated()) {
        window.location.href = './members.html';
        return;
    }

    initNetworking();
});

function initNetworking() {
    updateNetworkStats();
    renderMemberGrid();
    setupEventListeners();
    renderMyConnections();
    renderPendingRequests();
    renderSuggestions();
}

// =============================================================================
// STATS & UPDATES
// =============================================================================

function updateNetworkStats() {
    const totalMembers = document.getElementById('totalMembers');
    const totalCountries = document.getElementById('totalCountries');
    const totalIndustries = document.getElementById('totalIndustries');
    const onlineNow = document.getElementById('onlineNow');
    
    if (totalMembers) totalMembers.textContent = allMembers.length;
    if (onlineNow) onlineNow.textContent = allMembers.filter(m => m.online).length;
    
    const uniqueRegions = new Set(allMembers.map(m => m.region)).size;
    const uniqueIndustries = new Set(allMembers.map(m => m.industry)).size;
    
    if (totalCountries) totalCountries.textContent = uniqueRegions * 5; // Approximate
    if (totalIndustries) totalIndustries.textContent = uniqueIndustries;
}

// =============================================================================
// MEMBER GRID
// =============================================================================

function renderMemberGrid() {
    const grid = document.getElementById('memberGrid');
    const visibleCount = document.getElementById('visibleCount');
    
    if (!grid) return;
    
    if (filteredMembers.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <h3>😢 No members found</h3>
                <p>Try adjusting your filters or search terms</p>
            </div>
        `;
        if (visibleCount) visibleCount.textContent = '0';
        return;
    }

    grid.innerHTML = filteredMembers.map(member => `
        <div class="member-card" onclick="showProfile(${member.id})">
            <div class="member-status">
                <span class="status-dot ${member.online ? '' : 'offline'}"></span>
            </div>
            <div class="member-card-header">
                <img src="${member.avatar}" alt="${member.name}" class="member-avatar">
                <div class="member-basic-info">
                    <div class="member-name">
                        ${member.name}
                        <span class="member-badges-inline" data-member-id="${member.id}"></span>
                    </div>
                    <div class="member-title">${member.title}</div>
                </div>
            </div>
            <div class="member-location">📍 ${member.location}</div>
            <div class="member-tags">
                ${member.interests.slice(0, 3).map(interest => 
                    `<span class="member-tag">${interest}</span>`
                ).join('')}
            </div>
            ${member.verified || member.whale || member.founder ? `
                <div class="member-badges">
                    ${member.verified ? '<span class="badge badge-verified">✓ Verified</span>' : ''}
                    ${member.whale ? '<span class="badge badge-whale">🐋 Whale</span>' : ''}
                    ${member.founder ? '<span class="badge badge-founder">⭐ Founder</span>' : ''}
                </div>
            ` : ''}
            <div class="member-stats">
                <div class="member-stat">
                    <span class="member-stat-value">${member.connections}</span>
                    <span class="member-stat-label">Connections</span>
                </div>
                <div class="member-stat">
                    <span class="member-stat-value">${member.nfts}</span>
                    <span class="member-stat-label">NFTs</span>
                </div>
                <div class="member-stat">
                    <span class="member-stat-value">${member.joinDate}</span>
                    <span class="member-stat-label">Joined</span>
                </div>
            </div>
        </div>
    `).join('');

    if (visibleCount) visibleCount.textContent = filteredMembers.length;
    
    // Load badges for all members
    if (window.BadgeSystem) {
        filteredMembers.forEach(member => {
            const container = document.querySelector(`[data-member-id="${member.id}"]`);
            if (container) {
                BadgeSystem.renderInlineBadges(member.id, container, { limit: 3 });
            }
        });
    }
}

// =============================================================================
// PROFILE MODAL
// =============================================================================

function showProfile(memberId) {
    const member = allMembers.find(m => m.id === memberId);
    if (!member) return;

    const isConnected = myConnections.includes(memberId);
    const isPending = pendingRequests.includes(memberId);

    const modal = document.getElementById('profileModal');
    if (!modal) return;
    
    modal.innerHTML = `
        <div class="profile-modal-overlay" onclick="closeProfile()"></div>
        <div class="profile-modal-content">
            <button class="profile-close" onclick="closeProfile()">&times;</button>
            
            <div class="profile-header">
                <img src="${member.avatar}" alt="${member.name}" class="profile-avatar">
                <div class="profile-info">
                    <h2>${member.name}</h2>
                    <p>${member.title}</p>
                    <p>📍 ${member.location}</p>
                    <div class="profile-badges">
                        ${member.verified ? '<span class="badge badge-verified">✓ Verified</span>' : ''}
                        ${member.whale ? '<span class="badge badge-whale">🐋 Whale</span>' : ''}
                        ${member.founder ? '<span class="badge badge-founder">⭐ Founder</span>' : ''}
                        <span class="status-dot ${member.online ? '' : 'offline'}"></span>
                        <span style="font-size: 0.875rem; color: rgba(255,255,255,0.6);">
                            ${member.online ? 'Online' : 'Offline'}
                        </span>
                    </div>
                </div>
            </div>

            <div class="profile-stats">
                <div class="profile-stat">
                    <span class="stat-value">${member.connections}</span>
                    <span class="stat-label">Connections</span>
                </div>
                <div class="profile-stat">
                    <span class="stat-value">${member.nfts}</span>
                    <span class="stat-label">NFTs Owned</span>
                </div>
                <div class="profile-stat">
                    <span class="stat-value">${member.joinDate}</span>
                    <span class="stat-label">Member Since</span>
                </div>
            </div>

            <div class="profile-body">
                <div class="profile-section">
                    <h3>About</h3>
                    <p>${member.bio}</p>
                </div>

                <div class="profile-section">
                    <h3>Interests</h3>
                    <div class="interest-tags">
                        ${member.interests.map(interest => 
                            `<span class="interest-tag">${interest}</span>`
                        ).join('')}
                    </div>
                </div>

                ${Object.keys(member).some(key => ['twitter', 'discord', 'instagram', 'linkedin', 'github'].includes(key)) ? `
                    <div class="profile-section">
                        <h3>Social Links</h3>
                        <div class="social-links">
                            ${member.twitter ? `
                                <a href="${member.twitter}" target="_blank" class="social-link">
                                    <span>🐦</span> Twitter
                                </a>
                            ` : ''}
                            ${member.discord ? `
                                <div class="social-link">
                                    <span>💬</span> ${member.discord}
                                </div>
                            ` : ''}
                            ${member.instagram ? `
                                <a href="${member.instagram}" target="_blank" class="social-link">
                                    <span>📷</span> Instagram
                                </a>
                            ` : ''}
                            ${member.linkedin ? `
                                <a href="${member.linkedin}" target="_blank" class="social-link">
                                    <span>💼</span> LinkedIn
                                </a>
                            ` : ''}
                            ${member.github ? `
                                <a href="${member.github}" target="_blank" class="social-link">
                                    <span>💻</span> GitHub
                                </a>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}
            </div>

            <div class="profile-actions">
                ${isConnected ? `
                    <button class="btn btn-secondary" onclick="handleDisconnect(${memberId})">
                        🔗 Disconnect
                    </button>
                    <button class="btn btn-primary" onclick="handleMessage(${memberId})">
                        💬 Send Message
                    </button>
                ` : isPending ? `
                    <button class="btn btn-secondary" disabled>
                        ⏳ Request Pending
                    </button>
                ` : `
                    <button class="btn btn-primary" onclick="handleConnect(${memberId})">
                        🤝 Connect
                    </button>
                `}
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeProfile() {
    const modal = document.getElementById('profileModal');
    if (modal) {
        modal.style.display = 'none';
        modal.innerHTML = '';
    }
    document.body.style.overflow = '';
}

// =============================================================================
// CONNECTION HANDLERS
// =============================================================================

function handleConnect(memberId) {
    const member = allMembers.find(m => m.id === memberId);
    if (!member) return;

    NetworkingPortal.sendConnectionRequest(memberId).then(success => {
        if (success) {
            pendingRequests.push(memberId);
            updateNetworkStats();
            renderPendingRequests();
            closeProfile();
        }
    });
}

function handleDisconnect(memberId) {
    const member = allMembers.find(m => m.id === memberId);
    if (!member) return;

    if (confirm(`Remove ${member.name} from your connections?`)) {
        myConnections = myConnections.filter(id => id !== memberId);
        updateNetworkStats();
        renderMyConnections();
        closeProfile();
        
        showToast(`Disconnected from ${member.name}`, 'info');
    }
}

function handleMessage(memberId) {
    const member = allMembers.find(m => m.id === memberId);
    if (!member) return;
    
    closeProfile();
    showToast('💬 Messaging feature coming soon!', 'info');
}

function acceptConnection(requestId) {
    NetworkingPortal.acceptConnectionRequest(requestId).then(success => {
        if (success) {
            myConnections.push(requestId);
            pendingRequests = pendingRequests.filter(id => id !== requestId);
            updateNetworkStats();
            renderMyConnections();
            renderPendingRequests();
        }
    });
}

function declineConnection(requestId) {
    if (confirm('Decline this connection request?')) {
        NetworkingPortal.rejectConnectionRequest(requestId).then(success => {
            if (success) {
                pendingRequests = pendingRequests.filter(id => id !== requestId);
                renderPendingRequests();
            }
        });
    }
}

function acceptConnection(memberId) {
    const member = allMembers.find(m => m.id === memberId);
    if (!member) return;

    pendingRequests = pendingRequests.filter(id => id !== memberId);
    myConnections.push(memberId);
    
    updateNetworkStats();
    renderPendingRequests();
    renderMyConnections();
    
    showToast(`✅ You're now connected with ${member.name}!`, 'success');
}

function declineConnection(memberId) {
    pendingRequests = pendingRequests.filter(id => id !== memberId);
    updateNetworkStats();
    renderPendingRequests();
    
    showToast('Connection request declined', 'info');
}

// =============================================================================
// MY NETWORK TABS
// =============================================================================

function renderMyConnections() {
    const container = document.getElementById('connectionsList');
    if (!container) return;
    
    const connections = allMembers.filter(m => myConnections.includes(m.id));
    
    if (connections.length === 0) {
        container.innerHTML = '<div class="empty-state">No connections yet. Start connecting with members! 🤝</div>';
        return;
    }

    container.innerHTML = connections.map(member => `
        <div class="connection-item">
            <img src="${member.avatar}" alt="${member.name}" class="connection-avatar">
            <div class="connection-info">
                <div class="connection-name">${member.name}</div>
                <div class="connection-details">${member.title} • ${member.location}</div>
            </div>
            <div class="connection-actions">
                <button class="btn btn-sm btn-primary" onclick="showProfile(${member.id})">
                    View Profile
                </button>
                <button class="btn btn-sm btn-secondary" onclick="handleMessage(${member.id})">
                    Message
                </button>
            </div>
        </div>
    `).join('');
}

function renderPendingRequests() {
    const container = document.getElementById('pendingList');
    if (!container) return;
    
    const pending = allMembers.filter(m => pendingRequests.includes(m.id));
    
    if (pending.length === 0) {
        container.innerHTML = '<div class="empty-state">No pending requests</div>';
        return;
    }

    container.innerHTML = pending.map(member => `
        <div class="connection-item">
            <img src="${member.avatar}" alt="${member.name}" class="connection-avatar">
            <div class="connection-info">
                <div class="connection-name">${member.name}</div>
                <div class="connection-details">${member.title} • ${member.location}</div>
            </div>
            <div class="connection-actions">
                <button class="btn btn-sm btn-primary" onclick="acceptConnection(${member.id})">
                    ✓ Accept
                </button>
                <button class="btn btn-sm btn-secondary" onclick="declineConnection(${member.id})">
                    ✕ Decline
                </button>
            </div>
        </div>
    `).join('');
}

function renderSuggestions() {
    const container = document.getElementById('suggestionsList');
    if (!container) return;
    
    const suggestions = allMembers
        .filter(m => !myConnections.includes(m.id) && !pendingRequests.includes(m.id))
        .slice(0, 5);
    
    if (suggestions.length === 0) {
        container.innerHTML = '<div class="empty-state">No suggestions available</div>';
        return;
    }

    container.innerHTML = suggestions.map(member => `
        <div class="connection-item">
            <img src="${member.avatar}" alt="${member.name}" class="connection-avatar">
            <div class="connection-info">
                <div class="connection-name">${member.name}</div>
                <div class="connection-details">${member.title} • ${member.connections} connections</div>
            </div>
            <div class="connection-actions">
                <button class="btn btn-sm btn-primary" onclick="handleConnect(${member.id})">
                    🤝 Connect
                </button>
            </div>
        </div>
    `).join('');
}

// =============================================================================
// EVENT LISTENERS
// =============================================================================

function setupEventListeners() {
    // Search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchTerm = e.target.value.toLowerCase();
            applyFilters();
        });
    }

    // Filter tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            currentFilter = tab.dataset.filter;
            applyFilters();
        });
    });

    // Filter dropdowns
    const locationFilter = document.getElementById('locationFilter');
    const industryFilter = document.getElementById('industryFilter');
    const sortBy = document.getElementById('sortBy');
    
    if (locationFilter) locationFilter.addEventListener('change', applyFilters);
    if (industryFilter) industryFilter.addEventListener('change', applyFilters);
    if (sortBy) sortBy.addEventListener('change', applyFilters);

    // Network tabs
    document.querySelectorAll('.network-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.network-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            const tabName = tab.dataset.tab;
            const targetTab = document.getElementById(`${tabName}Tab`);
            if (targetTab) targetTab.classList.add('active');
        });
    });
}

// =============================================================================
// FILTERING & SORTING
// =============================================================================

function applyFilters() {
    const locationFilter = document.getElementById('locationFilter')?.value || '';
    const industryFilter = document.getElementById('industryFilter')?.value || '';
    const sortBy = document.getElementById('sortBy')?.value || 'recent';
    
    let results = [...allMembers];
    
    // Apply search
    if (searchTerm) {
        results = results.filter(member => 
            member.name.toLowerCase().includes(searchTerm) ||
            member.title.toLowerCase().includes(searchTerm) ||
            member.location.toLowerCase().includes(searchTerm) ||
            member.interests.some(interest => interest.toLowerCase().includes(searchTerm))
        );
    }
    
    // Apply filter tabs
    if (currentFilter === 'online') {
        results = results.filter(m => m.online);
    } else if (currentFilter === 'verified') {
        results = results.filter(m => m.verified);
    } else if (currentFilter === 'whale') {
        results = results.filter(m => m.whale);
    }
    
    // Apply location filter
    if (locationFilter) {
        results = results.filter(m => m.region === locationFilter);
    }
    
    // Apply industry filter
    if (industryFilter) {
        results = results.filter(m => m.industry === industryFilter);
    }
    
    // Apply sorting
    if (sortBy === 'name') {
        results.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'nfts') {
        results.sort((a, b) => b.nfts - a.nfts);
    } else if (sortBy === 'joined') {
        const monthOrder = { 'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6 };
        results.sort((a, b) => {
            const aMonth = monthOrder[a.joinDate.split(' ')[0]];
            const bMonth = monthOrder[b.joinDate.split(' ')[0]];
            return bMonth - aMonth;
        });
    }
    
    filteredMembers = results;
    renderMemberGrid();
}

// =============================================================================
// UI HELPERS
// =============================================================================

function showToast(message, type = 'info') {
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#8b5cf6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        font-weight: 500;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// =============================================================================
// GLOBAL API
// =============================================================================

window.showProfile = showProfile;
window.closeProfile = closeProfile;
window.handleConnect = handleConnect;
window.handleDisconnect = handleDisconnect;
window.handleMessage = handleMessage;
window.acceptConnection = acceptConnection;
window.declineConnection = declineConnection;
