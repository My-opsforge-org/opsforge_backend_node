'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Fix the auto-increment sequence for the message table
    try {
      // Reset the sequence to the maximum id value + 1
      await queryInterface.sequelize.query(`
        SELECT setval(pg_get_serial_sequence('message', 'id'), COALESCE((SELECT MAX(id) FROM message), 0) + 1, false);
      `);
      console.log('Message table sequence fixed successfully');
    } catch (error) {
      console.log('Could not fix message table sequence:', error.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // No rollback needed for sequence fix
  }
};

