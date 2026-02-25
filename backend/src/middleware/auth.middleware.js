const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    // Check if instant badge has expired
    if (user.instant_badge_active && user.instant_badge_until && user.instant_badge_until < new Date()) {
      user.instant_badge_active = false;
      await user.save();
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

module.exports = { verifyJWT };
