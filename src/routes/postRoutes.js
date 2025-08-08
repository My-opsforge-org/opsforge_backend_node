const express = require('express');
const { body, validationResult } = require('express-validator');
const { Post, User, Community, Image, Comment, Reaction, Bookmark } = require('../models');
const sequelize = require('../config/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Create community post
router.post('/communities/:communityId/posts', verifyToken, [
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

    // Check if community exists
    const community = await Community.findByPk(communityId);
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    // Check if user is a member
    const isMember = await community.hasMember(req.userId);
    if (!isMember) {
      return res.status(403).json({ error: 'You must be a member to create posts' });
    }

    // Create post
    const post = await Post.create({
      title,
      content,
      author_id: req.userId,
      community_id: communityId,
      post_type: 'community'
    });

    // Add images
    if (image_urls.length > 0) {
      const images = image_urls.map(url => ({
        url,
        post_id: post.id
      }));
      await Image.bulkCreate(images);
    }

    // Get post with images
    const postWithImages = await Post.findByPk(post.id, {
      include: [
        {
          model: Image,
          as: 'images'
        },
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email', 'avatarUrl']
        }
      ]
    });

    res.status(201).json(postWithImages.toJSON());
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get community posts
router.get('/communities/:communityId/posts', verifyToken, async (req, res) => {
  try {
    const { communityId } = req.params;
    
    const community = await Community.findByPk(communityId);
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    const posts = await Post.findAll({
      where: { community_id: communityId },
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
          attributes: ['id', 'reaction_type']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    const postsData = posts.map(post => post.toJSON());
    res.json(postsData);
  } catch (error) {
    console.error('Get community posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific post
router.get('/:postId', verifyToken, async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.postId, {
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
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'name', 'email', 'avatarUrl']
            }
          ],
          order: [['created_at', 'DESC']]
        },
        {
          model: Reaction,
          as: 'reactions',
          attributes: ['id', 'reaction_type', 'user_id']
        }
      ]
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const postData = post.toJSON();
    
    // Check if current user has reacted
    const userReaction = post.reactions.find(r => r.user_id === req.userId);
    postData.user_reaction = userReaction ? userReaction.reaction_type : null;

    res.json(postData);
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update post
router.put('/:postId', verifyToken, [
  body('title').optional().isLength({ min: 1, max: 200 }),
  body('content').optional().isLength({ min: 1 }),
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

    const post = await Post.findByPk(req.params.postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user is the author
    if (post.author_id !== req.userId) {
      return res.status(403).json({ error: 'You can only edit your own posts' });
    }

    const { title, content, image_urls } = req.body;

    // Update post fields
    if (title) post.title = title;
    if (content) post.content = content;
    await post.save();

    // Update images if provided
    if (image_urls) {
      // Remove existing images
      await Image.destroy({ where: { post_id: post.id } });
      
      // Add new images
      if (image_urls.length > 0) {
        const images = image_urls.map(url => ({
          url,
          post_id: post.id
        }));
        await Image.bulkCreate(images);
      }
    }

    // Get updated post
    const updatedPost = await Post.findByPk(post.id, {
      include: [
        {
          model: Image,
          as: 'images'
        },
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email', 'avatarUrl']
        }
      ]
    });

    res.json(updatedPost.toJSON());
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete post (ensure child records are removed first to satisfy FK constraints)
router.delete('/:postId', verifyToken, async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user is the author
    if (post.author_id !== req.userId) {
      return res.status(403).json({ error: 'You can only delete your own posts' });
    }

    await sequelize.transaction(async (t) => {
      // Delete dependent rows explicitly in case DB FKs lack ON DELETE CASCADE
      await Reaction.destroy({ where: { post_id: post.id }, transaction: t });
      await Bookmark.destroy({ where: { post_id: post.id }, transaction: t });
      await Comment.destroy({ where: { post_id: post.id }, transaction: t });
      await Image.destroy({ where: { post_id: post.id }, transaction: t });

      await post.destroy({ transaction: t });
    });
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Alias endpoints under /api/posts/:postId/... for reactions, bookmarks, and comments ---

// Like a post (alias for reactions)
router.post('/:postId/like', verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const existingReaction = await Reaction.findOne({
      where: { user_id: req.userId, post_id: postId }
    });

    if (existingReaction) {
      if (existingReaction.reaction_type === 'like') {
        return res.json({ message: 'Post already liked' });
      }
      existingReaction.reaction_type = 'like';
      await existingReaction.save();
    } else {
      await Reaction.create({
        user_id: req.userId,
        post_id: postId,
        reaction_type: 'like'
      });
    }

    res.json({ message: 'Post liked successfully' });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Dislike a post (alias for reactions)
router.post('/:postId/dislike', verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const existingReaction = await Reaction.findOne({
      where: { user_id: req.userId, post_id: postId }
    });

    if (existingReaction) {
      if (existingReaction.reaction_type === 'dislike') {
        return res.json({ message: 'Post already disliked' });
      }
      existingReaction.reaction_type = 'dislike';
      await existingReaction.save();
    } else {
      await Reaction.create({
        user_id: req.userId,
        post_id: postId,
        reaction_type: 'dislike'
      });
    }

    res.json({ message: 'Post disliked successfully' });
  } catch (error) {
    console.error('Dislike post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove reaction from a post (alias)
router.delete('/:postId/reaction', verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;

    const reaction = await Reaction.findOne({
      where: { user_id: req.userId, post_id: postId }
    });

    if (!reaction) {
      return res.status(404).json({ error: 'Reaction not found' });
    }

    await reaction.destroy();
    res.json({ message: 'Reaction removed successfully' });
  } catch (error) {
    console.error('Remove reaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bookmark a post (alias)
router.post('/:postId/bookmark', verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const existingBookmark = await Bookmark.findOne({
      where: { user_id: req.userId, post_id: postId }
    });

    if (existingBookmark) {
      return res.json({ message: 'Post already bookmarked' });
    }

    await Bookmark.create({
      user_id: req.userId,
      post_id: postId
    });

    res.json({ message: 'Post bookmarked successfully' });
  } catch (error) {
    console.error('Bookmark post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove bookmark for a post (alias)
router.delete('/:postId/bookmark', verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;

    const bookmark = await Bookmark.findOne({
      where: { user_id: req.userId, post_id: postId }
    });

    if (!bookmark) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }

    await bookmark.destroy();
    res.json({ message: 'Bookmark removed successfully' });
  } catch (error) {
    console.error('Remove bookmark error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a comment on a post (alias)
router.post('/:postId/comments', verifyToken, [
  body('content').isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Comment content is required',
        details: errors.array()
      });
    }

    const { content } = req.body;
    const { postId } = req.params;

    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = await Comment.create({
      content,
      author_id: req.userId,
      post_id: postId
    });

    const commentWithAuthor = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email', 'avatarUrl']
        }
      ]
    });

    res.status(201).json(commentWithAuthor.toJSON());
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get comments for a post (alias)
router.get('/:postId/comments', verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comments = await Comment.findAll({
      where: { post_id: postId },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'name', 'email', 'avatarUrl']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(comments.map(comment => comment.toJSON()));
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;



