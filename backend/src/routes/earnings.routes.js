const express = require('express');
const { getDriverEarnings } = require('../controllers/earnings.controller');
const { verifyJWT } = require('../middleware/auth.middleware');
const { requireDriver } = require('../middleware/role.middleware');

const router = express.Router();

router.get('/driver/earnings', verifyJWT, requireDriver, getDriverEarnings);

module.exports = router;
