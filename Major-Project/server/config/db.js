// ============================================================================
// CareNova Health — Database Connection Pool (mysql2/promise)
// iNeuBytes Web Development Internship — Major Project Phase 3A Foundation
// ============================================================================

const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'carenova_health_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create Connection Pool
const pool = mysql.createPool(dbConfig);

// Helper function to test DB connection health
async function testDbConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.query('SELECT 1');
    connection.release();
    return { connected: true, message: 'MySQL Database pool connected successfully' };
  } catch (error) {
    return { 
      connected: false, 
      message: `MySQL Connection Notice: ${error.message}. (Local server operational)`
    };
  }
}

module.exports = {
  pool,
  testDbConnection
};
