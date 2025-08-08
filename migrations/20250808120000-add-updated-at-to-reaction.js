'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = 'reaction';
    const column = 'updated_at';
    // Add updated_at if it doesn't exist
    const tableDesc = await queryInterface.describeTable(table);
    if (!tableDesc[column]) {
      await queryInterface.addColumn(table, column, {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const table = 'reaction';
    const column = 'updated_at';
    const tableDesc = await queryInterface.describeTable(table);
    if (tableDesc[column]) {
      await queryInterface.removeColumn(table, column);
    }
  }
};



