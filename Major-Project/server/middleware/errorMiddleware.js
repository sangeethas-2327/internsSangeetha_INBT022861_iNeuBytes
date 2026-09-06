// ============================================================================
// CareNova Health — Express Error & 404 Middleware Foundation
// iNeuBytes Web Development Internship — Major Project Phase 3A Foundation
// ============================================================================

// 404 Unknown Route Handler
function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`
  });
}

// Centralized Error Handling Middleware
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};
