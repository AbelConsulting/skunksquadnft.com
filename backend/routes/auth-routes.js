const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Web3 = require('web3');
const db = require('../config/db-config');

const NFT_ABI = [
    {
        "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "owner", "type": "address"}, {"internalType": "uint256", "name": "index", "type": "uint256"}],
        "name": "tokenOfOwnerByIndex",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    }
];

/**
 * POST /api/auth/wallet
 * Authenticate with wallet address
 */
router.post('/wallet', async (req, res) => {
    try {
        const { walletAddress, signature } = req.body;

        if (!walletAddress) {
            return res.status(400).json({ error: 'Wallet address required' });
        }

        // Verify NFT ownership using configured RPC with fallback
        const rpcUrl = process.env.INFURA_PROJECT_ID 
            ? `https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`
            : process.env.ETH_RPC_URL || 'https://ethereum.publicnode.com';
            
        const web3 = new Web3(rpcUrl);
        const contract = new web3.eth.Contract(NFT_ABI, process.env.CONTRACT_ADDRESS);
        
        const balance = await contract.methods.balanceOf(walletAddress).call();
        const nftCount = parseInt(balance);

        if (nftCount === 0) {
            return res.status(403).json({ error: 'No NFTs found for this wallet' });
        }

        // Get or create member
        let member = await db.query(
            'SELECT * FROM members WHERE wallet_address = $1',
            [walletAddress.toLowerCase()]
        );

        if (member.rows.length === 0) {
            // Create new member
            const insertResult = await db.query(
                `INSERT INTO members (wallet_address, display_name, nft_count, verified) 
                 VALUES ($1, $2, $3, true) 
                 RETURNING *`,
                [walletAddress.toLowerCase(), `${walletAddress.substring(0, 6)}...${walletAddress.slice(-4)}`, nftCount]
            );
            member = insertResult;

            // Log activity
            await db.query(
                'INSERT INTO activity_log (member_id, action_type, details) VALUES ($1, $2, $3)',
                [insertResult.rows[0].id, 'registration', { wallet: walletAddress }]
            );
        } else {
            // Update NFT count and last active
            await db.query(
                'UPDATE members SET nft_count = $1, last_active = NOW() WHERE id = $2',
                [nftCount, member.rows[0].id]
            );
        }

        const memberId = member.rows[0].id;

        // Get token IDs
        const tokenIds = [];
        for (let i = 0; i < Math.min(nftCount, 20); i++) {
            try {
                const tokenId = await contract.methods.tokenOfOwnerByIndex(walletAddress, i).call();
                tokenIds.push(parseInt(tokenId));

                // Store NFT ownership
                await db.query(
                    `INSERT INTO member_nfts (member_id, token_id, contract_address) 
                     VALUES ($1, $2, $3) 
                     ON CONFLICT (member_id, token_id, contract_address) DO NOTHING`,
                    [memberId, tokenId, process.env.CONTRACT_ADDRESS]
                );
            } catch (e) {
                console.warn('Error fetching token at index', i);
            }
        }

        // Create session token
        const sessionToken = jwt.sign(
            { memberId, walletAddress },
            process.env.JWT_SECRET,
            { expiresIn: `${process.env.SESSION_DURATION_HOURS || 24}h` }
        );

        // Store session
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + parseInt(process.env.SESSION_DURATION_HOURS || 24));

        await db.query(
            'INSERT INTO member_sessions (member_id, session_token, expires_at) VALUES ($1, $2, $3)',
            [memberId, sessionToken, expiresAt]
        );

        // Log login
        await db.query(
            'INSERT INTO activity_log (member_id, action_type, details) VALUES ($1, $2, $3)',
            [memberId, 'login', { method: 'wallet', tokenCount: nftCount }]
        );

        res.json({
            success: true,
            token: sessionToken,
            member: {
                id: memberId,
                walletAddress,
                nftCount,
                tokenIds,
                displayName: member.rows[0].display_name
            }
        });

    } catch (error) {
        console.error('Wallet auth error:', error);
        res.status(500).json({ error: 'Authentication failed', details: error.message });
    }
});

/**
 * POST /api/auth/logout
 * Logout and invalidate session
 */
router.post('/logout', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            await db.query('DELETE FROM member_sessions WHERE session_token = $1', [token]);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Logout failed' });
    }
});

/**
 * GET /api/auth/verify
 * Verify current session
 */
router.get('/verify', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ valid: false });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const sessionResult = await db.query(
            'SELECT * FROM member_sessions WHERE session_token = $1 AND expires_at > NOW()',
            [token]
        );

        if (sessionResult.rows.length === 0) {
            return res.status(401).json({ valid: false });
        }

        res.json({ valid: true, memberId: decoded.memberId });

    } catch (error) {
        res.status(401).json({ valid: false });
    }
});

module.exports = router;
