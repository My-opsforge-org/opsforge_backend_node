module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('messages', 'community_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'community',
        key: 'id'
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('messages', 'community_id');
  }
}; 