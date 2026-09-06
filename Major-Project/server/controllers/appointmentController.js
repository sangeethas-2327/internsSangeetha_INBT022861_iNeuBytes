// ============================================================================
// CareNova Health — Appointment Controller
// iNeuBytes Web Development Internship — Major Project Phase 3C Patient Module
// ============================================================================

const { pool } = require('../config/db');
const { getPatientIdByUserId } = require('./patientController');

// Helper: Generate Unique Appointment Reference ID (e.g. CNH-2026-8492)
function generateReferenceId() {
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `CNH-2026-${randomDigits}`;
}

// ----------------------------------------------------------------------------
// 1. Book New Appointment (POST /api/appointments)
// ----------------------------------------------------------------------------
async function bookAppointment(req, res, next) {
  try {
    const userId = req.user.id;
    const { doctorId, departmentId, appointmentDate, timeSlot, reasonForVisit } = req.body;

    // Validate Required Inputs
    if (!doctorId || !departmentId || !appointmentDate || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Missing required appointment fields: doctorId, departmentId, appointmentDate, and timeSlot are required.'
      });
    }

    // Resolve Patient ID from req.user.id
    const patientId = await getPatientIdByUserId(userId);
    if (!patientId) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found. Please complete your registration.'
      });
    }

    // Validate Doctor Exists & Active & Belongs to Department
    const [docRows] = await pool.query(
      `SELECT d.id, d.department_id, d.consultation_fee, d.is_available, u.is_active
       FROM doctors d
       JOIN users u ON u.id = d.user_id
       WHERE d.id = ?`,
      [Number(doctorId)]
    );

    if (!docRows || docRows.length === 0 || !docRows[0].is_available || !docRows[0].is_active) {
      return res.status(400).json({
        success: false,
        message: 'The selected doctor is currently inactive or unavailable.'
      });
    }

    const doctor = docRows[0];
    if (doctor.department_id !== Number(departmentId)) {
      return res.status(400).json({
        success: false,
        message: 'Doctor does not belong to the selected department.'
      });
    }

    // Validate Appointment Date is not in the past
    const selectedDate = new Date(appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(selectedDate.getTime()) || selectedDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Appointment date must be today or a future date.'
      });
    }

    // Authoritative consultation fee from Doctor record
    const consultationFee = doctor.consultation_fee;
    const cleanReason = reasonForVisit ? String(reasonForVisit).trim() : 'General Consultation';

    // MySQL Transaction for Double-Booking Conflict Prevention
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Conflict Check (Doctor + Date + Slot)
      const [conflictRows] = await connection.query(
        `SELECT id FROM appointments 
         WHERE doctor_id = ? AND appointment_date = ? AND time_slot = ? 
           AND status IN ('Confirmed', 'Pending', 'Rescheduled')
         FOR UPDATE`,
        [Number(doctorId), appointmentDate, String(timeSlot).trim()]
      );

      if (conflictRows && conflictRows.length > 0) {
        await connection.rollback();
        connection.release();
        return res.status(409).json({
          success: false,
          message: 'Selected time slot is already booked for this doctor. Please select another slot or date.'
        });
      }

      // 2. Generate Unique Reference ID
      let referenceId = generateReferenceId();
      const [refCheck] = await connection.query('SELECT id FROM appointments WHERE reference_id = ?', [referenceId]);
      if (refCheck && refCheck.length > 0) {
        referenceId = `${referenceId}-${Math.floor(Math.random() * 90 + 10)}`;
      }

      // 3. Insert Appointment Record
      const [result] = await connection.query(
        `INSERT INTO appointments (reference_id, patient_id, doctor_id, department_id, appointment_date, time_slot, consultation_fee, status, reason_for_visit)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'Confirmed', ?)`,
        [referenceId, patientId, Number(doctorId), Number(departmentId), appointmentDate, String(timeSlot).trim(), consultationFee, cleanReason]
      );

      await connection.commit();
      connection.release();

      return res.status(201).json({
        success: true,
        message: 'Appointment booked successfully.',
        appointment: {
          id: result.insertId,
          referenceId,
          patientId,
          doctorId: Number(doctorId),
          departmentId: Number(departmentId),
          appointmentDate,
          timeSlot: String(timeSlot).trim(),
          consultationFee,
          status: 'Confirmed',
          reasonForVisit: cleanReason
        }
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

// ----------------------------------------------------------------------------
// 2. Get Authenticated Patient Appointments (GET /api/appointments/my)
// ----------------------------------------------------------------------------
async function getMyAppointments(req, res, next) {
  try {
    const userId = req.user.id;
    const patientId = await getPatientIdByUserId(userId);

    if (!patientId) {
      return res.status(200).json({
        success: true,
        count: 0,
        appointments: []
      });
    }

    const query = `
      SELECT 
        a.id AS id,
        a.reference_id AS referenceId,
        a.patient_id AS patientId,
        a.doctor_id AS doctorId,
        CONCAT('Dr. ', docUser.first_name, ' ', docUser.last_name) AS doctorName,
        doc.qualification AS doctorQualification,
        a.department_id AS departmentId,
        dept.name AS departmentName,
        dept.code AS departmentCode,
        DATE_FORMAT(a.appointment_date, '%Y-%m-%d') AS appointmentDate,
        a.time_slot AS timeSlot,
        a.consultation_fee AS consultationFee,
        a.status,
        a.reason_for_visit AS reasonForVisit,
        a.created_at AS createdAt,
        mr.id AS medicalRecordId,
        mr.record_code AS medicalRecordCode
      FROM appointments a
      JOIN doctors doc ON doc.id = a.doctor_id
      JOIN users docUser ON docUser.id = doc.user_id
      JOIN departments dept ON dept.id = a.department_id
      LEFT JOIN medical_records mr ON mr.appointment_id = a.id
      WHERE a.patient_id = ?
      ORDER BY a.appointment_date DESC, a.created_at DESC
    `;

    const [rows] = await pool.query(query, [patientId]);

    return res.status(200).json({
      success: true,
      count: rows.length,
      appointments: rows
    });
  } catch (error) {
    next(error);
  }
}

// ----------------------------------------------------------------------------
// 3. Get Appointment Details by ID (GET /api/appointments/:id)
// ----------------------------------------------------------------------------
async function getAppointmentById(req, res, next) {
  try {
    const userId = req.user.id;
    const patientId = await getPatientIdByUserId(userId);
    const appointmentId = Number(req.params.id);

    const query = `
      SELECT 
        a.id AS id,
        a.reference_id AS referenceId,
        a.patient_id AS patientId,
        a.doctor_id AS doctorId,
        CONCAT('Dr. ', docUser.first_name, ' ', docUser.last_name) AS doctorName,
        doc.qualification AS doctorQualification,
        a.department_id AS departmentId,
        dept.name AS departmentName,
        dept.code AS departmentCode,
        DATE_FORMAT(a.appointment_date, '%Y-%m-%d') AS appointmentDate,
        a.time_slot AS timeSlot,
        a.consultation_fee AS consultationFee,
        a.status,
        a.reason_for_visit AS reasonForVisit,
        a.created_at AS createdAt,
        mr.id AS medicalRecordId,
        mr.record_code AS medicalRecordCode,
        mr.diagnosis,
        mr.prescription,
        mr.doctor_notes AS doctorNotes
      FROM appointments a
      JOIN doctors doc ON doc.id = a.doctor_id
      JOIN users docUser ON docUser.id = doc.user_id
      JOIN departments dept ON dept.id = a.department_id
      LEFT JOIN medical_records mr ON mr.appointment_id = a.id
      WHERE a.id = ?
    `;

    const [rows] = await pool.query(query, [appointmentId]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment record not found.'
      });
    }

    const appt = rows[0];

    // Ownership Enforcement
    if (appt.patientId !== patientId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to view this appointment.'
      });
    }

    return res.status(200).json({
      success: true,
      appointment: appt
    });
  } catch (error) {
    next(error);
  }
}

// ----------------------------------------------------------------------------
// 4. Reschedule Appointment (PUT /api/appointments/:id/reschedule)
// ----------------------------------------------------------------------------
async function rescheduleAppointment(req, res, next) {
  try {
    const userId = req.user.id;
    const patientId = await getPatientIdByUserId(userId);
    const appointmentId = Number(req.params.id);
    const { newDate, newTimeSlot } = req.body;

    if (!newDate || !newTimeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both newDate (YYYY-MM-DD) and newTimeSlot.'
      });
    }

    // Verify Ownership and Current Status
    const [existing] = await pool.query(
      'SELECT id, patient_id, doctor_id, status FROM appointments WHERE id = ?',
      [appointmentId]
    );

    if (!existing || existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.'
      });
    }

    const appt = existing[0];
    if (appt.patient_id !== patientId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to reschedule this appointment.'
      });
    }

    if (appt.status === 'Cancelled' || appt.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: `Cannot reschedule an appointment that is already ${appt.status}.`
      });
    }

    // Transaction for Double-Booking Check (Excluding self)
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [conflict] = await connection.query(
        `SELECT id FROM appointments 
         WHERE doctor_id = ? AND appointment_date = ? AND time_slot = ? 
           AND status IN ('Confirmed', 'Pending', 'Rescheduled')
           AND id != ?
         FOR UPDATE`,
        [appt.doctor_id, newDate, String(newTimeSlot).trim(), appointmentId]
      );

      if (conflict && conflict.length > 0) {
        await connection.rollback();
        connection.release();
        return res.status(409).json({
          success: false,
          message: 'Selected new time slot is already occupied for this doctor. Please select another slot.'
        });
      }

      await connection.query(
        `UPDATE appointments 
         SET appointment_date = ?, time_slot = ?, status = 'Rescheduled' 
         WHERE id = ?`,
        [newDate, String(newTimeSlot).trim(), appointmentId]
      );

      await connection.commit();
      connection.release();

      return res.status(200).json({
        success: true,
        message: 'Appointment rescheduled successfully.',
        appointment: {
          id: appointmentId,
          appointmentDate: newDate,
          timeSlot: String(newTimeSlot).trim(),
          status: 'Rescheduled'
        }
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

// ----------------------------------------------------------------------------
// 5. Cancel Appointment (PUT /api/appointments/:id/cancel)
// ----------------------------------------------------------------------------
async function cancelAppointment(req, res, next) {
  try {
    const userId = req.user.id;
    const patientId = await getPatientIdByUserId(userId);
    const appointmentId = Number(req.params.id);

    // Verify Ownership
    const [existing] = await pool.query(
      'SELECT id, patient_id, status FROM appointments WHERE id = ?',
      [appointmentId]
    );

    if (!existing || existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.'
      });
    }

    const appt = existing[0];
    if (appt.patient_id !== patientId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to cancel this appointment.'
      });
    }

    if (appt.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Appointment is already cancelled.'
      });
    }

    if (appt.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Completed appointments cannot be cancelled.'
      });
    }

    // Update status to 'Cancelled' (releases slot, preserves audit history)
    await pool.query(
      `UPDATE appointments SET status = 'Cancelled' WHERE id = ?`,
      [appointmentId]
    );

    return res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully. The slot has been released.',
      appointmentId,
      status: 'Cancelled'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  bookAppointment,
  getMyAppointments,
  getAppointmentById,
  rescheduleAppointment,
  cancelAppointment
};
