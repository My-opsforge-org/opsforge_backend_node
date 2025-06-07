const jwt = require('jsonwebtoken');
require('dotenv').config();
const sequelize = require('../config/database');

// Verify token and check blocklist
const verifyToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'No token provided',
        code: 'NO_TOKEN'
      });
    }

    const token = authHeader.split(' ')[1];

    // First verify the token to ensure it's valid
    const verified = jwt.verify(token, process.env.JWT_SECRET_KEY);
    
    // Check if token is in blocklist using the jti
    const [blockedToken] = await sequelize.query(
      'SELECT * FROM token_blocklist WHERE jti = :jti',
      {
        replacements: { jti: verified.jti },
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (blockedToken) {
      return res.status(401).json({
        message: 'Token has been invalidated',
        code: 'TOKEN_INVALIDATED'
      });
    }

    // Add user info to request
    req.user = verified;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    console.error('Auth middleware error:', error);
    res.status(500).json({
      message: 'Authentication error',
      code: 'AUTH_ERROR'
    });
  }
};

// Add token to blocklist
const addToBlocklist = async (token) => {
  try {
    await sequelize.query(
      'INSERT INTO token_blocklist (token, created_at) VALUES (:token, NOW())',
      {
        replacements: { token },
        type: sequelize.QueryTypes.INSERT
      }
    );
    return true;
  } catch (error) {
    console.error('Error adding token to blocklist:', error);
    return false;
  }
};

// Optional: Middleware to check if user has specific role
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  addToBlocklist,
  checkRole
}; 