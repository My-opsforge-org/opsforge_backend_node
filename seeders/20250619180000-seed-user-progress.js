'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Get all existing users
    const users = await queryInterface.sequelize.query(
      'SELECT id FROM "user"',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (users.length > 0) {
      // Create user progress records for all existing users
      const userProgressRecords = users.map(user => ({
        user_id: user.id,
        level: 1,
        total_xp: 0,
        places_discovered: 0,
        achievements: '[]',
        completed_levels: '[]',
        current_level_progress: '{}',
        last_played_at: new Date(),
        created_at: new Date(),
        updated_at: new Date()
      }));

      await queryInterface.bulkInsert('user_progress', userProgressRecords);
      console.log(`Created user progress records for ${users.length} existing users`);
    } else {
      console.log('No existing users found to seed user progress');
    }
  },

  async down (queryInterface, Sequelize) {
    // Remove all seeded user progress records
    await queryInterface.bulkDelete('user_progress', null, {});
  }
}; 