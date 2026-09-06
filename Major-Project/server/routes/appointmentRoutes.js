// ============================================================================
// CareNova Health — Appointment Routes
// iNeuBytes Web Development Internship — Major Project Phase 3C Patient Module
// ============================================================================

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const appointmentController = require('../controllers/appointmentController');

// All patient appointment endpoints require authentication and 'patient' role
router.use(authMiddleware);
router.use(requireRole('patient'));

router.post('/', appointmentController.bookAppointment);
router.get('/my', appointmentController.getMyAppointments);
router.get('/:id', appointmentController.getAppointmentById);
router.put('/:id/reschedule', appointmentController.rescheduleAppointment);
router.put('/:id/cancel', appointmentController.cancelAppointment);

module.exports = router;
