const express = require('express');
const router = express.Router();
const { register, login, sendOtp, verifyOtp, logout, forgotPassword, resetPassword } = require('../controllers/auth.controller');
const { verifyJWT } = require('../middleware/auth.middleware');

router.post('/register', register);
router.post('/login', login);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/logout', verifyJWT, logout);

module.exports = router;
