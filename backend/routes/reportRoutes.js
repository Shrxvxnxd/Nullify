const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// POST /api/reports (protected) - Submit a new report
router.post('/', verifyToken, reportController.createReport);

// GET /api/reports/me (protected) - Get current user reports
router.get('/me', verifyToken, reportController.getUserReports);

// GET /api/reports (admin) - Get all reports
router.get('/', verifyToken, isAdmin, reportController.getAllReports);

// PATCH /api/reports/:reportId/status (admin) - Update report status
router.patch('/:reportId/status', verifyToken, isAdmin, reportController.updateReportStatus);

module.exports = router;
