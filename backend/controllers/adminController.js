const db = require('../config/db');

// ──────────────────────────────────────────────
//  USER MANAGEMENT
// ──────────────────────────────────────────────

async function getAllUsers(req, res) {
    try {
        const [users] = await db.execute(
            'SELECT id, name, phone, community_location, is_admin, created_at FROM nullify_users ORDER BY created_at DESC'
        );
        res.json({ success: true, users });
    } catch (err) {
        console.error('[getAllUsers error]', err);
        res.status(500).json({ success: false, error: 'Failed to fetch users' });
    }
}

async function updateUser(req, res) {
    const { userId, name, phone, community_location } = req.body;
    try {
        await db.execute(
            'UPDATE nullify_users SET name = ?, phone = ?, community_location = ? WHERE id = ?',
            [name, phone, community_location, userId]
        );
        res.json({ success: true, message: 'User updated successfully' });
    } catch (err) {
        console.error('[updateUser error]', err);
        res.status(500).json({ success: false, error: 'Failed to update user' });
    }
}

async function deleteUser(req, res) {
    const { userId } = req.params;
    try {
        await db.execute('DELETE FROM nullify_users WHERE id = ?', [userId]);
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (err) {
        console.error('[deleteUser error]', err);
        res.status(500).json({ success: false, error: 'Failed to delete user' });
    }
}

async function toggleAdmin(req, res) {
    const { userId, isAdmin } = req.body;
    try {
        await db.execute('UPDATE nullify_users SET is_admin = ? WHERE id = ?', [isAdmin, userId]);
        res.json({ success: true, message: `Admin status ${isAdmin ? 'granted' : 'revoked'}` });
    } catch (err) {
        console.error('[toggleAdmin error]', err);
        res.status(500).json({ success: false, error: 'Failed to update admin status' });
    }
}

// ──────────────────────────────────────────────
//  BADGE MANAGEMENT
// ──────────────────────────────────────────────

async function createBadge(req, res) {
    const { name, description, iconUrl } = req.body;
    try {
        const [result] = await db.execute(
            'INSERT INTO nullify_badges (name, description, icon_url) VALUES (?, ?, ?)',
            [name, description, iconUrl]
        );
        res.json({ success: true, badgeId: result.insertId });
    } catch (err) {
        console.error('[createBadge error]', err);
        res.status(500).json({ success: false, error: 'Failed to create badge' });
    }
}

async function getAllBadges(req, res) {
    try {
        const [badges] = await db.execute('SELECT * FROM nullify_badges');
        res.json({ success: true, badges });
    } catch (err) {
        console.error('[getAllBadges error]', err);
        res.status(500).json({ success: false, error: 'Failed to fetch badges' });
    }
}

async function awardBadge(req, res) {
    const { userId, badgeId } = req.body;
    try {
        // Check if already awarded
        const [existing] = await db.execute(
            'SELECT id FROM nullify_user_badges WHERE user_id = ? AND badge_id = ?',
            [userId, badgeId]
        );
        if (existing.length > 0) {
            return res.status(400).json({ success: false, error: 'User already has this badge' });
        }

        await db.execute(
            'INSERT INTO nullify_user_badges (user_id, badge_id) VALUES (?, ?)',
            [userId, badgeId]
        );
        res.json({ success: true, message: 'Badge awarded successfully' });
    } catch (err) {
        console.error('[awardBadge error]', err);
        res.status(500).json({ success: false, error: 'Failed to award badge' });
    }
}

async function getUserBadges(req, res) {
    const { userId } = req.params;
    try {
        const [badges] = await db.execute(
            `SELECT b.* FROM nullify_badges b 
             JOIN nullify_user_badges ub ON b.id = ub.badge_id 
             WHERE ub.user_id = ?`,
            [userId]
        );
        res.json({ success: true, badges });
    } catch (err) {
        console.error('[getUserBadges error]', err);
        res.status(500).json({ success: false, error: 'Failed to fetch user badges' });
    }
}

// ──────────────────────────────────────────────
//  CRITICAL ALERTS
// ──────────────────────────────────────────────

async function createAlert(req, res) {
    const { message, type, expiresAt, startsAt } = req.body;
    try {
        const [result] = await db.execute(
            'INSERT INTO nullify_critical_alerts (message, type, starts_at, expires_at) VALUES (?, ?, ?, ?)',
            [message, type || 'warning', startsAt || new Date(), expiresAt || null]
        );
        res.json({ success: true, alertId: result.insertId });
    } catch (err) {
        console.error('[createAlert error]', err);
        res.status(500).json({ success: false, error: 'Failed to create alert' });
    }
}

async function getActiveAlerts(req, res) {
    try {
        const [alerts] = await db.execute(
            'SELECT * FROM nullify_critical_alerts WHERE starts_at <= NOW() AND (expires_at IS NULL OR expires_at > NOW()) ORDER BY created_at DESC'
        );
        res.json({ success: true, alerts });
    } catch (err) {
        console.error('[getActiveAlerts error]', err);
        res.status(500).json({ success: false, error: 'Failed to fetch alerts' });
    }
}

async function deleteAlert(req, res) {
    const { alertId } = req.params;
    try {
        await db.execute('DELETE FROM nullify_critical_alerts WHERE id = ?', [alertId]);
        res.json({ success: true, message: 'Alert deleted' });
    } catch (err) {
        console.error('[deleteAlert error]', err);
        res.status(500).json({ success: false, error: 'Failed to delete alert' });
    }
}

module.exports = {
    getAllUsers,
    updateUser,
    deleteUser,
    toggleAdmin,
    createBadge,
    getAllBadges,
    awardBadge,
    getUserBadges,
    createAlert,
    getActiveAlerts,
    deleteAlert
};
