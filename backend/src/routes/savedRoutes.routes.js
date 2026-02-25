const express = require('express');
const router = express.Router();
const { saveRoute, getSavedRoutes } = require('../controllers/savedRoutes.controller');
const { verifyJWT } = require('../middleware/auth.middleware');

router.post('/', verifyJWT, saveRoute);
router.get('/', verifyJWT, getSavedRoutes);

module.exports = router;
