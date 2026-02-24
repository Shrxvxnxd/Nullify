const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
    filename: String,
    contentType: String,
    data: Buffer,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Media', mediaSchema);
