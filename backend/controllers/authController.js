const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const multer = require('multer');
const Media = require('../models/Media');

const JWT_SECRET = process.env.JWT_SECRET || 'nullify_secret_key_2026';
const JWT_EXPIRES = '7d';

// Multer Storage for Profile Pictures
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
}).single('profilePic');

// ──────────────────────────────────────────────
//  POST /api/auth/signup
// ──────────────────────────────────────────────
async function signup(req, res) {
    const { name, phone, password, referredBy, communityLocation, housingType } = req.body;

    if (!name || !phone || !password) {
        return res.status(400).json({ success: false, error: 'Name, phone, and password are required' });
    }
    if (password.length < 6) {
        return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    try {
        // Check if phone already exists
        const [existing] = await db.execute('SELECT id FROM nullify_users WHERE phone = ?', [phone]);
        if (existing.length > 0) {
            return res.status(409).json({ success: false, error: 'Phone number already registered' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const [result] = await db.execute(
            `INSERT INTO nullify_users (name, phone, password, referred_by, community_location, housing_type, created_at)
             VALUES (?, ?, ?, ?, ?, ?, NOW())`,
            [name, phone, hashedPassword, referredBy || null, communityLocation || null, housingType || null]
        );

        const userId = result.insertId;

        // Generate token (include name and is_admin)
        const token = jwt.sign({ id: userId, name, phone, isAdmin: false }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

        return res.status(201).json({
            success: true,
            token,
            user: { id: userId, name, phone, communityLocation, housingType, isAdmin: false }
        });
    } catch (err) {
        console.error('[signup error]', err);
        return res.status(500).json({ success: false, error: 'Server error. Please try again.' });
    }
}

// ──────────────────────────────────────────────
//  POST /api/auth/login
// ──────────────────────────────────────────────
async function login(req, res) {
    const { phone, password, isAdminLogin } = req.body;

    if (!phone || !password) {
        return res.status(400).json({ success: false, error: 'Phone and password are required' });
    }

    // Special case for Hackathon Admin
    if (phone === 'Nullifity@admin' && password === 'Nullifity@admin') {
        const token = jwt.sign({ id: 0, name: 'System Admin', phone: 'Nullifity@admin', isAdmin: true }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
        return res.json({
            success: true,
            token,
            user: {
                id: 0,
                name: 'System Admin',
                phone: 'Nullifity@admin',
                isAdmin: true
            }
        });
    }

    try {
        const [rows] = await db.execute(
            'SELECT id, name, phone, password, community_location, housing_type, is_admin, profile_pic_url FROM nullify_users WHERE phone = ?',
            [phone]
        );

        if (rows.length === 0) {
            return res.status(401).json({ success: false, error: 'Invalid phone number or password' });
        }

        const user = rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ success: false, error: 'Invalid phone number or password' });
        }

        // Enforce login separation: Standard users cannot use the Admin Panel login
        if (!user.is_admin && isAdminLogin) {
            return res.status(403).json({ success: false, error: 'Standard users cannot access the Command Center.' });
        }

        const token = jwt.sign({ id: user.id, name: user.name, phone: user.phone, isAdmin: !!user.is_admin }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

        return res.json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                phone: user.phone,
                communityLocation: user.community_location,
                housingType: user.housing_type,
                isAdmin: !!user.is_admin,
                profilePicUrl: user.profile_pic_url
            }
        });
    } catch (err) {
        console.error('[login error]', err);
        return res.status(500).json({ success: false, error: 'Server error. Please try again.' });
    }
}

// ──────────────────────────────────────────────
//  GET /api/auth/me  (protected)
// ──────────────────────────────────────────────
async function me(req, res) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        if (decoded.id === 0 && decoded.phone === 'Nullifity@admin') {
            return res.json({
                success: true,
                user: {
                    id: 0,
                    name: 'System Admin',
                    phone: 'Nullifity@admin',
                    isAdmin: true
                }
            });
        }

        const [rows] = await db.execute(
            'SELECT id, name, phone, community_location, housing_type, is_admin, created_at, profile_pic_url FROM nullify_users WHERE id = ?',
            [decoded.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const user = rows[0];
        return res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                phone: user.phone,
                communityLocation: user.community_location,
                housingType: user.housing_type,
                joinedAt: user.created_at,
                isAdmin: !!user.is_admin,
                profilePicUrl: user.profile_pic_url
            }
        });
    } catch (err) {
        return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }
}

// ──────────────────────────────────────────────
//  POST /api/auth/logout
// ──────────────────────────────────────────────
async function logout(req, res) {
    // In a stateless JWT setup, logout is primarily frontend-side (clearing the token).
    // However, we return success to confirm the intent.
    return res.json({ success: true, message: 'Logged out successfully' });
}

async function updateProfilePic(req, res) {
    upload(req, res, async (err) => {
        if (err) return res.status(400).json({ success: false, error: err.message });
        if (!req.file) return res.status(400).json({ success: false, error: 'No image provided' });

        try {
            const media = new Media({
                filename: req.file.originalname,
                contentType: req.file.mimetype,
                data: req.file.buffer
            });
            await media.save();
            const mediaUrl = `/api/media/${media._id}`;

            await db.execute('UPDATE nullify_users SET profile_pic_url = ? WHERE id = ?', [mediaUrl, req.user.id]);

            return res.json({ success: true, profilePicUrl: mediaUrl });
        } catch (err) {
            console.error('[updateProfilePic error]', err);
            return res.status(500).json({ success: false, error: 'Failed to update profile picture' });
        }
    });
}

module.exports = { signup, login, me, logout, updateProfilePic };
