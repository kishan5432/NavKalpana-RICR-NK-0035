const express = require('express');
const router = express.Router();
const { getRouteAnalytics } = require('../controllers/analytics.controller');
const { verifyJWT } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/role.middleware');

router.get('/routes', verifyJWT, requireAdmin, getRouteAnalytics);

module.exports = router;
