const jwt = require('jsonwebtoken');
const Register = require('../models/Register');

const jwtAuth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    const token =
      authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.replace('Bearer ', '')
        : req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');

    // Get user from database
    const user = await Register.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token. User not found.' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ error: 'User not verified.' });
    }

    // Add user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('JWT Auth Error:', error.message);
    res.status(401).json({ error: 'Invalid token.' });
  }
};

module.exports = jwtAuth;
