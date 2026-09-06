// ============================================================================
// CareNova Health — Doctor Routes (Public & Workstation Endpoints)
// iNeuBytes Web Development Internship — Major Project Phase 3D Doctor Module
// ============================================================================

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const doctorController = require('../controllers/doctorController');

// ----------------------------------------------------------------------------
// 1. Authenticated Doctor Workstation Endpoints (/api/doctors/me/*)
// ----------------------------------------------------------------------------
router.get('/me', authMiddleware, requireRole('doctor'), doctorController.getDoctorProfile);
router.put('/me', authMiddleware, requireRole('doctor'), doctorController.updateDoctorProfile);
router.get('/me/dashboard', authMiddleware, requireRole('doctor'), doctorController.getDoctorDashboard);
router.get('/me/appointments', authMiddleware, requireRole('doctor'), doctorController.getDoctorAppointments);
router.get('/me/appointments/:id', authMiddleware, requireRole('doctor'), doctorController.getDoctorAppointmentById);
router.put('/me/appointments/:id/status', authMiddleware, requireRole('doctor'), doctorController.updateDoctorAppointmentStatus);
router.post('/me/appointments/:id/consultation', authMiddleware, requireRole('doctor'), doctorController.submitDoctorConsultation);
router.get('/me/records', authMiddleware, requireRole('doctor'), doctorController.getDoctorAuthoredRecords);
router.put('/me/records/:id', authMiddleware, requireRole('doctor'), doctorController.updateAuthoredRecord);

// ----------------------------------------------------------------------------
// 2. Public / Patient Read-Only Doctor Discovery Endpoints
// ----------------------------------------------------------------------------
router.get('/', doctorController.getAllDoctors);
router.get('/:id', doctorController.getDoctorById);
router.get('/:id/available-slots', doctorController.getDoctorAvailableSlots);

module.exports = router;
