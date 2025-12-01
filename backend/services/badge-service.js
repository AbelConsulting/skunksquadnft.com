/**
 * Badge Service
 * Handles badge checking, awarding, and management
 */

const db = require('../config/db-config');

class BadgeService {
    /**
     * Check and award badges for a member
     */
    async checkAndAwardBadges(memberId) {
        const badges = await this.checkEligibleBadges(memberId);
        const awarded = [];

        for (const badge of badges) {
            const success = await this.awardBadge(memberId, badge.id, badge.metadata);
            if (success) {
                awarded.push(badge);
            }
        }

        return awarded;
    }

    /**
     * Check which badges a member is eligible for
     */
    async checkEligibleBadges(memberId) {
        const eligible = [];
        
        // Get member data
        const memberData = await this.getMemberData(memberId);
        
        // Get all badges not yet earned
        const allBadges = await db.query(`
            SELECT b.* FROM badges b
            WHERE NOT EXISTS (
                SELECT 1 FROM member_badges mb 
                WHERE mb.member_id = $1 AND mb.badge_id = b.id
            )
        `, [memberId]);

        // Check each badge criteria
        for (const badge of allBadges.rows) {
            const criteria = badge.criteria;
            let isEligible = false;
            let metadata = {};

            switch (criteria.type) {
                case 'nft_count':
                    isEligible = memberData.nft_count >= criteria.min;
                    metadata = { nft_count: memberData.nft_count };
                    break;

                case 'connection_count':
                    isEligible = memberData.connection_count >= criteria.min;
                    metadata = { connection_count: memberData.connection_count };
                    break;

                case 'member_rank':
                    isEligible = memberData.member_rank <= criteria.max;
                    metadata = { member_rank: memberData.member_rank };
                    break;

                case 'profile_complete':
                    isEligible = this.isProfileComplete(memberData);
                    break;

                case 'verified':
                    isEligible = memberData.wallet_address !== null;
                    break;

                case 'rarity_score':
                    // TODO: Implement when we have rarity scores
                    isEligible = false;
                    break;

                case 'login_streak':
                    // TODO: Implement login tracking
                    isEligible = false;
                    break;

                case 'events_attended':
                    // TODO: Implement event tracking
                    isEligible = false;
                    break;

                case 'never_sold':
                    // TODO: Implement blockchain transaction checking
                    isEligible = false;
                    break;

                case 'early_minter':
                    // TODO: Implement mint timestamp checking
                    isEligible = false;
                    break;

                case 'referrals':
                    // TODO: Implement referral tracking
                    isEligible = false;
                    break;
            }

            if (isEligible) {
                eligible.push({ ...badge, metadata });
            }
        }

        return eligible;
    }

    /**
     * Award a badge to a member
     */
    async awardBadge(memberId, badgeId, metadata = {}) {
        try {
            await db.query(`
                INSERT INTO member_badges (member_id, badge_id, metadata)
                VALUES ($1, $2, $3)
                ON CONFLICT (member_id, badge_id) DO NOTHING
            `, [memberId, badgeId, JSON.stringify(metadata)]);
            
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
        const result = await db.query(`
            SELECT 
                b.*,
                mb.earned_at,
                mb.progress,
                mb.metadata
            FROM member_badges mb
            JOIN badges b ON mb.badge_id = b.id
            WHERE mb.member_id = $1
            ORDER BY mb.earned_at DESC
        `, [memberId]);

        return result.rows;
    }

    /**
     * Get all available badges
     */
    async getAllBadges() {
        const result = await db.query(`
            SELECT * FROM badges
            ORDER BY 
                CASE rarity
                    WHEN 'legendary' THEN 1
                    WHEN 'epic' THEN 2
                    WHEN 'rare' THEN 3
                    ELSE 4
                END,
                points DESC
        `);

        return result.rows;
    }

    /**
     * Get member's badge progress (for progressive badges)
     */
    async getBadgeProgress(memberId) {
        const memberData = await this.getMemberData(memberId);
        const allBadges = await this.getAllBadges();
        
        return allBadges.map(badge => {
            const earned = memberData.badges?.some(b => b.id === badge.id);
            const progress = this.calculateProgress(badge, memberData);
            
            return {
                ...badge,
                earned,
                progress
            };
        });
    }

    /**
     * Calculate progress towards a badge
     */
    calculateProgress(badge, memberData) {
        const criteria = badge.criteria;
        
        switch (criteria.type) {
            case 'nft_count':
                return Math.min(100, (memberData.nft_count / criteria.min) * 100);
            
            case 'connection_count':
                return Math.min(100, (memberData.connection_count / criteria.min) * 100);
            
            case 'member_rank':
                return memberData.member_rank <= criteria.max ? 100 : 0;
            
            case 'profile_complete':
                return this.isProfileComplete(memberData) ? 100 : 50;
            
            default:
                return 0;
        }
    }

    /**
     * Get member data for badge checking
     */
    async getMemberData(memberId) {
        const result = await db.query(`
            SELECT 
                m.*,
                COUNT(DISTINCT n.id) as nft_count,
                COUNT(DISTINCT c.id) as connection_count,
                (
                    SELECT COUNT(*) + 1 
                    FROM members m2 
                    WHERE m2.created_at < m.created_at
                ) as member_rank
            FROM members m
            LEFT JOIN member_nfts n ON m.id = n.member_id
            LEFT JOIN connections c ON (
                (c.member_id = m.id OR c.connected_member_id = m.id)
                AND c.status = 'accepted'
            )
            WHERE m.id = $1
            GROUP BY m.id
        `, [memberId]);

        if (result.rows.length === 0) {
            throw new Error('Member not found');
        }

        return result.rows[0];
    }

    /**
     * Check if profile is complete
     */
    isProfileComplete(memberData) {
        return !!(
            memberData.display_name &&
            memberData.bio &&
            memberData.location &&
            memberData.title
        );
    }

    /**
     * Get leaderboard by badge count
     */
    async getBadgeLeaderboard(limit = 10) {
        const result = await db.query(`
            SELECT 
                m.id,
                m.display_name,
                m.wallet_address,
                m.avatar_url,
                COUNT(mb.id) as badge_count,
                SUM(b.points) as total_points,
                json_agg(
                    json_build_object(
                        'name', b.name,
                        'icon', b.icon,
                        'rarity', b.rarity
                    )
                ) as badges
            FROM members m
            LEFT JOIN member_badges mb ON m.id = mb.member_id
            LEFT JOIN badges b ON mb.badge_id = b.id
            GROUP BY m.id
            ORDER BY badge_count DESC, total_points DESC
            LIMIT $1
        `, [limit]);

        return result.rows;
    }
}

module.exports = new BadgeService();
