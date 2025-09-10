const express = require('express');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');
const dotenv = require('dotenv');

// Load environment variables from .env if present
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting to mitigate spam
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: 'Too many requests from this IP, please try again later.'
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/contact', limiter);

app.post(
  '/contact',
  [
    body('name').trim().escape().notEmpty().withMessage('Name is required'),
    body('email').trim().isEmail().withMessage('Valid email required').normalizeEmail(),
    body('message').trim().escape().notEmpty().withMessage('Message is required')
  ],
  async (req, res) => {
    // Honeypot field to catch bots
    if (req.body.website) {
      return res.status(400).json({ error: 'Spam detected' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, message } = req.body;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const mailOptions = {
      from: `${name} <${email}>`,
      to: process.env.CONTACT_RECIPIENT,
      subject: 'New Contact Form Message',
      text: message
    };

    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: 'Message sent successfully' });
    } catch (err) {
      console.error('Email error:', err);
      res.status(500).json({ error: 'Failed to send message' });
    }
  }
);

// Generic error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Server error' });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
