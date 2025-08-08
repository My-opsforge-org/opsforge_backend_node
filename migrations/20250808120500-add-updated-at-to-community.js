'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = 'community';
    const column = 'updated_at';
    const desc = await queryInterface.describeTable(table);
    if (!desc[column]) {
      await queryInterface.addColumn(table, column, {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const table = 'community';
    const column = 'updated_at';
    const desc = await queryInterface.describeTable(table);
    if (desc[column]) {
      await queryInterface.removeColumn(table, column);
    }
  }
};



