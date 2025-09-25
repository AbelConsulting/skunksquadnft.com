const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const contractService = require('./contract');

function getRpc(chain) {
  if (chain === 'mainnet') return `https://eth-mainnet.g.alchemy.com/v2/${process.env.MM2ndEQYXsoFzQ9q9QlpniXoU3jv4}`;
  if (chain === 'sepolia') return `https://eth-sepolia.g.alchemy.com/v2/${process.env.MM2ndEQYXsoFzQ9q9QlpniXoU3jv4}`;
  throw new Error('Unsupported chain');
}

class ContractService {
  constructor() {
    const rpc = getRpc(process.env.CHAIN);
    this.provider = new ethers.JsonRpcProvider(rpc);
    this.wallet = new ethers.Wallet(process.env.BACKEND_MINTER_PRIVATE_KEY, this.provider);
    const abiPath = path.join(__dirname, 'abi', 'SkunkSquad.json');
    const abi = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
    this.contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, this.wallet);
  }

  async creditCardMint(to, quantity) {
    const gasOpts = {};
    try {
      const tx = await this.contract.creditCardMint(to, quantity, gasOpts);
      const receipt = await tx.wait();
      return { ok: true, txHash: receipt.transactionHash };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }
}

router.post('/create-payment-intent', async (req, res) => {
  try {
    const { quantity, walletAddress } = req.body;
    if (!quantity || quantity < 1 || quantity > MAX_PER_TX)
      return res.status(400).json({ success: false, error: 'Invalid quantity' });
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress))
      return res.status(400).json({ success: false, error: 'Invalid wallet address' });

    // Amount in cents
    const amount = PRICE_USD * 50 * quantity;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        walletAddress: walletAddress.toLowerCase(),
        quantity: String(quantity)
      }
    });

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  let event;
  try {
    const sig = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object;
    const wallet = pi.metadata.walletAddress;
    const qty = parseInt(pi.metadata.quantity || '0', 10);
    if (wallet && qty > 0) {
      const result = await contractService.creditCardMint(wallet, qty);
      if (!result.ok) console.error('Mint failed:', result.error);
    }
  }

  res.json({ received: true });
});

module.exports = { contractService: new ContractService(), router };