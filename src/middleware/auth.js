const jwt = require('jsonwebtoken');
const { User, TokenBlocklist } = require('../models');

// Verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'No token provided',
        code: 'NO_TOKEN'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    
    // Check if token is in blocklist (only if jti exists)
    if (decoded.jti) {
      const blockedToken = await TokenBlocklist.findOne({
        where: { jti: decoded.jti }
      });

      if (blockedToken) {
        return res.status(401).json({
          message: 'Token has been invalidated',
          code: 'TOKEN_INVALIDATED'
        });
      }
    }

    // Get user from database
    const user = await User.findByPk(decoded.sub);
    if (!user) {
      return res.status(401).json({
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Add user info to request
    req.user = user;
    req.userId = user.id;
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

// Optional authentication (for routes that can work with or without auth)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    
    // Check if token is in blocklist
    const blockedToken = await TokenBlocklist.findOne({
      where: { jti: decoded.jti }
    });

    if (blockedToken) {
      return next();
    }

    // Get user from database
    const user = await User.findByPk(decoded.sub);
    if (user) {
      req.user = user;
      req.userId = user.id;
    }
    
    next();
  } catch (error) {
    // If token is invalid, just continue without authentication
    next();
  }
};

module.exports = {
  verifyToken,
  optionalAuth
}; 