const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../skunksquad.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('✅ Connected to SQLite database');
        initializeTables();
    }
});

function initializeTables() {
    // Create badge_definitions table
    db.run(`
        CREATE TABLE IF NOT EXISTS badge_definitions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            icon TEXT,
            category TEXT,
            tier TEXT,
            criteria TEXT,
            points INTEGER DEFAULT 0,
            rarity TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) console.error('Error creating badge_definitions:', err);
        else insertSampleBadges();
    });

    // Create member_badges table
    db.run(`
        CREATE TABLE IF NOT EXISTS member_badges (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            member_id INTEGER NOT NULL,
            badge_id INTEGER NOT NULL,
            earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (badge_id) REFERENCES badge_definitions(id)
        )
    `);

    // Create members table
    db.run(`
        CREATE TABLE IF NOT EXISTS members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            wallet_address TEXT UNIQUE NOT NULL,
            display_name TEXT,
            bio TEXT,
            avatar_url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

function insertSampleBadges() {
    const badges = [
        { name: 'Early Adopter', description: 'One of the first 100 members', icon: '🎯', category: 'achievement', tier: 'bronze', criteria: '{"min_member_number": 100}', points: 50, rarity: 'rare' },
        { name: 'Whale', description: 'Own 5+ NFTs', icon: '🐋', category: 'collection', tier: 'bronze', criteria: '{"min_nfts": 5}', points: 25, rarity: 'epic' },
        { name: 'Diamond Hands', description: 'Held NFTs for 180+ days without selling', icon: '💎', category: 'collection', tier: 'bronze', criteria: '{"min_hold_days": 180}', points: 50, rarity: 'rare' },
        { name: 'Social Butterfly', description: 'Connected with 25+ members', icon: '🦋', category: 'social', tier: 'bronze', criteria: '{"min_connections": 25}', points: 30, rarity: 'rare' },
        { name: 'Influencer', description: 'Twitter verified with 1K+ followers', icon: '📢', category: 'social', tier: 'bronze', criteria: '{"twitter_verified": true, "min_followers": 1000}', points: 100, rarity: 'epic' },
        { name: 'Founder', description: 'Special founder status', icon: '👑', category: 'achievement', tier: 'platinum', criteria: '{"founder": true}', points: 500, rarity: 'legendary' },
        { name: 'Network Builder', description: 'Connected with 10+ members', icon: '🤝', category: 'social', tier: 'bronze', criteria: '{"min_connections": 10}', points: 20, rarity: 'uncommon' },
        { name: 'Event Goer', description: 'Attended 3+ events', icon: '📅', category: 'activity', tier: 'bronze', criteria: '{"min_events": 3}', points: 30, rarity: 'uncommon' },
        { name: 'Content Creator', description: 'Posted 5+ times', icon: '✍️', category: 'activity', tier: 'bronze', criteria: '{"min_posts": 5}', points: 25, rarity: 'uncommon' },
        { name: 'Trade Master', description: 'Completed 50+ trades', icon: '📈', category: 'activity', tier: 'bronze', criteria: '{"min_trades": 50}', points: 75, rarity: 'rare' },
        { name: 'Collector', description: 'Own NFTs from 3+ collections', icon: '🎨', category: 'collection', tier: 'bronze', criteria: '{"min_collections": 3}', points: 40, rarity: 'uncommon' },
        { name: 'Global Citizen', description: 'Visited 5+ countries', icon: '🌍', category: 'social', tier: 'bronze', criteria: '{"min_countries": 5}', points: 60, rarity: 'rare' },
        { name: 'Verified', description: 'Verified ID/KYC', icon: '✓', category: 'achievement', tier: 'bronze', criteria: '{"verified": true}', points: 10, rarity: 'common' },
        { name: 'Active Member', description: 'Active for 90+ days', icon: '⚡', category: 'activity', tier: 'bronze', criteria: '{"min_active_days": 90}', points: 35, rarity: 'uncommon' },
        { name: 'Generous', description: 'Referred 5+ members', icon: '💝', category: 'social', tier: 'bronze', criteria: '{"min_referrals": 5}', points: 45, rarity: 'uncommon' }
    ];

    db.get('SELECT COUNT(*) as count FROM badge_definitions', (err, row) => {
        if (!err && row.count === 0) {
            const stmt = db.prepare(`
                INSERT INTO badge_definitions (name, description, icon, category, tier, criteria, points, rarity)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `);

            badges.forEach(badge => {
                stmt.run([badge.name, badge.description, badge.icon, badge.category, badge.tier, badge.criteria, badge.points, badge.rarity]);
            });

            stmt.finalize(() => {
                console.log('✅ Inserted 15 sample badges');
            });
        }
    });
}

// Promisified query method
function query(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve({ rows });
        });
    });
}

// Run method for INSERT/UPDATE/DELETE
function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
}

module.exports = {
    query,
    run,
    db
};
