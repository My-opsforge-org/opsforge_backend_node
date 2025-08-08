const express = require('express');
const { body, validationResult } = require('express-validator');
const { User } = require('../models');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Get current user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      include: [
        {
          model: User,
          as: 'Followers',
          attributes: ['id', 'name', 'email', 'avatarUrl']
        },
        {
          model: User,
          as: 'Following',
          attributes: ['id', 'name', 'email', 'avatarUrl']
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = user.toJSON();
    
    // Add followers/following counts
    userData.followers_count = user.Followers ? user.Followers.length : 0;
    userData.following_count = user.Following ? user.Following.length : 0;

    res.json(userData);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update current user profile
router.put('/profile', verifyToken, [
  body('name').optional().isLength({ min: 1, max: 100 }),
  body('age').optional().isInt({ min: 0, max: 120 }),
  body('gender').optional().isIn(['male', 'female', 'other']),
  body('sun_sign').optional().isIn(['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 
                                   'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user fields
    user.updateFromDict(req.body);
    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    if (error.message.includes('Invalid')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users (paginated)
router.get('/', verifyToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.per_page) || 10;
    const offset = (page - 1) * perPage;

    const { count, rows: users } = await User.findAndCountAll({
      limit: perPage,
      offset,
      include: [
        {
          model: User,
          as: 'Followers',
          attributes: ['id']
        },
        {
          model: User,
          as: 'Following',
          attributes: ['id']
        }
      ]
    });

    const currentUser = await User.findByPk(req.userId, {
      include: [
        {
          model: User,
          as: 'Following',
          attributes: ['id']
        }
      ]
    });

    const usersData = users.map(user => {
      const userData = user.toJSON();
      userData.followers_count = user.Followers ? user.Followers.length : 0;
      userData.following_count = user.Following ? user.Following.length : 0;
      userData.is_following = currentUser.Following.some(followed => followed.id === user.id);
      return userData;
    });

    res.json({
      users: usersData,
      total: count,
      pages: Math.ceil(count / perPage),
      current_page: page,
      has_next: page * perPage < count,
      has_prev: page > 1
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user by ID
router.get('/:userId', verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId, {
      include: [
        {
          model: User,
          as: 'Followers',
          attributes: ['id', 'name', 'email', 'avatarUrl']
        },
        {
          model: User,
          as: 'Following',
          attributes: ['id', 'name', 'email', 'avatarUrl']
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = user.toJSON();
    userData.followers_count = user.Followers ? user.Followers.length : 0;
    userData.following_count = user.Following ? user.Following.length : 0;

    res.json(userData);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Follow user
router.post('/:userId/follow', verifyToken, async (req, res) => {
  try {
    const userToFollow = await User.findByPk(req.params.userId);
    if (!userToFollow) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (req.userId === parseInt(req.params.userId)) {
      return res.status(400).json({ error: 'You cannot follow yourself' });
    }

    const currentUser = await User.findByPk(req.userId);
    await currentUser.addFollowing(userToFollow);

    res.json({ message: `Successfully followed ${userToFollow.name}` });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Unfollow user
router.post('/:userId/unfollow', verifyToken, async (req, res) => {
  try {
    const userToUnfollow = await User.findByPk(req.params.userId);
    if (!userToUnfollow) {
      return res.status(404).json({ error: 'User not found' });
    }

    const currentUser = await User.findByPk(req.userId);
    await currentUser.removeFollowing(userToUnfollow);

    res.json({ message: `Successfully unfollowed ${userToUnfollow.name}` });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's followers
router.get('/:userId/followers', verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId, {
      include: [
        {
          model: User,
          as: 'Followers',
          attributes: ['id', 'name', 'email', 'avatarUrl', 'bio']
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ followers: user.Followers.map(follower => follower.toJSON()) });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's following
router.get('/:userId/following', verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId, {
      include: [
        {
          model: User,
          as: 'Following',
          attributes: ['id', 'name', 'email', 'avatarUrl', 'bio']
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ following: user.Following.map(followed => followed.toJSON()) });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 