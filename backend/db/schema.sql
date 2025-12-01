-- SkunkSquad Networking Portal Database Schema
-- PostgreSQL Database

-- Members table (core user data)
CREATE TABLE members (
    id SERIAL PRIMARY KEY,
    wallet_address VARCHAR(42) UNIQUE NOT NULL,
    display_name VARCHAR(100),
    title VARCHAR(150),
    bio TEXT,
    location VARCHAR(150),
    region VARCHAR(50),
    industry VARCHAR(50),
    avatar_url TEXT,
    nft_count INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT false,
    online_status BOOLEAN DEFAULT false,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Member NFTs (track owned tokens)
CREATE TABLE member_nfts (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    token_id INTEGER NOT NULL,
    contract_address VARCHAR(42) NOT NULL,
    acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(member_id, token_id, contract_address)
);

-- Member interests/tags
CREATE TABLE member_interests (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    interest VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(member_id, interest)
);

-- Social links
CREATE TABLE member_socials (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL, -- twitter, discord, instagram, linkedin, github, etc.
    url TEXT,
    username VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(member_id, platform)
);

-- Connections (relationships between members)
CREATE TABLE connections (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    connected_member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL, -- 'pending', 'accepted', 'declined', 'blocked'
    initiated_by INTEGER REFERENCES members(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (member_id != connected_member_id),
    UNIQUE(member_id, connected_member_id)
);

-- Messages (for future messaging feature)
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    receiver_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Member sessions (track login sessions)
CREATE TABLE member_sessions (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activity log (track member actions)
CREATE TABLE activity_log (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL, -- 'login', 'profile_update', 'connection_request', etc.
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_members_wallet ON members(wallet_address);
CREATE INDEX idx_members_online ON members(online_status);
CREATE INDEX idx_members_region ON members(region);
CREATE INDEX idx_members_industry ON members(industry);
CREATE INDEX idx_connections_member ON connections(member_id);
CREATE INDEX idx_connections_status ON connections(status);
CREATE INDEX idx_messages_receiver ON messages(receiver_id, read);
CREATE INDEX idx_member_sessions_token ON member_sessions(session_token);
CREATE INDEX idx_activity_log_member ON activity_log(member_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-updating timestamps
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_connections_updated_at BEFORE UPDATE ON connections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views for common queries
CREATE VIEW member_connections_count AS
SELECT 
    member_id,
    COUNT(*) as connection_count
FROM connections
WHERE status = 'accepted'
GROUP BY member_id;

CREATE VIEW member_full_profile AS
SELECT 
    m.*,
    COALESCE(mcc.connection_count, 0) as connections_count,
    (SELECT COUNT(*) FROM member_nfts WHERE member_id = m.id) as nft_count_verified
FROM members m
LEFT JOIN member_connections_count mcc ON m.id = mcc.member_id;
