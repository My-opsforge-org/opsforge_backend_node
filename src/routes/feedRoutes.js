const express = require('express');
const { Post, User, Community, Image, Reaction, Comment } = require('../models');
const { verifyToken } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// Get user's feed
router.get('/', verifyToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.per_page) || 10;
    const offset = (page - 1) * perPage;

    const currentUser = await User.findByPk(req.userId, {
      include: [
        {
          model: Community,
          as: 'communities_joined',
          attributes: ['id']
        },
        {
          model: User,
          as: 'Following',
          attributes: ['id']
        }
      ]
    });

    // Get community IDs
    const communityIds = currentUser.communities_joined.map(c => c.id);
    
    // Get followed user IDs
    const followedUserIds = currentUser.Following.map(u => u.id);
    
    // Ensure current user's own posts are included
    if (!followedUserIds.includes(req.userId)) {
      followedUserIds.push(req.userId);
    }

    // Build query conditions
    const conditions = [];
    if (communityIds.length > 0) {
      conditions.push({ community_id: communityIds });
    }
    if (followedUserIds.length > 0) {
      conditions.push({ author_id: followedUserIds });
    }

    // Get posts
    let posts = [];
    if (conditions.length > 0) {
      posts = await Post.findAll({
        where: {
          [Op.or]: conditions
        },
        include: [
          {
            model: Image,
            as: 'images'
          },
          {
            model: User,
            as: 'author',
            attributes: ['id', 'name', 'email', 'avatarUrl']
          },
          {
            model: Community,
            as: 'community',
            attributes: ['id', 'name']
          },
          {
            model: Comment,
            as: 'comments',
            attributes: ['id']
          },
          {
            model: Reaction,
            as: 'reactions',
            attributes: ['id', 'reaction_type', 'user_id']
          }
        ],
        order: [['created_at', 'DESC']],
        limit: perPage,
        offset
      });
    }

    // Always include the user's own profile posts
    const profilePosts = await Post.findAll({
      where: { 
        author_id: req.userId, 
        post_type: 'profile' 
      },
      include: [
        {
          model: Image,
          as: 'images'
        },
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email', 'avatarUrl']
        },
        {
          model: Comment,
          as: 'comments',
          attributes: ['id']
        },
        {
          model: Reaction,
          as: 'reactions',
          attributes: ['id', 'reaction_type', 'user_id']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Combine and remove duplicates
    const allPosts = [...posts, ...profilePosts];
    const uniquePosts = allPosts.filter((post, index, self) => 
      index === self.findIndex(p => p.id === post.id)
    );

    // Sort by createdAt (model attribute) descending
    uniquePosts.sort((a, b) => {
      const aDate = a.createdAt || a.get && a.get('createdAt');
      const bDate = b.createdAt || b.get && b.get('createdAt');
      return new Date(bDate) - new Date(aDate);
    });

    // Paginate manually
    const total = uniquePosts.length;
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const paginatedPosts = uniquePosts.slice(start, end);

    // Prepare response
    const postsData = paginatedPosts.map(post => {
      const postData = post.toJSON();
      postData.author = post.author.toJSON();
      if (post.community) {
        postData.community = post.community.toJSON();
      }
      
      // Set user-specific fields
      const userReaction = post.getUserReaction(req.userId);
      postData.is_liked = userReaction === 'like';
      postData.is_disliked = userReaction === 'dislike';
      
      // Ensure timestamps are present in response (both snake_case and camelCase)
      const createdAt = post.createdAt || (post.get && post.get('createdAt'));
      const updatedAt = post.updatedAt || (post.get && post.get('updatedAt'));
      if (createdAt instanceof Date) {
        postData.created_at = createdAt.toISOString();
        postData.createdAt = createdAt.toISOString();
      } else if (createdAt) {
        postData.created_at = createdAt;
        postData.createdAt = createdAt;
      }
      if (updatedAt instanceof Date) {
        postData.updated_at = updatedAt.toISOString();
        postData.updatedAt = updatedAt.toISOString();
      } else if (updatedAt) {
        postData.updated_at = updatedAt;
        postData.updatedAt = updatedAt;
      }
      
      return postData;
    });

    res.json({
      posts: postsData,
      total,
      pages: Math.ceil(total / perPage),
      current_page: page,
      has_next: end < total,
      has_prev: start > 0
    });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

