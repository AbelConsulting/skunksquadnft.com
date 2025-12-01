/**
 * Badge System Frontend
 * Display and manage member badges
 */

const BadgeSystem = {
    badges: [],
    myBadges: [],
    api: null,

    async init() {
        console.log('🏆 Initializing Badge System...');
        
        // Initialize API if available
        if (typeof NetworkingAPI !== 'undefined') {
            this.api = new NetworkingAPI();
        }
        
        // Load badges
        await this.loadBadges();
        await this.loadMyBadges();
        
        console.log('✅ Badge System initialized');
    },

    async loadBadges() {
        if (!this.api) {
            this.badges = this.getSampleBadges();
            return;
        }
        
        try {
            const response = await fetch('/api/badges');
            if (response.ok) {
                this.badges = await response.json();
            } else {
                this.badges = this.getSampleBadges();
            }
        } catch (error) {
            console.error('Error loading badges:', error);
            this.badges = this.getSampleBadges();
        }
    },

    async loadMyBadges() {
        if (!this.api) {
            this.myBadges = [];
            return;
        }
        
        try {
            const response = await fetch('/api/badges/my', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            if (response.ok) {
                this.myBadges = await response.json();
            }
        } catch (error) {
            console.error('Error loading my badges:', error);
        }
    },

    async checkForNewBadges() {
        if (!this.api) return [];
        
        try {
            const response = await fetch('/api/badges/check', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.badges && result.badges.length > 0) {
                    this.showBadgeNotification(result.badges);
                    await this.loadMyBadges();
                }
                return result.badges;
            }
        } catch (error) {
            console.error('Error checking badges:', error);
        }
        return [];
    },

    renderBadgeList(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const limit = options.limit || null;
        let badges = options.badges || this.myBadges;
        
        if (limit && badges.length > limit) {
            badges = badges.slice(0, limit);
        }
        
        if (badges.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #94a3b8;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🏆</div>
                    <p>No badges earned yet. Start exploring to unlock achievements!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem;">
                ${badges.map(badge => `
                    <div class="badge-card ${badge.rarity || 'common'}" style="cursor: pointer;" onclick="BadgeSystem.showBadgeModal(${badge.id})">
                        <div class="badge-icon">${badge.icon}</div>
                        <div class="badge-info">
                            <h4 class="badge-name">${badge.name}</h4>
                            ${badge.tier ? `<div class="badge-tier badge-tier-${badge.tier}">${this.capitalizeFirst(badge.tier)}</div>` : ''}
                            <div class="badge-meta">
                                <span class="badge-rarity ${badge.rarity || 'common'}">${this.capitalizeFirst(badge.rarity || 'common')}</span>
                                ${badge.points ? `<span class="badge-points">+${badge.points} pts</span>` : ''}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    renderInlineBadges(memberId, container, options = {}) {
        const limit = options.limit || 3;
        
        // For now, show sample badges - will be replaced with real member badges from API
        const badges = this.myBadges.slice(0, limit);
        
        if (!container || badges.length === 0) {
            if (container) container.innerHTML = '';
            return;
        }
        
        container.innerHTML = badges.map(badge => 
            `<span class="badge-inline badge-tier-${badge.tier || 'bronze'}" title="${badge.name}">${badge.icon}</span>`
        ).join('');
    },

    renderBadgeGrid(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const badges = options.all ? this.badges : this.myBadges;
        const showLocked = options.showLocked !== false;
        
        if (badges.length === 0) {
            container.innerHTML = '<p class="empty-state">No badges available</p>';
            return;
        }
        
        container.innerHTML = badges.map(badge => {
            const earned = this.myBadges.some(mb => mb.id === badge.id);
            const locked = !earned && showLocked;
            
            return `
                <div class="badge-item ${badge.rarity} ${locked ? 'locked' : ''}" onclick="BadgeSystem.showBadgeModal(${badge.id})">
                    <div class="badge-icon-large">${locked ? '🔒' : badge.icon}</div>
                    <div class="badge-title">${badge.name}</div>
                    ${badge.tier ? `<div class="badge-tier badge-tier-${badge.tier}">${this.capitalizeFirst(badge.tier)}</div>` : ''}
                    <div class="badge-rarity-tag ${badge.rarity}">${this.capitalizeFirst(badge.rarity)}</div>
                    ${earned ? '<div class="badge-earned">✓ Earned</div>' : ''}
                    ${!earned && badge.progress ? `<div class="badge-progress-info">${badge.progress.current}/${badge.progress.required}</div>` : ''}
                </div>
            `;
        }).join('');
    },

    showBadgeModal(badgeId) {
        const badge = this.badges.find(b => b.id === badgeId) || this.myBadges.find(b => b.id === badgeId);
        if (!badge) return;
        
        const earned = this.myBadges.some(mb => mb.id === badgeId);
        
        const modal = document.createElement('div');
        modal.className = 'badge-modal';
        modal.innerHTML = `
            <div class="badge-modal-overlay" onclick="BadgeSystem.closeBadgeModal()"></div>
            <div class="badge-modal-content">
                <button class="badge-modal-close" onclick="BadgeSystem.closeBadgeModal()">&times;</button>
                <div class="badge-modal-header">
                    <div class="badge-icon-huge">${badge.icon}</div>
                    <h2>${badge.name}</h2>
                    ${badge.tier ? `<div class="badge-tier badge-tier-${badge.tier}">${this.capitalizeFirst(badge.tier)}</div>` : ''}
                </div>
                <div class="badge-modal-body">
                    <p class="badge-description">${badge.description}</p>
                    <div class="badge-stats">
                        <div class="badge-stat">
                            <span class="badge-stat-label">Rarity</span>
                            <span class="badge-stat-value ${badge.rarity}">${this.capitalizeFirst(badge.rarity)}</span>
                        </div>
                        <div class="badge-stat">
                            <span class="badge-stat-label">Points</span>
                            <span class="badge-stat-value">${badge.points}</span>
                        </div>
                        ${badge.category ? `
                            <div class="badge-stat">
                                <span class="badge-stat-label">Category</span>
                                <span class="badge-stat-value">${this.capitalizeFirst(badge.category)}</span>
                            </div>
                        ` : ''}
                    </div>
                    ${earned ? `
                        <div class="badge-earned-info">
                            <span class="badge-earned-check">✓</span> 
                            Earned ${badge.earned_at ? this.formatDate(badge.earned_at) : 'recently'}
                        </div>
                    ` : badge.progress ? `
                        <div class="badge-progress-section">
                            <div class="badge-progress-header">
                                <span>Progress</span>
                                <span>${badge.progress.current}/${badge.progress.required}</span>
                            </div>
                            <div class="badge-progress-bar">
                                <div class="badge-progress-fill" style="width: ${(badge.progress.current / badge.progress.required) * 100}%"></div>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('active'), 10);
    },

    closeBadgeModal() {
        const modal = document.querySelector('.badge-modal');
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        }
    },

    renderBadgeRow(badges, maxDisplay = 5) {
        if (!badges || badges.length === 0) {
            return '<span class="no-badges">No badges</span>';
        }
        
        const displayBadges = badges.slice(0, maxDisplay);
        const remaining = badges.length - maxDisplay;
        
        let html = displayBadges.map(badge => 
            `<span class="badge-icon-small" title="${badge.name}">${badge.icon}</span>`
        ).join('');
        
        if (remaining > 0) {
            html += `<span class="badge-more">+${remaining}</span>`;
        }
        
        return html;
    },

    showBadgeNotification(badges) {
        const notification = document.createElement('div');
        notification.className = 'badge-notification';
        notification.innerHTML = `
            <div class="badge-notification-content">
                <h3>🎉 New Badge${badges.length > 1 ? 's' : ''} Earned!</h3>
                <div class="badge-notification-list">
                    ${badges.map(badge => `
                        <div class="badge-notification-item">
                            <span class="badge-icon-large">${badge.icon}</span>
                            <div>
                                <div class="badge-name">${badge.name}</div>
                                <div class="badge-points">+${badge.points} points</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <button class="btn btn-primary" onclick="BadgeSystem.closeBadgeNotification()">Awesome!</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-close after 10 seconds
        setTimeout(() => {
            this.closeBadgeNotification();
        }, 10000);
    },

    closeBadgeNotification() {
        const notification = document.querySelector('.badge-notification');
        if (notification) {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }
    },

    async getMemberBadges(memberId) {
        if (!this.api) return [];
        
        try {
            const response = await fetch(`/api/badges/member/${memberId}`);
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Error loading member badges:', error);
        }
        return [];
    },

    async getLeaderboard(limit = 10) {
        if (!this.api) return [];
        
        try {
            const response = await fetch(`/api/badges/leaderboard?limit=${limit}`);
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Error loading leaderboard:', error);
        }
        return [];
    },

    renderLeaderboard(containerId, limit = 10) {
        this.getLeaderboard(limit).then(leaderboard => {
            const container = document.getElementById(containerId);
            if (!container) return;
            
            container.innerHTML = leaderboard.map((member, index) => `
                <div class="leaderboard-item rank-${index + 1}">
                    <div class="leaderboard-rank">${index + 1}</div>
                    <img src="${member.avatar_url || './assets/charlesskunk.webp'}" alt="${member.display_name}" class="leaderboard-avatar">
                    <div class="leaderboard-info">
                        <div class="leaderboard-name">${member.display_name || member.wallet_address?.substring(0, 8)}</div>
                        <div class="leaderboard-stats">
                            <span>${member.badge_count} badges</span>
                            <span>${member.total_points} points</span>
                        </div>
                    </div>
                    <div class="leaderboard-badges">
                        ${this.renderBadgeRow(member.badges, 3)}
                    </div>
                </div>
            `).join('');
        });
    },

    getSampleBadges() {
        return [
            { id: 1, name: 'First Skunk', icon: '🦨', description: 'Minted your first SkunkSquad NFT', rarity: 'common', category: 'collection', points: 10 },
            { id: 2, name: 'Diamond Hands', icon: '💎', description: 'Own 3+ SkunkSquad NFTs', rarity: 'rare', category: 'collection', points: 25 },
            { id: 3, name: 'Whale Status', icon: '🐋', description: 'Own 5+ SkunkSquad NFTs', rarity: 'epic', category: 'collection', points: 50 },
            { id: 4, name: 'Early Adopter', icon: '🎯', description: 'Joined in first 100 members', rarity: 'rare', category: 'social', points: 50 },
            { id: 5, name: 'Network Builder', icon: '🤝', description: 'Connected with 10+ members', rarity: 'rare', category: 'social', points: 30 },
            { id: 6, name: 'Profile Complete', icon: '✅', description: 'Filled out complete profile', rarity: 'common', category: 'activity', points: 15 },
            { id: 7, name: 'Verified Member', icon: '✓', description: 'Verified NFT ownership', rarity: 'common', category: 'achievement', points: 5 }
        ];
    },

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
};

// Auto-initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    BadgeSystem.init();
});

// Make available globally
window.BadgeSystem = BadgeSystem;
