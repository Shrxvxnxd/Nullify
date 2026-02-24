const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'nullify_secret_key_2026';

function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { id, phone, isAdmin }
        next();
    } catch (err) {
        return res.status(401).json({ success: false, error: 'Invalid or expired token' });
    }
}

function isAdmin(req, res, next) {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        return res.status(403).json({ success: false, error: 'Admin privileges required' });
    }
}

module.exports = { verifyToken, isAdmin };
