const express = require('express');
const { Post, Bookmark, User, Image, Reaction, Community } = require('../models');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Bookmark post
router.post('/:postId', verifyToken, async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if already bookmarked
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

// Remove bookmark
router.delete('/:postId', verifyToken, async (req, res) => {
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

// Get user's bookmarked posts
router.get('/', verifyToken, async (req, res) => {
  try {
    const bookmarks = await Bookmark.findAll({
      where: { user_id: req.userId },
      include: [
        {
          model: Post,
          as: 'Post',
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'name', 'email', 'avatarUrl']
            },
            {
              model: Image,
              as: 'images'
            },
            {
              model: Reaction,
              as: 'reactions',
              attributes: ['id', 'reaction_type', 'user_id']
            },
            {
              model: Community,
              as: 'community',
              attributes: ['id', 'name']
            }
          ]
        }
      ]
    });

    const bookmarkedPosts = bookmarks
      .filter(bookmark => bookmark.Post) // Filter out bookmarks with null posts
      .map(bookmark => {
        const postData = bookmark.Post.toJSON();
        
        // Set user-specific fields
        const userReaction = bookmark.Post.getUserReaction(req.userId);
        postData.is_liked = userReaction === 'like';
        postData.is_disliked = userReaction === 'dislike';
        postData.is_bookmarked = true; // Obviously true since it's a bookmarked post
        
        return postData;
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); // Sort by created_at descending
    
    res.json(bookmarkedPosts);
  } catch (error) {
    console.error('Get bookmarks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;



