const db = require('../config/db');

async function createReport(req, res) {
    const { type, location, severity, description, imageUrl, latitude, longitude } = req.body;
    const userId = req.user.id;

    if (!type || !location || !severity) {
        return res.status(400).json({ success: false, error: 'Type, location and severity are required' });
    }

    try {
        const [result] = await db.execute(
            `INSERT INTO nullify_reports (user_id, type, location, severity, description, image_url, latitude, longitude)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, type, location, severity, description || null, imageUrl || null, latitude || null, longitude || null]
        );
        res.json({ success: true, reportId: result.insertId });
    } catch (err) {
        console.error('[createReport error]', err);
        res.status(500).json({ success: false, error: 'Failed to submit report' });
    }
}

async function getUserReports(req, res) {
    const userId = req.user.id;
    try {
        const [reports] = await db.execute(
            'SELECT * FROM nullify_reports WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        res.json({ success: true, reports });
    } catch (err) {
        console.error('[getUserReports error]', err);
        res.status(500).json({ success: false, error: 'Failed to fetch your reports' });
    }
}

async function getAllReports(req, res) {
    try {
        const [reports] = await db.execute(
            `SELECT r.*, u.name as user_name, u.phone as user_phone 
             FROM nullify_reports r 
             JOIN nullify_users u ON r.user_id = u.id 
             ORDER BY r.created_at DESC`
        );
        res.json({ success: true, reports });
    } catch (err) {
        console.error('[getAllReports error]', err);
        res.status(500).json({ success: false, error: 'Failed to fetch all reports' });
    }
}

async function updateReportStatus(req, res) {
    const { reportId } = req.params;
    const { status } = req.body;

    if (!['pending', 'verified', 'rejected'].includes(status)) {
        return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    try {
        await db.execute('UPDATE nullify_reports SET status = ? WHERE id = ?', [status, reportId]);
        res.json({ success: true, message: 'Report status updated' });
    } catch (err) {
        console.error('[updateReportStatus error]', err);
        res.status(500).json({ success: false, error: 'Failed to update report status' });
    }
}

module.exports = {
    createReport,
    getUserReports,
    getAllReports,
    updateReportStatus
};
