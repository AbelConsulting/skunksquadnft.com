const express = require('express');
const cors = require('cors');
const db = require('./config/db-sqlite');
const badgeService = require('./services/badge-service-simple');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get all badges
app.get('/api/badges', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM badge_definitions ORDER BY rarity DESC, points DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching badges:', error);
        res.status(500).json({ error: 'Failed to fetch badges' });
    }
});

// Get badges for a specific member
app.get('/api/badges/my', async (req, res) => {
    try {
        // For demo, use member ID 1 or from query param
        const memberId = parseInt(req.query.memberId) || 1;
        
        const badges = await badgeService.getMemberBadges(memberId);
        res.json(badges);
    } catch (error) {
        console.error('Error fetching member badges:', error);
        res.status(500).json({ error: 'Failed to fetch member badges' });
    }
});

// Check and award badges (auto-award based on current stats)
app.post('/api/badges/check', async (req, res) => {
    try {
        const { memberId = 1, nftCount = 0, connectionCount = 0, verified = false } = req.body;
        
        // Member data for checking
        const memberData = {
            nftCount,
            connectionCount,
            memberNumber: memberId, // Use member ID as member number for demo
            verified
        };
        
        // Check and award badges
        const newBadges = await badgeService.checkAllBadges(memberId, memberData);
        
        res.json({ 
            badges: newBadges,
            message: newBadges.length > 0 
                ? `Awarded ${newBadges.length} new badge(s)!` 
                : 'No new badges at this time'
        });
    } catch (error) {
        console.error('Error checking badges:', error);
        res.status(500).json({ error: 'Failed to check badges' });
    }
});

// Get badge progress for a member
app.get('/api/badges/progress', async (req, res) => {
    try {
        const memberId = parseInt(req.query.memberId) || 1;
        const nftCount = parseInt(req.query.nftCount) || 0;
        const connectionCount = parseInt(req.query.connectionCount) || 0;
        
        const progress = await badgeService.getBadgeProgress(memberId, {
            nftCount,
            connectionCount
        });
        
        res.json(progress);
    } catch (error) {
        console.error('Error fetching badge progress:', error);
        res.status(500).json({ error: 'Failed to fetch badge progress' });
    }
});

// Get leaderboard
app.get('/api/badges/leaderboard', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        
        // Sample leaderboard data
        const leaderboard = [
            { 
                member_id: 1, 
                display_name: 'SkunkMaster', 
                wallet_address: '0x1234...5678',
                badge_count: 8,
                total_points: 285,
                badges: []
            },
            {
                member_id: 2,
                display_name: 'CryptoSkunk',
                wallet_address: '0xabcd...ef01',
                badge_count: 6,
                total_points: 180,
                badges: []
            }
        ];
        
        res.json(leaderboard.slice(0, limit));
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log('');
    console.log('🚀 SkunkSquad Badge Server Started!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📡 Server running on http://localhost:${PORT}`);
    console.log(`💾 Database: SQLite (skunksquad.db)`);
    console.log('');
    console.log('📋 Available Endpoints:');
    console.log(`   GET  /health                     - Health check`);
    console.log(`   GET  /api/badges                 - Get all badges`);
    console.log(`   GET  /api/badges/my              - Get my badges`);
    console.log(`   POST /api/badges/check           - Check & auto-award badges`);
    console.log(`   GET  /api/badges/progress        - Get badge progress`);
    console.log(`   GET  /api/badges/leaderboard     - Get leaderboard`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('✨ Ready to test! Try:');
    console.log(`   http://localhost:${PORT}/api/badges`);
    console.log('');
    console.log('🏆 Auto-Award Example:');
    console.log(`   POST http://localhost:${PORT}/api/badges/check`);
    console.log(`   Body: {"memberId": 1, "nftCount": 5, "connectionCount": 10}`);
    console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});
