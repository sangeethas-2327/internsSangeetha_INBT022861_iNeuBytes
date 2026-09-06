// ============================================================================
// CareNova Health — Medical Record Controller (Patient Read Access)
// iNeuBytes Web Development Internship — Major Project Phase 3C Patient Module
// ============================================================================

const { pool } = require('../config/db');
const { getPatientIdByUserId } = require('./patientController');

// ----------------------------------------------------------------------------
// 1. Get Authenticated Patient Medical Records (GET /api/medical-records/my)
// ----------------------------------------------------------------------------
async function getMyMedicalRecords(req, res, next) {
  try {
    const userId = req.user.id;
    const patientId = await getPatientIdByUserId(userId);

    if (!patientId) {
      return res.status(200).json({
        success: true,
        count: 0,
        records: []
      });
    }

    const query = `
      SELECT 
        mr.id AS id,
        mr.record_code AS recordCode,
        mr.appointment_id AS appointmentId,
        mr.patient_id AS patientId,
        mr.doctor_id AS doctorId,
        CONCAT('Dr. ', docUser.first_name, ' ', docUser.last_name) AS doctorName,
        dept.name AS departmentName,
        mr.diagnosis,
        mr.prescription,
        mr.doctor_notes AS doctorNotes,
        DATE_FORMAT(mr.recommended_followup_date, '%Y-%m-%d') AS recommendedFollowupDate,
        DATE_FORMAT(a.appointment_date, '%Y-%m-%d') AS appointmentDate,
        a.time_slot AS timeSlot,
        mr.created_at AS createdAt
      FROM medical_records mr
      JOIN appointments a ON a.id = mr.appointment_id
      JOIN doctors doc ON doc.id = mr.doctor_id
      JOIN users docUser ON docUser.id = doc.user_id
      JOIN departments dept ON dept.id = doc.department_id
      WHERE mr.patient_id = ?
      ORDER BY mr.created_at DESC
    `;

    const [rows] = await pool.query(query, [patientId]);

    return res.status(200).json({
      success: true,
      count: rows.length,
      records: rows
    });
  } catch (error) {
    next(error);
  }
}

// ----------------------------------------------------------------------------
// 2. Get Single Medical Record Details by ID (GET /api/medical-records/:id)
// ----------------------------------------------------------------------------
async function getMedicalRecordById(req, res, next) {
  try {
    const userId = req.user.id;
    const patientId = await getPatientIdByUserId(userId);
    const recordId = Number(req.params.id);

    const query = `
      SELECT 
        mr.id AS id,
        mr.record_code AS recordCode,
        mr.appointment_id AS appointmentId,
        mr.patient_id AS patientId,
        mr.doctor_id AS doctorId,
        CONCAT('Dr. ', docUser.first_name, ' ', docUser.last_name) AS doctorName,
        dept.name AS departmentName,
        mr.diagnosis,
        mr.prescription,
        mr.doctor_notes AS doctorNotes,
        DATE_FORMAT(mr.recommended_followup_date, '%Y-%m-%d') AS recommendedFollowupDate,
        DATE_FORMAT(a.appointment_date, '%Y-%m-%d') AS appointmentDate,
        a.time_slot AS timeSlot,
        mr.created_at AS createdAt
      FROM medical_records mr
      JOIN appointments a ON a.id = mr.appointment_id
      JOIN doctors doc ON doc.id = mr.doctor_id
      JOIN users docUser ON docUser.id = doc.user_id
      JOIN departments dept ON dept.id = doc.department_id
      WHERE mr.id = ?
    `;

    const [rows] = await pool.query(query, [recordId]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found.'
      });
    }

    const record = rows[0];

    // Ownership Enforcement
    if (record.patientId !== patientId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to view this medical record.'
      });
    }

    return res.status(200).json({
      success: true,
      record
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMyMedicalRecords,
  getMedicalRecordById
};
