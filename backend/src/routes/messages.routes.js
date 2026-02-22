const express = require('express');
const router = express.Router();
const { getConversations, getMessages, sendMessage, markMessagesRead } = require('../controllers/messages.controller');
const { verifyJWT } = require('../middleware/auth.middleware');

router.get('/conversations', verifyJWT, getConversations);
router.get('/booking/:bookingId', verifyJWT, getMessages);
router.post('/', verifyJWT, sendMessage);
router.put('/booking/:bookingId/read', verifyJWT, markMessagesRead);

module.exports = router;
