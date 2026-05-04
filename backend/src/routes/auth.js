const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const User = require('../models/User');
const { jwtSecret, jwtExpiry, bcryptRounds } = require('../config');
const { sendVerificationEmail } = require('../utils/emailService');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, nickname } = req.body;
    if (!email || !password) {
      return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Email and password are required.' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ code: 'DUPLICATE_ENTRY', message: 'Email already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, bcryptRounds || 10);
    const user = await User.create({ 
      email, 
      passwordHash, 
      nickname: nickname || email.split('@')[0],
      isVerified: true,        // ← auto-verified
    });

    // Return token immediately, just like login does
    const token = jwt.sign({ userId: user._id, email: user.email }, jwtSecret, { expiresIn: jwtExpiry });

    res.status(201).json({ 
      token,
      user: { id: user._id, email: user.email, nickname: user.nickname }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Internal server error' });
  }
});

// Verify Email
router.post('/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email, verificationCode: code });

    if (!user) {
      return res.status(400).json({ code: 'INVALID_CODE', message: 'Invalid verification code.' });
    }

    if (user.verificationCodeExpires < new Date()) {
      return res.status(400).json({ code: 'EXPIRED_CODE', message: 'Verification code expired.' });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    const token = jwt.sign({ userId: user._id, email: user.email }, jwtSecret, { expiresIn: jwtExpiry });

    res.json({ token, user: { id: user._id, email: user.email, nickname: user.nickname } });
  } catch (err) {
    res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ code: 'AUTH_INVALID_CREDENTIALS', message: 'Invalid credentials.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ code: 'AUTH_NOT_VERIFIED', message: 'Please verify your email first.' });
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, jwtSecret, { expiresIn: jwtExpiry });
    res.json({ token, user: { id: user._id, email: user.email, nickname: user.nickname } });
  } catch (err) {
    res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Internal server error' });
  }
});

module.exports = router;
