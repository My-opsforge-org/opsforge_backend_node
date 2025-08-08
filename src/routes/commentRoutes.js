const express = require('express');
const { body, validationResult } = require('express-validator');
const { Comment, Post, User } = require('../models');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Create comment
router.post('/posts/:postId/comments', verifyToken, [
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

    // Check if post exists
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Create comment
    const comment = await Comment.create({
      content,
      author_id: req.userId,
      post_id: postId
    });

    // Get comment with author
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

// Get post comments
router.get('/posts/:postId/comments', verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;

    // Check if post exists
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

// Update comment
router.put('/:commentId', verifyToken, [
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
    const { commentId } = req.params;

    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if user is the author
    if (comment.author_id !== req.userId) {
      return res.status(403).json({ error: 'You can only edit your own comments' });
    }

    comment.content = content;
    await comment.save();

    res.json(comment.toJSON());
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete comment
router.delete('/:commentId', verifyToken, async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if user is the author
    if (comment.author_id !== req.userId) {
      return res.status(403).json({ error: 'You can only delete your own comments' });
    }

    await comment.destroy();
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;










