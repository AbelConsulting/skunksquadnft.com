# 🏆 Badge System Setup Guide

## Overview
Complete achievement and badge system for SkunkSquad members with 15 badge types, 4 tiers each (Bronze/Silver/Gold/Platinum), auto-awards, and progress tracking.

## 🗄️ Database Setup

### Step 1: Apply Badge Schema
```bash
# Connect to PostgreSQL and run migration
psql -d skunksquad_networking -f backend/db/badges-schema.sql
```

This creates:
- `badge_definitions` - 15 predefined badge types
- `member_badges` - Tracks earned badges per member
- `badges` - Junction table for badge awards

### Step 2: Verify Installation
```sql
-- Check tables created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%badge%';

-- View available badges
SELECT * FROM badge_definitions;

-- Should return 15 badges
```

## 🚀 Server Setup

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Start Backend Server
```bash
# From backend directory
node networking-server.js
```

Server runs on `http://localhost:3001`

### Step 3: Verify Badge Routes
```bash
# Test badge endpoints
curl http://localhost:3001/api/badges

# Should return array of 15 available badges
```

## 📋 Badge Types

### 🦨 Collection Badges
- **Early Adopter** 🎯 - First 100 minters (Bronze/Silver/Gold/Platinum)
- **Whale** 🐋 - Own 5/10/25/50+ NFTs
- **Diamond Hands** 💎 - Never sold, held 180/365/730/1095 days
- **Collector** 🎨 - Own NFTs from 3/5/10/15+ collections

### 🤝 Social Badges
- **Social Butterfly** 🦋 - 25/50/100/200+ connections
- **Network Builder** 🤝 - 10/25/50/100+ connections
- **Influencer** 📢 - Twitter verified + 1K/10K/50K/100K followers

### 🔥 Activity Badges
- **Event Goer** 📅 - Attended 3/10/25/50+ events
- **Content Creator** ✍️ - Posted 5/25/100/250+ times
- **Active Member** ⚡ - Active 90/180/365/730 days
- **Trade Master** 📈 - Completed 50/200/500/1000+ trades

### 🏆 Achievement Badges
- **Founder** 👑 - Special founder status (single tier)
- **Global Citizen** 🌍 - Visited 5/10/25/50+ countries
- **Verified** ✓ - ID/KYC verified (single tier)
- **Generous** 💝 - Referred 5/20/50/100+ members

## 🎯 Integration Points

### Frontend Pages
✅ **badges.html** - Dedicated badge showcase page
- My Badges tab
- All Badges tab with category filters
- Leaderboard top 20
- Stats overview

✅ **members.html** - Dashboard integration
- Recent achievements section
- Quick access to badge page

✅ **profile.html** - Profile editor
- Badge showcase (6 badges)
- Link to full badge page

✅ **networking.html** - Member cards
- Inline badges next to member names (3 max)
- Badge icons on hover

### Auto-Award Triggers

#### Current Implementation
```javascript
// On login
BadgeService.checkAllBadges(userId);

// Badge checking runs automatically when:
// 1. User logs in (init)
// 2. Profile loads
// 3. Every 60 seconds (auto-refresh)
```

#### Recommended Additions
```javascript
// After NFT mint
await mintNFT();
await BadgeService.checkAllBadges(userId);

// After connection accepted
await acceptConnection(requestId);
await BadgeService.checkAllBadges(userId);

// Daily cron job
cron.schedule('0 0 * * *', async () => {
    // Check time-based badges for all users
    const users = await getAllActiveUsers();
    for (const user of users) {
        await BadgeService.checkAllBadges(user.id);
    }
});
```

## 🎨 Styling

### Tier Colors
- **Bronze**: `#cd7f32` → `#e59842`
- **Silver**: `#c0c0c0` → `#e0e0e0`
- **Gold**: `#ffd700` → `#ffed4e`
- **Platinum**: `#e5e4e2` → `#b9f2ff`

### Rarity Colors
- **Common**: Gray `#64748b`
- **Uncommon**: Green `#10b981`
- **Rare**: Blue `#3b82f6`
- **Epic**: Purple `#a855f7`
- **Legendary**: Gold `#fbbf24`

## 📊 API Endpoints

### GET /api/badges
Get all available badges
```javascript
const response = await fetch('/api/badges');
const badges = await response.json();
// Returns: Array of 15 badge definitions
```

### GET /api/badges/my
Get user's earned badges
```javascript
const response = await fetch('/api/badges/my', {
    headers: { 'Authorization': `Bearer ${token}` }
});
const myBadges = await response.json();
```

### POST /api/badges/check
Check and auto-award badges
```javascript
const response = await fetch('/api/badges/check', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
});
const newBadges = await response.json();
// Returns: Array of newly awarded badges
```

### GET /api/badges/progress
Get progress toward next tier
```javascript
const response = await fetch('/api/badges/progress', {
    headers: { 'Authorization': `Bearer ${token}` }
});
const progress = await response.json();
// Returns: { badgeId: { current: 7, required: 10, percentage: 70 } }
```

### POST /api/badges/:badgeId/award
Manually award badge (admin only)
```javascript
const response = await fetch(`/api/badges/${badgeId}/award`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${adminToken}` }
});
```

## 🧪 Testing

### Test Badge Awards
```javascript
// In browser console (badges.html)
await BadgeSystem.init();
await BadgeSystem.checkForNewBadges();

// View my badges
console.log(BadgeSystem.myBadges);

// View all badges
console.log(BadgeSystem.badges);
```

### Database Queries
```sql
-- View member's badges
SELECT mb.*, bd.name, bd.icon, bd.tier
FROM member_badges mb
JOIN badge_definitions bd ON mb.badge_id = bd.id
WHERE mb.member_id = 1;

-- Leaderboard
SELECT member_id, COUNT(*) as badge_count, SUM(bd.points) as total_points
FROM member_badges mb
JOIN badge_definitions bd ON mb.badge_id = bd.id
GROUP BY member_id
ORDER BY total_points DESC
LIMIT 20;

-- Badge distribution
SELECT bd.name, COUNT(mb.id) as earned_count
FROM badge_definitions bd
LEFT JOIN member_badges mb ON bd.id = mb.badge_id
GROUP BY bd.name
ORDER BY earned_count DESC;
```

## 🔧 Customization

### Add New Badge Type
1. Insert into `badge_definitions` table:
```sql
INSERT INTO badge_definitions (name, description, icon, category, tier, criteria, points, rarity)
VALUES ('Custom Badge', 'Description', '🎯', 'achievement', 'bronze', '{"requirement": 10}', 10, 'common');
```

2. Add check function in `badge-service.js`:
```javascript
async checkCustomBadge(userId) {
    const meetsCriteria = await this.checkSomeCriteria(userId);
    if (meetsCriteria) {
        return await this.awardBadge(userId, 'custom_badge');
    }
}
```

3. Add to `checkAllBadges()` array

### Adjust Tier Thresholds
Edit criteria in `badge_definitions`:
```sql
UPDATE badge_definitions 
SET criteria = '{"min_nfts": 10}'  -- Changed from 5
WHERE name = 'Whale' AND tier = 'bronze';
```

## 📱 Frontend Usage

### Display Badges Anywhere
```javascript
// Initialize
await BadgeSystem.init();

// Render badge list
BadgeSystem.renderBadgeList('containerId', { limit: 6 });

// Render inline badges (for member cards)
BadgeSystem.renderInlineBadges(memberId, container, { limit: 3 });

// Render badge grid
BadgeSystem.renderBadgeGrid('containerId', { all: true, showLocked: true });

// Show badge modal
BadgeSystem.showBadgeModal(badgeId);

// Show progress
BadgeSystem.showProgress(badgeId);
```

### Badge Events
```javascript
// Listen for new badges
document.addEventListener('badgeEarned', (e) => {
    const badge = e.detail;
    console.log(`Earned: ${badge.name}`);
    showToast(`🏆 New Badge: ${badge.name}`);
});
```

## 🎉 Launch Checklist

- [ ] Database migration applied
- [ ] Backend server running on port 3001
- [ ] Badge routes responding (test /api/badges)
- [ ] Frontend scripts loaded (badges.js in all pages)
- [ ] Badge showcase visible on members.html
- [ ] Badge grid showing on networking.html
- [ ] Dedicated badges.html page working
- [ ] Auto-check on login working
- [ ] Manual badge awards functional (admin)
- [ ] Leaderboard displaying top 20

## 🐛 Troubleshooting

### Badges not showing?
1. Check console for errors
2. Verify BadgeSystem.init() called
3. Check backend connection: `fetch('/api/badges')`
4. Verify badges.js loaded before other scripts

### Auto-awards not working?
1. Check badge criteria in database
2. Verify BadgeService.checkAllBadges() called
3. Check user authentication token
4. Review backend logs

### Database errors?
1. Verify schema applied: `\dt badges*` in psql
2. Check foreign keys exist
3. Verify 15 badge_definitions inserted
4. Check triggers created

## 📚 Files Reference

### Backend
- `backend/db/badges-schema.sql` - Database schema
- `backend/services/badge-service.js` - Badge logic
- `backend/routes/badge-routes.js` - API endpoints

### Frontend
- `src/js/badges.js` - Badge UI manager
- `styles/badges.css` - Badge styling
- `badges.html` - Dedicated badge page

### Integration
- `members.html` - Dashboard integration
- `profile.html` - Profile badge showcase
- `networking.html` - Inline member badges

---

**Status**: ✅ Complete - Ready for database migration and testing
**Last Updated**: November 30, 2025
