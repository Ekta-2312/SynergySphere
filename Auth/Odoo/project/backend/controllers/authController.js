const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Register = require('../models/Register');
const Login = require('../models/Login');
const sendEmail = require('../utils/sendEmail');

const generateOtp = () => {
  return Math.floor( Math.random() * 900000).toString();
};

const hashOtp = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    const existing = await Register.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    const user = new Register({
      name,
      email,
      password: hashed,
      isVerified: false,
      otpHash,
      otpExpires,
    });

    await user.save();

    // respond early
    res.status(201).json({ success: true, message: 'User registered, OTP sent to email', user: { name, email } });

    // send OTP email in background
    (async () => {
      try {
        await sendEmail({
          to: email,
          subject: 'Your verification code',
          text: `Your OTP is ${otp}. It expires in 10 minutes.`,
        });
        console.log('OTP sent to', email);
      } catch (err) {
        console.error('Failed to send OTP email:', err.message || err);
      }
    })();
  } catch (err) {
    console.error('Register error:', err.message || err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.verify = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success: false, message: 'Missing fields' });

    const user = await Register.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid email or otp' });
    if (user.isVerified) return res.status(400).json({ success: false, message: 'User already verified' });
    if (!user.otpHash || !user.otpExpires) return res.status(400).json({ success: false, message: 'No OTP set' });
    if (Date.now() > user.otpExpires) return res.status(400).json({ success: false, message: 'OTP expired' });

    const otpHash = hashOtp(otp);
    if (otpHash !== user.otpHash) return res.status(400).json({ success: false, message: 'Invalid OTP' });

    user.isVerified = true;
    user.otpHash = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Generate JWT token and log the user in automatically
    const payload = { id: user._id, email: user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

    // Record login asynchronously
    (async () => {
      try {
        await Login.create({ email: user.email });
      } catch (err) {
        console.error('Failed to record login:', err.message || err);
      }
    })();

    res.json({ 
      success: true, 
      message: 'User verified and logged in successfully',
      token,
      user: { name: user.name, email: user.email }
    });
  } catch (err) {
    console.error('Verify error:', err.message || err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Missing email' });

    const user = await Register.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ success: false, message: 'User already verified' });

    const otp = generateOtp();
    user.otpHash = hashOtp(otp);
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    res.json({ success: true, message: 'OTP resent' });

    (async () => {
      try {
        await sendEmail({
          to: email,
          subject: 'Your new verification code',
          text: `Your new OTP is ${otp}. It expires in 10 minutes.`,
        });
        console.log('Resent OTP to', email);
      } catch (err) {
        console.error('Failed to resend OTP email:', err.message || err);
      }
    })();
  } catch (err) {
    console.error('Resend OTP error:', err.message || err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Missing fields' });

    const user = await Register.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid email or password' });
    if (!user.isVerified) return res.status(400).json({ success: false, message: 'Email not verified' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid email or password' });

    const payload = { id: user._id, email: user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

    // record login asynchronously
    (async () => {
      try {
        await Login.create({ email: user.email });
      } catch (err) {
        console.error('Failed to record login:', err.message || err);
      }
    })();

    res.json({ success: true, token, user: { name: user.name, email: user.email } });
  } catch (err) {
    console.error('Login error:', err.message || err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
