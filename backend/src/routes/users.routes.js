const express = require('express');
const router = express.Router();
const { getMe, updateMe, getUserById, getMyNotifications, markNotificationRead } = require('../controllers/users.controller');
const { verifyJWT } = require('../middleware/auth.middleware');

router.get('/me', verifyJWT, getMe);
router.put('/me', verifyJWT, updateMe);
router.get('/me/notifications', verifyJWT, getMyNotifications);
router.patch('/notifications/:id/read', verifyJWT, markNotificationRead);
router.get('/:id', verifyJWT, getUserById);

module.exports = router;
