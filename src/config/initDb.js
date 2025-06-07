const sequelize = require('./database');
const Message = require('../models/Message');

async function initializeDatabase() {
  try {
    console.log('Checking database tables...');
    
    // Check if messages table exists
    const tableExists = await sequelize.getQueryInterface().showAllTables()
      .then(tables => tables.includes('messages'));

    if (!tableExists) {
      console.log('Creating messages table...');
      await Message.sync();
      console.log('Messages table created successfully');
    } else {
      console.log('Messages table already exists, skipping creation');
    }

    return true;
  } catch (error) {
    console.error('Error during database initialization:', error);
    return false;
  }
}

module.exports = initializeDatabase; 