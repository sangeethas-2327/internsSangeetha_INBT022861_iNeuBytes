// ============================================================================
// CareNova Health — Admin Routes (Command Console Endpoints)
// iNeuBytes Web Development Internship — Major Project Phase 3E Admin Module
// ============================================================================

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const adminController = require('../controllers/adminController');

// All Admin workstation endpoints protected with authMiddleware + requireRole('admin')
router.use(authMiddleware, requireRole('admin'));

// 1. Dashboard Analytics & Reports
router.get('/dashboard-stats', adminController.getDashboardStats);
router.get('/reports/summary', adminController.getReportsSummary);

// 2. Doctor Management & Onboarding
router.get('/doctors', adminController.getAllDoctors);
router.post('/doctors', adminController.onboardDoctor);
router.get('/doctors/:id', adminController.getDoctorById);
router.put('/doctors/:id', adminController.updateDoctor);
router.patch('/doctors/:id/status', adminController.toggleDoctorStatus);

// 3. Patient Management
router.get('/patients', adminController.getAllPatients);
router.get('/patients/:id', adminController.getPatientById);
router.put('/patients/:id', adminController.updatePatient);
router.patch('/patients/:id/status', adminController.togglePatientStatus);

// 4. Department Management (Full CRUD)
router.get('/departments', adminController.getAllDepartments);
router.post('/departments', adminController.createDepartment);
router.put('/departments/:id', adminController.updateDepartment);
router.delete('/departments/:id', adminController.deleteDepartment);

// 5. Global Appointment Management & Overrides
router.get('/appointments', adminController.getAllAppointments);
router.get('/appointments/:id', adminController.getAppointmentById);
router.patch('/appointments/:id/status', adminController.overrideAppointmentStatus);
router.put('/appointments/:id/reschedule', adminController.rescheduleAppointment);
router.delete('/appointments/:id/cancel', adminController.cancelAppointment);

module.exports = router;
