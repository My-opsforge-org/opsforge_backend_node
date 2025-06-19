const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(120),
    unique: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING(60),
    allowNull: false
  },
  avatarUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'avatarUrl'
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  gender: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  sun_sign: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  interests: {
    type: DataTypes.TEXT, // Store as JSON string
    allowNull: true
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  longitude: {
    type: DataTypes.FLOAT,
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
  tableName: 'user',
  underscored: true
});

// Associations for followers/following can be added here if needed
// Example (requires a join table):
// User.belongsToMany(User, { as: 'Followers', through: 'followers', foreignKey: 'followed_id' });
// User.belongsToMany(User, { as: 'Following', through: 'followers', foreignKey: 'follower_id' });

module.exports = User; 