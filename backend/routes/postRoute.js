const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { multerMiddleware } = require('../config/cloudinary');
const { createPost, getAllPosts, getPostByUserId, likePost, sharePost, addCommentToPost, getAllStory, createStory, likeComment, addReplyToComment, deletePost, deleteStory, likeStory } = require('../controllers/postController');
const router = express.Router();


//create post
router.post('/posts', authMiddleware, multerMiddleware.single('media'), createPost)

//get all posts
router.get('/posts', authMiddleware, getAllPosts)

//get post by userid
router.get('/posts/user/:userId', authMiddleware, getPostByUserId)

//delete post — sirf owner kar sakta hai
router.delete('/posts/:postId', authMiddleware, deletePost)


//user like post route
router.post('/posts/likes/:postId', authMiddleware, likePost)


//user share post route
router.post('/posts/share/:postId', authMiddleware, sharePost)


//user comments post route
router.post('/posts/comments/:postId', authMiddleware, addCommentToPost)

//user like comment route
router.post('/posts/comments/:commentId/like', authMiddleware, likeComment);

//user reply to comment route
router.post('/posts/comments/:commentId/reply', authMiddleware, addReplyToComment);


//create story
router.post('/story', authMiddleware, multerMiddleware.single('media'), createStory)

//get all story
router.get('/story', authMiddleware, getAllStory)

//delete story
router.delete('/story/:storyId', authMiddleware, deleteStory)

//like story
router.post('/story/likes/:storyId', authMiddleware, likeStory)

module.exports = router;