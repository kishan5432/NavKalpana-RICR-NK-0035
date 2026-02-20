const express = require('express');
const router = express.Router();
const { createRating, getUserRatings } = require('../controllers/ratings.controller');
const { verifyJWT } = require('../middleware/auth.middleware');

router.post('/', verifyJWT, createRating);
router.get('/user/:userId', getUserRatings);

module.exports = router;
