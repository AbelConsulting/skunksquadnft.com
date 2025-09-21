const express = require('express');
const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
    console.log("🚀 Starting Simple Analytics Dashboard...\n");

    // Load deployment info
    let deploymentInfo;
    try {
        deploymentInfo = JSON.parse(fs.readFileSync('ultra-smart-deployment.json', 'utf8'));
        console.log("📖 Contract Address:", deploymentInfo.contractAddress);
    } catch (error) {
        console.log("❌ No deployment info found. Please deploy the ultra smart contract first.");
        process.exit(1);
    }

    // Initialize contract
    const contract = await ethers.getContractAt("SkunkSquadNFTUltraSmart", deploymentInfo.contractAddress);
    console.log("✅ Contract connected successfully");

    // Create Express app
    const app = express();
    app.use(express.json());
    app.use(express.static('public'));

    // CORS middleware
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
    });

    // API Routes
    app.get('/', (req, res) => {
        res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>🧠 Ultra Smart NFT Analytics</title>
            <style>
                body { font-family: Arial, sans-serif; background: #1a1a1a; color: white; padding: 20px; }
                .container { max-width: 1200px; margin: 0 auto; }
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 20px 0; }
                .stat-card { background: #2a2a2a; padding: 20px; border-radius: 10px; border: 1px solid #444; }
                .stat-value { font-size: 2em; font-weight: bold; color: #4CAF50; }
                .refresh-btn { background: #4CAF50; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin: 10px 0; }
                .address { font-family: monospace; font-size: 0.9em; color: #888; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🧠 Ultra Smart NFT Analytics Dashboard</h1>
                <div class="address">Contract: ${deploymentInfo.contractAddress}</div>
                <button class="refresh-btn" onclick="loadStats()">🔄 Refresh Data</button>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <h3>📊 Collection Stats</h3>
                        <div id="collection-stats">Loading...</div>
                    </div>
                    
                    <div class="stat-card">
                        <h3>💰 Smart Pricing</h3>
                        <div id="pricing-stats">Loading...</div>
                    </div>
                    
                    <div class="stat-card">
                        <h3>🏆 Achievements</h3>
                        <div id="achievement-stats">Loading...</div>
                    </div>
                    
                    <div class="stat-card">
                        <h3>📈 Revenue</h3>
                        <div id="revenue-stats">Loading...</div>
                    </div>
                </div>
                
                <div class="stat-card">
                    <h3>👤 User Lookup</h3>
                    <input type="text" id="userAddress" placeholder="Enter wallet address" style="width: 300px; padding: 5px; margin: 10px 0;">
                    <button class="refresh-btn" onclick="lookupUser()">🔍 Lookup User</button>
                    <div id="user-stats"></div>
                </div>
            </div>

            <script>
                async function loadStats() {
                    try {
                        const response = await fetch('/api/stats');
                        const stats = await response.json();
                        
                        document.getElementById('collection-stats').innerHTML = \`
                            <div class="stat-value">\${stats.totalSupply}/\${stats.maxSupply}</div>
                            <div>Total Minted (\${stats.mintedPercentage}%)</div>
                            <div>Phase: \${stats.currentPhase}</div>
                            <div>Owner: \${stats.owner.substring(0,8)}...</div>
                        \`;
                        
                        document.getElementById('pricing-stats').innerHTML = \`
                            <div class="stat-value">\${stats.pricing.current} ETH</div>
                            <div>Demand Multiplier: \${stats.pricing.demandMultiplier}%</div>
                            <div>Base Price: \${stats.pricing.base} ETH</div>
                            <div>Range: \${stats.pricing.min} - \${stats.pricing.max} ETH</div>
                        \`;
                        
                        document.getElementById('achievement-stats').innerHTML = \`
                            <div class="stat-value">\${stats.achievements || 10}</div>
                            <div>Total Achievements Available</div>
                            <div>XP Rewards Active</div>
                            <div>Social Features Enabled</div>
                        \`;
                        
                        document.getElementById('revenue-stats').innerHTML = \`
                            <div class="stat-value">\${stats.revenue.total} ETH</div>
                            <div>Total Revenue Generated</div>
                            <div>Smart Pricing Active</div>
                            <div>Analytics Tracking</div>
                        \`;
                        
                    } catch (error) {
                        console.error('Failed to load stats:', error);
                    }
                }
                
                async function lookupUser() {
                    const address = document.getElementById('userAddress').value;
                    if (!address) return;
                    
                    try {
                        const response = await fetch(\`/api/user/\${address}\`);
                        const user = await response.json();
                        
                        document.getElementById('user-stats').innerHTML = \`
                            <h4>User: \${address.substring(0,8)}...</h4>
                            <div>NFTs Owned: \${user.balance}</div>
                            <div>Total Minted: \${user.analytics.totalMinted}</div>
                            <div>Total Spent: \${user.analytics.totalSpent} ETH</div>
                            <div>XP Points: \${user.analytics.xpPoints}</div>
                            <div>Referrals: \${user.analytics.referralCount}</div>
                            <div>Loyalty Score: \${user.pattern.loyaltyScore}%</div>
                            <div>Whale Status: \${user.pattern.isWhale ? 'Yes' : 'No'}</div>
                            <div>Achievements: \${user.achievements.length}</div>
                        \`;
                        
                    } catch (error) {
                        document.getElementById('user-stats').innerHTML = 'Error loading user data';
                        console.error('Failed to load user:', error);
                    }
                }
                
                // Auto-refresh every 30 seconds
                setInterval(loadStats, 30000);
                loadStats(); // Initial load
            </script>
        </body>
        </html>
        `);
    });

    // Stats API
    app.get('/api/stats', async (req, res) => {
        try {
            const totalSupply = await contract.totalSupply();
            const maxSupply = await contract.MAX_SUPPLY();
            const currentPhase = await contract.currentPhase();
            const smartPrice = await contract.getCurrentSmartPrice();
            const dynamicPricing = await contract.dynamicPricing();
            const totalRevenue = await contract.totalRevenue();
            const owner = await contract.owner();

            res.json({
                totalSupply: totalSupply.toString(),
                maxSupply: maxSupply.toString(),
                mintedPercentage: (Number(totalSupply) / Number(maxSupply) * 100).toFixed(2),
                currentPhase: ['CLOSED', 'PRESALE', 'WHITELIST', 'PUBLIC'][currentPhase],
                owner: owner,
                pricing: {
                    current: ethers.utils.formatEther(smartPrice),
                    base: ethers.utils.formatEther(dynamicPricing.basePriceETH),
                    demandMultiplier: dynamicPricing.demandMultiplier.toString(),
                    min: ethers.utils.formatEther(dynamicPricing.minPrice),
                    max: ethers.utils.formatEther(dynamicPricing.maxPrice)
                },
                revenue: {
                    total: ethers.utils.formatEther(totalRevenue)
                },
                achievements: 10,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // User lookup API
    app.get('/api/user/:address', async (req, res) => {
        try {
            const { address } = req.params;
            
            if (!ethers.utils.isAddress(address)) {
                return res.status(400).json({ error: 'Invalid address' });
            }

            const analytics = await contract.getUserAnalytics(address);
            const pattern = await contract.getUserPattern(address);
            const balance = await contract.balanceOf(address);
            const achievements = await contract.getAchievements(address);

            res.json({
                address,
                balance: balance.toString(),
                analytics: {
                    totalMinted: analytics.totalMinted.toString(),
                    totalSpent: ethers.utils.formatEther(analytics.totalSpent),
                    xpPoints: analytics.xpPoints.toString(),
                    referralCount: analytics.referralCount.toString(),
                    firstMintTime: analytics.firstMintTime.toString(),
                    lastMintTime: analytics.lastMintTime.toString()
                },
                pattern: {
                    preferredTimeOfDay: pattern.preferredTimeOfDay.toString(),
                    averageQuantity: pattern.averageQuantity.toString(),
                    isWhale: pattern.isWhale,
                    loyaltyScore: pattern.loyaltyScore.toString()
                },
                achievements: achievements.map(id => id.toString())
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Start server
    const port = 3001;
    app.listen(port, () => {
        console.log("🌐 Analytics dashboard running!");
        console.log(`📊 Dashboard: http://localhost:${port}`);
        console.log(`🔌 API Stats: http://localhost:${port}/api/stats`);
        console.log(`👤 API User: http://localhost:${port}/api/user/ADDRESS`);
        console.log("\n💡 Features Available:");
        console.log("   • Real-time contract statistics");
        console.log("   • Smart pricing monitoring");
        console.log("   • User analytics lookup");
        console.log("   • Achievement tracking");
        console.log("   • Revenue analytics");
        console.log("\n🎯 Your Ultra Smart Contract is ready!");
        console.log(`📍 Contract: ${deploymentInfo.contractAddress}`);
        console.log("🚀 Visit the dashboard to see your smart features in action!");
    });

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

module.exports = main;