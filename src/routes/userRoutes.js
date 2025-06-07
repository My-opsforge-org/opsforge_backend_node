const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');

// Apply authentication middleware
router.use(verifyToken);

// Get all users
router.get('/', userController.getAllUsers);

module.exports = router; 