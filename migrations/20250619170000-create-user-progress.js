'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('user_progress', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'user',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      level: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      total_xp: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      places_discovered: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      tourist_trail: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      food_explorer: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      cultural_quest: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      nature_wanderer: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      entertainment_hunter: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      last_played_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for better performance
    await queryInterface.addIndex('user_progress', ['user_id']);
    await queryInterface.addIndex('user_progress', ['total_xp']);
    await queryInterface.addIndex('user_progress', ['places_discovered']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('user_progress');
  }
}; 