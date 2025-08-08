'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove Firebase-related columns if they exist
    try {
      await queryInterface.removeColumn('user', 'firebase_uid');
    } catch (error) {
      console.log('firebase_uid column does not exist or already removed');
    }

    try {
      await queryInterface.removeColumn('user', 'auth_provider');
    } catch (error) {
      console.log('auth_provider column does not exist or already removed');
    }

    // Make password required again (remove nullable constraint)
    try {
      await queryInterface.changeColumn('user', 'password', {
        type: Sequelize.STRING(60),
        allowNull: false
      });
    } catch (error) {
      console.log('Could not update password column constraint');
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Add back Firebase fields if needed to rollback
    await queryInterface.addColumn('user', 'firebase_uid', {
      type: Sequelize.STRING(128),
      allowNull: true,
      unique: true
    });

    await queryInterface.addColumn('user', 'auth_provider', {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: 'local'
    });

    // Make password nullable again
    await queryInterface.changeColumn('user', 'password', {
      type: Sequelize.STRING(60),
      allowNull: true
    });
  }
};

