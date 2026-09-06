// ============================================================================
// CareNova Health — Medical Record Routes (Patient Read Access)
// iNeuBytes Web Development Internship — Major Project Phase 3C Patient Module
// ============================================================================

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const medicalRecordController = require('../controllers/medicalRecordController');

// All patient medical record endpoints require authentication and 'patient' role
router.use(authMiddleware);
router.use(requireRole('patient'));

router.get('/my', medicalRecordController.getMyMedicalRecords);
router.get('/:id', medicalRecordController.getMedicalRecordById);

module.exports = router;
