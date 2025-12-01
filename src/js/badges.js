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

    renderBadgeList(containerId, badgeList = null) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const badges = badgeList || this.myBadges;
        
        if (badges.length === 0) {
            container.innerHTML = '<p class="empty-state">No badges earned yet. Start exploring to unlock achievements!</p>';
            return;
        }
        
        container.innerHTML = badges.map(badge => `
            <div class="badge-card ${badge.rarity}">
                <div class="badge-icon">${badge.icon}</div>
                <div class="badge-info">
                    <h4 class="badge-name">${badge.name}</h4>
                    <p class="badge-description">${badge.description}</p>
                    <div class="badge-meta">
                        <span class="badge-rarity ${badge.rarity}">${this.capitalizeFirst(badge.rarity)}</span>
                        <span class="badge-points">+${badge.points} pts</span>
                        ${badge.earned_at ? `<span class="badge-date">Earned ${this.formatDate(badge.earned_at)}</span>` : ''}
                    </div>
                </div>
            </div>
        `).join('');
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
                <div class="badge-item ${badge.rarity} ${locked ? 'locked' : ''}">
                    <div class="badge-icon-large">${locked ? '🔒' : badge.icon}</div>
                    <div class="badge-title">${badge.name}</div>
                    <div class="badge-rarity-tag ${badge.rarity}">${this.capitalizeFirst(badge.rarity)}</div>
                    ${earned ? '<div class="badge-earned">✓ Earned</div>' : ''}
                </div>
            `;
        }).join('');
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
