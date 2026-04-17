const express = require('express');
const { sendMessage, getConversations, getMessages, editMessage, deleteMessage } = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

const { multerMiddleware } = require('../config/cloudinary');

router.post('/send', authMiddleware, multerMiddleware.single('file'), sendMessage);
router.get('/conversations', authMiddleware, getConversations);
router.get('/messages/:conversationId', authMiddleware, getMessages);
router.put('/edit', authMiddleware, editMessage);
router.delete('/delete/:messageId', authMiddleware, deleteMessage);

module.exports = router;
