// ============================================================================
// CareNova Health — Patient Controller
// iNeuBytes Web Development Internship — Major Project Phase 3C Patient Module
// ============================================================================

const { pool } = require('../config/db');

// Helper: Get Patient Record ID from Authenticated User ID
async function getPatientIdByUserId(userId) {
  const [rows] = await pool.query('SELECT id FROM patients WHERE user_id = ?', [userId]);
  if (rows && rows.length > 0) {
    return rows[0].id;
  }
  return null;
}

// ----------------------------------------------------------------------------
// 1. Get Authenticated Patient Profile (GET /api/patients/me)
// ----------------------------------------------------------------------------
async function getProfile(req, res, next) {
  try {
    const userId = req.user.id;

    const query = `
      SELECT 
        u.id AS userId,
        u.email,
        u.role,
        u.first_name AS firstName,
        u.last_name AS lastName,
        u.phone,
        u.is_active AS isActive,
        u.created_at AS userCreatedAt,
        p.id AS patientId,
        p.date_of_birth AS dateOfBirth,
        p.gender,
        p.blood_group AS bloodGroup,
        p.address,
        p.emergency_contact AS emergencyContact,
        p.medical_history_summary AS medicalHistorySummary,
        p.updated_at AS profileUpdatedAt
      FROM users u
      LEFT JOIN patients p ON p.user_id = u.id
      WHERE u.id = ? AND u.role = 'patient'
    `;

    const [rows] = await pool.query(query, [userId]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found.'
      });
    }

    return res.status(200).json({
      success: true,
      patient: rows[0]
    });
  } catch (error) {
    next(error);
  }
}

// ----------------------------------------------------------------------------
// 2. Update Authenticated Patient Profile (PUT /api/patients/me)
// ----------------------------------------------------------------------------
async function updateProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const {
      firstName,
      lastName,
      phone,
      dateOfBirth,
      gender,
      bloodGroup,
      address,
      emergencyContact,
      medicalHistorySummary
    } = req.body;

    const cleanFirstName = firstName ? String(firstName).trim() : null;
    const cleanLastName = lastName ? String(lastName).trim() : null;
    const cleanPhone = phone ? String(phone).trim() : null;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Update Users table fields if provided
      if (cleanFirstName || cleanLastName || cleanPhone) {
        const updateUsersFields = [];
        const userQueryParams = [];

        if (cleanFirstName) {
          updateUsersFields.push('first_name = ?');
          userQueryParams.push(cleanFirstName);
        }
        if (cleanLastName) {
          updateUsersFields.push('last_name = ?');
          userQueryParams.push(cleanLastName);
        }
        if (cleanPhone) {
          updateUsersFields.push('phone = ?');
          userQueryParams.push(cleanPhone);
        }

        userQueryParams.push(userId);
        await connection.query(
          `UPDATE users SET ${updateUsersFields.join(', ')} WHERE id = ?`,
          userQueryParams
        );
      }

      // 2. Update or Insert Patients table profile fields
      const [existingPatient] = await connection.query('SELECT id FROM patients WHERE user_id = ?', [userId]);

      if (existingPatient && existingPatient.length > 0) {
        await connection.query(
          `UPDATE patients SET 
            date_of_birth = ?, 
            gender = ?, 
            blood_group = ?, 
            address = ?, 
            emergency_contact = ?, 
            medical_history_summary = ? 
           WHERE user_id = ?`,
          [
            dateOfBirth || null,
            gender || 'female',
            bloodGroup || null,
            address || null,
            emergencyContact || null,
            medicalHistorySummary || null,
            userId
          ]
        );
      } else {
        await connection.query(
          `INSERT INTO patients (user_id, date_of_birth, gender, blood_group, address, emergency_contact, medical_history_summary)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            dateOfBirth || null,
            gender || 'female',
            bloodGroup || null,
            address || null,
            emergencyContact || null,
            medicalHistorySummary || null
          ]
        );
      }

      await connection.commit();
      connection.release();

      // Fetch updated profile
      const [updatedRows] = await pool.query(`
        SELECT 
          u.id AS userId,
          u.email,
          u.role,
          u.first_name AS firstName,
          u.last_name AS lastName,
          u.phone,
          p.id AS patientId,
          p.date_of_birth AS dateOfBirth,
          p.gender,
          p.blood_group AS bloodGroup,
          p.address,
          p.emergency_contact AS emergencyContact,
          p.medical_history_summary AS medicalHistorySummary
        FROM users u
        LEFT JOIN patients p ON p.user_id = u.id
        WHERE u.id = ?
      `, [userId]);

      return res.status(200).json({
        success: true,
        message: 'Patient profile updated successfully.',
        patient: updatedRows[0]
      });
    } catch (dbErr) {
      await connection.rollback();
      connection.release();
      throw dbErr;
    }
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getPatientIdByUserId,
  getProfile,
  updateProfile
};
