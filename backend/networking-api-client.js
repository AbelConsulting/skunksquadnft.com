/**
 * SkunkSquad Networking API Client
 * Frontend integration for networking backend
 * 
 * Usage: Include this file in your HTML and use window.NetworkingAPI
 * Server runs on port 3001 (separate from payment server on 3002)
 */

// Auto-detect environment
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3001/api'
    : 'https://api.skunksquadnft.com/networking/api'; // Update with your production API URL

class NetworkingAPI {
    constructor() {
        this.token = localStorage.getItem('networking_token');
    }

    // Helper: Make authenticated request
    async request(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Request failed');
        }

        return response.json();
    }

    // =================================================================
    // AUTHENTICATION
    // =================================================================

    async loginWithWallet(walletAddress) {
        const data = await this.request('/auth/wallet', {
            method: 'POST',
            body: JSON.stringify({ walletAddress })
        });

        this.token = data.token;
        localStorage.setItem('networking_token', data.token);
        localStorage.setItem('networking_member', JSON.stringify(data.member));

        return data;
    }

    async logout() {
        try {
            await this.request('/auth/logout', { method: 'POST' });
        } finally {
            this.token = null;
            localStorage.removeItem('networking_token');
            localStorage.removeItem('networking_member');
        }
    }

    async verifySession() {
        try {
            return await this.request('/auth/verify');
        } catch (error) {
            this.token = null;
            localStorage.removeItem('networking_token');
            return { valid: false };
        }
    }

    // =================================================================
    // MEMBERS
    // =================================================================

    async getMembers(filters = {}) {
        const params = new URLSearchParams();
        
        Object.entries(filters).forEach(([key, value]) => {
            if (value) params.append(key, value);
        });

        return this.request(`/members?${params.toString()}`);
    }

    async getStats() {
        return this.request('/members/stats');
    }

    async getMember(id) {
        return this.request(`/members/${id}`);
    }

    async updateProfile(data) {
        return this.request('/members/profile', {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async updateInterests(interests) {
        return this.request('/members/interests', {
            method: 'PUT',
            body: JSON.stringify({ interests })
        });
    }

    async updateSocials(socials) {
        return this.request('/members/socials', {
            method: 'PUT',
            body: JSON.stringify({ socials })
        });
    }

    async updateOnlineStatus(online) {
        return this.request('/members/online-status', {
            method: 'PUT',
            body: JSON.stringify({ online })
        });
    }

    // =================================================================
    // CONNECTIONS
    // =================================================================

    async getConnections(status = 'accepted') {
        return this.request(`/connections?status=${status}`);
    }

    async getPendingConnections() {
        return this.request('/connections/pending');
    }

    async getSuggestions(limit = 5) {
        return this.request(`/connections/suggestions?limit=${limit}`);
    }

    async sendConnectionRequest(targetMemberId) {
        return this.request('/connections/request', {
            method: 'POST',
            body: JSON.stringify({ targetMemberId })
        });
    }

    async acceptConnection(connectionId) {
        return this.request(`/connections/accept/${connectionId}`, {
            method: 'POST'
        });
    }

    async declineConnection(connectionId) {
        return this.request(`/connections/decline/${connectionId}`, {
            method: 'POST'
        });
    }

    async removeConnection(connectionId) {
        return this.request(`/connections/${connectionId}`, {
            method: 'DELETE'
        });
    }
}

// Export singleton instance
window.NetworkingAPI = new NetworkingAPI();

// =================================================================
// USAGE EXAMPLES
// =================================================================

/*
// Login
const result = await NetworkingAPI.loginWithWallet('0x...');

// Get members with filters
const { members } = await NetworkingAPI.getMembers({
    search: 'developer',
    region: 'north-america',
    industry: 'tech',
    verified: true,
    sort: 'nfts',
    limit: 20
});

// Get stats
const stats = await NetworkingAPI.getStats();

// Get single member
const member = await NetworkingAPI.getMember(1);

// Update your profile
await NetworkingAPI.updateProfile({
    displayName: 'CryptoKing',
    title: 'Blockchain Developer',
    bio: 'Building the future...',
    location: 'San Francisco, CA',
    region: 'north-america',
    industry: 'tech'
});

// Update interests
await NetworkingAPI.updateInterests(['DeFi', 'NFTs', 'Gaming']);

// Update socials
await NetworkingAPI.updateSocials([
    { platform: 'twitter', url: 'https://twitter.com/...', username: '@...' },
    { platform: 'discord', username: '...#1234' }
]);

// Send connection request
await NetworkingAPI.sendConnectionRequest(5);

// Get your connections
const { connections } = await NetworkingAPI.getConnections();

// Get pending requests
const { incoming, outgoing } = await NetworkingAPI.getPendingConnections();

// Accept connection
await NetworkingAPI.acceptConnection(connectionId);

// Get suggestions
const { suggestions } = await NetworkingAPI.getSuggestions(5);

// Update online status
await NetworkingAPI.updateOnlineStatus(true);

// Logout
await NetworkingAPI.logout();
*/
