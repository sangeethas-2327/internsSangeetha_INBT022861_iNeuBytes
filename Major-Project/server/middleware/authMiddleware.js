// ============================================================================
// CareNova Health — Authentication Middleware
// iNeuBytes Web Development Internship — Major Project Phase 3B Auth & RBAC
// ============================================================================

const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  try {
    let token = null;

    // 1. Primary Source: Read JWT from HttpOnly cookie 'carenova_token'
    if (req.cookies && req.cookies.carenova_token) {
      token = req.cookies.carenova_token;
    } 
    // 2. Secondary Fallback: Support Bearer Authorization header for API testing
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Reject missing credentials
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to access this resource.'
      });
    }

    // Verify JWT Signature & Expiration
    const jwtSecret = process.env.JWT_SECRET || 'replace_with_a_long_random_secret';
    const decoded = jwt.verify(token, jwtSecret);

    // Attach authenticated user identity payload to request object
    req.user = {
      id: decoded.userId,
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      firstName: decoded.firstName,
      lastName: decoded.lastName
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Authentication token has expired. Please log in again.'
      });
    }
    
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token. Please log in again.'
    });
  }
}

module.exports = authMiddleware;
