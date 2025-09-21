const express = require('express');
const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

class SmartContractAnalytics {
    constructor(contractAddress, network = 'sepolia') {
        this.contractAddress = contractAddress;
        this.networ        // Listen for mints
        this.contract.on("Transfer", (from, to, tokenId) => {
            if (from === ethers.constants.AddressZero) {
                console.log(`🎉 New mint: Token ${tokenId.toString()} → ${to}`);
                this.broadcastEvent('mint', { tokenId: tokenId.toString(), to });
            }
        });work;
        this.contract = null;
        this.app = express();
        this.port = 3001;
        
        this.setupExpress();
    }

    async initialize() {
        console.log("🚀 Initializing Smart Contract Analytics...");
        
        try {
            this.contract = await ethers.getContractAt("SkunkSquadNFTUltraSmart", this.contractAddress);
            console.log("✅ Contract connected:", this.contractAddress);
            
            // Setup event listeners after contract is initialized
            await this.setupEventListeners();
            
        } catch (error) {
            console.error("❌ Failed to initialize:", error.message);
            throw error;
        }
    }

    setupExpress() {
        this.app.use(express.json());
        this.app.use(express.static('public'));
        
        // CORS middleware
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            next();
        });

        // API Routes
        this.setupRoutes();
    }

    setupRoutes() {
        // Dashboard homepage
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, '../dashboard/index.html'));
        });

        // Real-time contract stats
        this.app.get('/api/stats', async (req, res) => {
            try {
                const stats = await this.getContractStats();
                res.json(stats);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // User analytics
        this.app.get('/api/user/:address', async (req, res) => {
            try {
                const userStats = await this.getUserStats(req.params.address);
                res.json(userStats);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Dynamic pricing data
        this.app.get('/api/pricing', async (req, res) => {
            try {
                const pricingData = await this.getPricingData();
                res.json(pricingData);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Analytics trends
        this.app.get('/api/trends', async (req, res) => {
            try {
                const trends = await this.getTrends();
                res.json(trends);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Leaderboard
        this.app.get('/api/leaderboard', async (req, res) => {
            try {
                const leaderboard = await this.getLeaderboard();
                res.json(leaderboard);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });

        // Live events
        this.app.get('/api/events', async (req, res) => {
            try {
                const events = await this.getRecentEvents();
                res.json(events);
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        });
    }

    async getContractStats() {
        const totalSupply = await this.contract.totalSupply();
        const maxSupply = await this.contract.MAX_SUPPLY();
        const currentPhase = await this.contract.currentPhase();
        const smartPrice = await this.contract.getCurrentSmartPrice();
        const dynamicPricing = await this.contract.dynamicPricing();
        const totalRevenue = await this.contract.totalRevenue();

        return {
            totalSupply: totalSupply.toString(),
            maxSupply: maxSupply.toString(),
            mintedPercentage: (Number(totalSupply) / Number(maxSupply) * 100).toFixed(2),
            currentPhase: this.getPhaseString(currentPhase),
            pricing: {
                current: ethers.utils.formatEther(smartPrice),
                base: ethers.utils.formatEther(dynamicPricing.basePriceETH),
                demandMultiplier: dynamicPricing.demandMultiplier.toString(),
                min: ethers.utils.formatEther(dynamicPricing.minPrice),
                max: ethers.utils.formatEther(dynamicPricing.maxPrice)
            },
            revenue: {
                total: ethers.utils.formatEther(totalRevenue),
                totalWei: totalRevenue.toString()
            },
            timestamp: new Date().toISOString()
        };
    }

    async getUserStats(address) {
        if (!ethers.isAddress(address)) {
            throw new Error("Invalid address");
        }

        const analytics = await this.contract.getUserAnalytics(address);
        const pattern = await this.contract.getUserPattern(address);
        const balance = await this.contract.balanceOf(address);
        const prediction = await this.contract.getPredictedNextMint(address);
        const achievements = await this.contract.getAchievements(address);

        return {
            address,
            balance: balance.toString(),
            analytics: {
                totalMinted: analytics.totalMinted.toString(),
                totalSpent: ethers.utils.formatEther(analytics.totalSpent),
                xpPoints: analytics.xpPoints.toString(),
                referralCount: analytics.referralCount.toString(),
                referralEarnings: analytics.referralEarnings.toString(),
                firstMintTime: analytics.firstMintTime.toString(),
                lastMintTime: analytics.lastMintTime.toString()
            },
            pattern: {
                preferredTimeOfDay: pattern.preferredTimeOfDay.toString(),
                averageQuantity: pattern.averageQuantity.toString(),
                isWhale: pattern.isWhale,
                loyaltyScore: pattern.loyaltyScore.toString()
            },
            prediction: {
                nextMint: prediction.toString(),
                nextMintDate: prediction > 0 ? new Date(Number(prediction) * 1000).toISOString() : null
            },
            achievements: achievements.map(id => id.toString())
        };
    }

    async getPricingData() {
        const smartPrice = await this.contract.getCurrentSmartPrice();
        const dynamicPricing = await this.contract.dynamicPricing();
        
        // Get hourly mint data for the last 24 hours
        const currentHour = Math.floor(Date.now() / 1000 / 3600);
        const hourlyData = [];
        
        for (let i = 23; i >= 0; i--) {
            const hour = currentHour - i;
            const mints = await this.contract.getHourlyMints(hour);
            hourlyData.push({
                hour: hour % 24,
                mints: mints.toString(),
                timestamp: (hour * 3600) * 1000
            });
        }

        return {
            current: {
                price: ethers.utils.formatEther(smartPrice),
                priceWei: smartPrice.toString(),
                demandMultiplier: dynamicPricing.demandMultiplier.toString(),
                lastUpdate: dynamicPricing.lastUpdateTime.toString()
            },
            bounds: {
                min: ethers.utils.formatEther(dynamicPricing.minPrice),
                max: ethers.utils.formatEther(dynamicPricing.maxPrice),
                base: ethers.utils.formatEther(dynamicPricing.basePriceETH)
            },
            hourlyMints: hourlyData
        };
    }

    async getTrends() {
        // Get daily revenue for the last 30 days
        const currentDay = Math.floor(Date.now() / 1000 / 86400);
        const dailyRevenue = [];
        
        for (let i = 29; i >= 0; i--) {
            const day = currentDay - i;
            const revenue = await this.contract.getDailyRevenue(day);
            dailyRevenue.push({
                day,
                revenue: ethers.utils.formatEther(revenue),
                revenueWei: revenue.toString(),
                date: new Date(day * 86400 * 1000).toISOString().split('T')[0]
            });
        }

        return {
            dailyRevenue,
            summary: {
                totalDays: 30,
                averageDaily: dailyRevenue.reduce((sum, day) => sum + parseFloat(day.revenue), 0) / 30,
                highestDay: Math.max(...dailyRevenue.map(day => parseFloat(day.revenue)))
            }
        };
    }

    async getLeaderboard() {
        // Note: This is a simplified version. In production, you'd want to
        // maintain an off-chain database for better performance
        
        return {
            topCollectors: [
                // This would be populated from events or off-chain indexing
                { rank: 1, address: "0x...", balance: "25", xp: "2500" },
                { rank: 2, address: "0x...", balance: "18", xp: "1800" },
                { rank: 3, address: "0x...", balance: "12", xp: "1200" }
            ],
            topReferrers: [
                { rank: 1, address: "0x...", referrals: "15", earnings: "0.15" },
                { rank: 2, address: "0x...", referrals: "10", earnings: "0.10" },
                { rank: 3, address: "0x...", referrals: "8", earnings: "0.08" }
            ],
            topXP: [
                { rank: 1, address: "0x...", xp: "5000" },
                { rank: 2, address: "0x...", xp: "3500" },
                { rank: 3, address: "0x...", xp: "2800" }
            ]
        };
    }

    async getRecentEvents() {
        // This would typically query event logs
        // For now, return mock data
        return [
            {
                type: "mint",
                user: "0x123...",
                quantity: 2,
                price: "0.02",
                timestamp: Date.now() - 300000
            },
            {
                type: "achievement",
                user: "0x456...",
                achievement: "First Mint",
                xp: 50,
                timestamp: Date.now() - 600000
            },
            {
                type: "referral",
                referrer: "0x789...",
                referred: "0xabc...",
                bonus: 10,
                timestamp: Date.now() - 900000
            }
        ];
    }

    async setupEventListeners() {
        if (!this.contract) {
            console.log("⚠️ Contract not initialized, skipping event listeners");
            return;
        }
        
        console.log("🎧 Setting up event listeners...");

        try {
            // Listen for mints
            this.contract.on("Transfer", (from, to, tokenId) => {
                if (from === ethers.constants.AddressZero) {
                    console.log(`🎉 New mint: Token ${tokenId.toString()} → ${to}`);
                    this.broadcastEvent('mint', { tokenId: tokenId.toString(), to });
                }
            });

            // Listen for XP awards
            this.contract.on("XPAwarded", (user, amount, reason) => {
                console.log(`⭐ XP Awarded: ${amount} to ${user} for ${reason}`);
                this.broadcastEvent('xp', { user, amount: amount.toString(), reason });
            });

            // Listen for achievements
            this.contract.on("AchievementUnlocked", (user, achievementId, name) => {
                console.log(`🏆 Achievement unlocked: ${name} by ${user}`);
                this.broadcastEvent('achievement', { user, achievementId: achievementId.toString(), name });
            });

            // Listen for price changes
            this.contract.on("DynamicPriceUpdated", (oldPrice, newPrice, demandMultiplier) => {
                console.log(`💰 Price updated: ${ethers.utils.formatEther(oldPrice)} → ${ethers.utils.formatEther(newPrice)} ETH`);
                this.broadcastEvent('price', { 
                    oldPrice: ethers.utils.formatEther(oldPrice), 
                    newPrice: ethers.utils.formatEther(newPrice),
                    demandMultiplier: demandMultiplier.toString()
                });
            });
            
            console.log("✅ Event listeners setup complete");
        } catch (error) {
            console.error("❌ Failed to setup event listeners:", error.message);
        }
    }

    broadcastEvent(type, data) {
        // In a real application, you'd use WebSockets or Server-Sent Events
        console.log(`📡 Broadcasting ${type} event:`, data);
    }

    getPhaseString(phase) {
        const phases = ['CLOSED', 'PRESALE', 'WHITELIST', 'PUBLIC'];
        return phases[phase] || 'UNKNOWN';
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`🌐 Analytics dashboard running at http://localhost:${this.port}`);
            console.log(`📊 API endpoints available at http://localhost:${this.port}/api/`);
        });
    }
}

// Dashboard HTML template
const dashboardHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SkunkSquad Ultra Smart Analytics</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #1a1a1a; color: white; }
        .header { text-align: center; margin-bottom: 30px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .stat-card { background: #2a2a2a; padding: 20px; border-radius: 10px; border: 1px solid #444; }
        .stat-value { font-size: 2em; font-weight: bold; color: #4CAF50; }
        .chart-container { margin: 20px 0; }
        .live-events { max-height: 300px; overflow-y: auto; }
        .event-item { padding: 10px; margin: 5px 0; background: #333; border-radius: 5px; }
        .refresh-btn { background: #4CAF50; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧠 SkunkSquad Ultra Smart Analytics</h1>
        <button class="refresh-btn" onclick="loadData()">🔄 Refresh Data</button>
    </div>
    
    <div class="stats-grid">
        <div class="stat-card">
            <h3>📊 Collection Stats</h3>
            <div id="collection-stats">Loading...</div>
        </div>
        
        <div class="stat-card">
            <h3>💰 Dynamic Pricing</h3>
            <div id="pricing-stats">Loading...</div>
        </div>
        
        <div class="stat-card">
            <h3>📈 Revenue Trends</h3>
            <canvas id="revenue-chart" width="400" height="200"></canvas>
        </div>
        
        <div class="stat-card">
            <h3>🎯 Hourly Mints</h3>
            <canvas id="mints-chart" width="400" height="200"></canvas>
        </div>
    </div>
    
    <div class="stat-card">
        <h3>🔴 Live Events</h3>
        <div id="live-events" class="live-events">Loading...</div>
    </div>

    <script>
        async function loadData() {
            try {
                // Load stats
                const stats = await fetch('/api/stats').then(r => r.json());
                document.getElementById('collection-stats').innerHTML = \`
                    <div class="stat-value">\${stats.totalSupply}/\${stats.maxSupply}</div>
                    <div>Minted (\${stats.mintedPercentage}%)</div>
                    <div>Phase: \${stats.currentPhase}</div>
                    <div>Revenue: \${stats.revenue.total} ETH</div>
                \`;
                
                // Load pricing
                const pricing = await fetch('/api/pricing').then(r => r.json());
                document.getElementById('pricing-stats').innerHTML = \`
                    <div class="stat-value">\${pricing.current.price} ETH</div>
                    <div>Demand: \${pricing.current.demandMultiplier}%</div>
                    <div>Range: \${pricing.bounds.min} - \${pricing.bounds.max} ETH</div>
                \`;
                
                // Load trends and create charts
                const trends = await fetch('/api/trends').then(r => r.json());
                createRevenueChart(trends.dailyRevenue);
                createMintsChart(pricing.hourlyMints);
                
                // Load events
                const events = await fetch('/api/events').then(r => r.json());
                document.getElementById('live-events').innerHTML = events.map(event => \`
                    <div class="event-item">
                        <strong>\${event.type.toUpperCase()}</strong> - \${event.user.substring(0, 8)}... 
                        - \${new Date(event.timestamp).toLocaleTimeString()}
                    </div>
                \`).join('');
                
            } catch (error) {
                console.error('Failed to load data:', error);
            }
        }
        
        function createRevenueChart(data) {
            const ctx = document.getElementById('revenue-chart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.map(d => d.date),
                    datasets: [{
                        label: 'Daily Revenue (ETH)',
                        data: data.map(d => parseFloat(d.revenue)),
                        borderColor: '#4CAF50',
                        tension: 0.1
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }
        
        function createMintsChart(data) {
            const ctx = document.getElementById('mints-chart').getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: data.map(d => d.hour + ':00'),
                    datasets: [{
                        label: 'Hourly Mints',
                        data: data.map(d => parseInt(d.mints)),
                        backgroundColor: '#2196F3'
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }
        
        // Auto-refresh every 30 seconds
        setInterval(loadData, 30000);
        
        // Initial load
        loadData();
    </script>
</body>
</html>
`;

// Main execution function
async function main() {
    console.log("🚀 Starting Smart Contract Analytics Dashboard...\n");

    // Load deployment info
    let deploymentInfo;
    try {
        deploymentInfo = JSON.parse(fs.readFileSync('ultra-smart-deployment.json', 'utf8'));
    } catch (error) {
        console.log("❌ No deployment info found. Please deploy the ultra smart contract first.");
        process.exit(1);
    }

    // Create dashboard directory and HTML file
    const dashboardDir = path.join(__dirname, '../dashboard');
    if (!fs.existsSync(dashboardDir)) {
        fs.mkdirSync(dashboardDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(dashboardDir, 'index.html'), dashboardHTML);

    // Initialize analytics
    const analytics = new SmartContractAnalytics(deploymentInfo.contractAddress);
    await analytics.initialize();
    
    analytics.start();
    
    console.log("📊 Analytics Features:");
    console.log("   • Real-time contract statistics");
    console.log("   • Dynamic pricing monitoring");
    console.log("   • User analytics and patterns");
    console.log("   • Revenue and mint tracking");
    console.log("   • Live event streaming");
    console.log("   • Achievement monitoring");
    console.log("   • Referral tracking");
    
    console.log("\n🌐 Dashboard URLs:");
    console.log("   Main Dashboard: http://localhost:3001");
    console.log("   API Stats: http://localhost:3001/api/stats");
    console.log("   API Pricing: http://localhost:3001/api/pricing");
    console.log("   API Trends: http://localhost:3001/api/trends");
    
    console.log("\n💡 Pro Tips:");
    console.log("   • Dashboard auto-refreshes every 30 seconds");
    console.log("   • All API endpoints return JSON data");
    console.log("   • Events are logged to console in real-time");
    console.log("   • Use Ctrl+C to stop the dashboard");
    
    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log("\n👋 Shutting down analytics dashboard...");
        process.exit(0);
    });
}

if (require.main === module) {
    main().catch((error) => {
        console.error("❌ Analytics dashboard failed:", error);
        process.exit(1);
    });
}

module.exports = { SmartContractAnalytics, main };