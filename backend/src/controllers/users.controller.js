const User = require('../models/User');

const getMe = (req, res) => {
  res.status(200).json({ success: true, user: req.user });
};

const updateMe = async (req, res, next) => {
  try {
    const { name, bio, profilePhoto, vehicle, savedRoutes } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, bio, profilePhoto, vehicle, savedRoutes },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select(
      '_id name profilePhoto bio rating role vehicle isPhoneVerified isEmailVerified createdAt'
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

const getMyNotifications = (req, res) => {
  // TODO: implement Notification model in Phase 4
  res.status(200).json({ success: true, notifications: [] });
};

const markNotificationRead = (req, res) => {
  // TODO: implement in Phase 4
  res.status(200).json({ success: true, message: 'Marked as read' });
};

module.exports = { getMe, updateMe, getUserById, getMyNotifications, markNotificationRead };
