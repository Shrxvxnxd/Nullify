const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const { verifyToken } = require('../middleware/authMiddleware');

// POST /api/community/posts - Create a new post
router.post('/posts', verifyToken, communityController.createPost);

// GET /api/community/posts - Get posts for user's community
router.get('/posts', verifyToken, communityController.getCommunityPosts);

// Stories
router.get('/stories', communityController.getStories);
router.post('/stories', verifyToken, communityController.uploadStory);
router.post('/stories/:storyId/like', verifyToken, communityController.toggleStoryLike);
router.post('/stories/:storyId/comment', verifyToken, communityController.addStoryComment);
router.post('/stories/:storyId/share', verifyToken, communityController.shareStory);
router.delete('/stories/:storyId', verifyToken, communityController.deleteStory);
router.post('/stories/:storyId/archive', verifyToken, communityController.toggleArchiveStory);

// Notifications
router.get('/notifications', verifyToken, communityController.getNotifications);
router.put('/notifications/read-all', verifyToken, communityController.markAllNotificationsRead);
router.put('/notifications/:id/read', verifyToken, communityController.markNotificationRead);

// POST /api/community/posts/:postId/like - Toggle like
router.post('/posts/:postId/like', verifyToken, communityController.toggleLike);

// POST /api/community/posts/:postId/comment - Add comment
router.post('/posts/:postId/comment', verifyToken, communityController.addComment);

// PUT /api/community/posts/:postId/comments/:commentId - Update comment
router.put('/posts/:postId/comments/:commentId', verifyToken, communityController.updateComment);

// DELETE /api/community/posts/:postId/comments/:commentId - Delete comment
router.delete('/posts/:postId/comments/:commentId', verifyToken, communityController.deleteComment);

// PUT /api/community/posts/:postId - Update post
router.put('/posts/:postId', verifyToken, communityController.updatePost);

// DELETE /api/community/posts/:postId - Delete post
router.delete('/posts/:postId', verifyToken, communityController.deletePost);

// GET /api/community/trending - Public trending hashtags
router.get('/trending', communityController.getTrendingHashtags);

// GET /api/community/user/:userId/posts - Get posts for a specific user
router.get('/user/:userId/posts', verifyToken, communityController.getUserPosts);

// GET /api/community/leaderboard
router.get('/leaderboard', communityController.getLeaderboard);

module.exports = router;
