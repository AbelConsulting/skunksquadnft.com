/**
 * SkunkSquad Members Portal Features
 * Handles member-specific functionality and interactions
 */

// Quick action handlers
function openNetworking() {
    showFeatureModal(
        '🤝 Elite Networking',
        `
        <p><strong>Connect with Fellow Members</strong></p>
        <ul style="text-align: left; margin: 1rem 0;">
            <li>✨ Private member directory</li>
            <li>💬 Direct messaging system</li>
            <li>🌍 Global networking events</li>
            <li>🤝 Collaboration opportunities</li>
            <li>📊 Professional profiles</li>
        </ul>
        <p class="text-muted">Build lasting relationships with elite collectors and entrepreneurs worldwide.</p>
        `,
        '🚀 Coming Soon!',
        () => {
            console.log('Networking feature clicked');
        }
    );
}

function openRewards() {
    showFeatureModal(
        '🎁 Member Rewards Program',
        `
        <p><strong>Exclusive Benefits & Perks</strong></p>
        <ul style="text-align: left; margin: 1rem 0;">
            <li>💎 Monthly NFT airdrops</li>
            <li>🛍️ Exclusive merchandise</li>
            <li>🎫 VIP event tickets</li>
            <li>💰 Partnership discounts</li>
            <li>⭐ Loyalty rewards</li>
        </ul>
        <p class="text-muted">Earn points for holding, participating, and referring new members.</p>
        `,
        '🔜 Launching Soon',
        () => {
            console.log('Rewards feature clicked');
        }
    );
}

function openEvents() {
    showFeatureModal(
        '📅 Exclusive Events Calendar',
        `
        <p><strong>VIP Access & Premium Experiences</strong></p>
        <ul style="text-align: left; margin: 1rem 0;">
            <li>🍽️ Private networking dinners</li>
            <li>💼 Investment seminars</li>
            <li>🎤 Speaker series</li>
            <li>🌐 Virtual meetups</li>
            <li>✈️ Global conferences</li>
        </ul>
        <p class="text-muted">Join exclusive events designed for elite networking and growth.</p>
        `,
        '📆 Calendar Coming Soon',
        () => {
            console.log('Events feature clicked');
        }
    );
}

/**
 * Show feature modal
 */
function showFeatureModal(title, content, buttonText, buttonAction) {
    // Remove existing modal if any
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
    
    // Animate in
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
}

/**
 * Initialize member portal charts
 */
function initMemberCharts() {
    const portfolioCanvas = document.getElementById('portfolioChart');
    if (!portfolioCanvas) return;
    
    const ctx = portfolioCanvas.getContext('2d');
    
    // Simple portfolio chart (replace with real data)
    new Chart(ctx, {
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
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function(value) {
                            return '$' + value;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Copy text to clipboard
 */
function copyToClipboard(text, successMessage = 'Copied!') {
    navigator.clipboard.writeText(text).then(() => {
        showToast(successMessage, 'success');
    }).catch(err => {
        console.error('Failed to copy:', err);
        showToast('Copy failed', 'error');
    });
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Load member NFTs
 */
async function loadMemberNFTs() {
    const member = window.MembersAuth?.getCurrentMember();
    if (!member || !member.tokenIds) return;
    
    console.log('Loading NFTs for member:', member.displayName);
    console.log('Token IDs:', member.tokenIds);
    
    // In production, fetch actual NFT metadata
    // For now, just log the information
}

/**
 * Update member activity
 */
function updateMemberActivity() {
    const lastActive = new Date().toLocaleTimeString();
    console.log('Member activity updated:', lastActive);
}

/**
 * Initialize member portal features
 */
function initMemberPortal() {
    console.log('🦨 Initializing member portal features...');
    
    // Load charts if Chart.js is available
    if (typeof Chart !== 'undefined') {
        initMemberCharts();
    }
    
    // Load member NFTs
    loadMemberNFTs();
    
    // Set up activity tracking
    setInterval(updateMemberActivity, 60000); // Every minute
    
    console.log('✅ Member portal features initialized');
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMemberPortal);
} else {
    initMemberPortal();
}

// Export functions for global use
window.MembersPortal = {
    openNetworking,
    openRewards,
    openEvents,
    copyToClipboard,
    showToast,
    showFeatureModal
};
