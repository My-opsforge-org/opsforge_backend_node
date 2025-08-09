'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('user', 'firebase_uid', {
      type: Sequelize.STRING(128),
      unique: true,
      allowNull: true
    });
    
    await queryInterface.addColumn('user', 'auth_provider', {
      type: Sequelize.ENUM('local', 'google', 'apple'),
      allowNull: false,
      defaultValue: 'local'
    });
    
    // Make password nullable for OAuth users
    await queryInterface.changeColumn('user', 'password', {
      type: Sequelize.STRING(60),
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('user', 'firebase_uid');
    await queryInterface.removeColumn('user', 'auth_provider');
    
    // Revert password to required
    await queryInterface.changeColumn('user', 'password', {
      type: Sequelize.STRING(60),
      allowNull: false
    });
  }
};

