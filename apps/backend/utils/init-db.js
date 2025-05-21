const db = require('../models');
const seedDatabase = require('./database-seed');

// Initialize database
const initDb = async (force = false) => {
  try {
    console.log('Initializing database...');
    
    // Sync all models with database
    await db.sequelize.sync({ force });
    console.log('Database synchronized successfully');
    
    // Seed database if force is true
    if (force) {
      await seedDatabase();
    }
    
    console.log('Database initialization completed');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
};

// Execute if this script is run directly
if (require.main === module) {
  // Get force flag from command line arguments
  const force = process.argv.includes('--force');
  initDb(force);
}

module.exports = initDb;
