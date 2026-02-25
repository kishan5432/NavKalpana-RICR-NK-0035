const express = require('express');
const router = express.Router();
const { getPriceSuggestion } = require('../controllers/priceSuggestion.controller');
const { verifyJWT } = require('../middleware/auth.middleware');
const { requireDriver } = require('../middleware/role.middleware');

router.get('/', verifyJWT, requireDriver, getPriceSuggestion);

module.exports = router;
