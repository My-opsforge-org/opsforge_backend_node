'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    const targetTable = tables.includes('messages') ? 'messages' : (tables.includes('message') ? 'message' : 'messages');
    await queryInterface.addColumn(targetTable, 'community_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'community', key: 'id' }
    });
  },

  async down (queryInterface) {
    const tables = await queryInterface.showAllTables();
    const targetTable = tables.includes('messages') ? 'messages' : (tables.includes('message') ? 'message' : 'messages');
    await queryInterface.removeColumn(targetTable, 'community_id');
  }
};
