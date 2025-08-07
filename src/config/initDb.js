const sequelize = require('./database');
const Message = require('../models/Message');
const UserProgress = require('../models/UserProgress');

async function initializeDatabase() {
  try {
    console.log('Checking database tables...');
    
    // Check if messages table exists
    const messagesTableExists = await sequelize.getQueryInterface().showAllTables()
      .then(tables => tables.includes('messages'));

    if (!messagesTableExists) {
      console.log('Creating messages table...');
      await Message.sync();
      console.log('Messages table created successfully');
    } else {
      console.log('Messages table already exists, skipping creation');
    }

    // Check if user_progress table exists
    const progressTableExists = await sequelize.getQueryInterface().showAllTables()
      .then(tables => tables.includes('user_progress'));

    if (!progressTableExists) {
      console.log('Creating user_progress table...');
      await UserProgress.sync();
      console.log('User progress table created successfully');
    } else {
      console.log('User progress table already exists, skipping creation');
    }

    return true;
  } catch (error) {
    console.error('Error during database initialization:', error);
    return false;
  }
}

module.exports = initializeDatabase; 