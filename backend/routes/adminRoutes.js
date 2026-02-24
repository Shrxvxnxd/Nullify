const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// All routes here require being an admin
router.use(verifyToken);
router.use(isAdmin);

// User Management
router.get('/users', adminController.getAllUsers);
router.put('/users/:userId', adminController.updateUser);
router.delete('/users/:userId', adminController.deleteUser);
router.post('/users/toggle-admin', adminController.toggleAdmin);

// Badge Management
router.get('/badges', adminController.getAllBadges);
router.post('/badges', adminController.createBadge);
router.post('/badges/award', adminController.awardBadge);

// Alert Management
router.post('/alerts', adminController.createAlert);
router.get('/alerts', adminController.getActiveAlerts);
router.delete('/alerts/:alertId', adminController.deleteAlert);

module.exports = router;
