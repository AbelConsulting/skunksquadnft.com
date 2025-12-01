const express = require('express');
const router = express.Router();
const db = require('../config/db-config');
const { authenticateToken, optionalAuth } = require('../middleware/auth-middleware');

/**
 * GET /api/members
 * Get all members with filters
 */
router.get('/', optionalAuth, async (req, res) => {
    try {
        const { 
            search, 
            region, 
            industry, 
            verified, 
            online,
            whale,
            sort = 'recent',
            limit = 50,
            offset = 0
        } = req.query;

        let query = `
            SELECT m.*, 
                   COALESCE(
                       (SELECT COUNT(*) FROM connections 
                        WHERE (member_id = m.id OR connected_member_id = m.id) 
                        AND status = 'accepted'), 0
                   ) as connections_count
            FROM members m
            WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;

        // Search filter
        if (search) {
            query += ` AND (
                m.display_name ILIKE $${paramIndex} OR 
                m.title ILIKE $${paramIndex} OR 
                m.location ILIKE $${paramIndex} OR
                m.bio ILIKE $${paramIndex}
            )`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        // Region filter
        if (region) {
            query += ` AND m.region = $${paramIndex}`;
            params.push(region);
            paramIndex++;
        }

        // Industry filter
        if (industry) {
            query += ` AND m.industry = $${paramIndex}`;
            params.push(industry);
            paramIndex++;
        }

        // Verified filter
        if (verified === 'true') {
            query += ` AND m.verified = true`;
        }

        // Online filter
        if (online === 'true') {
            query += ` AND m.online_status = true`;
        }

        // Whale filter (5+ NFTs)
        if (whale === 'true') {
            query += ` AND m.nft_count >= 5`;
        }

        // Sorting
        switch (sort) {
            case 'name':
                query += ` ORDER BY m.display_name ASC`;
                break;
            case 'nfts':
                query += ` ORDER BY m.nft_count DESC`;
                break;
            case 'joined':
                query += ` ORDER BY m.created_at DESC`;
                break;
            case 'recent':
            default:
                query += ` ORDER BY m.last_active DESC`;
                break;
        }

        // Pagination
        query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(parseInt(limit), parseInt(offset));

        const result = await db.query(query, params);

        // Get interests for each member
        const members = await Promise.all(result.rows.map(async (member) => {
            const interestsResult = await db.query(
                'SELECT interest FROM member_interests WHERE member_id = $1',
                [member.id]
            );
            
            const socialsResult = await db.query(
                'SELECT platform, url, username FROM member_socials WHERE member_id = $1',
                [member.id]
            );

            return {
                ...member,
                interests: interestsResult.rows.map(r => r.interest),
                socials: socialsResult.rows,
                whale: member.nft_count >= 5
            };
        }));

        // Get total count for pagination
        const countQuery = query.split('ORDER BY')[0].replace(/SELECT.*FROM/, 'SELECT COUNT(*) FROM');
        const countResult = await db.query(countQuery, params.slice(0, -2));
        const totalCount = parseInt(countResult.rows[0].count);

        res.json({
            members,
            pagination: {
                total: totalCount,
                limit: parseInt(limit),
                offset: parseInt(offset),
                hasMore: (parseInt(offset) + parseInt(limit)) < totalCount
            }
        });

    } catch (error) {
        console.error('Get members error:', error);
        res.status(500).json({ error: 'Failed to fetch members' });
    }
});

/**
 * GET /api/members/stats
 * Get network statistics
 */
router.get('/stats', async (req, res) => {
    try {
        const stats = await db.query(`
            SELECT 
                COUNT(*) as total_members,
                COUNT(DISTINCT region) as total_regions,
                COUNT(DISTINCT industry) as total_industries,
                COUNT(*) FILTER (WHERE online_status = true) as online_now,
                COUNT(*) FILTER (WHERE nft_count >= 5) as whale_count,
                COUNT(*) FILTER (WHERE verified = true) as verified_count
            FROM members
        `);

        res.json(stats.rows[0]);
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

/**
 * GET /api/members/:id
 * Get single member profile
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const memberResult = await db.query(
            'SELECT * FROM members WHERE id = $1',
            [id]
        );

        if (memberResult.rows.length === 0) {
            return res.status(404).json({ error: 'Member not found' });
        }

        const member = memberResult.rows[0];

        // Get interests
        const interestsResult = await db.query(
            'SELECT interest FROM member_interests WHERE member_id = $1',
            [id]
        );

        // Get socials
        const socialsResult = await db.query(
            'SELECT platform, url, username FROM member_socials WHERE member_id = $1',
            [id]
        );

        // Get connection count
        const connectionCountResult = await db.query(
            `SELECT COUNT(*) as count FROM connections 
             WHERE (member_id = $1 OR connected_member_id = $1) 
             AND status = 'accepted'`,
            [id]
        );

        res.json({
            ...member,
            interests: interestsResult.rows.map(r => r.interest),
            socials: socialsResult.rows,
            connections_count: parseInt(connectionCountResult.rows[0].count),
            whale: member.nft_count >= 5
        });

    } catch (error) {
        console.error('Get member error:', error);
        res.status(500).json({ error: 'Failed to fetch member' });
    }
});

/**
 * PUT /api/members/profile
 * Update own profile
 */
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const memberId = req.member.id;
        const { displayName, title, bio, location, region, industry, avatarUrl } = req.body;

        await db.query(
            `UPDATE members 
             SET display_name = COALESCE($1, display_name),
                 title = COALESCE($2, title),
                 bio = COALESCE($3, bio),
                 location = COALESCE($4, location),
                 region = COALESCE($5, region),
                 industry = COALESCE($6, industry),
                 avatar_url = COALESCE($7, avatar_url)
             WHERE id = $8`,
            [displayName, title, bio, location, region, industry, avatarUrl, memberId]
        );

        // Log activity
        await db.query(
            'INSERT INTO activity_log (member_id, action_type, details) VALUES ($1, $2, $3)',
            [memberId, 'profile_update', { fields: Object.keys(req.body) }]
        );

        res.json({ success: true, message: 'Profile updated' });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

/**
 * PUT /api/members/interests
 * Update member interests
 */
router.put('/interests', authenticateToken, async (req, res) => {
    try {
        const memberId = req.member.id;
        const { interests } = req.body;

        if (!Array.isArray(interests)) {
            return res.status(400).json({ error: 'Interests must be an array' });
        }

        // Delete existing interests
        await db.query('DELETE FROM member_interests WHERE member_id = $1', [memberId]);

        // Insert new interests
        for (const interest of interests) {
            await db.query(
                'INSERT INTO member_interests (member_id, interest) VALUES ($1, $2)',
                [memberId, interest]
            );
        }

        res.json({ success: true, message: 'Interests updated' });

    } catch (error) {
        console.error('Update interests error:', error);
        res.status(500).json({ error: 'Failed to update interests' });
    }
});

/**
 * PUT /api/members/socials
 * Update social links
 */
router.put('/socials', authenticateToken, async (req, res) => {
    try {
        const memberId = req.member.id;
        const { socials } = req.body; // Array of {platform, url, username}

        if (!Array.isArray(socials)) {
            return res.status(400).json({ error: 'Socials must be an array' });
        }

        // Delete existing socials
        await db.query('DELETE FROM member_socials WHERE member_id = $1', [memberId]);

        // Insert new socials
        for (const social of socials) {
            await db.query(
                'INSERT INTO member_socials (member_id, platform, url, username) VALUES ($1, $2, $3, $4)',
                [memberId, social.platform, social.url, social.username]
            );
        }

        res.json({ success: true, message: 'Social links updated' });

    } catch (error) {
        console.error('Update socials error:', error);
        res.status(500).json({ error: 'Failed to update socials' });
    }
});

/**
 * PUT /api/members/online-status
 * Update online status
 */
router.put('/online-status', authenticateToken, async (req, res) => {
    try {
        const memberId = req.member.id;
        const { online } = req.body;

        await db.query(
            'UPDATE members SET online_status = $1, last_active = NOW() WHERE id = $2',
            [online, memberId]
        );

        res.json({ success: true });

    } catch (error) {
        console.error('Update online status error:', error);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

module.exports = router;
