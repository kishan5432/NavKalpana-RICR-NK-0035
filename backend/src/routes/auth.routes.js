const express = require('express');
const router = express.Router();
const { register, login, sendOtp, verifyOtp, logout } = require('../controllers/auth.controller');
const { verifyJWT } = require('../middleware/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/logout', verifyJWT, logout);

module.exports = router;
