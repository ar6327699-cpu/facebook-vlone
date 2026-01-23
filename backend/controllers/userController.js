const User = require("../model/User");
const response = require("../utils/responceHandler");



//follow user
const followUser = async (req, res) => {
    const { userIdToFollow } = req.body;
    const userId = req?.user?.userId;
    //prevent the user to follow itself 
    if (userId === userIdToFollow) {
        return response(res, 400, 'You are not allowed to follow yourself');
    }
    try {
        const userToFollow = await User.findById(userIdToFollow)
        const currentUser = await User.findById(userId);

        //check both user is exit in database or not
        if (!userToFollow || !currentUser) {
            return response(res, 404, 'User not found')
        }

        // check if blocked
        const isBlocked = currentUser.blockedUsers.some(id => id.toString() === userIdToFollow) ||
            userToFollow.blockedUsers.some(id => id.toString() === userId);
        if (isBlocked) {
            return response(res, 403, 'Cannot follow/friend a blocked user or someone who has blocked you')
        }

        //check if current user is already following
        if (currentUser.following.includes(userIdToFollow)) {
            return response(res, 404, 'User already following this user');
        }

        //add user to the current user in following list
        currentUser.following.push(userIdToFollow);

        //add current user id to the user to follow ke follower vale list mein 
        userToFollow.followers.push(currentUser)

        //update the follower and following count
        currentUser.followingCount += 1;
        userToFollow.followerCount += 1;

        //check if userToFollow is also following currentUser
        if (userToFollow.following.some(id => id.toString() === userId)) {
            // Add to each other's friends list
            if (!currentUser.friends.some(id => id.toString() === userIdToFollow)) {
                currentUser.friends.push(userIdToFollow);
            }
            if (!userToFollow.friends.some(id => id.toString() === userId)) {
                userToFollow.friends.push(userId);
            }
        }

        //save the update current user aur user to follow
        await currentUser.save()
        await userToFollow.save()

        return response(res, 200, 'User followed successfully')

    } catch (error) {
        return response(res, 500, 'Internal server error', error.message)
    }
}




//unfollow user
const unfollowUser = async (req, res) => {
    const { userIdToUnFollow } = req.body;
    const userId = req?.user?.userId;

    //prevent the user to follow itself 
    if (userId === userIdToUnFollow) {
        return response(res, 400, 'You are not allowed to unfollow yourself');
    }
    try {
        const userToUnFollow = await User.findById(userIdToUnFollow)
        const currentUser = await User.findById(userId);

        //check both user is exit in database or not
        if (!userToUnFollow || !currentUser) {
            return response(res, 404, 'User not found')
        }

        //check if current user is already following
        if (!currentUser.following.includes(userIdToUnFollow)) {
            return response(res, 404, 'You are not following this user');
        }

        //remove the user from the following list and update the follower count
        currentUser.following = currentUser.following.filter(id => id.toString() !== userIdToUnFollow)
        userToUnFollow.followers = userToUnFollow.followers.filter(id => id.toString() !== userId) // Corrected from userToUnFollow.following to userToUnFollow.followers

        // If they were friends, remove from friends list
        currentUser.friends = currentUser.friends.filter(id => id.toString() !== userIdToUnFollow);
        userToUnFollow.friends = userToUnFollow.friends.filter(id => id.toString() !== userId);

        //update the follower and following count
        currentUser.followingCount -= 1;
        userToUnFollow.followerCount -= 1;

        //save the update current user aur user to follow
        await currentUser.save()
        await userToUnFollow.save()

        return response(res, 200, 'User unfollowed successfully')

    } catch (error) {
        return response(res, 500, 'Internal server error', error.message)
    }
}

// unfriend user
const unfriendUser = async (req, res) => {
    const { userIdToUnfriend } = req.body;
    const userId = req?.user?.userId;

    try {
        const userToUnfriend = await User.findById(userIdToUnfriend)
        const currentUser = await User.findById(userId);

        if (!userToUnfriend || !currentUser) {
            return response(res, 404, 'User not found')
        }

        // Remove from friends lists
        currentUser.friends = currentUser.friends.filter(id => id.toString() !== userIdToUnfriend);
        userToUnfriend.friends = userToUnfriend.friends.filter(id => id.toString() !== userId);

        // Also unfollow each other if desired (typical for FB)
        currentUser.following = currentUser.following.filter(id => id.toString() !== userIdToUnfriend);
        currentUser.followers = currentUser.followers.filter(id => id.toString() !== userIdToUnfriend);
        userToUnfriend.following = userToUnfriend.following.filter(id => id.toString() !== userId);
        userToUnfriend.followers = userToUnfriend.followers.filter(id => id.toString() !== userId);

        // Update counts
        currentUser.followingCount = currentUser.following.length;
        currentUser.followerCount = currentUser.followers.length;
        userToUnfriend.followingCount = userToUnfriend.following.length;
        userToUnfriend.followerCount = userToUnfriend.followers.length;

        await currentUser.save()
        await userToUnfriend.save()

        return response(res, 200, 'User unfriended successfully')
    } catch (error) {
        return response(res, 500, 'Internal server error', error.message)
    }
}

// block user
const blockUser = async (req, res) => {
    const { userIdToBlock } = req.body;
    const userId = req?.user?.userId;

    try {
        const currentUser = await User.findById(userId);
        if (currentUser.blockedUsers.includes(userIdToBlock)) {
            return response(res, 400, 'User already blocked');
        }

        currentUser.blockedUsers.push(userIdToBlock);

        // Also unfriend/unfollow when blocking
        currentUser.friends = currentUser.friends.filter(id => id.toString() !== userIdToBlock);
        currentUser.following = currentUser.following.filter(id => id.toString() !== userIdToBlock);
        currentUser.followers = currentUser.followers.filter(id => id.toString() !== userIdToBlock);

        const blockedUser = await User.findById(userIdToBlock);
        if (blockedUser) {
            blockedUser.friends = blockedUser.friends.filter(id => id.toString() !== userId);
            blockedUser.following = blockedUser.following.filter(id => id.toString() !== userId);
            blockedUser.followers = blockedUser.followers.filter(id => id.toString() !== userId);

            blockedUser.followingCount = blockedUser.following.length;
            blockedUser.followerCount = blockedUser.followers.length;
            await blockedUser.save();
        }

        currentUser.followingCount = currentUser.following.length;
        currentUser.followerCount = currentUser.followers.length;

        await currentUser.save();
        return response(res, 200, 'User blocked successfully');
    } catch (error) {
        return response(res, 500, 'Internal server error', error.message);
    }
}

// unblock user
const unblockUser = async (req, res) => {
    const { userIdToUnblock } = req.body;
    const userId = req?.user?.userId;

    try {
        const currentUser = await User.findById(userId);
        currentUser.blockedUsers = currentUser.blockedUsers.filter(id => id.toString() !== userIdToUnblock);
        await currentUser.save();
        return response(res, 200, 'User unblocked successfully');
    } catch (error) {
        return response(res, 500, 'Internal server error', error.message);
    }
}

// get blocked users
const getBlockedUsers = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId).populate('blockedUsers', 'username profilePicture email');
        if (!user) return response(res, 404, 'User not found');

        return response(res, 200, 'Blocked users fetched successfully', user.blockedUsers);
    } catch (error) {
        return response(res, 500, 'Internal server error', error.message);
    }
}

// toggle privacy
const togglePrivacy = async (req, res) => {
    const userId = req?.user?.userId;
    try {
        const user = await User.findById(userId);
        user.isPrivate = !user.isPrivate;
        await user.save();
        return response(res, 200, `Profile is now ${user.isPrivate ? 'private' : 'public'}`, user.isPrivate);
    } catch (error) {
        return response(res, 500, 'Internal server error', error.message);
    }
}


const deleteUserFromRequest = async (req, res) => {
    try {
        const loggedInUserId = req.user.userId;
        const { requestSenderId } = req.body;

        const requestSender = await User.findById(requestSenderId)
        const loggedInUser = await User.findById(loggedInUserId);

        //check both user is exit in database or not
        if (!requestSender || !loggedInUser) {
            return response(res, 404, 'User not found')
        }

        //check if the request sender is following to loggedin user or not
        const isRequestSend = requestSender.following.includes(loggedInUserId)

        if (!isRequestSend) {
            return response(res, 404, 'No request found for this user')
        }

        //remove the loggedIn userId from the request sender following list
        requestSender.following = requestSender.following.filter(user => user.toString() !== loggedInUserId)

        //remove the sender id from the loggedIn user followers list
        loggedInUser.followers = loggedInUser.followers.filter(user => user.toString() !== requestSenderId)

        //update follower and following counts
        loggedInUser.followerCount = loggedInUser.followers.length;
        requestSender.followingCount = requestSender.following.length


        //save both users
        await loggedInUser.save()
        await requestSender.save()

        return response(res, 200, `Friends request from ${requestSender.username} deleted successfully `)

    } catch (error) {
        return response(res, 500, 'Internal server error', error.message)
    }
}


//get all frined request fro user
const getAllFriendsRequest = async (req, res) => {
    try {
        const loggedInUserId = req.user.userId;

        //find the logged in user and retrive their followers and following

        const loggedInUser = await User.findById(loggedInUserId).select('followers following')
        if (!loggedInUser) {
            return response(res, 404, 'User not found')
        }

        //find user who follow the logged in user but are not followed back
        const userToFollowBack = await User.find({
            _id: {
                $in: loggedInUser.followers, //user who follow the logged in user
                $nin: loggedInUser.following // exclued users the logged in user already follow back
            }
        }).select('username profilePicture email followerCount');

        return response(res, 200, 'user to follow back get successfully', userToFollowBack)

    } catch (error) {
        return response(res, 500, 'Internal server error', error.message)
    }
}


//get all frined request fro user
const getAllUserForRequest = async (req, res) => {
    try {
        const loggedInUserId = req.user.userId;

        //find the logged in user and retrive their followers and following

        const loggedInUser = await User.findById(loggedInUserId).select('followers following')
        if (!loggedInUser) {
            return response(res, 404, 'User not found')
        }

        //find user who  neither followers not following of the login user
        const userForFriendRequest = await User.find({
            _id: {
                $ne: loggedInUser, //user who follow the logged in user
                $nin: [...loggedInUser.following, ...loggedInUser.followers]// exclued both
            }
        }).select('username profilePicture email followerCount');

        return response(res, 200, 'user for frined request get successfully ', userForFriendRequest)

    } catch (error) {
        return response(res, 500, 'Internal server error', error.message)
    }
}

//api for get mutual friends
const getAllMutualFriends = async (req, res) => {
    try {
        const ProfileUserId = req.params.userId;

        //find the logged in user and retrive their followers and following
        const loggedInUser = await User.findById(ProfileUserId)
            .select('friends followers following')
            .populate('following', 'username profilePicture email followerCount followingCount')
            .populate('followers', 'username profilePicture email followerCount followingCount')

        if (!loggedInUser) return response(res, 404, 'User not found');

        // Return only actual friends (mutual follows)
        const friends = await User.find({
            _id: { $in: loggedInUser.friends || [] }
        }).select('username profilePicture email followerCount followingCount');

        return response(res, 200, 'Friends fetched successfully', friends)

    } catch (error) {
        return response(res, 500, 'Internal server error', error.message)
    }
}


//get all users so that you can search for profile 
const getAllUser = async (req, res) => {
    try {
        const users = await User.find().select('username profilePicture email followerCount')
        return response(res, 200, 'users get successfully', users)
    } catch (error) {
        return response(res, 500, 'Internal server error', error.message)
    }
}

//check if user is authenticated or not 
const checkUserAuth = async (req, res) => {
    try {
        const userId = req?.user?.userId;
        if (!userId) return response(res, 404, 'unauthenticated ! please login before access the data')

        //fetch the user details and excude sensitive information
        const user = await User.findById(userId).select('-password');

        if (!user) return response(res, 403, 'User not found')

        return response(res, 201, 'user retrived and allow to use facebook', user)
    } catch (error) {
        return response(res, 500, 'Internal server error', error.message)
    }
}


const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const loggedInUserId = req?.user?.userId

        //fetch the user details and excude sensitive information
        const userProfile = await User.findById(userId).select('-password').populate('bio').exec();

        if (!userProfile) return response(res, 403, 'User not found')

        const isOwner = loggedInUserId === userId;
        const isFriend = userProfile.friends.some(id => id.toString() === loggedInUserId);
        const isBlocked = userProfile.blockedUsers.some(id => id.toString() === loggedInUserId);

        if (isBlocked) {
            return response(res, 403, 'You are blocked by this user');
        }

        if (userProfile.isPrivate && !isOwner && !isFriend) {
            return response(res, 200, 'This profile is private', { profile: { username: userProfile.username, profilePicture: userProfile.profilePicture, isPrivate: true }, isOwner: false });
        }

        return response(res, 201, 'user profile get successfully', { profile: userProfile, isOwner })
    } catch (error) {
        return response(res, 500, 'Internal server error', error.message)
    }
}



module.exports = {
    followUser,
    unfollowUser,
    unfriendUser,
    blockUser,
    unblockUser,
    getBlockedUsers,
    togglePrivacy,
    deleteUserFromRequest,
    getAllFriendsRequest,
    getAllUserForRequest,
    getAllMutualFriends,
    getAllUser,
    checkUserAuth,
    getUserProfile
}