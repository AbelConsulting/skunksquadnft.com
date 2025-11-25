// Dashboard Configuration
const CONFIG = {
    CONTRACT_ADDRESS: '0xAa5C50099bEb130c8988324A0F6Ebf65979f10EF',
    INFURA_URL: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY', // Replace with actual key
    MAX_SUPPLY: 10000,
    MINT_PRICE: 0.01,
    REFRESH_INTERVAL: 30000, // 30 seconds
    COINGECKO_API: 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true'
};

// Contract ABI (minimal for dashboard needs)
const CONTRACT_ABI = [
    {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "MAX_SUPPLY",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "PRICE",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "revealed",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [{"internalType": "address", "name": "", "type": "address"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    }
];

// Global variables
let web3;
let contract;
let ethPrice = 0;
let refreshTimer;
let mintingChart;

// Initialize dashboard
async function initDashboard() {
    try {
        updateStatus('Connecting to Ethereum...', 'warning');
        
        // Try to use MetaMask if available, otherwise use Infura
        if (typeof window.ethereum !== 'undefined') {
            web3 = new Web3(window.ethereum);
            updateStatus('Connected via MetaMask', 'success');
        } else {
            // Fallback to public RPC
            web3 = new Web3('https://eth.llamarpc.com');
            updateStatus('Connected to Ethereum', 'success');
        }
        
        // Initialize contract
        contract = new web3.eth.Contract(CONTRACT_ABI, CONFIG.CONTRACT_ADDRESS);
        
        // Load all data
        await loadAllData();
        
        // Set up auto-refresh
        setupAutoRefresh();
        
    } catch (error) {
        console.error('Dashboard initialization error:', error);
        updateStatus('Connection Error', 'error');
    }
}

// Load all dashboard data
async function loadAllData() {
    try {
        await Promise.all([
            loadContractData(),
            loadNetworkData(),
            loadETHPrice(),
            loadRecentActivity()
        ]);
        
        updateLastUpdate();
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Load contract data
async function loadContractData() {
    try {
        // Get total supply
        const totalSupply = await contract.methods.totalSupply().call();
        const supplyNum = parseInt(totalSupply);
        
        // Update metrics
        updateElement('totalMinted', supplyNum.toLocaleString());
        updateElement('mintedCount', supplyNum.toLocaleString());
        updateElement('remainingCount', (CONFIG.MAX_SUPPLY - supplyNum).toLocaleString());
        
        // Calculate percentage
        const percentage = (supplyNum / CONFIG.MAX_SUPPLY) * 100;
        updateElement('mintProgress', percentage.toFixed(2));
        updateElement('supplyPercentage', percentage.toFixed(1) + '%');
        
        // Update progress ring
        updateProgressRing(percentage);
        
        // Calculate revenue
        const revenue = (supplyNum * CONFIG.MINT_PRICE).toFixed(2);
        updateElement('totalRevenue', revenue + ' ETH');
        
        if (ethPrice > 0) {
            const revenueUSD = (revenue * ethPrice).toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            });
            updateElement('revenueUSD', '≈ ' + revenueUSD);
        }
        
        // Get revealed status
        try {
            const revealed = await contract.methods.revealed().call();
            updateElement('revealedStatus', revealed ? '✅ Revealed' : '🔒 Not Revealed');
        } catch (e) {
            updateElement('revealedStatus', 'N/A');
        }
        
        // Get contract owner
        try {
            const owner = await contract.methods.owner().call();
            updateElement('contractOwner', formatAddress(owner));
        } catch (e) {
            updateElement('contractOwner', 'N/A');
        }
        
        // Estimate unique holders (simplified - actual would need event logs)
        const estimatedHolders = Math.floor(supplyNum * 0.65); // Rough estimate
        updateElement('uniqueHolders', estimatedHolders.toLocaleString());
        
        // Get mint price from contract
        try {
            const price = await contract.methods.PRICE().call();
            const priceEth = web3.utils.fromWei(price, 'ether');
            updateElement('mintPrice', priceEth + ' ETH');
        } catch (e) {
            updateElement('mintPrice', CONFIG.MINT_PRICE + ' ETH');
        }
        
    } catch (error) {
        console.error('Error loading contract data:', error);
        updateElement('totalMinted', 'Error loading');
    }
}

// Load network data
async function loadNetworkData() {
    try {
        // Get current block number
        const blockNumber = await web3.eth.getBlockNumber();
        updateElement('blockNumber', blockNumber.toLocaleString());
        
        // Get gas price
        const gasPrice = await web3.eth.getGasPrice();
        const gasPriceGwei = web3.utils.fromWei(gasPrice, 'gwei');
        updateElement('gasPrice', parseFloat(gasPriceGwei).toFixed(2) + ' Gwei');
        
    } catch (error) {
        console.error('Error loading network data:', error);
    }
}

// Load ETH price from CoinGecko
async function loadETHPrice() {
    try {
        const response = await fetch(CONFIG.COINGECKO_API);
        const data = await response.json();
        
        ethPrice = data.ethereum.usd;
        const change24h = data.ethereum.usd_24h_change;
        
        const formattedPrice = ethPrice.toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        
        updateElement('ethPrice', formattedPrice);
        
        const changeText = change24h >= 0 
            ? `+${change24h.toFixed(2)}%` 
            : `${change24h.toFixed(2)}%`;
        const changeColor = change24h >= 0 ? '#10b981' : '#ef4444';
        
        const ethChangeEl = document.getElementById('ethChange');
        if (ethChangeEl) {
            ethChangeEl.textContent = changeText + ' (24h)';
            ethChangeEl.style.color = changeColor;
        }
        
    } catch (error) {
        console.error('Error loading ETH price:', error);
        updateElement('ethPrice', 'N/A');
    }
}

// Load recent minting activity
async function loadRecentActivity() {
    try {
        const activityContainer = document.getElementById('recentActivity');
        
        // Get recent Transfer events (mints are transfers from 0x0)
        const latestBlock = await web3.eth.getBlockNumber();
        const fromBlock = Math.max(0, latestBlock - 5000); // Last ~5000 blocks
        
        const events = await contract.getPastEvents('Transfer', {
            filter: { from: '0x0000000000000000000000000000000000000000' },
            fromBlock: fromBlock,
            toBlock: 'latest'
        });
        
        // Get last 10 mints
        const recentMints = events.slice(-10).reverse();
        
        if (recentMints.length === 0) {
            activityContainer.innerHTML = '<div class="activity-loading">No recent minting activity found</div>';
            return;
        }
        
        // Build activity list
        let html = '';
        for (const event of recentMints) {
            const tokenId = event.returnValues.tokenId;
            const to = event.returnValues.to;
            const blockNumber = event.blockNumber;
            
            // Get block timestamp
            let timeAgo = 'Recently';
            try {
                const block = await web3.eth.getBlock(blockNumber);
                const timestamp = block.timestamp * 1000;
                timeAgo = getTimeAgo(timestamp);
            } catch (e) {
                // Skip if can't get block
            }
            
            html += `
                <div class="activity-item">
                    <span class="activity-icon">🎨</span>
                    <div class="activity-details">
                        <div class="activity-title">NFT #${tokenId} Minted</div>
                        <div class="activity-subtitle">To: ${formatAddress(to)}</div>
                    </div>
                    <div class="activity-time">${timeAgo}</div>
                </div>
            `;
        }
        
        activityContainer.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading recent activity:', error);
        const activityContainer = document.getElementById('recentActivity');
        activityContainer.innerHTML = '<div class="activity-loading">Unable to load recent activity</div>';
    }
}

// Update progress ring
function updateProgressRing(percentage) {
    const ring = document.getElementById('supplyProgressRing');
    if (!ring) return;
    
    const radius = 90;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    
    ring.style.strokeDasharray = `${circumference} ${circumference}`;
    ring.style.strokeDashoffset = offset;
}

// Load top holders (simplified version - would need full event analysis for accurate data)
async function loadTopHolders() {
    const tbody = document.getElementById('holdersTableBody');
    
    // For a real implementation, you'd need to:
    // 1. Get all Transfer events
    // 2. Build a holder map
    // 3. Sort by balance
    // This is a placeholder showing how it would display
    
    const sampleHolders = [
        { address: '0x742d35Cc6634C0532925a3b8...', balance: 47, percentage: 0.47 },
        { address: '0x9f59b5e4f1b8d7c3a2e6f1d8...', balance: 32, percentage: 0.32 },
        { address: '0x3a7c8b2d1e4f5a6b9c0d1e2f...', balance: 28, percentage: 0.28 },
        { address: '0x1f2e3d4c5b6a7980f1e2d3c4...', balance: 21, percentage: 0.21 },
        { address: '0x8d9e0f1a2b3c4d5e6f708192...', balance: 19, percentage: 0.19 },
    ];
    
    let html = '';
    sampleHolders.forEach((holder, index) => {
        html += `
            <tr>
                <td>${index + 1}</td>
                <td><code>${holder.address}</code></td>
                <td>${holder.balance}</td>
                <td>${holder.percentage}%</td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// Create minting history chart
function createMintingChart() {
    const ctx = document.getElementById('mintingChart');
    if (!ctx) return;
    
    // Sample data - in production, this would come from blockchain events
    const labels = [];
    const data = [];
    
    // Generate last 30 days
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        
        // Simulated minting activity
        data.push(Math.floor(Math.random() * 150) + 50);
    }
    
    mintingChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'NFTs Minted',
                data: data,
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: '#8b5cf6',
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(22, 33, 62, 0.95)',
                    titleColor: '#e2e8f0',
                    bodyColor: '#e2e8f0',
                    borderColor: '#8b5cf6',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return 'Minted: ' + context.parsed.y + ' NFTs';
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(51, 65, 85, 0.5)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#94a3b8',
                        maxRotation: 45,
                        minRotation: 45
                    }
                },
                y: {
                    grid: {
                        color: 'rgba(51, 65, 85, 0.5)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#94a3b8',
                        callback: function(value) {
                            return value;
                        }
                    },
                    beginAtZero: true
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

// Utility functions
function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.innerHTML = value;
    }
}

function formatAddress(address) {
    if (!address || address.length < 10) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

function getTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

function updateLastUpdate() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    updateElement('lastUpdate', timeString);
}

function updateStatus(message, type = 'success') {
    const statusEl = document.querySelector('.status-text');
    const dotEl = document.querySelector('.status-dot');
    
    if (statusEl) {
        statusEl.textContent = message;
    }
    
    if (dotEl) {
        dotEl.style.background = type === 'success' ? 'var(--success)' : 
                                 type === 'warning' ? 'var(--warning)' : 
                                 'var(--error)';
    }
}

// Copy to clipboard
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const text = element.textContent;
    navigator.clipboard.writeText(text).then(() => {
        // Show temporary feedback
        const originalText = element.innerHTML;
        element.innerHTML = '✓ Copied!';
        element.style.color = 'var(--success)';
        
        setTimeout(() => {
            element.innerHTML = originalText;
            element.style.color = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
    });
}

// Auto-refresh setup
function setupAutoRefresh() {
    if (refreshTimer) {
        clearInterval(refreshTimer);
    }
    
    refreshTimer = setInterval(() => {
        loadAllData();
    }, CONFIG.REFRESH_INTERVAL);
}

// Manual refresh
function manualRefresh() {
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.style.animation = 'none';
        setTimeout(() => {
            refreshBtn.style.animation = '';
        }, 10);
    }
    
    loadAllData();
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
    
    // Load top holders
    loadTopHolders();
    
    // Create minting chart
    createMintingChart();
    
    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', manualRefresh);
    }
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    if (refreshTimer) {
        clearInterval(refreshTimer);
    }
});

// Make copyToClipboard available globally
window.copyToClipboard = copyToClipboard;
