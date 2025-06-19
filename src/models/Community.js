const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Community = sequelize.define('Community', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'community',
  underscored: true,
  timestamps: false
});

// Many-to-many relationship with User (members)
Community.belongsToMany(User, {
  through: 'community_members',
  foreignKey: 'community_id',
  otherKey: 'user_id',
  as: 'members',
  timestamps: false
});
User.belongsToMany(Community, {
  through: 'community_members',
  foreignKey: 'user_id',
  otherKey: 'community_id',
  as: 'communities_joined',
  timestamps: false
});

module.exports = Community; 