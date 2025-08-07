const express = require('express');
const router = express.Router();
const userProgressController = require('../controllers/userProgressController');
const { verifyToken } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(verifyToken);

// Get user progress
router.get('/', userProgressController.getUserProgress);

// Update user progress
router.put('/', userProgressController.updateUserProgress);

// Complete a level
router.post('/complete-level', userProgressController.completeLevel);

// Update current level progress
router.put('/level-progress', userProgressController.updateLevelProgress);

// Get leaderboard
router.get('/leaderboard', userProgressController.getLeaderboard);

module.exports = router; 