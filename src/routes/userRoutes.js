const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

// Debug endpoint to check token structure
router.get('/debug-token', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    res.json({ 
      message: 'Token decoded successfully',
      tokenStructure: decoded
    });
  } catch (error) {
    res.status(401).json({ 
      message: 'Invalid token',
      error: error.message
    });
  }
});

// Apply authentication middleware
router.use(verifyToken);

// Get user profile
router.get('/profile', userController.getUserProfile);

module.exports = router; 