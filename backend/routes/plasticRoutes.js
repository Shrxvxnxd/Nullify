const express = require('express');
const router = express.Router();
const plasticController = require('../controllers/plasticController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/detect', verifyToken, plasticController.detectPlastic);
router.post('/sell', verifyToken, plasticController.confirmSale);

module.exports = router;
