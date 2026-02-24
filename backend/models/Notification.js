const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipientId: {
        type: Number,
        required: true,
        index: true
    },
    senderId: {
        type: Number,
        required: true
    },
    senderName: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['story_comment', 'story_like', 'story_share', 'post_like', 'post_comment'],
        required: true
    },
    storyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CommunityStory'
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CommunityPost'
    },
    message: {
        type: String,
        required: true
    },
    postSnippet: {
        type: String,
        default: ''
    },
    read: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: { expires: '7d' } // Auto-delete after 7 days
    }
});

module.exports = mongoose.model('Notification', notificationSchema);
