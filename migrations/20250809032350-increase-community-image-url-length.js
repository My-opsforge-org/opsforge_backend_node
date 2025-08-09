'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('community', 'image_url', {
      type: Sequelize.STRING(1000),
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('community', 'image_url', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
  }
};
