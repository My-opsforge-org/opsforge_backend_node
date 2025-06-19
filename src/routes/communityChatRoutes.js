const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const communityChatController = require('../controllers/communityChatController');
// console.log('communityChatController:', communityChatController);

// Get community chat history
router.get('/:communityId/messages', verifyToken, communityChatController.getCommunityChatHistory);

// Send a message to a community
router.post('/message', verifyToken, communityChatController.sendCommunityMessage);

// Get unread message count for a user in a community
router.get('/:communityId/unread-count/:userId', verifyToken, communityChatController.getCommunityUnreadCount);

// Mark all messages as read for a user in a community
router.post('/:communityId/mark-read', verifyToken, communityChatController.markCommunityMessagesAsRead);

// Delete a message from a community chat
router.delete('/message/:messageId', verifyToken, communityChatController.deleteCommunityMessage);

module.exports = router; 