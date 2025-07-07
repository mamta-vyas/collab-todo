// routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');

// Get all users (only their names and IDs)
router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find({}, 'name');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
