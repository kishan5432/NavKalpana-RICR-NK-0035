const express = require('express');
const router = express.Router();
const { createRide, getRides, getMyPostedRides, getRideById, updateRide, cancelRide, completeRide } = require('../controllers/rides.controller');
const { verifyJWT } = require('../middleware/auth.middleware');
const { requireDriver } = require('../middleware/role.middleware');

router.post('/', verifyJWT, requireDriver, createRide);
router.get('/', getRides);
router.get('/my/posted', verifyJWT, requireDriver, getMyPostedRides);
router.get('/:id', getRideById);
router.put('/:id', verifyJWT, requireDriver, updateRide);
router.patch('/:id/cancel', verifyJWT, requireDriver, cancelRide);
router.patch('/:id/complete', verifyJWT, requireDriver, completeRide);

module.exports = router;
