const express = require('express');
const { body, validationResult } = require('express-validator');
const { Post, User, Image } = require('../models');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Create profile post
router.post('/posts', verifyToken, [
  body('title').isLength({ min: 1, max: 200 }),
  body('content').isLength({ min: 1 }),
  body('image_urls').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Title and content are required',
        details: errors.array()
      });
    }

    const { title, content, image_urls = [] } = req.body;

    // Create post
    const post = await Post.create({
      title,
      content,
      author_id: req.userId,
      post_type: 'profile'
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

    res.status(201).json({
      message: 'Post created successfully',
      post: postWithImages.toJSON()
    });
  } catch (error) {
    console.error('Create profile post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's profile posts
router.get('/:userId/posts', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;

    const posts = await Post.findAll({
      where: { 
        author_id: userId, 
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
        }
      ],
      order: [['created_at', 'DESC']]
    });

    const postsData = posts.map(post => {
      const postData = post.toJSON();
      postData.author = post.author.toJSON();
      return postData;
    });

    res.json({ posts: postsData });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update profile post
router.put('/posts/:postId', verifyToken, [
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

    const { postId } = req.params;
    const post = await Post.findByPk(postId);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.author_id !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized to update this post' });
    }

    if (post.post_type !== 'profile') {
      return res.status(400).json({ error: 'This is not a profile post' });
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
    console.error('Update profile post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete profile post
router.delete('/posts/:postId', verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findByPk(postId);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.author_id !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized to delete this post' });
    }

    if (post.post_type !== 'profile') {
      return res.status(400).json({ error: 'This is not a profile post' });
    }

    await post.destroy();
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete profile post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;











