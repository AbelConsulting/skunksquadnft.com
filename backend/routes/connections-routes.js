const express = require('express');
const router = express.Router();
const db = require('../config/db-config');
const { authenticateToken } = require('../middleware/auth-middleware');

/**
 * GET /api/connections
 * Get user's connections
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const memberId = req.member.id;
        const { status = 'accepted' } = req.query;

        const query = `
            SELECT 
                c.*,
                CASE 
                    WHEN c.member_id = $1 THEN connected_member_id
                    ELSE member_id
                END as other_member_id,
                m.display_name, m.title, m.location, m.avatar_url, m.online_status, m.nft_count
            FROM connections c
            JOIN members m ON (
                CASE 
                    WHEN c.member_id = $1 THEN c.connected_member_id = m.id
                    ELSE c.member_id = m.id
                END
            )
            WHERE (c.member_id = $1 OR c.connected_member_id = $1)
            AND c.status = $2
            ORDER BY c.updated_at DESC
        `;

        const result = await db.query(query, [memberId, status]);

        res.json({ connections: result.rows });

    } catch (error) {
        console.error('Get connections error:', error);
        res.status(500).json({ error: 'Failed to fetch connections' });
    }
});

/**
 * GET /api/connections/pending
 * Get pending connection requests
 */
router.get('/pending', authenticateToken, async (req, res) => {
    try {
        const memberId = req.member.id;

        // Get incoming requests
        const incomingQuery = `
            SELECT 
                c.*,
                m.id as member_id,
                m.display_name, m.title, m.location, m.avatar_url, m.online_status, m.nft_count
            FROM connections c
            JOIN members m ON c.member_id = m.id
            WHERE c.connected_member_id = $1 
            AND c.status = 'pending'
            ORDER BY c.created_at DESC
        `;

        // Get outgoing requests
        const outgoingQuery = `
            SELECT 
                c.*,
                m.id as member_id,
                m.display_name, m.title, m.location, m.avatar_url, m.online_status, m.nft_count
            FROM connections c
            JOIN members m ON c.connected_member_id = m.id
            WHERE c.member_id = $1 
            AND c.status = 'pending'
            ORDER BY c.created_at DESC
        `;

        const [incoming, outgoing] = await Promise.all([
            db.query(incomingQuery, [memberId]),
            db.query(outgoingQuery, [memberId])
        ]);

        res.json({
            incoming: incoming.rows,
            outgoing: outgoing.rows
        });

    } catch (error) {
        console.error('Get pending connections error:', error);
        res.status(500).json({ error: 'Failed to fetch pending connections' });
    }
});

/**
 * GET /api/connections/suggestions
 * Get suggested connections
 */
router.get('/suggestions', authenticateToken, async (req, res) => {
    try {
        const memberId = req.member.id;
        const { limit = 5 } = req.query;

        // Get suggestions based on:
        // 1. Same industry
        // 2. Same region
        // 3. Not already connected
        // 4. Not pending
        const query = `
            SELECT m.*,
                COALESCE(
                    (SELECT COUNT(*) FROM connections 
                     WHERE (member_id = m.id OR connected_member_id = m.id) 
                     AND status = 'accepted'), 0
                ) as connections_count,
                CASE 
                    WHEN m.industry = (SELECT industry FROM members WHERE id = $1) THEN 2
                    WHEN m.region = (SELECT region FROM members WHERE id = $1) THEN 1
                    ELSE 0
                END as relevance_score
            FROM members m
            WHERE m.id != $1
            AND NOT EXISTS (
                SELECT 1 FROM connections 
                WHERE ((member_id = $1 AND connected_member_id = m.id) 
                   OR (member_id = m.id AND connected_member_id = $1))
            )
            ORDER BY relevance_score DESC, m.nft_count DESC, m.created_at DESC
            LIMIT $2
        `;

        const result = await db.query(query, [memberId, limit]);

        // Get interests for each suggestion
        const suggestions = await Promise.all(result.rows.map(async (member) => {
            const interestsResult = await db.query(
                'SELECT interest FROM member_interests WHERE member_id = $1 LIMIT 3',
                [member.id]
            );
            
            return {
                ...member,
                interests: interestsResult.rows.map(r => r.interest),
                whale: member.nft_count >= 5
            };
        }));

        res.json({ suggestions });

    } catch (error) {
        console.error('Get suggestions error:', error);
        res.status(500).json({ error: 'Failed to fetch suggestions' });
    }
});

/**
 * POST /api/connections/request
 * Send connection request
 */
router.post('/request', authenticateToken, async (req, res) => {
    try {
        const memberId = req.member.id;
        const { targetMemberId } = req.body;

        if (!targetMemberId) {
            return res.status(400).json({ error: 'Target member ID required' });
        }

        if (memberId === targetMemberId) {
            return res.status(400).json({ error: 'Cannot connect with yourself' });
        }

        // Check if connection already exists
        const existing = await db.query(
            `SELECT * FROM connections 
             WHERE ((member_id = $1 AND connected_member_id = $2) 
                OR (member_id = $2 AND connected_member_id = $1))`,
            [memberId, targetMemberId]
        );

        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'Connection already exists or pending' });
        }

        // Create connection request
        await db.query(
            `INSERT INTO connections (member_id, connected_member_id, status, initiated_by) 
             VALUES ($1, $2, 'pending', $1)`,
            [memberId, targetMemberId]
        );

        // Log activity
        await db.query(
            'INSERT INTO activity_log (member_id, action_type, details) VALUES ($1, $2, $3)',
            [memberId, 'connection_request', { targetMemberId }]
        );

        res.json({ success: true, message: 'Connection request sent' });

    } catch (error) {
        console.error('Send connection request error:', error);
        res.status(500).json({ error: 'Failed to send connection request' });
    }
});

/**
 * POST /api/connections/accept/:connectionId
 * Accept connection request
 */
router.post('/accept/:connectionId', authenticateToken, async (req, res) => {
    try {
        const memberId = req.member.id;
        const { connectionId } = req.params;

        // Verify the request is for this member
        const connection = await db.query(
            'SELECT * FROM connections WHERE id = $1 AND connected_member_id = $2',
            [connectionId, memberId]
        );

        if (connection.rows.length === 0) {
            return res.status(404).json({ error: 'Connection request not found' });
        }

        // Update status
        await db.query(
            'UPDATE connections SET status = $1, updated_at = NOW() WHERE id = $2',
            ['accepted', connectionId]
        );

        // Log activity
        await db.query(
            'INSERT INTO activity_log (member_id, action_type, details) VALUES ($1, $2, $3)',
            [memberId, 'connection_accepted', { connectionId }]
        );

        res.json({ success: true, message: 'Connection accepted' });

    } catch (error) {
        console.error('Accept connection error:', error);
        res.status(500).json({ error: 'Failed to accept connection' });
    }
});

/**
 * POST /api/connections/decline/:connectionId
 * Decline connection request
 */
router.post('/decline/:connectionId', authenticateToken, async (req, res) => {
    try {
        const memberId = req.member.id;
        const { connectionId } = req.params;

        // Verify the request is for this member
        const connection = await db.query(
            'SELECT * FROM connections WHERE id = $1 AND connected_member_id = $2',
            [connectionId, memberId]
        );

        if (connection.rows.length === 0) {
            return res.status(404).json({ error: 'Connection request not found' });
        }

        // Delete the request
        await db.query('DELETE FROM connections WHERE id = $1', [connectionId]);

        res.json({ success: true, message: 'Connection declined' });

    } catch (error) {
        console.error('Decline connection error:', error);
        res.status(500).json({ error: 'Failed to decline connection' });
    }
});

/**
 * DELETE /api/connections/:connectionId
 * Remove connection
 */
router.delete('/:connectionId', authenticateToken, async (req, res) => {
    try {
        const memberId = req.member.id;
        const { connectionId } = req.params;

        // Verify connection belongs to this member
        const connection = await db.query(
            `SELECT * FROM connections 
             WHERE id = $1 
             AND (member_id = $2 OR connected_member_id = $2)`,
            [connectionId, memberId]
        );

        if (connection.rows.length === 0) {
            return res.status(404).json({ error: 'Connection not found' });
        }

        // Delete connection
        await db.query('DELETE FROM connections WHERE id = $1', [connectionId]);

        // Log activity
        await db.query(
            'INSERT INTO activity_log (member_id, action_type, details) VALUES ($1, $2, $3)',
            [memberId, 'connection_removed', { connectionId }]
        );

        res.json({ success: true, message: 'Connection removed' });

    } catch (error) {
        console.error('Remove connection error:', error);
        res.status(500).json({ error: 'Failed to remove connection' });
    }
});

module.exports = router;
