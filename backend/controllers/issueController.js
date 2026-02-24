const db = require('../config/db');
const Media = require('../models/Media');

// Phase 3: User Report Submission
async function reportIssue(req, res) {
    const { title, description, latitude, longitude } = req.body;
    let imagePath = null;

    if (req.file) {
        try {
            const media = new Media({
                filename: req.file.originalname,
                contentType: req.file.mimetype,
                data: req.file.buffer
            });
            await media.save();
            imagePath = `/api/media/${media._id}`;
        } catch (mediaErr) {
            console.error('[reportIssue] Media save error:', mediaErr);
        }
    }

    if (!title || !latitude || !longitude) {
        return res.status(400).json({ success: false, error: 'Title and location (lat/lng) are required' });
    }

    try {
        console.log(`[Rebuild] Inserting fresh report: ${title} at (${latitude}, ${longitude})`);
        const [result] = await db.execute(
            'INSERT INTO reports (title, description, image_path, latitude, longitude, status) VALUES (?, ?, ?, ?, ?, ?)',
            [title, description || null, imagePath, latitude, longitude, 'pending']
        );
        console.log(`[Rebuild Success] Inserted ID: ${result.insertId}`);
        res.json({ success: true, id: result.insertId });
    } catch (err) {
        console.error('[reportIssue error]', err);
        res.status(500).json({ success: false, error: 'Submission failed' });
    }
}

// Phase 5: Admin Fetch Route
async function getReports(req, res) {
    try {
        console.log('[Rebuild API] Fetching all reports');
        const [rows] = await db.execute('SELECT * FROM reports ORDER BY created_at DESC');
        console.log(`[Rebuild API] Found ${rows.length} records`);
        res.json(rows); // Return as clean array as requested
    } catch (err) {
        console.error('[getReports error]', err);
        res.status(500).json({ success: false, error: 'Retrieval failed' });
    }
}

// Phase 7: Resolve Report
async function resolveReport(req, res) {
    const { id } = req.params;
    try {
        console.log(`[Rebuild Action] Resolving report: ${id}`);
        await db.execute('UPDATE reports SET status = "resolved" WHERE id = ?', [id]);
        res.json({ success: true, message: 'Resolution confirmed' });
    } catch (err) {
        console.error('[resolveReport error]', err);
        res.status(500).json({ success: false, error: 'Resolution failed' });
    }
}

module.exports = {
    reportIssue,
    getReports,
    resolveReport
};
