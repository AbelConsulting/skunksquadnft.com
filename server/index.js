require('dotenv').config();
const express = require('express');
const cors = require('cors');
const payments = require('./payments');
const webhook = require('./webhook');

const app = express();

app.use('/webhook', webhook); // raw body first for Stripe webhook
app.use(cors());
app.use(express.json());

app.use('/api', payments);

app.get('/api/health', (_req, res) => res.json({ ok: true, chain: process.env.CHAIN }));

const port = process.env.PORT || 3002;
app.listen(port, () => console.log(`Payment server running on ${port}`));