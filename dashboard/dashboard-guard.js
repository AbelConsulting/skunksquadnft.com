/**
 * Dashboard Access Guard
 * Protects the analytics dashboard - members only
 */

(function() {
    'use strict';
    
    const STORAGE_KEY = 'skunksquad_member';
    const MEMBERS_URL = '../members.html';
    
    /**
     * Check if user has valid member session
     */
    function checkDashboardAccess() {
        try {
            const sessionData = localStorage.getItem(STORAGE_KEY);
            
            if (!sessionData) {
                console.warn('🔒 No member session found');
                redirectToMembers('no_session');
                return false;
            }
            
            const session = JSON.parse(sessionData);
            
            // Validate session
            if (!session.authenticated) {
                console.warn('🔒 Session not authenticated');
                redirectToMembers('not_authenticated');
                return false;
            }
            
            // Check session age (24 hours)
            const sessionAge = Date.now() - (session.timestamp || 0);
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours
            
            if (sessionAge > maxAge) {
                console.warn('🔒 Session expired');
                localStorage.removeItem(STORAGE_KEY);
                redirectToMembers('session_expired');
                return false;
            }
            
            console.log('✅ Dashboard access granted');
            displayMemberInfo(session);
            return true;
            
        } catch (error) {
            console.error('Error checking dashboard access:', error);
            redirectToMembers('error');
            return false;
        }
    }
    
    /**
     * Redirect to members portal with reason
     */
    function redirectToMembers(reason) {
        const messages = {
            'no_session': 'Please authenticate to access the dashboard',
            'not_authenticated': 'Authentication required',
            'session_expired': 'Your session has expired. Please login again',
            'error': 'Access verification failed'
        };
        
        // Show brief message before redirect
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.95);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            color: white;
            font-family: 'Inter', sans-serif;
        `;
        
        overlay.innerHTML = `
            <div style="text-align: center; max-width: 500px; padding: 2rem;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">🔒</div>
                <h2 style="font-size: 1.5rem; margin-bottom: 1rem;">Members Only Area</h2>
                <p style="color: #94a3b8; margin-bottom: 2rem;">${messages[reason] || 'Authentication required'}</p>
                <p style="color: #64748b; font-size: 0.875rem;">Redirecting to members portal...</p>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Redirect after brief delay
        setTimeout(() => {
            window.location.href = MEMBERS_URL;
        }, 2000);
    }
    
    /**
     * Display member info in dashboard header
     */
    function displayMemberInfo(session) {
        // Add member info to header if not already present
        const headerRight = document.querySelector('.header-right');
        if (!headerRight || document.querySelector('.dashboard-member-info')) return;
        
        const memberInfo = document.createElement('div');
        memberInfo.className = 'dashboard-member-info';
        memberInfo.innerHTML = `
            <div class="dashboard-member-badge">
                <span class="member-icon">👤</span>
                <span class="member-text">${session.displayName || 'Member'}</span>
            </div>
        `;
        
        // Insert before network status
        const networkStatus = headerRight.querySelector('.network-status');
        if (networkStatus) {
            headerRight.insertBefore(memberInfo, networkStatus);
        }
    }
    
    /**
     * Add logout functionality
     */
    function addLogoutButton() {
        const headerRight = document.querySelector('.header-right');
        if (!headerRight || document.querySelector('.dashboard-logout-btn')) return;
        
        const logoutBtn = document.createElement('button');
        logoutBtn.className = 'btn-icon dashboard-logout-btn';
        logoutBtn.title = 'Logout';
        logoutBtn.innerHTML = '🚪';
        logoutBtn.onclick = () => {
            if (confirm('Logout from members portal?')) {
                localStorage.removeItem(STORAGE_KEY);
                window.location.href = MEMBERS_URL;
            }
        };
        
        headerRight.appendChild(logoutBtn);
    }
    
    // Run access check immediately
    const hasAccess = checkDashboardAccess();
    
    // If access granted, add member features
    if (hasAccess) {
        document.addEventListener('DOMContentLoaded', () => {
            addLogoutButton();
        });
    }
    
})();
