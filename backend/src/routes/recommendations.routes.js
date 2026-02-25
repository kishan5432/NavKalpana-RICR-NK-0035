const express = require('express');
const router = express.Router();
const { getRecommendations } = require('../controllers/recommendations.controller');
const { verifyJWT } = require('../middleware/auth.middleware');

router.get('/:userId', verifyJWT, getRecommendations);

module.exports = router;
