const express = require('express');
const cors = require('cors');
const db = require('./config/db-sqlite');

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
        // For now, return sample earned badges
        // In production, this would check authentication and query member_badges
        const result = await db.query(`
            SELECT bd.* FROM badge_definitions bd
            LIMIT 3
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching member badges:', error);
        res.status(500).json({ error: 'Failed to fetch member badges' });
    }
});

// Check and award badges (simplified for testing)
app.post('/api/badges/check', async (req, res) => {
    try {
        // For testing, return empty array (no new badges)
        // In production, this would check criteria and award badges
        res.json({ badges: [], message: 'No new badges at this time' });
    } catch (error) {
        console.error('Error checking badges:', error);
        res.status(500).json({ error: 'Failed to check badges' });
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
    console.log(`   POST /api/badges/check           - Check for new badges`);
    console.log(`   GET  /api/badges/leaderboard     - Get leaderboard`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('✨ Ready to test! Try:');
    console.log(`   http://localhost:${PORT}/api/badges`);
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
