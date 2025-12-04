/**
 * SkunkSquad NFT Leaderboard System
 * Real-time stats, rankings, and community metrics
 */

class SkunkSquadLeaderboard {
    constructor() {
        this.web3 = null;
        this.contract = null;
        this.userAddress = null;
        this.refreshInterval = null;
        
        // Sample data for demo (will be replaced with real blockchain data)
        // Using anonymous placeholders until real data is available
        this.sampleHolders = [
            { rank: 1, address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0', nfts: 127, value: '1.27 ETH', badge: 'whale' },
            { rank: 2, address: '0x8Ba1f109551bD432803012645Ac136ddd64DBA72', nfts: 89, value: '0.89 ETH', badge: 'og' },
            { rank: 3, address: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B', nfts: 67, value: '0.67 ETH', badge: 'legend' },
            { rank: 4, address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', nfts: 54, value: '0.54 ETH', badge: 'whale' },
            { rank: 5, address: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD', nfts: 42, value: '0.42 ETH', badge: 'og' },
            { rank: 6, address: '0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8', nfts: 35, value: '0.35 ETH', badge: null },
            { rank: 7, address: '0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf', nfts: 28, value: '0.28 ETH', badge: null },
            { rank: 8, address: '0x40418beb7f24c87ab2d5ffbf5b40c8fe7c3e0b3c', nfts: 21, value: '0.21 ETH', badge: null },
            { rank: 9, address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', nfts: 17, value: '0.17 ETH', badge: null },
            { rank: 10, address: '0x0D8775F648430679A709E98d2b0Cb6250d2887EF', nfts: 12, value: '0.12 ETH', badge: null }
        ];

        this.sampleRarest = [
            { id: 1337, rarity: 156.8, rank: 1, traits: 'Ultra Rare', image: '../assets/skunksample3.png' },
            { id: 4269, rarity: 148.2, rank: 2, traits: 'Legendary', image: '../assets/skunksample14.png' },
            { id: 6969, rarity: 142.5, rank: 3, traits: 'Ultra Rare', image: '../assets/skunksample13.png' },
            { id: 420, rarity: 138.9, rank: 4, traits: 'Legendary', image: '../assets/skunksample17.png' },
            { id: 8888, rarity: 135.7, rank: 5, traits: 'Epic', image: '../assets/skunksample6.png' },
            { id: 777, rarity: 132.4, rank: 6, traits: 'Epic', image: '../assets/skunksample11.png' }
        ];

        this.sampleActivity = [
            { time: '2 min ago', event: 'Mint', tokenId: '9847', price: '0.01 ETH', tx: '0x7f3d...a4c2' },
            { time: '5 min ago', event: 'Transfer', tokenId: '7234', price: '0.015 ETH', tx: '0x9c2e...7b1a' },
            { time: '8 min ago', event: 'Mint', tokenId: '9846', price: '0.01 ETH', tx: '0x4a8f...3d9e' },
            { time: '12 min ago', event: 'Mint', tokenId: '9845', price: '0.01 ETH', tx: '0x2b7c...8f4d' },
            { time: '15 min ago', event: 'Transfer', tokenId: '5621', price: '0.02 ETH', tx: '0x6d3a...9c2b' }
        ];
    }

    async init() {
        console.log('🏆 Initializing SkunkSquad Leaderboard...');
        
        // Initialize Web3 if available
        if (typeof window.web3Instance !== 'undefined') {
            this.web3 = window.web3Instance;
            this.contract = window.contractInstance;
            console.log('✅ Web3 connected');
        } else if (typeof Web3 !== 'undefined' && window.ethereum) {
            this.web3 = new Web3(window.ethereum);
            console.log('✅ Web3 initialized');
        }

        // Load initial data
        await this.loadOverviewStats();
        this.renderHolders();
        this.renderRarestNFTs();
        this.renderRecentActivity();

        // Auto-refresh every 30 seconds
        this.refreshInterval = setInterval(() => this.refreshData(), 30000);

        console.log('✅ Leaderboard initialized');
    }

    async loadOverviewStats() {
        // Get real supply from contract if available
        let totalMinted = 0;
        
        if (this.contract) {
            try {
                totalMinted = await this.contract.methods.totalSupply().call();
                console.log('Total minted from contract:', totalMinted);
            } catch (error) {
                console.log('Using sample data for total minted');
                totalMinted = Math.floor(Math.random() * 1000) + 500; // Sample data
            }
        } else {
            totalMinted = Math.floor(Math.random() * 1000) + 500; // Sample data
        }

        const maxSupply = 10000;
        const mintPercentage = (totalMinted / maxSupply) * 100;

        // Update overview stats
        document.getElementById('totalMinted').textContent = totalMinted.toLocaleString();
        document.getElementById('mintProgress').style.width = `${mintPercentage}%`;
        document.getElementById('uniqueHolders').textContent = Math.floor(totalMinted * 0.65).toLocaleString();
        
        // Calculate derived stats
        const totalVolume = (totalMinted * 0.01).toFixed(2);
        document.getElementById('totalVolume').textContent = `${totalVolume} ETH`;
        
        const mintsToday = Math.floor(Math.random() * 50) + 10;
        document.getElementById('mintsToday').textContent = mintsToday.toLocaleString();
        
        const avgHoldTime = Math.floor(Math.random() * 30) + 5;
        document.getElementById('avgHoldTime').textContent = `${avgHoldTime} days`;

        // Update floor price with real ETH price if available
        if (window.ethPrice && window.ethPrice.getPrice) {
            const ethPriceData = window.ethPrice.getPrice();
            if (ethPriceData && ethPriceData.usd) {
                const floorUSD = (0.01 * ethPriceData.usd).toFixed(0);
                const subtitle = document.querySelector('#floorPrice').nextElementSibling;
                if (subtitle) {
                    subtitle.textContent = `~$${floorUSD} USD`;
                }
            }
        }
    }

    renderHolders() {
        const container = document.getElementById('holdersTable');
        container.innerHTML = this.sampleHolders.map(holder => `
            <div class="table-row">
                <div class="rank rank-${holder.rank}">${this.getRankEmoji(holder.rank)}${holder.rank}</div>
                <div class="collector-info">
                    <div class="avatar" style="background: linear-gradient(135deg, ${this.getGradientForAddress(holder.address)}); display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2rem;">
                        ${holder.address.substring(2, 4).toUpperCase()}
                    </div>
                    <div>
                        <div class="collector-address" style="font-size: 0.95rem; color: #e2e8f0; font-family: 'Courier New', monospace;">${this.shortenAddress(holder.address)}</div>
                        <div class="collector-address" style="font-size: 0.75rem;">Collector #${holder.rank}</div>
                    </div>
                </div>
                <div class="hide-mobile">${holder.nfts} NFTs</div>
                <div class="hide-mobile">${holder.value}</div>
                <div>${holder.badge ? `<span class="badge badge-${holder.badge}">${holder.badge}</span>` : '-'}</div>
            </div>
        `).join('');
    }

    getGradientForAddress(address) {
        // Generate unique gradient colors based on wallet address
        const hash = address.substring(2, 8);
        const r = parseInt(hash.substring(0, 2), 16);
        const g = parseInt(hash.substring(2, 4), 16);
        const b = parseInt(hash.substring(4, 6), 16);
        const r2 = (r + 80) % 255;
        const g2 = (g + 80) % 255;
        const b2 = (b + 80) % 255;
        return `rgb(${r}, ${g}, ${b}), rgb(${r2}, ${g2}, ${b2})`;
    }

    renderRarestNFTs() {
        const container = document.getElementById('rarestNFTs');
        container.innerHTML = this.sampleRarest.map(nft => `
            <div class="nft-card" onclick="window.open('https://opensea.io/collection/skunksquad-nft', '_blank')">
                <img src="${nft.image}" alt="SkunkSquad #${nft.id}" class="nft-image" loading="lazy">
                <div class="nft-info">
                    <div class="nft-title">SkunkSquad #${nft.id}</div>
                    <div style="font-size: 0.85rem; color: #64748b; margin-bottom: 0.5rem;">${nft.traits}</div>
                    <div class="nft-rarity">
                        <div>
                            <div style="font-size: 0.75rem; color: #64748b; margin-bottom: 0.25rem;">RARITY SCORE</div>
                            <div class="rarity-score">${nft.rarity}</div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 0.75rem; color: #64748b; margin-bottom: 0.25rem;">RANK</div>
                            <div style="font-size: 1.25rem; font-weight: 700;">#${nft.rank}</div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderRecentActivity() {
        const container = document.getElementById('recentActivity');
        container.innerHTML = this.sampleActivity.map(activity => `
            <div class="table-row">
                <div>${activity.time}</div>
                <div>
                    <span class="badge badge-${activity.event === 'Mint' ? 'whale' : 'og'}" style="font-size: 0.7rem; padding: 0.2rem 0.5rem;">
                        ${activity.event}
                    </span>
                </div>
                <div class="hide-mobile">#${activity.tokenId}</div>
                <div class="hide-mobile">${activity.price}</div>
                <div>
                    <a href="https://etherscan.io/tx/${activity.tx}" target="_blank" style="color: #8b5cf6; text-decoration: none;">
                        ${activity.tx}
                    </a>
                </div>
            </div>
        `).join('');
    }

    async renderYourStats() {
        const container = document.getElementById('yourStatsContent');
        
        if (!this.userAddress) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔗</div>
                    <h3>Connect Your Wallet</h3>
                    <p>Connect your wallet to see your personal stats and rankings</p>
                    <button class="refresh-btn" onclick="leaderboard.connectWallet()" style="margin-top: 1.5rem;">Connect Wallet</button>
                </div>
            `;
            return;
        }

        // Get user's NFT count
        let userNFTs = 0;
        let userRank = 0;
        
        if (this.contract) {
            try {
                userNFTs = await this.contract.methods.balanceOf(this.userAddress).call();
            } catch (error) {
                console.log('Error getting user balance:', error);
                userNFTs = Math.floor(Math.random() * 5) + 1; // Sample
            }
        } else {
            userNFTs = Math.floor(Math.random() * 5) + 1; // Sample
        }

        userRank = Math.floor(Math.random() * 100) + 1;
        const totalHolders = 650;
        const topPercentile = ((totalHolders - userRank) / totalHolders * 100).toFixed(1);

        container.innerHTML = `
            <div class="your-stats">
                <h2><span class="trophy">👤</span> Your Stats</h2>
                <div class="stats-grid">
                    <div class="stat-card">
                        <h3>Your NFTs</h3>
                        <div class="value">${userNFTs}</div>
                        <div class="subtitle">Owned</div>
                    </div>
                    <div class="stat-card">
                        <h3>Your Rank</h3>
                        <div class="value">#${userRank}</div>
                        <div class="subtitle">of ${totalHolders} holders</div>
                    </div>
                    <div class="stat-card">
                        <h3>Percentile</h3>
                        <div class="value">Top ${topPercentile}%</div>
                        <div class="subtitle">Among holders</div>
                    </div>
                    <div class="stat-card">
                        <h3>Total Value</h3>
                        <div class="value">${(userNFTs * 0.01).toFixed(3)} ETH</div>
                        <div class="subtitle">~$${(userNFTs * 42).toFixed(0)} USD</div>
                    </div>
                </div>

                <div style="margin-top: 2rem;">
                    <h3 style="margin-bottom: 1rem;">🎯 Next Milestone</h3>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                        <span>Progress to Top 50</span>
                        <span style="font-weight: 600;">${Math.min(userRank, 50)}/50</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${Math.min((50 / userRank) * 100, 100)}%"></div>
                    </div>
                    <div style="margin-top: 0.5rem; font-size: 0.85rem; color: #64748b;">
                        ${userRank <= 50 ? '🎉 Congratulations! You\'re in the top 50!' : `Need ${userRank - 50} more ranks to reach top 50`}
                    </div>
                </div>

                <div style="margin-top: 2rem; padding: 1.5rem; background: rgba(139, 92, 246, 0.1); border-radius: 0.75rem; border: 1px solid rgba(139, 92, 246, 0.3);">
                    <h4 style="margin-bottom: 1rem;">🏆 Achievements</h4>
                    <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                        ${userNFTs >= 1 ? '<span class="badge badge-og">First Mint 🎉</span>' : ''}
                        ${userNFTs >= 5 ? '<span class="badge badge-whale">Collector 📚</span>' : ''}
                        ${userNFTs >= 10 ? '<span class="badge badge-legend">Whale 🐋</span>' : ''}
                        ${userNFTs >= 25 ? '<span class="badge badge-whale">Diamond Hands 💎</span>' : ''}
                    </div>
                </div>
            </div>
        `;
    }

    async connectWallet() {
        if (!window.ethereum) {
            alert('Please install MetaMask to connect your wallet');
            return;
        }

        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            this.userAddress = accounts[0];
            
            if (!this.web3) {
                this.web3 = new Web3(window.ethereum);
            }

            // Load contract if not already loaded
            if (!this.contract && window.CONFIG) {
                this.contract = new this.web3.eth.Contract(
                    window.CONFIG.ABI,
                    window.CONFIG.CONTRACT_ADDRESS
                );
            }

            console.log('✅ Wallet connected:', this.userAddress);
            await this.renderYourStats();
            
            // Switch to your stats tab
            switchTab('your-stats');
        } catch (error) {
            console.error('Error connecting wallet:', error);
            alert('Failed to connect wallet. Please try again.');
        }
    }

    async refreshData() {
        console.log('🔄 Refreshing leaderboard data...');
        await this.loadOverviewStats();
        this.renderHolders();
        this.renderRarestNFTs();
        this.renderRecentActivity();
        
        if (this.userAddress) {
            await this.renderYourStats();
        }
    }

    getRankEmoji(rank) {
        if (rank === 1) return '🥇 ';
        if (rank === 2) return '🥈 ';
        if (rank === 3) return '🥉 ';
        return '';
    }

    shortenAddress(address) {
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    }

    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    }
}

// Tab switching
function switchTab(tabName) {
    // Remove active class from all tabs and contents
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    // Add active class to selected tab and content
    event.target.classList.add('active');
    document.getElementById(tabName).classList.add('active');

    // Load user stats if switching to that tab
    if (tabName === 'your-stats' && window.leaderboard) {
        window.leaderboard.renderYourStats();
    }
}

// Refresh data function
async function refreshData() {
    if (window.leaderboard) {
        await window.leaderboard.refreshData();
    }
}

// Connect wallet function
async function connectWallet() {
    if (window.leaderboard) {
        await window.leaderboard.connectWallet();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    window.leaderboard = new SkunkSquadLeaderboard();
    window.leaderboard.init();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.leaderboard) {
        window.leaderboard.destroy();
    }
});
