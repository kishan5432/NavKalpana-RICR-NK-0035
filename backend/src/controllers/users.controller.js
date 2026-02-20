const getMe = (req, res) => {
  res.status(200).json({ success: true, message: 'TODO' });
};

const updateMe = (req, res) => {
  res.status(200).json({ success: true, message: 'TODO' });
};

const getUserById = (req, res) => {
  res.status(200).json({ success: true, message: 'TODO' });
};

const getMyNotifications = (req, res) => {
  res.status(200).json({ success: true, message: 'TODO' });
};

const markNotificationRead = (req, res) => {
  res.status(200).json({ success: true, message: 'TODO' });
};

module.exports = { getMe, updateMe, getUserById, getMyNotifications, markNotificationRead };
