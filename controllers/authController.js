// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { transporter } = require('../config/mailer');

const loginCodes = new Map(); // email -> { code, expiresAt }

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function setLoginCode(email, code) {
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
  loginCodes.set(email, { code, expiresAt });
}

function getLoginCode(email) {
  const entry = loginCodes.get(email);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    loginCodes.delete(email);
    return null;
  }
  return entry.code;
}

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isDisabled) return res.status(403).json({ message: 'Account disabled' });

    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid password' });
    }
    

    // Generate code and email
    const code = generateCode();
    setLoginCode(email, code);

    // send email (best effort)
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your Neobankia login verification code',
      html: `<p>Your verification code: <strong>${code}</strong>. It expires in 5 minutes.</p>`
    }).catch(err => {
      console.error('Email send failed:', err);
      // Continue — code is set server-side; frontend can still use verify endpoint and we can surface message.
    });

    return res.json({ message: 'Verification code sent to email (if mail service configured)' });
  } catch (err) {
    console.error('loginUser error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

const verifyLoginCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ message: 'Email and code required' });

    const savedCode = getLoginCode(email);
    if (!savedCode || savedCode !== code) {
      return res.status(401).json({ message: 'Invalid or expired code' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Issue JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET  // token never expires
    );

    loginCodes.delete(email);

    return res.json({ message: 'Login successful', token, user: { id: user._id, fullName: user.fullName, email: user.email, username: user.username, role: user.role } });
  } catch (err) {
    console.error('verifyLoginCode error', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { loginUser, verifyLoginCode };
