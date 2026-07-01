const express = require('express');
const crypto = require('crypto');
const { sendVerificationEmail } = require('../services/emailService');
const { sendSmsOtp } = require('../services/smsService');

const router = express.Router();

// Simple in-memory store for OTPs (In production, use Redis or DB with TTL)
const otpStore = new Map();

const OTP_LENGTH = 6;
const OTP_EXPIRES_IN_MINUTES = parseInt(process.env.OTP_EXPIRES_IN_MINUTES || '5');
const OTP_MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS || '5');

// Helper to generate OTP
const generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Helper to hash OTP
const hashData = (data) => {
  return crypto.createHmac('sha256', process.env.OTP_SECRET_KEY || 'default_secret').update(data).digest('hex');
};

/**
 * 1. Send Verification Email
 */
router.post('/email/send-verification', async (req, res) => {
  const { email, purpose } = req.body;
  if (!email || !purpose) return res.status(400).json({ success: false, message: 'Email and purpose are required' });

  // Rate limiting basic check
  const key = `email_${email}_${purpose}`;
  if (otpStore.has(key)) {
    const existing = otpStore.get(key);
    if (Date.now() - existing.createdAt < 60000) {
      return res.status(429).json({ success: false, message: 'Vui lòng đợi 60 giây trước khi gửi lại.' });
    }
  }

  // Generate token and link
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashData(token);
  
  otpStore.set(key, {
    hash: tokenHash,
    createdAt: Date.now(),
    expiresAt: Date.now() + OTP_EXPIRES_IN_MINUTES * 60000,
    attempts: 0
  });

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const verifyLink = `${frontendUrl}/verify-email?token=${token}&email=${encodeURIComponent(email)}&purpose=${purpose}`;

  const sent = await sendVerificationEmail(email, verifyLink);
  
  // For dev testing, we return the link if SMTP is not properly configured
  if (sent) {
    res.json({ success: true, message: 'Email xác minh đã được gửi.' });
  } else {
    console.log(`[DEV MODE] Mock Email Verification Link: ${verifyLink}`);
    res.json({ success: true, message: 'Email xác minh đã được gửi (Mock mode - xem console backend).' });
  }
});

/**
 * 2. Verify Email Token
 */
router.post('/email/verify', (req, res) => {
  const { email, purpose, token } = req.body;
  if (!email || !purpose || !token) return res.status(400).json({ success: false, message: 'Thiếu thông tin xác minh.' });

  const key = `email_${email}_${purpose}`;
  const record = otpStore.get(key);

  if (!record) return res.status(400).json({ success: false, message: 'Mã xác minh không tồn tại hoặc đã hết hạn.' });
  if (Date.now() > record.expiresAt) {
    otpStore.delete(key);
    return res.status(400).json({ success: false, message: 'Mã xác minh đã hết hạn.' });
  }

  if (hashData(token) !== record.hash) {
    record.attempts += 1;
    if (record.attempts >= OTP_MAX_ATTEMPTS) {
      otpStore.delete(key);
      return res.status(400).json({ success: false, message: 'Quá số lần thử, vui lòng gửi lại yêu cầu.' });
    }
    return res.status(400).json({ success: false, message: 'Mã xác minh không chính xác.' });
  }

  // Verification successful
  otpStore.delete(key);
  
  // Generate short-lived verification ticket (to be used in actual sensitive request)
  const ticket = crypto.randomBytes(16).toString('hex');
  res.json({ success: true, message: 'Xác minh Email thành công.', ticket });
});

/**
 * 3. Send SMS OTP
 */
router.post('/phone/send-otp', async (req, res) => {
  const { phone, purpose } = req.body;
  if (!phone || !purpose) return res.status(400).json({ success: false, message: 'Số điện thoại và mục đích là bắt buộc.' });

  // Basic rate limit
  const key = `phone_${phone}_${purpose}`;
  if (otpStore.has(key)) {
    const existing = otpStore.get(key);
    if (Date.now() - existing.createdAt < 60000) {
      return res.status(429).json({ success: false, message: 'Vui lòng đợi 60 giây trước khi gửi lại OTP.' });
    }
  }

  const otpCode = generateOtp();
  const otpHash = hashData(otpCode);

  otpStore.set(key, {
    hash: otpHash,
    createdAt: Date.now(),
    expiresAt: Date.now() + OTP_EXPIRES_IN_MINUTES * 60000,
    attempts: 0
  });

  // Call Twilio
  const sent = await sendSmsOtp(phone, otpCode);

  res.json({ success: true, message: 'Mã OTP đã được gửi đến điện thoại của bạn.' });
});

/**
 * 4. Verify SMS OTP
 */
router.post('/phone/verify-otp', (req, res) => {
  const { phone, purpose, otp } = req.body;
  if (!phone || !purpose || !otp) return res.status(400).json({ success: false, message: 'Thiếu thông tin xác thực.' });

  const key = `phone_${phone}_${purpose}`;
  const record = otpStore.get(key);

  if (!record) return res.status(400).json({ success: false, message: 'Mã OTP không tồn tại hoặc đã hết hạn.' });
  if (Date.now() > record.expiresAt) {
    otpStore.delete(key);
    return res.status(400).json({ success: false, message: 'Mã OTP đã hết hạn.' });
  }

  if (hashData(otp) !== record.hash) {
    record.attempts += 1;
    if (record.attempts >= OTP_MAX_ATTEMPTS) {
      otpStore.delete(key);
      return res.status(400).json({ success: false, message: 'Nhập sai quá nhiều lần. Vui lòng yêu cầu OTP mới.' });
    }
    return res.status(400).json({ success: false, message: 'Mã OTP không chính xác.' });
  }

  // Success
  otpStore.delete(key);
  const ticket = crypto.randomBytes(16).toString('hex');
  res.json({ success: true, message: 'Xác thực OTP thành công.', ticket });
});

module.exports = router;
