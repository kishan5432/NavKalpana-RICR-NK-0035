const express = require('express');
const router = express.Router();
const { getMe, updateMe, getUserById, getMyNotifications, markNotificationRead, markAllNotificationsRead, uploadProfilePicture } = require('../controllers/users.controller');
const { verifyJWT } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.get('/me', verifyJWT, getMe);
router.put('/me', verifyJWT, updateMe);
router.post('/me/upload-photo', verifyJWT, upload.single('photo'), uploadProfilePicture);
router.get('/me/notifications', verifyJWT, getMyNotifications);
router.patch('/me/notifications/:id/read', verifyJWT, markNotificationRead);
router.patch('/me/notifications/read-all', verifyJWT, markAllNotificationsRead);
router.get('/:id', verifyJWT, getUserById);

module.exports = router;
