const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');

// GET /api/live-temperatures (public)
router.get('/live-temperatures', weatherController.getLiveTemperatures);

module.exports = router;
