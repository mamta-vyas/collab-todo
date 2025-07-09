const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.header('Authorization'); // Directly get the raw token

  if (!token) {
    return res.status(401).json({ error: "No token, access denied" });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified.id; // attach decoded user ID to request
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = auth;
