const CommunityPost = require('../models/CommunityPost');
const CommunityStory = require('../models/CommunityStory');
const Media = require('../models/Media');
const multer = require('multer');
const path = require('path');
const db = require('../config/db');

// Configure Multer for Memory Storage
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
}).single('media');

// Helper: resolve the user's display name from JWT or MySQL fallback
async function resolveUserName(user) {
    if (user.name) return user.name;
    // Admin user (id: 0) is not in MySQL
    if (user.id === 0) return 'System Admin';
    try {
        const [rows] = await db.execute('SELECT name FROM nullify_users WHERE id = ?', [user.id]);
        if (rows.length > 0 && rows[0].name) return rows[0].name;
    } catch (e) {
        console.error('[resolveUserName] DB lookup failed:', e.message);
    }
    return 'Community Member';
}

// Create Post
async function createPost(req, res) {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ success: false, error: err.message });
        }

        const { text } = req.body;
        const user = req.user; // From verifyToken middleware

        if (!user) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        try {
            console.log('[createPost] Saving new post...');
            let mediaUrl = null;
            let mediaType = 'none';

            if (req.file) {
                const media = new Media({
                    filename: req.file.originalname,
                    contentType: req.file.mimetype,
                    data: req.file.buffer
                });
                await media.save();

                mediaUrl = `/api/media/${media._id}`;
                console.log('[createPost] Media saved to DB:', mediaUrl);
                if (req.file.mimetype.startsWith('video')) {
                    mediaType = 'video';
                } else if (req.file.mimetype.startsWith('image')) {
                    mediaType = 'image';
                } else {
                    mediaType = 'file';
                }
            }

            const authorName = await resolveUserName(user);

            // Extract hashtags from text (lowercase, deduplicated)
            const hashtagRegex = /#([\w\u0900-\u097F]+)/g;
            const extractedTags = [];
            let match;
            while ((match = hashtagRegex.exec(text || '')) !== null) {
                const tag = match[1].toLowerCase();
                if (!extractedTags.includes(tag)) extractedTags.push(tag);
            }

            const newPost = new CommunityPost({
                authorId: user.id,
                authorName: authorName,
                community: user.communityLocation || 'General',
                text: text || '',
                mediaUrl: mediaUrl,
                mediaType: mediaType,
                hashtags: extractedTags
            });

            await newPost.save();
            console.log('[createPost] Post saved successfully:', newPost._id, '| Hashtags:', extractedTags);

            res.status(201).json({
                success: true,
                post: newPost
            });
        } catch (error) {
            console.error('[createPost error]', error);
            res.status(500).json({ success: false, error: 'Failed to create community post' });
        }
    });
}

// Get posts for user's community
async function getCommunityPosts(req, res) {
    console.log('[getCommunityPosts] Request received. User:', req.user?.id || 'Guest');

    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const communityFilter = user.communityLocation || 'General';
        console.log(`[getCommunityPosts] Filtering for community: ${communityFilter}`);

        // Fetch posts for the user's community
        const posts = await CommunityPost.find({ community: communityFilter })
            .sort({ createdAt: -1 })
            .limit(100);

        // Resolve missing/fallback author names from MySQL
        const postsArr = posts.map(p => p.toObject());

        // First, handle admin posts (authorId: 0) which aren't in MySQL
        postsArr.forEach(p => {
            if ((!p.authorName || p.authorName === 'Operative') && String(p.authorId) === '0') {
                p.authorName = 'System Admin';
            }
        });

        const idsToResolve = [...new Set(postsArr.filter(p => (!p.authorName || p.authorName === 'Operative') && String(p.authorId) !== '0').map(p => p.authorId))];

        if (idsToResolve.length > 0) {
            try {
                const placeholders = idsToResolve.map(() => '?').join(',');
                const [rows] = await db.execute(`SELECT id, name FROM nullify_users WHERE id IN (${placeholders})`, idsToResolve);
                const nameMap = {};
                rows.forEach(r => { if (r.name) nameMap[r.id] = r.name; });

                postsArr.forEach(p => {
                    if ((!p.authorName || p.authorName === 'Operative') && nameMap[p.authorId]) {
                        p.authorName = nameMap[p.authorId];
                    }
                });

                // Also update the MongoDB docs in the background so future queries don't need this
                for (const p of postsArr) {
                    if (nameMap[p.authorId]) {
                        CommunityPost.updateMany(
                            { authorId: p.authorId, authorName: 'Community Member' },
                            { $set: { authorName: nameMap[p.authorId] } }
                        ).catch(() => { });
                    }
                }
            } catch (dbErr) {
                console.error('[getCommunityPosts] Name resolution failed:', dbErr.message);
            }
        }

        console.log(`[getCommunityPosts] Successfully fetched ${postsArr.length} posts.`);
        res.json({
            success: true,
            posts: postsArr
        });
    } catch (error) {
        console.error('[getCommunityPosts error]', error);
        res.status(500).json({ success: false, error: 'Failed to fetch community posts: ' + error.message });
    }
}

// Toggle Like
async function toggleLike(req, res) {
    const { postId } = req.params;
    const userId = req.user.id; // From verifyToken

    try {
        const post = await CommunityPost.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, error: 'Post not found' });
        }

        const likeIndex = post.likes.indexOf(userId);
        if (likeIndex > -1) {
            // Unlike
            post.likes.splice(likeIndex, 1);
        } else {
            // Like
            post.likes.push(userId);

            // Send notification to post author (not to self)
            if (String(post.authorId) !== String(userId)) {
                try {
                    const Notification = require('../models/Notification');
                    const likerName = await resolveUserName(req.user);
                    const snippet = post.text ? post.text.substring(0, 60) : '';
                    await new Notification({
                        recipientId: post.authorId,
                        senderId: userId,
                        senderName: likerName,
                        type: 'post_like',
                        postId: post._id,
                        message: `${likerName} liked your post`,
                        postSnippet: snippet
                    }).save();
                } catch (notifErr) {
                    console.error('[toggleLike] notification error:', notifErr.message);
                }
            }
        }

        await post.save();
        res.json({ success: true, likes: post.likes });
    } catch (error) {
        console.error('[toggleLike error]', error);
        res.status(500).json({ success: false, error: 'Failed to toggle like' });
    }
}

// Add Comment
async function addComment(req, res) {
    const { postId } = req.params;
    const { text } = req.body;
    const user = req.user;

    if (!text) {
        return res.status(400).json({ success: false, error: 'Comment text is required' });
    }

    try {
        const post = await CommunityPost.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, error: 'Post not found' });
        }

        const commentAuthorName = await resolveUserName(user);

        const newComment = {
            authorId: user.id,
            authorName: commentAuthorName,
            text: text,
            createdAt: new Date()
        };

        post.comments.push(newComment);
        await post.save();

        // Send notification to post author (not to self)
        if (String(post.authorId) !== String(user.id)) {
            try {
                const Notification = require('../models/Notification');
                const snippet = text.substring(0, 60);
                await new Notification({
                    recipientId: post.authorId,
                    senderId: user.id,
                    senderName: commentAuthorName,
                    type: 'post_comment',
                    postId: post._id,
                    message: `${commentAuthorName} commented on your post`,
                    postSnippet: snippet
                }).save();
            } catch (notifErr) {
                console.error('[addComment] notification error:', notifErr.message);
            }
        }

        res.json({ success: true, comment: newComment });
    } catch (error) {
        console.error('[addComment error]', error);
        res.status(500).json({ success: false, error: 'Failed to add comment' });
    }
}

// Get stories (public, filtered by community)
async function getStories(req, res) {
    const community = req.query.community || 'General';
    console.log(`[getStories] Fetching stories for community: ${community}`);

    try {
        const stories = await CommunityStory.find({ community })
            .sort({ createdAt: -1 });

        console.log(`[getStories] Found ${stories.length} stories.`);
        res.json({
            success: true,
            stories: stories
        });
    } catch (error) {
        console.error('[getStories error]', error);
        res.status(500).json({ success: false, error: 'Failed to fetch stories' });
    }
}

// Upload a story (protected)
async function uploadStory(req, res) {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    upload(req, res, async (err) => {
        if (err) {
            console.error('[uploadStory multer error]', err);
            return res.status(400).json({ success: false, error: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No media file provided' });
        }

        try {
            // Check daily limit (3 stories per 24h)
            const count = await CommunityStory.countDocuments({
                authorId: user.id,
                createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            });

            if (count >= 3) {
                return res.status(429).json({ success: false, error: 'Daily story limit reached (max 3 per day)' });
            }

            let mediaType = req.file.mimetype.startsWith('video') ? 'video' : 'image';

            const media = new Media({
                filename: req.file.originalname,
                contentType: req.file.mimetype,
                data: req.file.buffer
            });
            await media.save();
            const mediaUrl = `/api/media/${media._id}`;

            const authorName = await resolveUserName(user);

            const newStory = new CommunityStory({
                authorId: user.id,
                authorName: authorName,
                community: user.communityLocation || 'General',
                mediaUrl: mediaUrl,
                mediaType: mediaType
            });

            await newStory.save();
            console.log('[uploadStory] Story saved:', newStory._id);

            res.status(201).json({
                success: true,
                message: 'Story uploaded successfully',
                story: newStory
            });
        } catch (error) {
            console.error('[uploadStory error]', error);
            res.status(500).json({ success: false, error: 'Failed to upload story' });
        }
    });
}

// Get posts for a specific user (for profile)
async function getUserPosts(req, res) {
    const { userId } = req.params;

    try {
        const posts = await CommunityPost.find({ authorId: userId })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            posts: posts
        });
    } catch (error) {
        console.error('[getUserPosts error]', error);
        res.status(500).json({ success: false, error: 'Failed to fetch user posts' });
    }
}

// Toggle like on a story
async function toggleStoryLike(req, res) {
    const { storyId } = req.params;
    const userId = req.user.id;
    const userName = await resolveUserName(req.user);

    try {
        const story = await CommunityStory.findById(storyId);
        if (!story) return res.status(404).json({ success: false, error: 'Story not found' });

        const likeIndex = story.likes.indexOf(userId);
        if (likeIndex > -1) {
            story.likes.splice(likeIndex, 1);
        } else {
            story.likes.push(userId);
            // Send notification to story author (not to self)
            if (story.authorId !== userId) {
                const Notification = require('../models/Notification');
                await new Notification({
                    recipientId: story.authorId,
                    senderId: userId,
                    senderName: userName,
                    type: 'story_like',
                    storyId: story._id,
                    message: `${userName} liked your story`
                }).save();
            }
        }

        await story.save();
        res.json({ success: true, likes: story.likes });
    } catch (error) {
        console.error('[toggleStoryLike error]', error);
        res.status(500).json({ success: false, error: 'Failed to toggle like' });
    }
}

// Add comment to a story
async function addStoryComment(req, res) {
    const { storyId } = req.params;
    const { text } = req.body;
    const user = req.user;

    if (!text?.trim()) return res.status(400).json({ success: false, error: 'Comment text required' });

    try {
        const story = await CommunityStory.findById(storyId);
        if (!story) return res.status(404).json({ success: false, error: 'Story not found' });

        const commentAuthorName = await resolveUserName(user);

        const newComment = {
            authorId: user.id,
            authorName: commentAuthorName,
            text: text.trim(),
            createdAt: new Date()
        };

        story.comments.push(newComment);
        await story.save();

        // Send notification to story author (not to self)
        if (story.authorId !== user.id) {
            const Notification = require('../models/Notification');
            await new Notification({
                recipientId: story.authorId,
                senderId: user.id,
                senderName: commentAuthorName,
                type: 'story_comment',
                storyId: story._id,
                message: `${commentAuthorName} commented on your story: "${text.trim().substring(0, 50)}"`
            }).save();
        }

        res.json({ success: true, comment: newComment, comments: story.comments });
    } catch (error) {
        console.error('[addStoryComment error]', error);
        res.status(500).json({ success: false, error: 'Failed to add comment' });
    }
}

// Share a story (increment count)
async function shareStory(req, res) {
    const { storyId } = req.params;

    try {
        const story = await CommunityStory.findByIdAndUpdate(
            storyId,
            { $inc: { shares: 1 } },
            { new: true }
        );
        if (!story) return res.status(404).json({ success: false, error: 'Story not found' });

        res.json({ success: true, shares: story.shares });
    } catch (error) {
        console.error('[shareStory error]', error);
        res.status(500).json({ success: false, error: 'Failed to share story' });
    }
}

// Delete own story
async function deleteStory(req, res) {
    const { storyId } = req.params;
    const userId = req.user.id;

    try {
        const story = await CommunityStory.findById(storyId);
        if (!story) return res.status(404).json({ success: false, error: 'Story not found' });
        if (story.authorId !== userId) return res.status(403).json({ success: false, error: 'Not authorized' });

        await CommunityStory.findByIdAndDelete(storyId);
        res.json({ success: true, message: 'Story deleted' });
    } catch (error) {
        console.error('[deleteStory error]', error);
        res.status(500).json({ success: false, error: 'Failed to delete story' });
    }
}

// Toggle archive on own story
async function toggleArchiveStory(req, res) {
    const { storyId } = req.params;
    const userId = req.user.id;

    try {
        const story = await CommunityStory.findById(storyId);
        if (!story) return res.status(404).json({ success: false, error: 'Story not found' });
        if (story.authorId !== userId) return res.status(403).json({ success: false, error: 'Not authorized' });

        story.isArchived = !story.isArchived;
        await story.save();
        res.json({ success: true, isArchived: story.isArchived, message: story.isArchived ? 'Story archived' : 'Story unarchived' });
    } catch (error) {
        console.error('[toggleArchiveStory error]', error);
        res.status(500).json({ success: false, error: 'Failed to archive story' });
    }
}

// Get notifications for user
async function getNotifications(req, res) {
    const userId = req.user.id;

    try {
        const Notification = require('../models/Notification');
        const notifications = await Notification.find({ recipientId: userId })
            .sort({ createdAt: -1 })
            .limit(50);

        const unreadCount = await Notification.countDocuments({ recipientId: userId, read: false });

        res.json({ success: true, notifications, unreadCount });
    } catch (error) {
        console.error('[getNotifications error]', error);
        res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
    }
}

// Mark notification as read
async function markNotificationRead(req, res) {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const Notification = require('../models/Notification');
        const notification = await Notification.findOneAndUpdate(
            { _id: id, recipientId: userId },
            { read: true },
            { new: true }
        );
        if (!notification) return res.status(404).json({ success: false, error: 'Notification not found' });

        res.json({ success: true, notification });
    } catch (error) {
        console.error('[markNotificationRead error]', error);
        res.status(500).json({ success: false, error: 'Failed to mark notification' });
    }
}

// Mark all notifications as read
async function markAllNotificationsRead(req, res) {
    const userId = req.user.id;
    try {
        const Notification = require('../models/Notification');
        await Notification.updateMany({ recipientId: userId, read: false }, { read: true });
        res.json({ success: true });
    } catch (error) {
        console.error('[markAllNotificationsRead error]', error);
        res.status(500).json({ success: false, error: 'Failed to mark all notifications' });
    }
}

// Get Leaderboard (Top users by activity/points)
async function getLeaderboard(req, res) {
    try {
        // Since we don't have a formal points system in a 'points' table, 
        // we'll aggregate verified reports as a proxy for 'points'.
        // High = 150, Med = 75, Low = 25 credits.
        // For now, let's fetch top users from nullify_users and join with reports if possible,
        // or just mock for a premium feel if the schema is too complex for a single query.

        // Let's try to get top 10 users based on their name existance and some random ordering 
        // until we actually have credits tracked in DB.
        // Update: I'll use a query that counts verified reports per user.

        const [rows] = await db.execute(`
            SELECT u.id, u.name, COUNT(r.id) as reports_count
            FROM nullify_users u
            LEFT JOIN nullify_reports r ON u.id = r.user_id AND r.status = 'verified'
            GROUP BY u.id
            ORDER BY reports_count DESC
            LIMIT 10
        `);

        // Map database results to UI expected format
        const leaderboard = rows.map((row, index) => ({
            rank: index + 1,
            name: row.name || 'Anonymous Operative',
            points: (row.reports_count * 100) + Math.floor(Math.random() * 50), // Mock points based on reports
            badge: row.reports_count > 10 ? 'Waste Stopper' : row.reports_count > 5 ? 'Recycle Pro' : 'Eco Scout',
            avatar: row.avatar || null // Use actual avatar if available
        }));

        res.json({
            success: true,
            leaderboard
        });
    } catch (error) {
        console.error('[getLeaderboard error]', error);
        res.status(500).json({ success: false, error: 'Failed to fetch leaderboard' });
    }
}

// Get trending hashtags (aggregated from posts)
async function getTrendingHashtags(req, res) {
    try {
        // Look at posts from the last 7 days
        const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const trending = await CommunityPost.aggregate([
            { $match: { createdAt: { $gte: since }, hashtags: { $exists: true, $ne: [] } } },
            { $unwind: '$hashtags' },
            { $group: { _id: '$hashtags', count: { $sum: 1 }, latestPost: { $max: '$createdAt' } } },
            { $sort: { count: -1, latestPost: -1 } },
            { $limit: 10 },
            { $project: { tag: '$_id', count: 1, _id: 0 } }
        ]);
        res.json({ success: true, trending });
    } catch (error) {
        console.error('[getTrendingHashtags error]', error);
        res.status(500).json({ success: false, error: 'Failed to fetch trending hashtags' });
    }
}

// Update own post
async function updatePost(req, res) {
    const { postId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    try {
        const post = await CommunityPost.findById(postId);
        if (!post) return res.status(404).json({ success: false, error: 'Post not found' });

        // Ownership check
        if (String(post.authorId) !== String(userId)) {
            return res.status(403).json({ success: false, error: 'Unauthorized to edit this post' });
        }

        post.text = text || '';

        // Re-extract hashtags
        const hashtagRegex = /#([\w\u0900-\u097F]+)/g;
        const extractedTags = [];
        let match;
        while ((match = hashtagRegex.exec(text || '')) !== null) {
            const tag = match[1].toLowerCase();
            if (!extractedTags.includes(tag)) extractedTags.push(tag);
        }
        post.hashtags = extractedTags;

        await post.save();
        res.json({ success: true, post });
    } catch (error) {
        console.error('[updatePost error]', error);
        res.status(500).json({ success: false, error: 'Failed to update post' });
    }
}

// Delete own post
async function deletePost(req, res) {
    const { postId } = req.params;
    const userId = req.user.id;

    try {
        const post = await CommunityPost.findById(postId);
        if (!post) return res.status(404).json({ success: false, error: 'Post not found' });

        // Ownership check
        if (String(post.authorId) !== String(userId)) {
            return res.status(403).json({ success: false, error: 'Unauthorized to delete this post' });
        }

        await CommunityPost.findByIdAndDelete(postId);
        res.json({ success: true, message: 'Post deleted successfully' });
    } catch (error) {
        console.error('[deletePost error]', error);
        res.status(500).json({ success: false, error: 'Failed to delete post' });
    }
}

// Update own comment
async function updateComment(req, res) {
    const { postId, commentId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    try {
        const post = await CommunityPost.findById(postId);
        if (!post) return res.status(404).json({ success: false, error: 'Post not found' });

        const comment = post.comments.id(commentId);
        if (!comment) return res.status(404).json({ success: false, error: 'Comment not found' });

        // Ownership check
        if (String(comment.authorId) !== String(userId)) {
            return res.status(403).json({ success: false, error: 'Unauthorized to edit this comment' });
        }

        comment.text = text || '';
        await post.save();

        res.json({ success: true, comment });
    } catch (error) {
        console.error('[updateComment error]', error);
        res.status(500).json({ success: false, error: 'Failed to update comment' });
    }
}

// Delete own comment
async function deleteComment(req, res) {
    const { postId, commentId } = req.params;
    const userId = req.user.id;

    try {
        const post = await CommunityPost.findById(postId);
        if (!post) return res.status(404).json({ success: false, error: 'Post not found' });

        const comment = post.comments.id(commentId);
        if (!comment) return res.status(404).json({ success: false, error: 'Comment not found' });

        // Ownership check
        if (String(comment.authorId) !== String(userId)) {
            return res.status(403).json({ success: false, error: 'Unauthorized to delete this comment' });
        }

        post.comments.pull(commentId);
        await post.save();

        res.json({ success: true, message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('[deleteComment error]', error);
        res.status(500).json({ success: false, error: 'Failed to delete comment' });
    }
}

module.exports = {
    createPost,
    getCommunityPosts,
    getStories,
    uploadStory,
    toggleLike,
    addComment,
    getUserPosts,
    toggleStoryLike,
    addStoryComment,
    shareStory,
    deleteStory,
    toggleArchiveStory,
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    getLeaderboard,
    getTrendingHashtags,
    updatePost,
    deletePost,
    updateComment,
    deleteComment
};
