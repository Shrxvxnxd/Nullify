const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from backend directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectMongo = require('../config/mongoDb');
const CommunityPost = require('../models/CommunityPost');
const CommunityStory = require('../models/CommunityStory');
const Media = require('../models/Media');
const Notification = require('../models/Notification');

async function clearData() {
    try {
        await connectMongo();
        console.log('--- Connected to MongoDB ---');

        const postResult = await CommunityPost.deleteMany({});
        console.log(`Deleted ${postResult.deletedCount} Community Posts.`);

        const storyResult = await CommunityStory.deleteMany({});
        console.log(`Deleted ${storyResult.deletedCount} Community Stories.`);

        const mediaResult = await Media.deleteMany({});
        console.log(`Deleted ${mediaResult.deletedCount} Media files.`);

        const notificationResult = await Notification.deleteMany({});
        console.log(`Deleted ${notificationResult.deletedCount} Notifications.`);

        console.log('--- Cleanup Complete ---');
        process.exit(0);
    } catch (error) {
        console.error('Cleanup Failed:', error);
        process.exit(1);
    }
}

clearData();
