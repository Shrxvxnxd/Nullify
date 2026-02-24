const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const CommunityPost = require('../models/CommunityPost');
// CommunityStory might not be required if not used, but let's check
let CommunityStory;
try {
    CommunityStory = require('../models/CommunityStory');
} catch (e) {
    console.log('CommunityStory model not found, skipping...');
}
const Notification = require('../models/Notification');

// Fix: The env var is MONGODB_URI in .env
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/nullify_hackathon';

async function cleanup() {
    try {
        console.log('Connecting to MongoDB...');
        // Remove trailing slash if any to avoid connection issues
        const cleanUri = MONGO_URI.trim();

        await mongoose.connect(cleanUri);
        console.log('Connected.');

        console.log('Purging Community Posts...');
        const postsResult = await CommunityPost.deleteMany({});
        console.log(`Deleted ${postsResult.deletedCount} posts.`);

        if (CommunityStory) {
            console.log('Purging Community Stories...');
            const storiesResult = await CommunityStory.deleteMany({});
            console.log(`Deleted ${storiesResult.deletedCount} stories.`);
        }

        console.log('Purging Notifications...');
        const notifResult = await Notification.deleteMany({});
        console.log(`Deleted ${notifResult.deletedCount} notifications.`);

        console.log('\n--- CLEANUP COMPLETE ---');
        process.exit(0);
    } catch (err) {
        console.error('Cleanup failed:', err);
        process.exit(1);
    }
}

cleanup();
