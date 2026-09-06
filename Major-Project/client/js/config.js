// ============================================================================
// CareNova Health — Client Configuration Constants
// iNeuBytes Web Development Internship — Major Project Phase 3A Foundation
// ============================================================================

const CONFIG = {
  API_BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : '/api',
  APP_NAME: 'CareNova Health',
  PHASE: '3A — Foundation'
};
