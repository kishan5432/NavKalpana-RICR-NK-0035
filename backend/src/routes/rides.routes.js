const express = require('express');
const router = express.Router();
const { createRide, getRides, getMyPostedRides, getRideById, updateRide, cancelRide, startRide, completeRide, getDriverStats } = require('../controllers/rides.controller');
const { verifyJWT } = require('../middleware/auth.middleware');
const { requireDriver } = require('../middleware/role.middleware');

router.post('/', verifyJWT, requireDriver, createRide);
router.get('/', getRides);
router.get('/my-rides', verifyJWT, requireDriver, getMyPostedRides);
router.get('/driver-stats', verifyJWT, requireDriver, getDriverStats);
router.get('/:id', getRideById);
router.put('/:id', verifyJWT, requireDriver, updateRide);
router.patch('/:id/start', verifyJWT, requireDriver, startRide);
router.patch('/:id/cancel', verifyJWT, requireDriver, cancelRide);
router.patch('/:id/complete', verifyJWT, requireDriver, completeRide);

module.exports = router;
