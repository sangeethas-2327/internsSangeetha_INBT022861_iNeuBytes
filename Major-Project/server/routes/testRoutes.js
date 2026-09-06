// ============================================================================
// CareNova Health — RBAC Verification Test Routes
// iNeuBytes Web Development Internship — Major Project Phase 3B Auth & RBAC
// ============================================================================

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const {
  testPatientEndpoint,
  testDoctorEndpoint,
  testAdminEndpoint
} = require('../controllers/testController');

// 1. Patient Protected Test Endpoint
router.get('/patient', authMiddleware, requireRole('patient'), testPatientEndpoint);

// 2. Doctor Protected Test Endpoint
router.get('/doctor', authMiddleware, requireRole('doctor'), testDoctorEndpoint);

// 3. Admin Protected Test Endpoint
router.get('/admin', authMiddleware, requireRole('admin'), testAdminEndpoint);

module.exports = router;
