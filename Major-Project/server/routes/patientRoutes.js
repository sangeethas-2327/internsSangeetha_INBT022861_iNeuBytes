// ============================================================================
// CareNova Health — Patient Routes
// iNeuBytes Web Development Internship — Major Project Phase 3C Patient Module
// ============================================================================

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const patientController = require('../controllers/patientController');

// All patient endpoints require authentication and 'patient' role
router.use(authMiddleware);
router.use(requireRole('patient'));

router.get('/me', patientController.getProfile);
router.put('/me', patientController.updateProfile);

module.exports = router;
