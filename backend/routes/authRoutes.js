const express = require('express');
const router = express.Router();
const { signup, login, me, logout, updateProfilePic } = require('../controllers/authController');
const { googleLogin, googleCallback } = require('../controllers/googleAuthController');
const { verifyToken } = require('../middleware/authMiddleware');

// POST /api/auth/signup
router.post('/signup', signup);

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/logout
router.post('/logout', logout);

// GET /api/auth/me  (requires Bearer token)
router.get('/me', verifyToken, me);

// PUT /api/auth/profile-pic (requires Bearer token)
router.put('/profile-pic', verifyToken, updateProfilePic);

// Google Auth Routes
router.get('/google', googleLogin);
router.get('/google/callback', googleCallback);

// GET /api/auth/badges/:userId (public/auth)
const adminController = require('../controllers/adminController');
router.get('/badges/:userId', adminController.getUserBadges);

module.exports = router;
