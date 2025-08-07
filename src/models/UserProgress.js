const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const UserProgress = sequelize.define('UserProgress', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'user',
      key: 'id'
    }
  },
  level: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  totalXP: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  placesDiscovered: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  achievements: {
    type: DataTypes.TEXT, // Store as JSON string
    allowNull: true,
    defaultValue: '[]'
  },
  completedLevels: {
    type: DataTypes.TEXT, // Store as JSON string of completed level IDs
    allowNull: true,
    defaultValue: '[]'
  },
  currentLevelProgress: {
    type: DataTypes.TEXT, // Store as JSON string of current level progress
    allowNull: true,
    defaultValue: '{}'
  },
  lastPlayedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'createdAt'
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'updatedAt'
  }
}, {
  tableName: 'user_progress',
  underscored: true
});

// Association with User model
UserProgress.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(UserProgress, { foreignKey: 'userId' });

module.exports = UserProgress; 