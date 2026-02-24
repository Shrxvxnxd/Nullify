const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// GET /api/stats/public (public)
router.get('/public', statsController.getPublicStats);

// GET /api/stats/admin (admin)
router.get('/admin', verifyToken, isAdmin, statsController.getAdminStats);

// GET /api/stats/me (user protected)
router.get('/me', verifyToken, statsController.getUserStats);

module.exports = router;
