const express = require('express');
const { Post, Reaction } = require('../models');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Like post
router.post('/posts/:postId/like', verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user already reacted
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

// Dislike post
router.post('/posts/:postId/dislike', verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user already reacted
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

// Remove reaction
router.delete('/posts/:postId/reaction', verifyToken, async (req, res) => {
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

module.exports = router;










