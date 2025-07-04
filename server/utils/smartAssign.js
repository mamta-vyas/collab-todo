const Task = require('../models/Task');
const User = require('../models/User');

const smartAssign = async () => {
  const users = await User.find();
  const userTaskCounts = await Promise.all(
    users.map(async user => {
      const count = await Task.countDocuments({
        assignedTo: user._id,
        status: { $in: ['Todo', 'In Progress'] }
      });
      return { user, count };
    })
  );

  userTaskCounts.sort((a, b) => a.count - b.count);

  return userTaskCounts[0]?.user;
};

module.exports = smartAssign;
