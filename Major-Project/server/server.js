// ============================================================================
// CareNova Health — HTTP Server Entry Point
// iNeuBytes Web Development Internship — Major Project Phase 3A Foundation
// ============================================================================

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = require('./app');
const { testDbConnection } = require('./config/db');

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`================================================================`);
  console.log(`  CareNova Health Express Backend Server Started               `);
  console.log(`  Port: ${PORT}`);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`  Health Endpoint: http://localhost:${PORT}/api/health`);
  console.log(`================================================================`);

  // Log DB Connection Status on Startup
  const dbStatus = await testDbConnection();
  console.log(`  [DB Status]: ${dbStatus.message}`);
  console.log(`================================================================`);
});
