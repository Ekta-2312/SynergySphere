const express = require('express');
const router = express.Router();
const Register = require('../models/Register');
const jwtAuth = require('../middleware/jwtAuth');

// Get all users (for team member selection)
router.get('/', jwtAuth, async (req, res) => {
  try {
    const users = await Register.find({ isVerified: true }, { name: 1, email: 1, _id: 1 }).sort({
      name: 1
    });

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

module.exports = router;
