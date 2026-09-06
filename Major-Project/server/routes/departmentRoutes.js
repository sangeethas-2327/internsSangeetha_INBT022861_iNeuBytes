// ============================================================================
// CareNova Health — Department Routes
// iNeuBytes Web Development Internship — Major Project Phase 3C Patient Module
// ============================================================================

const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');

// Read-only department listing accessible publicly or by authenticated patients
router.get('/', departmentController.getAllDepartments);

module.exports = router;
