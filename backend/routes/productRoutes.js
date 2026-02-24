const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Public routes
router.get('/public', productController.getPublicProducts);

// Admin routes
router.get('/admin', verifyToken, isAdmin, productController.getAdminProducts);
router.post('/admin', verifyToken, isAdmin, productController.addProduct);
router.put('/admin/:id', verifyToken, isAdmin, productController.updateProduct);
router.patch('/admin/:id/status', verifyToken, isAdmin, productController.updateProductStatus);
router.delete('/admin/:id', verifyToken, isAdmin, productController.deleteProduct);

module.exports = router;
