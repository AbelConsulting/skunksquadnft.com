const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { ethers } = require('ethers');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Raw body for Stripe webhook verification
app.use('/webhooks/stripe', express.raw({ type: 'application/json' }));

// =============================================================
//                   BLOCKCHAIN SETUP
// =============================================================

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Contract ABIs and addresses
const PAYMENT_GATEWAY_ADDRESS = process.env.PAYMENT_GATEWAY_ADDRESS;
const PAYMENT_GATEWAY_ABI = [
    "function initiateFiatPayment(string calldata paymentId, address buyer, uint256 quantity) external",
    "function confirmPaymentAndMint(string calldata paymentId, bytes calldata stripeSignature) external",
    "function markPaymentRefunded(string calldata paymentId, string calldata reason, bytes calldata stripeSignature) external",
    "function getPayment(string calldata paymentId) external view returns (tuple(string paymentId, address buyer, uint256 quantity, uint256 amountUSD, uint256 timestamp, uint8 status, uint256[] tokenIds, string failureReason))",
    "function pricePerNFTUSD() external view returns (uint256)",
    "function calculateTotalUSD(uint256 quantity) external view returns (uint256)"
];

const paymentGateway = new ethers.Contract(PAYMENT_GATEWAY_ADDRESS, PAYMENT_GATEWAY_ABI, wallet);

// =============================================================
//                   UTILITY FUNCTIONS
// =============================================================

/**
 * Create signature for payment confirmation
 */
function createPaymentSignature(paymentId, amountUSD) {
    const messageHash = ethers.utils.solidityKeccak256(
        ['string', 'uint256'],
        [paymentId, amountUSD]
    );
    const signature = wallet.signMessage(ethers.utils.arrayify(messageHash));
    return signature;
}

/**
 * Create signature for refund confirmation
 */
function createRefundSignature(paymentId, reason) {
    const messageHash = ethers.utils.solidityKeccak256(
        ['string', 'string', 'string'],
        ['REFUND', paymentId, reason]
    );
    const signature = wallet.signMessage(ethers.utils.arrayify(messageHash));
    return signature;
}

/**
 * Validate wallet address
 */
function isValidAddress(address) {
    try {
        return ethers.utils.isAddress(address);
    } catch (error) {
        return false;
    }
}

// =============================================================
//                    PAYMENT ENDPOINTS
// =============================================================

/**
 * GET /api/pricing
 * Get current NFT pricing information
 */
app.get('/api/pricing', async (req, res) => {
    try {
        const pricePerNFTUSD = await paymentGateway.pricePerNFTUSD();
        const priceInDollars = ethers.utils.formatUnits(pricePerNFTUSD, 2); // Convert from cents
        
        res.json({
            success: true,
            data: {
                pricePerNFTUSD: priceInDollars,
                pricePerNFTCents: pricePerNFTUSD.toString(),
                currency: 'USD'
            }
        });
    } catch (error) {
        console.error('Error fetching pricing:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch pricing information'
        });
    }
});

/**
 * POST /api/calculate-total
 * Calculate total cost for quantity
 */
app.post('/api/calculate-total', async (req, res) => {
    try {
        const { quantity } = req.body;
        
        if (!quantity || quantity < 1 || quantity > 10) {
            return res.status(400).json({
                success: false,
                error: 'Invalid quantity. Must be between 1 and 10.'
            });
        }
        
        const totalUSD = await paymentGateway.calculateTotalUSD(quantity);
        const totalInDollars = ethers.utils.formatUnits(totalUSD, 2);
        
        res.json({
            success: true,
            data: {
                quantity,
                totalUSD: totalInDollars,
                totalCents: totalUSD.toString(),
                pricePerNFT: ethers.utils.formatUnits(totalUSD.div(quantity), 2)
            }
        });
    } catch (error) {
        console.error('Error calculating total:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to calculate total cost'
        });
    }
});

/**
 * POST /api/create-payment-intent
 * Create Stripe payment intent for NFT purchase
 */
app.post('/api/create-payment-intent', async (req, res) => {
    try {
        const { quantity, walletAddress, metadata = {} } = req.body;
        
        // Validation
        if (!quantity || quantity < 1 || quantity > 10) {
            return res.status(400).json({
                success: false,
                error: 'Invalid quantity. Must be between 1 and 10.'
            });
        }
        
        if (!walletAddress || !isValidAddress(walletAddress)) {
            return res.status(400).json({
                success: false,
                error: 'Valid wallet address is required.'
            });
        }
        
        // Calculate total amount
        const totalUSD = await paymentGateway.calculateTotalUSD(quantity);
        const amountCents = parseInt(totalUSD.toString());
        
        // Create Stripe payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountCents,
            currency: 'usd',
            metadata: {
                quantity: quantity.toString(),
                walletAddress,
                nftCollection: 'SkunkSquad',
                ...metadata
            },
            description: `SkunkSquad NFT Purchase - ${quantity} NFT${quantity > 1 ? 's' : ''}`,
            statement_descriptor: 'SKUNKSQUAD NFT',
            automatic_payment_methods: {
                enabled: true,
            },
        });
        
        // Initiate payment in smart contract
        try {
            const tx = await paymentGateway.initiateFiatPayment(
                paymentIntent.id,
                walletAddress,
                quantity
            );
            await tx.wait();
            
            console.log(`Payment initiated: ${paymentIntent.id} for ${walletAddress}`);
        } catch (contractError) {
            console.error('Contract error:', contractError);
            // Cancel the Stripe payment intent if contract call fails
            await stripe.paymentIntents.cancel(paymentIntent.id);
            
            return res.status(500).json({
                success: false,
                error: 'Failed to initiate payment in smart contract'
            });
        }
        
        res.json({
            success: true,
            data: {
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id,
                amount: amountCents,
                quantity,
                walletAddress
            }
        });
        
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create payment intent'
        });
    }
});

/**
 * GET /api/payment-status/:paymentId
 * Check payment and NFT delivery status
 */
app.get('/api/payment-status/:paymentId', async (req, res) => {
    try {
        const { paymentId } = req.params;
        
        // Get payment from smart contract
        const payment = await paymentGateway.getPayment(paymentId);
        
        if (payment.timestamp.toString() === '0') {
            return res.status(404).json({
                success: false,
                error: 'Payment not found'
            });
        }
        
        // Get Stripe payment intent
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentId);
        
        const statusMap = {
            0: 'pending',
            1: 'confirmed',
            2: 'delivered',
            3: 'failed',
            4: 'refunded'
        };
        
        res.json({
            success: true,
            data: {
                paymentId,
                status: statusMap[payment.status] || 'unknown',
                buyer: payment.buyer,
                quantity: payment.quantity.toString(),
                amountUSD: ethers.utils.formatUnits(payment.amountUSD, 2),
                timestamp: new Date(payment.timestamp.toNumber() * 1000).toISOString(),
                tokenIds: payment.tokenIds.map(id => id.toString()),
                failureReason: payment.failureReason,
                stripeStatus: paymentIntent.status,
                stripeAmount: paymentIntent.amount,
                stripeCurrency: paymentIntent.currency
            }
        });
        
    } catch (error) {
        console.error('Error fetching payment status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch payment status'
        });
    }
});

// =============================================================
//                   STRIPE WEBHOOKS
// =============================================================

/**
 * POST /webhooks/stripe
 * Handle Stripe webhook events
 */
app.post('/webhooks/stripe', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    try {
        switch (event.type) {
            case 'payment_intent.succeeded':
                await handlePaymentSucceeded(event.data.object);
                break;
                
            case 'payment_intent.payment_failed':
                await handlePaymentFailed(event.data.object);
                break;
                
            case 'charge.dispute.created':
                await handleChargeback(event.data.object);
                break;
                
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }
        
        res.json({ received: true });
    } catch (error) {
        console.error('Error handling webhook:', error);
        res.status(500).json({ error: 'Webhook handler failed' });
    }
});

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(paymentIntent) {
    console.log(`Payment succeeded: ${paymentIntent.id}`);
    
    try {
        // Create signature for smart contract verification
        const signature = await createPaymentSignature(paymentIntent.id, paymentIntent.amount);
        
        // Confirm payment and mint NFTs
        const tx = await paymentGateway.confirmPaymentAndMint(paymentIntent.id, signature);
        const receipt = await tx.wait();
        
        console.log(`NFTs minted for payment ${paymentIntent.id}:`, receipt.transactionHash);
        
        // Here you could add email notification, analytics, etc.
        
    } catch (error) {
        console.error(`Error minting NFTs for payment ${paymentIntent.id}:`, error);
        // You might want to implement retry logic or manual intervention alerts
    }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(paymentIntent) {
    console.log(`Payment failed: ${paymentIntent.id}`);
    
    // Log failure for admin review
    // Could implement automatic refund or retry logic here
}

/**
 * Handle chargeback/dispute
 */
async function handleChargeback(charge) {
    console.log(`Chargeback created for charge: ${charge.id}`);
    
    // Extract payment intent ID from charge
    const paymentIntentId = charge.payment_intent;
    
    try {
        // Mark as refunded in smart contract
        const signature = await createRefundSignature(paymentIntentId, 'Chargeback dispute');
        const tx = await paymentGateway.markPaymentRefunded(
            paymentIntentId,
            'Chargeback dispute',
            signature
        );
        await tx.wait();
        
        console.log(`Payment ${paymentIntentId} marked as refunded due to chargeback`);
        
    } catch (error) {
        console.error(`Error handling chargeback for ${paymentIntentId}:`, error);
    }
}

// =============================================================
//                      ERROR HANDLING
// =============================================================

app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found'
    });
});

// =============================================================
//                      SERVER STARTUP
// =============================================================

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
    console.log(`🚀 SkunkSquad Payment Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`💳 Stripe Mode: ${process.env.STRIPE_SECRET_KEY?.startsWith('sk_live') ? 'LIVE' : 'TEST'}`);
    console.log(`🔗 Payment Gateway: ${PAYMENT_GATEWAY_ADDRESS}`);
});

module.exports = app;