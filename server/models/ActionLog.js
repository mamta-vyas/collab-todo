const mongoose = require('mongoose');

const actionLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    action: String
  },
  {
    timestamps: true // ✅ This auto-creates createdAt & updatedAt
  }
);

module.exports = mongoose.model('ActionLog', actionLogSchema);
