const express = require('express');
const router = express.Router();
const Media = require('../models/Media');

router.get('/:id', async (req, res) => {
    try {
        const media = await Media.findById(req.params.id);
        if (!media) return res.status(404).send('Not found');
        res.set('Content-Type', media.contentType);
        res.send(media.data);
    } catch (e) {
        console.error('[Media Route Error]', e);
        res.status(500).send('Error');
    }
});

module.exports = router;
