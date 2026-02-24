const db = require('../config/db');

async function getAllEvents(req, res) {
    try {
        const [events] = await db.execute('SELECT * FROM nullify_events ORDER BY event_date ASC');
        res.json({ success: true, events });
    } catch (err) {
        console.error('[getAllEvents error]', err);
        res.status(500).json({ success: false, error: 'Failed to fetch events' });
    }
}

async function createEvent(req, res) {
    const { title, type, eventDate, location, maxAttendees, imageUrl, description } = req.body;
    try {
        const [result] = await db.execute(
            'INSERT INTO nullify_events (title, type, event_date, location, max_attendees, image_url, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [title, type, eventDate, location, maxAttendees, imageUrl || null, description || null]
        );
        res.json({ success: true, eventId: result.insertId });
    } catch (err) {
        console.error('[createEvent error]', err);
        res.status(500).json({ success: false, error: 'Failed to create event' });
    }
}

async function deleteEvent(req, res) {
    const { id } = req.params;
    try {
        await db.execute('DELETE FROM nullify_events WHERE id = ?', [id]);
        res.json({ success: true, message: 'Event deleted successfully' });
    } catch (err) {
        console.error('[deleteEvent error]', err);
        res.status(500).json({ success: false, error: 'Failed to delete event' });
    }
}

async function joinEvent(req, res) {
    const { id } = req.params;
    const userId = req.user?.id;
    try {
        // Check current state
        const [[event]] = await db.execute('SELECT id, attendees, max_attendees FROM nullify_events WHERE id = ?', [id]);
        if (!event) return res.status(404).json({ success: false, error: 'Event not found' });
        if (event.attendees >= event.max_attendees) {
            return res.status(400).json({ success: false, error: 'Event is full' });
        }
        // Increment attendees
        await db.execute('UPDATE nullify_events SET attendees = attendees + 1 WHERE id = ?', [id]);
        const [[updated]] = await db.execute('SELECT attendees FROM nullify_events WHERE id = ?', [id]);
        res.json({ success: true, attendees: updated.attendees });
    } catch (err) {
        console.error('[joinEvent error]', err);
        res.status(500).json({ success: false, error: 'Failed to join event' });
    }
}

module.exports = {
    getAllEvents,
    createEvent,
    deleteEvent,
    joinEvent
};
