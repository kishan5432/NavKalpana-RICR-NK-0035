const express = require('express');
const router = express.Router();
const { getConversations, getMessages, sendMessage, markMessagesRead } = require('../controllers/messages.controller');
const { verifyJWT } = require('../middleware/auth.middleware');

router.get('/conversations', verifyJWT, getConversations);
router.get('/:bookingId', verifyJWT, getMessages);
router.post('/:bookingId', verifyJWT, sendMessage);
router.patch('/:bookingId/read', verifyJWT, markMessagesRead);

module.exports = router;
