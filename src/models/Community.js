const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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
  tableName: 'community',
  underscored: true
});

// Instance methods
Community.prototype.toJSON = function(includeMembers = false) {
  const values = Object.assign({}, this.get());
  
  // Add computed fields
  values.members_count = this.members ? this.members.length : 0;
  values.posts_count = this.posts ? this.posts.length : 0;
  
  if (includeMembers && this.members) {
    values.members = this.members.map(member => member.id);
  }
  
  return values;
};

Community.prototype.isMember = function(userId) {
  if (!this.members) return false;
  const userIdInt = parseInt(userId);
  return this.members.some(member => member.id === userIdInt);
};

module.exports = Community; 