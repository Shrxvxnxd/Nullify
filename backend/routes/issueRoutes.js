const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const issueController = require('../controllers/issueController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Storage configuration
const storage = multer.memoryStorage();

// File filter (JPG/PNG only)
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPG and PNG images are allowed'), false);
    }
};

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter
});

// POST /api/report-issue  → Submit a new report (public)
router.post('/report-issue', upload.single('image'), issueController.reportIssue);

// GET /api/issues         → Fetch all reports for admin map (public)
router.get('/issues', issueController.getReports);

// PUT /api/issues/:id     → Mark a report as resolved (public)
router.put('/issues/:id', issueController.resolveReport);

module.exports = router;
