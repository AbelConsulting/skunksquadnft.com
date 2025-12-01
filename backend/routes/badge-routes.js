/**
 * Badge Routes
 * API endpoints for badge system
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth-middleware');
const badgeService = require('../services/badge-service');

/**
 * GET /api/badges
 * Get all available badges
 */
router.get('/', async (req, res) => {
    try {
        const badges = await badgeService.getAllBadges();
        res.json(badges);
    } catch (error) {
        console.error('Error fetching badges:', error);
        res.status(500).json({ error: 'Failed to fetch badges' });
    }
});

/**
 * GET /api/badges/my
 * Get current user's earned badges
 */
router.get('/my', authMiddleware, async (req, res) => {
    try {
        const badges = await badgeService.getMemberBadges(req.user.id);
        res.json(badges);
    } catch (error) {
        console.error('Error fetching member badges:', error);
        res.status(500).json({ error: 'Failed to fetch badges' });
    }
});

/**
 * GET /api/badges/progress
 * Get current user's badge progress
 */
router.get('/progress', authMiddleware, async (req, res) => {
    try {
        const progress = await badgeService.getBadgeProgress(req.user.id);
        res.json(progress);
    } catch (error) {
        console.error('Error fetching badge progress:', error);
        res.status(500).json({ error: 'Failed to fetch progress' });
    }
});

/**
 * POST /api/badges/check
 * Check and award eligible badges for current user
 */
router.post('/check', authMiddleware, async (req, res) => {
    try {
        const awarded = await badgeService.checkAndAwardBadges(req.user.id);
        res.json({
            message: awarded.length > 0 ? 'New badges earned!' : 'No new badges',
            badges: awarded
        });
    } catch (error) {
        console.error('Error checking badges:', error);
        res.status(500).json({ error: 'Failed to check badges' });
    }
});

/**
 * GET /api/badges/member/:memberId
 * Get badges for a specific member
 */
router.get('/member/:memberId', async (req, res) => {
    try {
        const { memberId } = req.params;
        const badges = await badgeService.getMemberBadges(memberId);
        res.json(badges);
    } catch (error) {
        console.error('Error fetching member badges:', error);
        res.status(500).json({ error: 'Failed to fetch member badges' });
    }
});

/**
 * GET /api/badges/leaderboard
 * Get badge leaderboard
 */
router.get('/leaderboard', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const leaderboard = await badgeService.getBadgeLeaderboard(limit);
        res.json(leaderboard);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

module.exports = router;
