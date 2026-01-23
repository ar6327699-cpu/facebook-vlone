const Conversation = require('../model/Conversation');
const Message = require('../model/Message');
const User = require('../model/User');
const response = require('../utils/responceHandler');

const { uploadFileToCloudinary } = require('../config/cloudinary');

const sendMessage = async (req, res) => {
    try {
        const { receiverId, text } = req.body;
        const senderId = req.user.userId;
        let imageUrl = null;
        let videoUrl = null;

        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);

        if (!sender || !receiver) {
            return response(res, 404, 'User not found');
        }

        // Check if blocked
        const isBlocked = sender.blockedUsers.some(id => id.toString() === receiverId.toString()) ||
            receiver.blockedUsers.some(id => id.toString() === senderId.toString());
        if (isBlocked) {
            return response(res, 403, 'Cannot send message. One of you has blocked the other.');
        }

        // Check if friends
        const areFriends = sender.friends.some(id => id.toString() === receiverId.toString());
        if (!areFriends) {
            return response(res, 403, 'You must be friends to send messages.');
        }

        if (req.file) {
            const result = await uploadFileToCloudinary(req.file);
            if (req.file.mimetype.startsWith('video')) {
                videoUrl = result.secure_url;
            } else {
                imageUrl = result.secure_url;
            }
        }

        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId]
            });
        }

        const newMessage = await Message.create({
            conversationId: conversation._id,
            sender: senderId,
            text,
            imageUrl,
            videoUrl
        });

        conversation.lastMessage = newMessage._id;
        await conversation.save();

        return response(res, 201, 'Message sent successfully', newMessage);
    } catch (error) {
        return response(res, 500, 'Internal server error', error.message);
    }
};

const getConversations = async (req, res) => {
    try {
        const userId = req.user.userId;
        const conversations = await Conversation.find({
            participants: { $in: [userId] }
        }).populate('participants', 'username profilePicture email')
            .populate('lastMessage')
            .sort({ updatedAt: -1 });

        return response(res, 200, 'Conversations retrieved successfully', conversations);
    } catch (error) {
        return response(res, 500, 'Internal server error', error.message);
    }
};

const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const messages = await Message.find({ conversationId })
            .sort({ createdAt: 1 });

        return response(res, 200, 'Messages retrieved successfully', messages);
    } catch (error) {
        return response(res, 500, 'Internal server error', error.message);
    }
};

const editMessage = async (req, res) => {
    try {
        const { messageId, text } = req.body;
        const senderId = req.user.userId;

        const message = await Message.findById(messageId);
        if (!message) return response(res, 404, 'Message not found');

        if (message.sender.toString() !== senderId.toString()) {
            return response(res, 403, 'You can only edit your own messages');
        }

        const timeDiff = (new Date() - message.createdAt) / (1000 * 60);
        if (timeDiff > 5) {
            return response(res, 400, 'Cannot edit message after 5 minutes');
        }

        message.text = text;
        message.isEdited = true;
        await message.save();

        return response(res, 200, 'Message edited successfully', message);
    } catch (error) {
        return response(res, 500, 'Internal server error', error.message);
    }
};

const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.body;
        const senderId = req.user.userId;

        const message = await Message.findById(messageId);
        if (!message) return response(res, 404, 'Message not found');

        if (message.sender.toString() !== senderId.toString()) {
            return response(res, 403, 'You can only delete your own messages');
        }

        const timeDiff = (new Date() - message.createdAt) / (1000 * 60);
        if (timeDiff > 5) {
            return response(res, 400, 'Cannot delete message after 5 minutes');
        }

        message.isDeleted = true;
        message.text = 'This message was deleted';
        message.imageUrl = null;
        message.videoUrl = null;
        await message.save();

        return response(res, 200, 'Message deleted successfully', message);
    } catch (error) {
        return response(res, 500, 'Internal server error', error.message);
    }
};

module.exports = { sendMessage, getConversations, getMessages, editMessage, deleteMessage };
