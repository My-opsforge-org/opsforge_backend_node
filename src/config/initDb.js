const sequelize = require('./database');
const Message = require('../models/Message');
const UserProgress = require('../models/UserProgress');

async function initializeDatabase() {
  try {
    // Check if messages table exists
    const messagesTableExists = await sequelize.getQueryInterface().showAllTables()
      .then(tables => tables.includes('messages'));

    if (!messagesTableExists) {
      await Message.sync();
    }

    // Check if user_progress table exists
    const progressTableExists = await sequelize.getQueryInterface().showAllTables()
      .then(tables => tables.includes('user_progress'));

    if (!progressTableExists) {
      await UserProgress.sync();
    }

    return true;
  } catch (error) {
    console.error('Error during database initialization:', error);
    return false;
  }
}

module.exports = initializeDatabase; 