const express = require('express');
const Task = require('../models/Task');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');
const smartAssign = require('../utils/smartAssign');
const router = express.Router();

// Get all tasks
router.get('/', auth, async (req, res) => {
  const tasks = await Task.find().populate('assignedTo', 'name');
  res.json(tasks);
});

// Create task
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, status, priority, assignedTo } = req.body;

    if (['Todo', 'In Progress', 'Done'].includes(title)) {
      return res.status(400).json({ error: 'Title cannot be a column name' });
    }

    const existing = await Task.findOne({ title });
    if (existing) {
      return res.status(400).json({ error: 'Title must be unique' });
    }

    const assignedUser = assignedTo || await smartAssign();

    const newTask = new Task({
      title,
      description,
      status,
      priority,
      assignedTo: assignedUser._id
    });

    await newTask.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 🔹 Smart Assign Route
router.post('/:id/smart-assign', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const smartUser = await smartAssign();
    task.assignedTo = smartUser._id;
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
