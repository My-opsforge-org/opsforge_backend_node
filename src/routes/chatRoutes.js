const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { verifyToken } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(verifyToken);

// Get chat history between two users (with pagination)
router.get('/history/:userId/:otherUserId', chatController.getChatHistory);

// Mark messages as read
router.put('/read/:userId/:otherUserId', chatController.markAsRead);

// Get unread message count for a user
router.get('/unread/:userId', chatController.getUnreadCount);

// Delete a message
router.delete('/message/:messageId', chatController.deleteMessage);

module.exports = router; 