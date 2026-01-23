const { uploadFileToCloudinary } = require("../config/cloudinary");
const Post = require("../model/Post");
const User = require("../model/User"); // Added this line
const Story = require("../model/story");
const response = require("../utils/responceHandler");




const createPost = async (req, res) => {
    try {
        const userId = req.user.userId;

        const { content } = req.body;
        const file = req.file;
        let mediaUrl = null;
        let mediaType = null;

        if (file) {
            const uploadResult = await uploadFileToCloudinary(file)
            mediaUrl = uploadResult?.secure_url;
            mediaType = file.mimetype.startsWith('video') ? 'video' : 'image';
        }

        //create a new post
        const newPost = await new Post({
            user: userId,
            content,
            mediaUrl,
            mediaType,
            likeCount: 0,
            commentCount: 0,
            shareCount: 0,
        })

        await newPost.save();
        return response(res, 201, 'Post created successfully', newPost)

    } catch (error) {
        console.log('error creating post', error)
        return response(res, 500, 'Internal server error', error.message)
    }
}


//create story 

const createStory = async (req, res) => {
    try {
        const userId = req.user.userId;
        const file = req.file;

        if (!file) {
            return response(res, 400, 'file is required to create a story')
        }
        let mediaUrl = null;
        let mediaType = null;

        if (file) {
            const uploadResult = await uploadFileToCloudinary(file)
            mediaUrl = uploadResult?.secure_url;
            mediaType = file.mimetype.startsWith('video') ? 'video' : 'image';
        }

        //create a new story
        const newStory = await new Story({
            user: userId,
            mediaUrl,
            mediaType
        })

        await newStory.save();
        return response(res, 201, 'Story created successfully', newStory)

    } catch (error) {
        console.log('error creating story', error)
        return response(res, 500, 'Internal server error', error.message)
    }
}


//getAllStory
const getAllStory = async (req, res) => {
    try {
        const story = await Story.find()
            .sort({ createdAt: -1 })
            .populate('user', '_id username profilePicture email')

        return response(res, 201, 'Get all story successfully', story)
    } catch (error) {
        console.log('error getting story', error)
        return response(res, 500, 'Internal server error', error.message)
    }
}



//get all posts
const getAllPosts = async (req, res) => {
    try {
        const loggedInUserId = req.user.userId;
        const currentUser = await User.findById(loggedInUserId);

        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate('user', '_id username profilePicture email isPrivate friends blockedUsers')
            .populate({
                path: 'comments.user',
                select: 'username profilePicture'
            });

        // Filter posts based on privacy and blocking
        const filteredPosts = posts.filter(post => {
            const postOwner = post.user;
            if (!postOwner) return false;

            const postOwnerId = postOwner._id.toString();
            const isOwner = postOwnerId === loggedInUserId;

            // Check blocking
            const isBlockedByOwner = postOwner.blockedUsers?.some(id => id.toString() === loggedInUserId);
            const isBlockedByMe = currentUser?.blockedUsers?.some(id => id.toString() === postOwnerId);

            if (isBlockedByOwner || isBlockedByMe) return false;

            // Check privacy
            const isFriend = postOwner.friends?.some(id => id.toString() === loggedInUserId.toString());

            if (isOwner) return true;
            if (postOwner.isPrivate && !isFriend) return false;

            return true;
        });

        return response(res, 201, 'Get all posts successfully', filteredPosts)
    } catch (error) {
        console.log('error getting posts', error)
        return response(res, 500, 'Internal server error', error.message)
    }
}


//get post by userId
const getPostByUserId = async (req, res) => {
    const { userId } = req.params;
    const loggedInUserId = req.user.userId;

    try {
        if (!userId) {
            return response(res, 400, 'UserId is require to get user post')
        }

        const userProfile = await User.findById(userId);
        if (!userProfile) return response(res, 404, 'User not found');

        const currentUser = await User.findById(loggedInUserId);

        const isOwner = loggedInUserId === userId;
        const isFriend = userProfile.friends?.some(id => id.toString() === loggedInUserId.toString());
        const isBlockedByOwner = userProfile.blockedUsers?.some(id => id.toString() === loggedInUserId.toString());
        const isBlockedByMe = currentUser?.blockedUsers?.some(id => id.toString() === userId.toString());

        if (isBlockedByOwner || isBlockedByMe) {
            return response(res, 403, 'Cannot access posts of a blocked user');
        }

        if (userProfile.isPrivate && !isOwner && !isFriend) {
            return response(res, 200, 'This profile is private', []);
        }

        const posts = await Post.find({ user: userId })
            .sort({ createdAt: -1 })
            .populate('user', '_id username profilePicture email isPrivate friends blockedUsers')
            .populate({
                path: 'comments.user',
                select: 'username profilePicture'
            });

        return response(res, 201, 'Get user post successfully', posts)
    } catch (error) {
        console.log('error getting posts', error)
        return response(res, 500, 'Internal server error', error.message)
    }
}

//like post api
const likePost = async (req, res) => {
    const { postId } = req.params;
    const userId = req.user.userId;
    try {
        const post = await Post.findById(postId)
        if (!post) {
            return response(res, 404, 'post not found')
        }
        const hasLiked = post.likes.includes(userId)
        if (hasLiked) {
            post.likes = post.likes.filter(id => id.toString() !== userId.toString())
            post.likeCount = Math.max(0, post.likeCount - 1); //ensure llikecount does not go negative
        } else {
            post.likes.push(userId)
            post.likeCount += 1
        }


        //save the like in updated post
        const updatedpost = await post.save()
        return response(res, 201, hasLiked ? "Post unlike successfully" : "post liked successfully", updatedpost)
    } catch (error) {
        console.log(error)
        return response(res, 500, 'Internal server error', error.message)
    }
}

//post comments by user

const addCommentToPost = async (req, res) => {
    const { postId } = req.params;
    const userId = req.user.userId;
    const { text } = req.body;
    try {
        const post = await Post.findById(postId)
        if (!post) {
            return response(res, 404, 'post not found')
        }


        post.comments.push({ user: userId, text })
        post.commentCount += 1;

        //save the post with new comments
        await post.save()
        return response(res, 201, "comments added successfully", post)
    } catch (error) {
        console.log(error)
        return response(res, 500, 'Internal server error', error.message)
    }
}



//share on post by user
const sharePost = async (req, res) => {
    const { postId } = req.params;
    const userId = req.user.userId;
    try {
        const post = await Post.findById(postId)
        if (!post) {
            return response(res, 404, 'post not found')
        }
        const hasUserShared = post.share.includes(userId)
        if (!hasUserShared) {
            post.share.push(userId)
        }

        post.shareCount += 1;

        //save the share in updated post
        await post.save()
        return response(res, 201, 'post share successfully', post)
    } catch (error) {
        console.log(error)
        return response(res, 500, 'Internal server error', error.message)
    }
}

const likeComment = async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user.userId;
    try {
        const post = await Post.findOne({ "comments._id": commentId });
        if (!post) return response(res, 404, 'Post or Comment not found');

        const comment = post.comments.id(commentId);
        if (!comment) return response(res, 404, 'Comment not found');

        const hasLiked = comment.likes.includes(userId);
        if (hasLiked) {
            comment.likes = comment.likes.filter(id => id.toString() !== userId.toString());
        } else {
            comment.likes.push(userId);
        }

        await post.save();
        return response(res, 201, hasLiked ? "Comment unliked successfully" : "Comment liked successfully", post);
    } catch (error) {
        return response(res, 500, 'Internal server error', error.message);
    }
}

const addReplyToComment = async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user.userId;
    const { text } = req.body;
    try {
        const post = await Post.findOne({ "comments._id": commentId });
        if (!post) return response(res, 404, 'Post or Comment not found');

        const comment = post.comments.id(commentId);
        if (!comment) return response(res, 404, 'Comment not found');

        comment.replies.push({ user: userId, text });
        await post.save();
        return response(res, 201, "Reply added successfully", post);
    } catch (error) {
        return response(res, 500, 'Internal server error', error.message);
    }
}







module.exports = {
    createPost,
    getAllPosts,
    getPostByUserId,
    likePost,
    addCommentToPost,
    sharePost,
    createStory,
    getAllStory,
    likeComment,
    addReplyToComment
}