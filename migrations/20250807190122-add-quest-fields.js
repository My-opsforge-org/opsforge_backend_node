'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add new quest fields
    await queryInterface.addColumn('user_progress', 'tourist_trail', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('user_progress', 'food_explorer', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('user_progress', 'cultural_quest', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('user_progress', 'nature_wanderer', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('user_progress', 'entertainment_hunter', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });

    // Remove old JSON fields
    await queryInterface.removeColumn('user_progress', 'achievements');
    await queryInterface.removeColumn('user_progress', 'completed_levels');
    await queryInterface.removeColumn('user_progress', 'current_level_progress');
  },

  async down (queryInterface, Sequelize) {
    // Remove new quest fields
    await queryInterface.removeColumn('user_progress', 'tourist_trail');
    await queryInterface.removeColumn('user_progress', 'food_explorer');
    await queryInterface.removeColumn('user_progress', 'cultural_quest');
    await queryInterface.removeColumn('user_progress', 'nature_wanderer');
    await queryInterface.removeColumn('user_progress', 'entertainment_hunter');

    // Add back old JSON fields
    await queryInterface.addColumn('user_progress', 'achievements', {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: '[]'
    });

    await queryInterface.addColumn('user_progress', 'completed_levels', {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: '[]'
    });

    await queryInterface.addColumn('user_progress', 'current_level_progress', {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: '{}'
    });
  }
};
