const express = require('express');
const { body, validationResult } = require('express-validator');
const { Community, User, Post, Image, Comment, Reaction, Message } = require('../models');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Get all communities
router.get('/', verifyToken, async (req, res) => {
  try {
    const communities = await Community.findAll({
      include: [
        {
          model: User,
          as: 'members',
          attributes: ['id', 'name', 'email', 'avatarUrl']
        },
        {
          model: Post,
          as: 'posts',
          attributes: ['id']
        }
      ]
    });

    const communitiesData = communities.map(community => {
      const data = community.toJSON();
      data.members_count = community.members ? community.members.length : 0;
      data.posts_count = community.posts ? community.posts.length : 0;
      return data;
    });

    res.json(communitiesData);
  } catch (error) {
    console.error('Get communities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new community
router.post('/', verifyToken, [
  body('name').isLength({ min: 1, max: 100 }),
  body('description').optional().isLength({ max: 1000 }),
  body('image_url').optional().isURL().withMessage('image_url must be a valid URL')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { name, description, image_url } = req.body;

    // Check if community name already exists
    const existingCommunity = await Community.findOne({ where: { name } });
    if (existingCommunity) {
      return res.status(400).json({ error: 'Community name already exists' });
    }

    const community = await Community.create({
      name,
      description,
      image_url
    });

    res.status(201).json({
      message: 'Community created',
      community: community.toJSON()
    });
  } catch (error) {
    console.error('Create community error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update community
router.put('/:communityId', verifyToken, [
  body('name').optional().isLength({ min: 1, max: 100 }),
  body('description').optional().isLength({ max: 1000 }),
  body('image_url').optional().isURL().withMessage('image_url must be a valid URL')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { communityId } = req.params;
    const community = await Community.findByPk(communityId);
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    const { name, description, image_url } = req.body;
    if (name !== undefined) community.name = name;
    if (description !== undefined) community.description = description;
    if (image_url !== undefined) community.image_url = image_url;
    await community.save();

    res.json({ message: 'Community updated', community: community.toJSON() });
  } catch (error) {
    console.error('Update community error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete community
router.delete('/:communityId', verifyToken, async (req, res) => {
  try {
    const { communityId } = req.params;
    const community = await Community.findByPk(communityId);
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    // Delete related data first to avoid foreign key constraint violations
    const { Post, Comment, Reaction, Bookmark, Message, UserProgress } = require('../models');
    
    // Delete community posts and related data (cascading will handle images, comments, reactions, bookmarks)
    await Post.destroy({ where: { community_id: communityId } });
    
    // Delete community messages
    await Message.destroy({ where: { community_id: communityId } });
    
    // Remove all community members
    await community.setMembers([]);
    
    // Now delete the community
    await community.destroy();
    
    res.json({ message: 'Community deleted' });
  } catch (error) {
    console.error('Delete community error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Join community
router.post('/:communityId/join', verifyToken, async (req, res) => {
  try {
    const community = await Community.findByPk(req.params.communityId);
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is already a member
    const isMember = await community.hasMember(user);
    if (isMember) {
      return res.json({ message: 'Already a member' });
    }

    await community.addMember(user);
    res.json({ message: 'Joined community' });
  } catch (error) {
    console.error('Join community error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Leave community
router.post('/:communityId/leave', verifyToken, async (req, res) => {
  try {
    const community = await Community.findByPk(req.params.communityId);
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is a member
    const isMember = await community.hasMember(user);
    if (!isMember) {
      return res.json({ message: 'Not a member' });
    }

    await community.removeMember(user);
    res.json({ message: 'Left community' });
  } catch (error) {
    console.error('Leave community error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's joined communities (place BEFORE parameterized routes)
router.get('/joined', verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      include: [
        {
          model: Community,
          as: 'communities_joined',
          include: [
            {
              model: User,
              as: 'members',
              attributes: ['id']
            },
            {
              model: Post,
              as: 'posts',
              attributes: ['id']
            }
          ]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const communitiesData = user.communities_joined.map(community => {
      const data = community.toJSON();
      data.members_count = community.members ? community.members.length : 0;
      data.posts_count = community.posts ? community.posts.length : 0;
      return data;
    });

    res.json(communitiesData);
  } catch (error) {
    console.error('Get joined communities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's communities with latest message metadata
router.get('/user/with-messages', verifyToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      include: [
        {
          model: Community,
          as: 'communities_joined'
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const communities = user.communities_joined || [];

    // For each community, fetch last message and unread count
    const results = await Promise.all(communities.map(async (community) => {
      const lastMessage = await Message.findOne({
        where: { community_id: community.id },
        order: [['createdAt', 'DESC']]
      });

      const unreadCount = await Message.count({
        where: {
          community_id: community.id,
          is_read: false,
          sender_id: { [require('sequelize').Op.ne]: req.userId }
        }
      });

      return {
        id: community.id,
        name: community.name,
        description: community.description,
        lastMessage: lastMessage ? lastMessage.content : '',
        lastMessageTime: lastMessage ? lastMessage.createdAt : null,
        unreadCount,
        lastMessageSender: null
      };
    }));

    res.json(results);
  } catch (error) {
    console.error('Get user communities with messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create community post (alias under /api/communities/:communityId/posts)
router.post('/:communityId/posts', verifyToken, [
  body('title').isLength({ min: 1, max: 200 }),
  body('content').isLength({ min: 1 }),
  body('image_urls').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { title, content, image_urls = [] } = req.body;
    const { communityId } = req.params;

    const community = await Community.findByPk(communityId);
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    // Ensure requester is a member
    const isMember = await community.hasMember(req.userId);
    if (!isMember) {
      return res.status(403).json({ error: 'You must be a member to create posts' });
    }

    const post = await Post.create({
      title,
      content,
      author_id: req.userId,
      community_id: communityId,
      post_type: 'community'
    });

    if (image_urls.length > 0) {
      const images = image_urls.map(url => ({ url, post_id: post.id }));
      await Image.bulkCreate(images);
    }

    const postWithImages = await Post.findByPk(post.id, {
      include: [
        { model: Image, as: 'images' },
        { model: User, as: 'author', attributes: ['id', 'name', 'email', 'avatarUrl'] }
      ]
    });

    res.status(201).json(postWithImages.toJSON());
  } catch (error) {
    console.error('Create community post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get community posts (alias under /api/communities/:communityId/posts)
router.get('/:communityId/posts', verifyToken, async (req, res) => {
  try {
    const { communityId } = req.params;

    const community = await Community.findByPk(communityId);
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    const posts = await Post.findAll({
      where: { community_id: communityId },
      include: [
        { model: Image, as: 'images' },
        { model: User, as: 'author', attributes: ['id', 'name', 'email', 'avatarUrl'] },
        { model: Comment, as: 'comments', attributes: ['id'] },
        { model: Reaction, as: 'reactions', attributes: ['id', 'reaction_type', 'user_id'] }
      ],
      order: [['created_at', 'DESC']]
    });

    const postsData = posts.map(post => {
      const postData = post.toJSON();
      
      // Set user-specific fields
      const userReaction = post.getUserReaction(req.userId);
      postData.is_liked = userReaction === 'like';
      postData.is_disliked = userReaction === 'dislike';
      
      return postData;
    });
    
    res.json(postsData);
  } catch (error) {
    console.error('Get community posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get community members
router.get('/:communityId/members', verifyToken, async (req, res) => {
  try {
    const { communityId } = req.params;
    const community = await Community.findByPk(communityId, {
      include: [{
        model: User,
        as: 'members',
        attributes: ['id', 'name', 'email', 'avatarUrl', 'bio']
      }]
    });

    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    const members = (community.members || []).map(member => ({
      id: member.id,
      name: member.name,
      email: member.email,
      avatarUrl: member.avatarUrl,
      bio: member.bio,
      interests: Array.isArray(member.interests)
        ? member.interests
        : (typeof member.interests === 'string' ? safeParseJsonArray(member.interests) : []),
      joinedAt: member.createdAt || new Date().toISOString()
    }));

    res.json({
      community: {
        id: community.id,
        name: community.name,
        description: community.description,
        memberCount: members.length
      },
      members
    });
  } catch (error) {
    console.error('Get community members error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function safeParseJsonArray(value) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_e) {
    return [];
  }
}

// Get specific community (placed AFTER '/joined' to avoid route conflict)
router.get('/:communityId', verifyToken, async (req, res) => {
  try {
    const community = await Community.findByPk(req.params.communityId, {
      include: [
        {
          model: User,
          as: 'members',
          attributes: ['id', 'name', 'email', 'avatarUrl', 'bio']
        },
        {
          model: Post,
          as: 'posts',
          attributes: ['id', 'title', 'content', 'created_at']
        }
      ]
    });

    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    const communityData = community.toJSON();
    communityData.members_count = community.members ? community.members.length : 0;
    communityData.posts_count = community.posts ? community.posts.length : 0;
    communityData.current_user_id = req.userId;
    communityData.is_member = community.members.some(member => member.id === req.userId);

    res.json(communityData);
  } catch (error) {
    console.error('Get community error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
