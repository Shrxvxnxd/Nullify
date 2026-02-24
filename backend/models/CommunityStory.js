const mongoose = require('mongoose');

const communityStorySchema = new mongoose.Schema({
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
    mediaUrl: {
        type: String,
        required: true
    },
    mediaType: {
        type: String,
        enum: ['image', 'video'],
        default: 'image'
    },
    likes: [{
        type: Number // user IDs
    }],
    comments: [{
        authorId: { type: Number, required: true },
        authorName: { type: String, required: true },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }],
    shares: {
        type: Number,
        default: 0
    },
    isArchived: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// TTL index: only delete non-archived stories after 24 hours
communityStorySchema.index(
    { createdAt: 1 },
    { expireAfterSeconds: 86400, partialFilterExpression: { isArchived: false } }
);

module.exports = mongoose.model('CommunityStory', communityStorySchema);
