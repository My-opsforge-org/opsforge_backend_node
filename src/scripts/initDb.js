require('dotenv').config();
const initializeDatabase = require('../config/initDb');

async function main() {
  try {
    await initializeDatabase();
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

main(); 