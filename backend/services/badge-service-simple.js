const db = require('../config/db-sqlite');

/**
 * Badge Service - Auto-award logic
 * Checks member activity and awards badges automatically
 */

class BadgeService {
    /**
     * Check all badges for a member and award any newly earned
     */
    async checkAllBadges(memberId, memberData = {}) {
        const newBadges = [];

        try {
            // Get member's current badges
            const currentBadges = await this.getMemberBadges(memberId);
            const earnedBadgeIds = currentBadges.map(b => b.badge_id);

            // Get all badge definitions
            const allBadges = await db.query('SELECT * FROM badge_definitions');

            // Check each badge type
            for (const badge of allBadges.rows) {
                // Skip if already earned
                if (earnedBadgeIds.includes(badge.id)) continue;

                // Parse criteria
                const criteria = JSON.parse(badge.criteria || '{}');
                
                // Check if member meets criteria
                const earned = await this.checkBadgeCriteria(badge, criteria, memberData);
                
                if (earned) {
                    await this.awardBadge(memberId, badge.id);
                    newBadges.push(badge);
                    console.log(`✨ Awarded ${badge.name} to member ${memberId}`);
                }
            }

            return newBadges;
        } catch (error) {
            console.error('Error checking badges:', error);
            return [];
        }
    }

    /**
     * Check if member meets badge criteria
     */
    async checkBadgeCriteria(badge, criteria, memberData) {
        const { nftCount = 0, connectionCount = 0, memberNumber = 999, verified = false } = memberData;

        // NFT-based badges
        if (criteria.min_nfts && nftCount >= criteria.min_nfts) {
            return true;
        }

        // Connection-based badges
        if (criteria.min_connections && connectionCount >= criteria.min_connections) {
            return true;
        }

        // Early adopter (first 100 members)
        if (criteria.min_member_number && memberNumber <= criteria.min_member_number) {
            return true;
        }

        // Verified badge
        if (criteria.verified && verified) {
            return true;
        }

        // Founder badge (special flag)
        if (criteria.founder && memberData.isFounder) {
            return true;
        }

        return false;
    }

    /**
     * Award a badge to a member
     */
    async awardBadge(memberId, badgeId) {
        try {
            await db.run(
                'INSERT INTO member_badges (member_id, badge_id) VALUES (?, ?)',
                [memberId, badgeId]
            );
            return true;
        } catch (error) {
            console.error('Error awarding badge:', error);
            return false;
        }
    }

    /**
     * Get member's earned badges
     */
    async getMemberBadges(memberId) {
        try {
            const result = await db.query(`
                SELECT mb.*, bd.name, bd.description, bd.icon, bd.category, 
                       bd.tier, bd.criteria, bd.points, bd.rarity
                FROM member_badges mb
                JOIN badge_definitions bd ON mb.badge_id = bd.id
                WHERE mb.member_id = ?
                ORDER BY mb.earned_at DESC
            `, [memberId]);
            
            return result.rows || [];
        } catch (error) {
            console.error('Error getting member badges:', error);
            return [];
        }
    }

    /**
     * Get badge progress for a member
     */
    async getBadgeProgress(memberId, memberData = {}) {
        const { nftCount = 0, connectionCount = 0 } = memberData;
        const progress = [];

        try {
            const allBadges = await db.query('SELECT * FROM badge_definitions');
            const earnedBadges = await this.getMemberBadges(memberId);
            const earnedIds = earnedBadges.map(b => b.badge_id);

            for (const badge of allBadges.rows) {
                if (earnedIds.includes(badge.id)) continue;

                const criteria = JSON.parse(badge.criteria || '{}');
                let current = 0;
                let required = 0;
                let type = '';

                if (criteria.min_nfts) {
                    current = nftCount;
                    required = criteria.min_nfts;
                    type = 'nfts';
                } else if (criteria.min_connections) {
                    current = connectionCount;
                    required = criteria.min_connections;
                    type = 'connections';
                }

                if (required > 0) {
                    progress.push({
                        badge_id: badge.id,
                        badge_name: badge.name,
                        badge_icon: badge.icon,
                        current,
                        required,
                        type,
                        percentage: Math.min(100, Math.round((current / required) * 100))
                    });
                }
            }

            return progress;
        } catch (error) {
            console.error('Error getting badge progress:', error);
            return [];
        }
    }
}

module.exports = new BadgeService();
