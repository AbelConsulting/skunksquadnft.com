-- Badge System Tables for SkunkSquad

-- Badge definitions
CREATE TABLE IF NOT EXISTS badges (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    icon VARCHAR(10) NOT NULL, -- emoji icon
    category VARCHAR(50) NOT NULL, -- 'collection', 'social', 'activity', 'achievement'
    rarity VARCHAR(20) DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
    criteria JSONB NOT NULL, -- conditions to earn badge
    points INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Member badges (earned badges)
CREATE TABLE IF NOT EXISTS member_badges (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    badge_id INTEGER REFERENCES badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    progress INTEGER DEFAULT 100, -- percentage complete (for progressive badges)
    metadata JSONB, -- additional data like "earned at mint #1234"
    UNIQUE(member_id, badge_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_member_badges_member ON member_badges(member_id);
CREATE INDEX IF NOT EXISTS idx_member_badges_earned ON member_badges(earned_at DESC);
CREATE INDEX IF NOT EXISTS idx_badges_category ON badges(category);
CREATE INDEX IF NOT EXISTS idx_badges_rarity ON badges(rarity);

-- Insert badge definitions
INSERT INTO badges (name, description, icon, category, rarity, criteria, points) VALUES
-- Collection Badges
('First Skunk', 'Minted your first SkunkSquad NFT', '🦨', 'collection', 'common', '{"type": "nft_count", "min": 1}', 10),
('Diamond Hands', 'Own 3+ SkunkSquad NFTs', '💎', 'collection', 'rare', '{"type": "nft_count", "min": 3}', 25),
('Whale Status', 'Own 5+ SkunkSquad NFTs', '🐋', 'collection', 'epic', '{"type": "nft_count", "min": 5}', 50),
('Legendary Collector', 'Own 10+ SkunkSquad NFTs', '👑', 'collection', 'legendary', '{"type": "nft_count", "min": 10}', 100),
('Ultra Rare Hunter', 'Own an NFT with rarity score >150', '⭐', 'collection', 'epic', '{"type": "rarity_score", "min": 150}', 75),

-- Social Badges
('Early Adopter', 'Joined in first 100 members', '🎯', 'social', 'rare', '{"type": "member_rank", "max": 100}', 50),
('Network Builder', 'Connected with 10+ members', '🤝', 'social', 'rare', '{"type": "connection_count", "min": 10}', 30),
('Social Butterfly', 'Connected with 25+ members', '🦋', 'social', 'epic', '{"type": "connection_count", "min": 25}', 60),
('Community Leader', 'Connected with 50+ members', '🌟', 'social', 'legendary', '{"type": "connection_count", "min": 50}', 120),

-- Activity Badges
('Profile Complete', 'Filled out complete profile', '✅', 'activity', 'common', '{"type": "profile_complete"}', 15),
('Active Member', 'Logged in 7 days in a row', '🔥', 'activity', 'rare', '{"type": "login_streak", "days": 7}', 40),
('Dedicated', 'Logged in 30 days in a row', '⚡', 'activity', 'epic', '{"type": "login_streak", "days": 30}', 80),
('Event Goer', 'Attended 3+ events', '🎪', 'activity', 'rare', '{"type": "events_attended", "min": 3}', 35),

-- Achievement Badges
('OG Holder', 'Never sold a SkunkSquad NFT', '🏆', 'achievement', 'legendary', '{"type": "never_sold"}', 150),
('First Minter', 'Minted in first hour of launch', '⚡', 'achievement', 'epic', '{"type": "early_minter", "window_hours": 1}', 100),
('Referral Master', 'Referred 5+ new members', '🎁', 'achievement', 'rare', '{"type": "referrals", "min": 5}', 45),
('Verified Member', 'Verified NFT ownership', '✓', 'achievement', 'common', '{"type": "verified"}', 5)

ON CONFLICT (name) DO NOTHING;
