// ============================================================================
// CareNova Health — Health Check Controller
// iNeuBytes Web Development Internship — Major Project Phase 3A Foundation
// ============================================================================

const { testDbConnection } = require('../config/db');

async function getHealth(req, res, next) {
  try {
    const dbStatus = await testDbConnection();

    res.status(200).json({
      success: true,
      message: 'CareNova Health API is running',
      version: '1.0.0-phase3a',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      database: dbStatus.connected ? 'connected' : 'disconnected_or_notice',
      databaseNotice: dbStatus.message
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getHealth
};
