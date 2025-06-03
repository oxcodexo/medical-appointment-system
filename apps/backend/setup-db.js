const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

async function setupDatabase() {
  try {
    console.log('Setting up database...');
    
    // Create connection without database specified
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root'
    });
    
    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'medical_appointment_db_2025';
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`Database '${dbName}' created or already exists`);
    
    // Close connection
    await connection.end();
    console.log('Database setup completed successfully');
    
    // Run database initialization
    const initDb = require('./utils/init-db');
    await initDb(true);
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

// Run setup if this script is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;
