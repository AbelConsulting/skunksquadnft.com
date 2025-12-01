const jwt = require('jsonwebtoken');
const db = require('../config/db-config');

/**
 * Verify JWT token and attach member to request
 */
async function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Verify session is still valid
        const sessionResult = await db.query(
            'SELECT * FROM member_sessions WHERE session_token = $1 AND expires_at > NOW()',
            [token]
        );

        if (sessionResult.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid or expired session' });
        }

        // Get member data
        const memberResult = await db.query(
            'SELECT * FROM members WHERE id = $1',
            [decoded.memberId]
        );

        if (memberResult.rows.length === 0) {
            return res.status(401).json({ error: 'Member not found' });
        }

        req.member = memberResult.rows[0];
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(403).json({ error: 'Invalid token' });
    }
}

/**
 * Optional authentication - doesn't fail if no token
 */
async function optionalAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const memberResult = await db.query(
            'SELECT * FROM members WHERE id = $1',
            [decoded.memberId]
        );

        if (memberResult.rows.length > 0) {
            req.member = memberResult.rows[0];
        }
    } catch (error) {
        // Silently fail
    }

    next();
}

module.exports = { authenticateToken, optionalAuth };
