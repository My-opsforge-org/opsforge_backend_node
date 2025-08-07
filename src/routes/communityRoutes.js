const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const communityController = require('../controllers/communityController');

// Get all communities
router.get('/', verifyToken, communityController.getAllCommunities);

// Get user communities with last messages (for chat panel)
router.get('/user/with-messages', verifyToken, communityController.getUserCommunitiesWithLastMessages);

// Get community members
router.get('/:communityId/members', verifyToken, communityController.getCommunityMembers);

// Join a community
router.post('/:communityId/join', verifyToken, communityController.joinCommunity);

// Leave a community
router.post('/:communityId/leave', verifyToken, communityController.leaveCommunity);

module.exports = router;
