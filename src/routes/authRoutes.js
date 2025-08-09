const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { User, TokenBlocklist } = require('../models');
const { verifyToken } = require('../middleware/auth');
const { admin } = require('../config/firebase');

const router = express.Router();

// Local authentication routes
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Email and password are required',
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    
    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const jti = require('crypto').randomBytes(16).toString('hex');
    const token = jwt.sign(
      { sub: user.id, email: user.email, jti },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1h' }
    );

    res.json({
      access_token: token,
      message: 'Login successful',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/register', [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { name, email, password, avatarUrl } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      avatarUrl: avatarUrl || 'https://picsum.photos/256/256',
      auth_provider: 'local'
    });

    // Make user follow themselves
    await user.addFollowing(user);

    res.status(201).json({ 
      message: 'User created successfully',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Firebase authentication route
router.post('/firebase-login', async (req, res) => {
  try {
    const { idToken } = req.body;
    
    if (!idToken) {
      return res.status(400).json({ error: 'Firebase ID token is required' });
    }

    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;
    
    // Extract name from email if Firebase doesn't provide it
    let displayName = name;
    if (!displayName && email) {
      // Extract name from email (e.g., "john.doe@gmail.com" -> "John Doe")
      const emailName = email.split('@')[0];
      displayName = emailName
        .split(/[._-]/)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ');
    }
    
    // Fallback name if still no name
    if (!displayName) {
      displayName = 'User';
    }

    // Find or create user
    let user = await User.findOne({ 
      where: { 
        [require('sequelize').Op.or]: [
          { firebase_uid: uid },
          { email: email }
        ]
      }
    });
    
    if (!user) {
      // Create new user
      user = await User.create({
        name: displayName,
        email,
        firebase_uid: uid,
        auth_provider: 'google', // or determine from provider data
        avatarUrl: picture || 'https://picsum.photos/256/256',
        password: null // No password for OAuth users
      });
    } else {
      // Update existing user with latest Firebase data
      const updateData = {
        firebase_uid: uid,
        auth_provider: 'google'
      };
      
      // Update name if it's different or if user doesn't have a name
      if (displayName && (displayName !== user.name || !user.name)) {
        updateData.name = displayName;
      }
      
      // Update avatar if Firebase provides one and user doesn't have one
      if (picture && (!user.avatarUrl || user.avatarUrl === 'https://picsum.photos/256/256')) {
        updateData.avatarUrl = picture;
      }
      
      await user.update(updateData);
    }

    // Generate JWT token using your existing system
    const jti = require('crypto').randomBytes(16).toString('hex');
    const token = jwt.sign(
      { sub: user.id, email: user.email, jti },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '1h' }
    );

    res.json({
      access_token: token,
      message: 'Firebase authentication successful',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Firebase auth error:', error);
    res.status(500).json({ error: 'Firebase authentication failed' });
  }
});

router.post('/logout', verifyToken, async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.decode(token);

    // Add token to blocklist (only if jti exists)
    if (decoded && decoded.jti) {
      await TokenBlocklist.create({
        jti: decoded.jti,
        created_at: new Date()
      });
    }

    res.json({ message: 'Successfully logged out' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// Protected route for testing
router.get('/protected', verifyToken, (req, res) => {
  res.json({
    message: 'This is a protected route',
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    }
  });
});

module.exports = router;

