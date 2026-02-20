const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, getBookingById, acceptBooking, rejectBooking, cancelBooking } = require('../controllers/bookings.controller');
const { verifyJWT } = require('../middleware/auth.middleware');
const { requirePassenger, requireDriver } = require('../middleware/role.middleware');

router.post('/', verifyJWT, requirePassenger, createBooking);
router.get('/my', verifyJWT, getMyBookings);
router.get('/:id', verifyJWT, getBookingById);
router.patch('/:id/accept', verifyJWT, requireDriver, acceptBooking);
router.patch('/:id/reject', verifyJWT, requireDriver, rejectBooking);
router.patch('/:id/cancel', verifyJWT, cancelBooking);

module.exports = router;
