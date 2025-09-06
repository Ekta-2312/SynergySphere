const express = require('express');
const router = express.Router();
const passport = require('passport');
const controller = require('../controllers/authController');

router.post('/register', controller.register);
router.post('/verify', controller.verify);
router.post('/resend-otp', controller.resendOtp);
router.post('/login', controller.login);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed` }), (req, res) => {
  try {
    console.log('Google callback - req.user:', req.user);
    
    if (!req.user) {
      console.error('No user found in Google callback');
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`);
    }

    if (!req.user.email) {
      console.error('No email found for user:', req.user);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=no_email`);
    }

    // Generate JWT token for the user
    const jwt = require('jsonwebtoken');
    const payload = { id: req.user._id, email: req.user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

    // Redirect to frontend with token and user data
    const userData = encodeURIComponent(JSON.stringify({
      name: req.user.name,
      email: req.user.email
    }));
    
    console.log('Redirecting to frontend with token and user data');
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?token=${token}&user=${userData}`);
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=server_error`);
  }
});

module.exports = router;
