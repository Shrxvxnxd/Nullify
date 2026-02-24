const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Media = require('../models/Media');

// Multer Config
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images (jpg, png, webp) are allowed'));
    }
}).single('image');

// Admin: Get all products
exports.getAdminProducts = async (req, res) => {
    try {
        const { search, category, status } = req.query;
        let query = 'SELECT * FROM products WHERE 1=1';
        const params = [];

        if (search) {
            query += ' AND (name LIKE ? OR description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }
        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }
        if (status) {
            query += ' AND status = ?';
            params.push(status);
        }

        query += ' ORDER BY created_at DESC';

        const [products] = await db.query(query, params);
        res.json({ success: true, products });
    } catch (error) {
        console.error('Error fetching admin products:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// User: Get active and upcoming products
exports.getPublicProducts = async (req, res) => {
    try {
        const [activeProducts] = await db.query('SELECT * FROM products WHERE status = "active" ORDER BY created_at DESC');
        const [upcomingProducts] = await db.query('SELECT * FROM products WHERE status = "upcoming" ORDER BY created_at DESC');

        res.json({
            success: true,
            active: activeProducts,
            upcoming: upcomingProducts
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// Admin: Add product
exports.addProduct = (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ success: false, error: err.message });
        }

        try {
            const { name, description, price, category, stock_quantity, status, is_featured } = req.body;
            let image_url = null;

            if (req.file) {
                const media = new Media({
                    filename: req.file.originalname,
                    contentType: req.file.mimetype,
                    data: req.file.buffer
                });
                await media.save();
                image_url = `/api/media/${media._id}`;
            }

            const [result] = await db.query(
                'INSERT INTO products (name, description, price, category, image_url, stock_quantity, status, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [name, description, price, category, image_url, stock_quantity || 0, status || 'active', is_featured === 'true' || is_featured === true]
            );

            res.status(201).json({ success: true, productId: result.insertId, message: 'Product added successfully' });
        } catch (error) {
            console.error('Error adding product:', error);
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    });
};

// Admin: Update product
exports.updateProduct = (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ success: false, error: err.message });
        }

        try {
            const { id } = req.params;
            const { name, description, price, category, stock_quantity, status, is_featured } = req.body;

            let query = 'UPDATE products SET name=?, description=?, price=?, category=?, stock_quantity=?, status=?, is_featured=?';
            const params = [name, description, price, category, stock_quantity, status, is_featured === 'true' || is_featured === true];

            if (req.file) {
                const media = new Media({
                    filename: req.file.originalname,
                    contentType: req.file.mimetype,
                    data: req.file.buffer
                });
                await media.save();
                const image_url = `/api/media/${media._id}`;
                query += ', image_url=?';
                params.push(image_url);
            }

            query += ' WHERE id=?';
            params.push(id);

            await db.query(query, params);
            res.json({ success: true, message: 'Product updated successfully' });
        } catch (error) {
            console.error('Error updating product:', error);
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    });
};

// Admin: Update status only
exports.updateProductStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['active', 'inactive', 'upcoming'].includes(status)) {
            return res.status(400).json({ success: false, error: 'Invalid status' });
        }

        await db.query('UPDATE products SET status = ? WHERE id = ?', [status, id]);
        res.json({ success: true, message: 'Status updated successfully' });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

// Admin: Delete product
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        // Optional: delete from MongoDB if we want perfect cleanup
        const [products] = await db.query('SELECT image_url FROM products WHERE id = ?', [id]);
        if (products.length > 0 && products[0].image_url && products[0].image_url.startsWith('/api/media/')) {
            const mediaId = products[0].image_url.split('/').pop();
            try {
                await Media.findByIdAndDelete(mediaId);
            } catch (e) {
                console.error('[deleteProduct] Media deletion failed:', e);
            }
        }

        await db.query('DELETE FROM products WHERE id = ?', [id]);
        res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};
