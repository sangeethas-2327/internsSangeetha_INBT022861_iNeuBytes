// ============================================================================
// CareNova Health — Role-Based Access Control (RBAC) Middleware
// iNeuBytes Web Development Internship — Major Project Phase 3B Auth & RBAC
// ============================================================================

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    // 1. Assert Authentication State
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in first.'
      });
    }

    // 2. Assert Role Authorization
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to role(s): [${allowedRoles.join(', ')}]. Your current role is '${req.user.role}'.`
      });
    }

    next();
  };
}

module.exports = {
  requireRole
};
