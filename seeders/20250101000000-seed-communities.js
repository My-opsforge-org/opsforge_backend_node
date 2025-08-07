'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Create test communities
    const communities = await queryInterface.bulkInsert('community', [
      {
        id: 1,
        name: 'Travel Enthusiasts',
        description: 'A community for people who love to travel and explore new places',
        created_at: new Date()
      },
      {
        id: 2,
        name: 'Adventure Seekers',
        description: 'For those who seek adventure and outdoor activities',
        created_at: new Date()
      },
      {
        id: 3,
        name: 'Photography Lovers',
        description: 'Share your travel photos and photography tips',
        created_at: new Date()
      }
    ], { returning: true });

    // Add some users to communities (assuming users with IDs 1, 2, 3 exist)
    await queryInterface.bulkInsert('community_members', [
      { community_id: 1, user_id: 1 },
      { community_id: 1, user_id: 2 },
      { community_id: 1, user_id: 3 },
      { community_id: 2, user_id: 1 },
      { community_id: 2, user_id: 2 },
      { community_id: 3, user_id: 1 },
      { community_id: 3, user_id: 3 }
    ]);
  },

  async down (queryInterface, Sequelize) {
    // Remove test data
    await queryInterface.bulkDelete('community_members', null, {});
    await queryInterface.bulkDelete('community', null, {});
  }
};
