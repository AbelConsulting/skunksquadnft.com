// Networking Tool - Member Directory & Connections
// SkunkSquad NFT Collection

// Sample member data (in production, this would come from a backend)
const SAMPLE_MEMBERS = [
    {
        id: 1,
        name: "Alex Rivera",
        title: "Blockchain Developer",
        location: "San Francisco, CA",
        industry: "Technology",
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
        industry: "Arts",
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
        industry: "Community",
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
        industry: "Finance",
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
        industry: "Gaming",
        avatar: "https://i.pravatar.cc/150?img=14",
        bio: "Building play-to-earn games with real utility for NFT holders.",
        interests: ["GameFi", "Metaverse", "Unity", "Unreal Engine"],
        connections: 134,
        nfts: 6,
        joinDate: "Mar 2024",
        verified: true,
        whale: false,
        online: true,
        twitter: "https://twitter.com/davidkim",
        discord: "davidkim#9012"
    },
    {
        id: 6,
        name: "Jessica Martinez",
        title: "Marketing Strategist",
        location: "Miami, FL",
        industry: "Marketing",
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
        industry: "Technology",
        avatar: "https://i.pravatar.cc/150?img=33",
        bio: "Building dApps and NFT marketplaces. Open source contributor.",
        interests: ["Web3", "React", "Node.js", "Smart Contracts"],
        connections: 167,
        nfts: 9,
        joinDate: "Feb 2024",
        verified: true,
        whale: false,
        online: true,
        twitter: "https://twitter.com/rthompson",
        github: "https://github.com/rthompson"
    },
    {
        id: 8,
        name: "Nicole Brown",
        title: "DAO Contributor",
        location: "Berlin, Germany",
        industry: "Community",
        avatar: "https://i.pravatar.cc/150?img=25",
        bio: "Active in multiple DAOs. Governance and community advocate.",
        interests: ["DAOs", "Governance", "DeFi", "Community"],
        connections: 188,
        nfts: 11,
        joinDate: "Jan 2024",
        verified: true,
        whale: false,
        founder: true,
        online: true,
        twitter: "https://twitter.com/nicoleb",
        discord: "nicoleb#3456"
    }
];

// State management
let allMembers = [...SAMPLE_MEMBERS];
let filteredMembers = [...SAMPLE_MEMBERS];
let currentFilter = 'all';
let myConnections = [2, 5]; // IDs of connected members
let pendingRequests = [4]; // IDs of pending connection requests

// Initialize networking page
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    if (typeof MembersAuth === 'undefined' || !MembersAuth.checkAuth()) {
        window.location.href = '/members.html';
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

// Update network statistics
function updateNetworkStats() {
    document.getElementById('total-members').textContent = allMembers.length;
    document.getElementById('my-connections').textContent = myConnections.length;
    document.getElementById('pending-requests').textContent = pendingRequests.length;
    
    const onlineCount = allMembers.filter(m => m.online).length;
    document.getElementById('online-now').textContent = onlineCount;
}

// Render member grid
function renderMemberGrid() {
    const grid = document.getElementById('member-grid');
    const memberCount = document.getElementById('member-count');
    
    if (filteredMembers.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <h3>No members found</h3>
                <p>Try adjusting your filters or search terms</p>
            </div>
        `;
        memberCount.textContent = '0 members';
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
                    <div class="member-name">${member.name}</div>
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

    memberCount.textContent = `${filteredMembers.length} member${filteredMembers.length !== 1 ? 's' : ''}`;
}

// Show member profile modal
function showProfile(memberId) {
    const member = allMembers.find(m => m.id === memberId);
    if (!member) return;

    const isConnected = myConnections.includes(memberId);
    const isPending = pendingRequests.includes(memberId);

    const modal = document.getElementById('profile-modal');
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
                        Disconnect
                    </button>
                    <button class="btn btn-primary" onclick="handleMessage(${memberId})">
                        Send Message
                    </button>
                ` : isPending ? `
                    <button class="btn btn-secondary" disabled>
                        Request Pending
                    </button>
                ` : `
                    <button class="btn btn-primary" onclick="handleConnect(${memberId})">
                        Connect
                    </button>
                `}
            </div>
        </div>
    `;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeProfile() {
    const modal = document.getElementById('profile-modal');
    modal.classList.remove('active');
    modal.innerHTML = '';
    document.body.style.overflow = '';
}

// Connection handlers
function handleConnect(memberId) {
    const member = allMembers.find(m => m.id === memberId);
    if (!member) return;

    pendingRequests.push(memberId);
    updateNetworkStats();
    renderPendingRequests();
    closeProfile();
    
    showToast(`Connection request sent to ${member.name}`, 'success');
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
    showToast('Messaging feature coming soon!', 'info');
}

function acceptConnection(memberId) {
    const member = allMembers.find(m => m.id === memberId);
    if (!member) return;

    pendingRequests = pendingRequests.filter(id => id !== memberId);
    myConnections.push(memberId);
    
    updateNetworkStats();
    renderPendingRequests();
    renderMyConnections();
    
    showToast(`You're now connected with ${member.name}`, 'success');
}

function declineConnection(memberId) {
    const member = allMembers.find(m => m.id === memberId);
    if (!member) return;

    pendingRequests = pendingRequests.filter(id => id !== memberId);
    updateNetworkStats();
    renderPendingRequests();
    
    showToast(`Connection request declined`, 'info');
}

// Render My Connections
function renderMyConnections() {
    const container = document.getElementById('connections-list');
    const connections = allMembers.filter(m => myConnections.includes(m.id));
    
    if (connections.length === 0) {
        container.innerHTML = '<div class="empty-state">No connections yet. Start connecting with members!</div>';
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

// Render Pending Requests
function renderPendingRequests() {
    const container = document.getElementById('pending-list');
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
                    Accept
                </button>
                <button class="btn btn-sm btn-secondary" onclick="declineConnection(${member.id})">
                    Decline
                </button>
            </div>
        </div>
    `).join('');
}

// Render Connection Suggestions
function renderSuggestions() {
    const container = document.getElementById('suggestions-list');
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
                    Connect
                </button>
            </div>
        </div>
    `).join('');
}

// Setup event listeners
function setupEventListeners() {
    // Search
    document.getElementById('member-search').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        filterMembers(searchTerm);
    });

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
    document.querySelectorAll('.filter-select').forEach(select => {
        select.addEventListener('change', applyFilters);
    });

    // Network tabs
    document.querySelectorAll('.network-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.network-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            const tabName = tab.dataset.tab;
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });
}

// Filter members by search
function filterMembers(searchTerm) {
    if (!searchTerm) {
        filteredMembers = [...allMembers];
    } else {
        filteredMembers = allMembers.filter(member => 
            member.name.toLowerCase().includes(searchTerm) ||
            member.title.toLowerCase().includes(searchTerm) ||
            member.location.toLowerCase().includes(searchTerm) ||
            member.interests.some(interest => interest.toLowerCase().includes(searchTerm))
        );
    }
    
    applyFilters();
}

// Apply all filters
function applyFilters() {
    const locationFilter = document.getElementById('filter-location').value;
    const industryFilter = document.getElementById('filter-industry').value;
    const sortBy = document.getElementById('filter-sort').value;
    
    let results = [...filteredMembers];
    
    // Apply current filter tab
    if (currentFilter === 'online') {
        results = results.filter(m => m.online);
    } else if (currentFilter === 'verified') {
        results = results.filter(m => m.verified);
    } else if (currentFilter === 'whales') {
        results = results.filter(m => m.whale);
    }
    
    // Apply location filter
    if (locationFilter && locationFilter !== 'all') {
        results = results.filter(m => m.location.includes(locationFilter));
    }
    
    // Apply industry filter
    if (industryFilter && industryFilter !== 'all') {
        results = results.filter(m => m.industry === industryFilter);
    }
    
    // Apply sorting
    if (sortBy === 'connections') {
        results.sort((a, b) => b.connections - a.connections);
    } else if (sortBy === 'nfts') {
        results.sort((a, b) => b.nfts - a.nfts);
    } else if (sortBy === 'recent') {
        // Sort by join date (most recent first)
        results.sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate));
    }
    
    filteredMembers = results;
    renderMemberGrid();
}

// Toast notification
function showToast(message, type = 'info') {
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

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
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Make functions globally available
window.showProfile = showProfile;
window.closeProfile = closeProfile;
window.handleConnect = handleConnect;
window.handleDisconnect = handleDisconnect;
window.handleMessage = handleMessage;
window.acceptConnection = acceptConnection;
window.declineConnection = declineConnection;
