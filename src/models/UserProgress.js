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
    defaultValue: 0,
    field: 'total_xp'
  },
  placesDiscovered: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'places_discovered'
  },
  touristTrail: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'tourist_trail'
  },
  foodExplorer: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'food_explorer'
  },
  culturalQuest: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'cultural_quest'
  },
  natureWanderer: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'nature_wanderer'
  },
  entertainmentHunter: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'entertainment_hunter'
  },
  lastPlayedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_played_at'
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
  tableName: 'user_progress',
  underscored: true
});

module.exports = UserProgress; 