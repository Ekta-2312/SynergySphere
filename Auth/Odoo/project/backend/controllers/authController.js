const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Register = require('../models/Register');
const Login = require('../models/Login');
const sendEmail = require('../utils/sendEmail');

const generateOtp = () => {
  return Math.floor(Math.random() * 900000).toString();
};

const hashOtp = otp => {
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
      otpExpires
    });

    await user.save();

    // respond early
    res.status(201).json({
      success: true,
      message: 'User registered, OTP sent to email',
      user: { name, email }
    });

    // send OTP email in background
    (async () => {
      try {
        await sendEmail({
          to: email,
          subject: 'Your verification code',
          text: `Your OTP is ${otp}. It expires in 10 minutes.`
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
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    const user = await Register.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email or otp' });
    }
    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'User already verified' });
    }
    if (!user.otpHash || !user.otpExpires) {
      return res.status(400).json({ success: false, message: 'No OTP set' });
    }
    if (Date.now() > user.otpExpires) {
      return res.status(400).json({ success: false, message: 'OTP expired' });
    }

    const otpHash = hashOtp(otp);
    if (otpHash !== user.otpHash) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

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
    if (!email) {
      return res.status(400).json({ success: false, message: 'Missing email' });
    }

    const user = await Register.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }
    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'User already verified' });
    }

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
          text: `Your new OTP is ${otp}. It expires in 10 minutes.`
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
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    const user = await Register.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }
    if (!user.isVerified) {
      return res.status(400).json({ success: false, message: 'Email not verified' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

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

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await Register.findById(req.user.id).select('-password -otpHash');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        provider: user.provider,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        notificationSettings: user.notificationSettings || {
          emailNotifications: true,
          taskReminders: true,
          projectUpdates: true,
          weeklyDigest: false
        }
      }
    });
  } catch (err) {
    console.error('Get profile error:', err.message || err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    // Check if email is already taken by another user
    if (email !== req.user.email) {
      const existingUser = await Register.findOne({ email, _id: { $ne: req.user.id } });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
      }
    }

    const user = await Register.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true, runValidators: true }
    ).select('-password -otpHash');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'Profile updated successfully', user });
  } catch (err) {
    console.error('Update profile error:', err.message || err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: 'Current and new password are required' });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ success: false, message: 'New password must be at least 6 characters long' });
    }

    const user = await Register.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await Register.findByIdAndUpdate(req.user.id, { password: hashedPassword });

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err.message || err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get notification settings
exports.getNotificationSettings = async (req, res) => {
  try {
    const user = await Register.findById(req.user.id).select('notificationSettings');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const settings = user.notificationSettings || {
      emailNotifications: true,
      taskReminders: true,
      projectUpdates: true,
      weeklyDigest: false
    };

    res.json({ success: true, settings });
  } catch (err) {
    console.error('Get notification settings error:', err.message || err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update notification settings
exports.updateNotificationSettings = async (req, res) => {
  try {
    const { emailNotifications, taskReminders, projectUpdates, weeklyDigest } = req.body;

    const settings = {
      emailNotifications: Boolean(emailNotifications),
      taskReminders: Boolean(taskReminders),
      projectUpdates: Boolean(projectUpdates),
      weeklyDigest: Boolean(weeklyDigest)
    };

    const user = await Register.findByIdAndUpdate(
      req.user.id,
      { notificationSettings: settings },
      { new: true, runValidators: true }
    ).select('notificationSettings');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Notification settings updated successfully',
      settings: user.notificationSettings
    });
  } catch (err) {
    console.error('Update notification settings error:', err.message || err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
