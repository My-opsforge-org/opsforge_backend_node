const User = require('./User');
const Community = require('./Community');
const Post = require('./Post');
const Comment = require('./Comment');
const Image = require('./Image');
const Reaction = require('./Reaction');
const Bookmark = require('./Bookmark');
const TokenBlocklist = require('./TokenBlocklist');
const Message = require('./Message');
const UserProgress = require('./UserProgress');

// User associations
User.belongsToMany(User, {
  as: 'Followers',
  through: 'followers',
  foreignKey: 'followed_id',
  otherKey: 'follower_id',
  timestamps: false
});

User.belongsToMany(User, {
  as: 'Following',
  through: 'followers',
  foreignKey: 'follower_id',
  otherKey: 'followed_id',
  timestamps: false
});

// Community associations
Community.belongsToMany(User, {
  as: 'members',
  through: 'community_members',
  foreignKey: 'community_id',
  otherKey: 'user_id',
  timestamps: false
});

User.belongsToMany(Community, {
  as: 'communities_joined',
  through: 'community_members',
  foreignKey: 'user_id',
  otherKey: 'community_id',
  timestamps: false
});

// Post associations
Post.belongsTo(User, {
  as: 'author',
  foreignKey: 'author_id'
});

Post.belongsTo(Community, {
  as: 'community',
  foreignKey: 'community_id'
});

User.hasMany(Post, {
  as: 'posts',
  foreignKey: 'author_id'
});

Community.hasMany(Post, {
  as: 'posts',
  foreignKey: 'community_id'
});

// Image associations
Post.hasMany(Image, {
  as: 'images',
  foreignKey: 'post_id',
  onDelete: 'CASCADE'
});

Image.belongsTo(Post, {
  foreignKey: 'post_id'
});

// Comment associations
Post.hasMany(Comment, {
  as: 'comments',
  foreignKey: 'post_id',
  onDelete: 'CASCADE'
});

Comment.belongsTo(Post, {
  foreignKey: 'post_id'
});

Comment.belongsTo(User, {
  as: 'author',
  foreignKey: 'author_id'
});

User.hasMany(Comment, {
  as: 'comments',
  foreignKey: 'author_id'
});

// Reaction associations
Post.hasMany(Reaction, {
  as: 'reactions',
  foreignKey: 'post_id',
  onDelete: 'CASCADE'
});

Reaction.belongsTo(Post, {
  foreignKey: 'post_id'
});

Reaction.belongsTo(User, {
  foreignKey: 'user_id'
});

User.hasMany(Reaction, {
  as: 'reactions',
  foreignKey: 'user_id'
});

// Bookmark associations
Post.hasMany(Bookmark, {
  as: 'bookmarks',
  foreignKey: 'post_id',
  onDelete: 'CASCADE'
});

Bookmark.belongsTo(Post, {
  as: 'Post',
  foreignKey: 'post_id'
});

Bookmark.belongsTo(User, {
  foreignKey: 'user_id'
});

User.hasMany(Bookmark, {
  as: 'bookmarks',
  foreignKey: 'user_id'
});

// Message associations (for chat functionality)
Message.belongsTo(User, {
  as: 'sender',
  foreignKey: 'sender_id'
});

Message.belongsTo(User, {
  as: 'receiver',
  foreignKey: 'receiver_id'
});

Message.belongsTo(Community, {
  as: 'community',
  foreignKey: 'community_id'
});

User.hasMany(Message, {
  as: 'sent_messages',
  foreignKey: 'sender_id'
});

User.hasMany(Message, {
  as: 'received_messages',
  foreignKey: 'receiver_id'
});

Community.hasMany(Message, {
  as: 'messages',
  foreignKey: 'community_id'
});

// UserProgress associations (attribute is userId, DB column is user_id)
UserProgress.belongsTo(User, {
  foreignKey: 'userId'
});

User.hasOne(UserProgress, {
  foreignKey: 'userId'
});

module.exports = {
  User,
  Community,
  Post,
  Comment,
  Image,
  Reaction,
  Bookmark,
  TokenBlocklist,
  Message,
  UserProgress
};

