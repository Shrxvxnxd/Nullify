const mongoose = require('mongoose');

const communityPostSchema = new mongoose.Schema({
    authorId: {
        type: Number,
        required: true
    },
    authorName: {
        type: String,
        required: true
    },
    community: {
        type: String,
        required: true,
        index: true
    },
    text: {
        type: String,
        default: ''
    },
    mediaUrl: {
        type: String,
        default: null
    },
    mediaType: {
        type: String,
        enum: ['image', 'video', 'file', 'none'],
        default: 'none'
    },
    likes: {
        type: [Number], // Array of authorIds
        default: []
    },
    comments: [{
        authorId: Number,
        authorName: String,
        text: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    hashtags: {
        type: [String],
        default: [],
        index: true
    }
});

module.exports = mongoose.model('CommunityPost', communityPostSchema);
