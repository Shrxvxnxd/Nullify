const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Public route to get events
router.get('/', eventController.getAllEvents);

// Authenticated user join
router.post('/:id/join', verifyToken, eventController.joinEvent);

// Admin-only routes
router.post('/', verifyToken, isAdmin, eventController.createEvent);
router.delete('/:id', verifyToken, isAdmin, eventController.deleteEvent);

module.exports = router;
