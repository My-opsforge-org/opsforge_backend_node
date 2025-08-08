const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  author_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'user',
      key: 'id'
    }
  },
  community_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'community',
      key: 'id'
    }
  },
  post_type: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'profile'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'updated_at'
  }
}, {
  tableName: 'post',
  underscored: true
});

// Instance methods
Post.prototype.toJSON = function(includeComments = false) {
  const values = Object.assign({}, this.get());
  
  // Add computed fields
  values.likes_count = this.reactions ? this.reactions.filter(r => r.reaction_type === 'like').length : 0;
  values.dislikes_count = this.reactions ? this.reactions.filter(r => r.reaction_type === 'dislike').length : 0;
  values.comments_count = this.comments ? this.comments.length : 0;
  values.is_bookmarked = false; // Will be set by the route if needed
  
  // Add images
  if (this.images) {
    values.images = this.images.map(image => image.toJSON());
  } else {
    values.images = [];
  }
  
  // Add comments if requested
  if (includeComments && this.comments) {
    values.comments = this.comments.map(comment => comment.toJSON());
  }
  
  return values;
};

Post.prototype.getUserReaction = function(userId) {
  if (!this.reactions) return null;
  const reaction = this.reactions.find(r => r.user_id === userId);
  return reaction ? reaction.reaction_type : null;
};

Post.prototype.isBookmarkedBy = function(userId) {
  if (!this.bookmarks) return false;
  return this.bookmarks.some(bookmark => bookmark.user_id === userId);
};

module.exports = Post;



