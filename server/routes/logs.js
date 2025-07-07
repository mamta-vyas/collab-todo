const express = require('express');
const router = express.Router();
const ActionLog = require('../models/ActionLog');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, async (req, res) => {
  try {
    const logs = await ActionLog.find()
      .sort({ createdAt: -1 }) // ✅ Most recent logs first
      .populate('user', 'name') // ✅ Populate user.name
      .populate('task', 'title'); // ✅ Populate task.title

    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
