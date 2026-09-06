// ============================================================================
// CareNova Health — Authentication Routes
// iNeuBytes Web Development Internship — Major Project Phase 3B Auth & RBAC
// ============================================================================

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Public Auth Endpoints
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Protected Auth Profile Endpoint
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
