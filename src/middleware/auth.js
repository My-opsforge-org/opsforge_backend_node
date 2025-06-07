const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ 
        message: 'Authorization header is required',
        code: 'AUTH_HEADER_MISSING'
      });
    }

    // Check if it's a Bearer token
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Invalid token format. Use Bearer token',
        code: 'INVALID_TOKEN_FORMAT'
      });
    }

    // Extract token
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ 
        message: 'No token provided',
        code: 'TOKEN_MISSING'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      
      // Check if token has required fields (based on Flask JWT structure)
      if (!decoded.sub || !decoded.type || !decoded.jti) {
        return res.status(401).json({ 
          message: 'Invalid token payload',
          code: 'INVALID_TOKEN_PAYLOAD'
        });
      }

      // Check if token is expired
      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        return res.status(401).json({ 
          message: 'Token has expired',
          code: 'TOKEN_EXPIRED'
        });
      }

      // Check if token is not yet valid
      if (decoded.nbf && Date.now() < decoded.nbf * 1000) {
        return res.status(401).json({ 
          message: 'Token is not yet valid',
          code: 'TOKEN_NOT_VALID'
        });
      }

      // Attach user info to request
      req.user = {
        id: decoded.sub,  // Flask JWT uses 'sub' for user ID
        tokenType: decoded.type,
        tokenId: decoded.jti
      };

      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: 'Token has expired',
          code: 'TOKEN_EXPIRED'
        });
      }
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          message: 'Invalid token',
          code: 'INVALID_TOKEN'
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      message: 'Internal server error during authentication',
      code: 'AUTH_ERROR'
    });
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
  checkRole
}; 