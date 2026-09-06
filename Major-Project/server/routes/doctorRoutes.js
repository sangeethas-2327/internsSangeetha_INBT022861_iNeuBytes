// ============================================================================
// CareNova Health — Doctor Routes
// iNeuBytes Web Development Internship — Major Project Phase 3C Patient Module
// ============================================================================

const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');

// Read-only doctor discovery endpoints
router.get('/', doctorController.getAllDoctors);
router.get('/:id', doctorController.getDoctorById);
router.get('/:id/available-slots', doctorController.getDoctorAvailableSlots);

module.exports = router;
