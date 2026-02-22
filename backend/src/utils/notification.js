const Notification = require('../models/Notification');

const createNotification = async (userId, type, message, link = null) => {
  try {
    await Notification.create({ userId, type, message, link });
  } catch (err) {
    console.error('Error creating notification:', err);
  }
};

module.exports = { createNotification };
