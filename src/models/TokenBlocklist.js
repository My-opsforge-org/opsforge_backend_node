const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TokenBlocklist = sequelize.define('TokenBlocklist', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  jti: {
    type: DataTypes.STRING(36),
    allowNull: false,
    unique: true
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'token_blocklist',
  underscored: true,
  timestamps: false
});

module.exports = TokenBlocklist;











