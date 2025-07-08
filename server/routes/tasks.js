const express = require('express');
const Task = require('../models/Task');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');
const smartAssign = require('../utils/smartAssign');
const ActionLog = require('../models/ActionLog');

const router = express.Router();

// ✅ Get all tasks
router.get('/', auth, async (req, res) => {
  const tasks = await Task.find().populate('assignedTo', 'name');
  res.json(tasks);
});

// ✅ Create task
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

    const newTask = new Task({
      title,
      description,
      status,
      priority,
      assignedTo: assignedTo || undefined
    });

    await newTask.save();

    // ✅ Populate assignedTo name for correct display in frontend
    const populatedTask = await Task.findById(newTask._id).populate('assignedTo', 'name');

    // ✅ Emit populated task to socket
    global.io.emit('task-created', populatedTask);

    await new ActionLog({
      user: req.user,
      task: newTask._id,
      action: 'created'
    }).save();

    res.status(201).json(populatedTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get a single task by ID (required for conflict detection)
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('assignedTo', 'name');
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: 'Server error while fetching task' });
  }
});


// ✅ Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });

    // ✅ Populate assigned user name after update
    const populatedUpdatedTask = await Task.findById(updatedTask._id).populate('assignedTo', 'name');

    res.json(populatedUpdatedTask);

    global.io.emit('task-updated', populatedUpdatedTask);

    await new ActionLog({
      user: req.user,
      task: populatedUpdatedTask._id,
      action: 'updated'
    }).save();

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });

    global.io.emit('task-deleted', req.params.id);

    await new ActionLog({
      user: req.user,
      task: req.params.id,
      action: 'deleted'
    }).save();

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Smart Assign Route
router.post('/:id/smart-assign', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const smartUser = await smartAssign();
    task.assignedTo = smartUser._id;
    await task.save();

    // ✅ Populate after smart assign too (optional but useful)
    const populatedTask = await Task.findById(task._id).populate('assignedTo', 'name');
    global.io.emit('task-updated', populatedTask);

    res.json(populatedTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
