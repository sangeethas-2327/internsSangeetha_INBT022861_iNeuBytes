// ============================================================================
// CareNova Health — Doctor Controller (Discovery & Workstation Modules)
// iNeuBytes Web Development Internship — Major Project Phase 3D Doctor Module
// ============================================================================

const { pool } = require('../config/db');

// Helper: Resolve Authenticated User ID to Doctor Record ID
async function getDoctorIdByUserId(userId) {
  const [rows] = await pool.query('SELECT id FROM doctors WHERE user_id = ?', [userId]);
  return (rows && rows.length > 0) ? rows[0].id : null;
}

// ============================================================================
// PUBLIC & PATIENT DISCOVERY ENDPOINTS
// ============================================================================

// ----------------------------------------------------------------------------
// 1. List Active Doctors with Filters (GET /api/doctors)
// ----------------------------------------------------------------------------
async function getAllDoctors(req, res, next) {
  try {
    const { departmentId, departmentCode, search } = req.query;

    let query = `
      SELECT 
        d.id AS id,
        d.user_id AS userId,
        u.first_name AS firstName,
        u.last_name AS lastName,
        CONCAT('Dr. ', u.first_name, ' ', u.last_name) AS fullName,
        u.email,
        u.phone,
        d.department_id AS departmentId,
        dept.name AS departmentName,
        dept.code AS departmentCode,
        d.qualification,
        d.experience_years AS experienceYears,
        d.consultation_fee AS consultationFee,
        d.bio,
        d.available_days AS availableDays,
        d.available_slots AS availableSlots,
        d.is_available AS isAvailable
      FROM doctors d
      JOIN users u ON u.id = d.user_id
      JOIN departments dept ON dept.id = d.department_id
      WHERE u.is_active = TRUE AND d.is_available = TRUE AND dept.is_active = TRUE
    `;

    const queryParams = [];

    if (departmentId) {
      query += ` AND d.department_id = ?`;
      queryParams.push(Number(departmentId));
    }

    if (departmentCode) {
      query += ` AND dept.code = ?`;
      queryParams.push(String(departmentCode).toUpperCase());
    }

    if (search) {
      const searchTerm = `%${String(search).trim()}%`;
      query += ` AND (u.first_name LIKE ? OR u.last_name LIKE ? OR dept.name LIKE ? OR d.qualification LIKE ?)`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    query += ` ORDER BY u.first_name ASC`;

    const [rows] = await pool.query(query, queryParams);

    const processedDoctors = rows.map(doc => {
      let slots = doc.availableSlots;
      if (typeof slots === 'string') {
        try {
          slots = JSON.parse(slots);
        } catch (e) {
          slots = [];
        }
      }
      return {
        ...doc,
        availableSlots: slots || ["09:00 AM", "10:30 AM", "02:00 PM", "04:00 PM"]
      };
    });

    return res.status(200).json({
      success: true,
      count: processedDoctors.length,
      doctors: processedDoctors
    });
  } catch (error) {
    next(error);
  }
}

// ----------------------------------------------------------------------------
// 2. Get Doctor Details by ID (GET /api/doctors/:id)
// ----------------------------------------------------------------------------
async function getDoctorById(req, res, next) {
  try {
    const doctorId = Number(req.params.id);

    const query = `
      SELECT 
        d.id AS id,
        d.user_id AS userId,
        u.first_name AS firstName,
        u.last_name AS lastName,
        CONCAT('Dr. ', u.first_name, ' ', u.last_name) AS fullName,
        u.email,
        u.phone,
        d.department_id AS departmentId,
        dept.name AS departmentName,
        dept.code AS departmentCode,
        d.qualification,
        d.experience_years AS experienceYears,
        d.consultation_fee AS consultationFee,
        d.bio,
        d.available_days AS availableDays,
        d.available_slots AS availableSlots,
        d.is_available AS isAvailable
      FROM doctors d
      JOIN users u ON u.id = d.user_id
      JOIN departments dept ON dept.id = d.department_id
      WHERE d.id = ? AND u.is_active = TRUE AND d.is_available = TRUE
    `;

    const [rows] = await pool.query(query, [doctorId]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found or currently unavailable.'
      });
    }

    const doc = rows[0];
    let slots = doc.availableSlots;
    if (typeof slots === 'string') {
      try {
        slots = JSON.parse(slots);
      } catch (e) {
        slots = [];
      }
    }

    return res.status(200).json({
      success: true,
      doctor: {
        ...doc,
        availableSlots: slots || ["09:00 AM", "10:30 AM", "02:00 PM", "04:00 PM"]
      }
    });
  } catch (error) {
    next(error);
  }
}

// ----------------------------------------------------------------------------
// 3. Get Doctor Available Time Slots for Date (GET /api/doctors/:id/available-slots)
// ----------------------------------------------------------------------------
async function getDoctorAvailableSlots(req, res, next) {
  try {
    const doctorId = Number(req.params.id);
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid date parameter (YYYY-MM-DD).'
      });
    }

    const [docRows] = await pool.query(
      'SELECT available_slots, is_available FROM doctors WHERE id = ?',
      [doctorId]
    );

    if (!docRows || docRows.length === 0 || !docRows[0].is_available) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found or unavailable.'
      });
    }

    let defaultSlots = docRows[0].available_slots;
    if (typeof defaultSlots === 'string') {
      try {
        defaultSlots = JSON.parse(defaultSlots);
      } catch (e) {
        defaultSlots = [];
      }
    }
    if (!Array.isArray(defaultSlots) || defaultSlots.length === 0) {
      defaultSlots = ["09:00 AM", "10:30 AM", "02:00 PM", "04:00 PM"];
    }

    const [occupiedRows] = await pool.query(
      `SELECT time_slot FROM appointments 
       WHERE doctor_id = ? AND appointment_date = ? AND status IN ('Confirmed', 'Pending', 'Rescheduled')`,
      [doctorId, date]
    );

    const occupiedSlots = occupiedRows.map(r => r.time_slot);

    const availableSlots = defaultSlots.map(slot => ({
      slot: slot,
      isAvailable: !occupiedSlots.includes(slot)
    }));

    return res.status(200).json({
      success: true,
      doctorId,
      date,
      slots: availableSlots
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// DOCTOR WORKSTATION ENDPOINTS (AUTHENTICATED DOCTOR ROLE ONLY)
// ============================================================================

// ----------------------------------------------------------------------------
// 4. Get Authenticated Doctor Profile (GET /api/doctors/me)
// ----------------------------------------------------------------------------
async function getDoctorProfile(req, res, next) {
  try {
    const doctorId = await getDoctorIdByUserId(req.user.id);
    if (!doctorId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Doctor record not associated with this user account.'
      });
    }

    const query = `
      SELECT 
        d.id AS id,
        d.user_id AS userId,
        u.first_name AS firstName,
        u.last_name AS lastName,
        CONCAT('Dr. ', u.first_name, ' ', u.last_name) AS fullName,
        u.email,
        u.phone,
        d.department_id AS departmentId,
        dept.name AS departmentName,
        dept.code AS departmentCode,
        d.qualification,
        d.experience_years AS experienceYears,
        d.consultation_fee AS consultationFee,
        d.bio,
        d.available_days AS availableDays,
        d.available_slots AS availableSlots,
        d.is_available AS isAvailable
      FROM doctors d
      JOIN users u ON u.id = d.user_id
      JOIN departments dept ON dept.id = d.department_id
      WHERE d.id = ?
    `;

    const [rows] = await pool.query(query, [doctorId]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found.'
      });
    }

    const doc = rows[0];
    let slots = doc.availableSlots;
    if (typeof slots === 'string') {
      try {
        slots = JSON.parse(slots);
      } catch (e) {
        slots = [];
      }
    }

    return res.status(200).json({
      success: true,
      doctor: {
        ...doc,
        availableSlots: slots || ["09:00 AM", "10:30 AM", "02:00 PM", "04:00 PM"]
      }
    });
  } catch (error) {
    next(error);
  }
}

// ----------------------------------------------------------------------------
// 5. Update Authenticated Doctor Profile & Schedule (PUT /api/doctors/me)
// ----------------------------------------------------------------------------
async function updateDoctorProfile(req, res, next) {
  try {
    const doctorId = await getDoctorIdByUserId(req.user.id);
    if (!doctorId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Doctor record not associated with this user account.'
      });
    }

    const { qualification, experienceYears, consultationFee, bio, availableDays, availableSlots } = req.body;

    if (consultationFee !== undefined && (isNaN(consultationFee) || Number(consultationFee) < 100)) {
      return res.status(400).json({
        success: false,
        message: 'Consultation fee must be a valid amount of at least ₹100.'
      });
    }

    let formattedSlots = undefined;
    if (availableSlots !== undefined) {
      if (Array.isArray(availableSlots)) {
        formattedSlots = JSON.stringify(availableSlots);
      } else if (typeof availableSlots === 'string') {
        formattedSlots = availableSlots;
      }
    }

    const updateQuery = `
      UPDATE doctors SET
        qualification = COALESCE(?, qualification),
        experience_years = COALESCE(?, experience_years),
        consultation_fee = COALESCE(?, consultation_fee),
        bio = COALESCE(?, bio),
        available_days = COALESCE(?, available_days),
        available_slots = COALESCE(?, available_slots)
      WHERE id = ?
    `;

    await pool.query(updateQuery, [
      qualification || null,
      experienceYears !== undefined ? Number(experienceYears) : null,
      consultationFee !== undefined ? Number(consultationFee) : null,
      bio || null,
      availableDays || null,
      formattedSlots || null,
      doctorId
    ]);

    return getDoctorProfile(req, res, next);
  } catch (error) {
    next(error);
  }
}

// ----------------------------------------------------------------------------
// 6. Get Doctor Dashboard Metrics & Schedule (GET /api/doctors/me/dashboard)
// ----------------------------------------------------------------------------
async function getDoctorDashboard(req, res, next) {
  try {
    const doctorId = await getDoctorIdByUserId(req.user.id);
    if (!doctorId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Doctor record not associated with this user account.'
      });
    }

    const [todayCountRow] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM appointments WHERE doctor_id = ? AND appointment_date = CURDATE() AND status != 'Cancelled'`,
      [doctorId]
    );

    const [upcomingCountRow] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM appointments WHERE doctor_id = ? AND appointment_date > CURDATE() AND status IN ('Confirmed', 'Rescheduled')`,
      [doctorId]
    );

    const [pendingCountRow] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM appointments WHERE doctor_id = ? AND status IN ('Confirmed', 'Rescheduled')`,
      [doctorId]
    );

    const [completedCountRow] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM appointments WHERE doctor_id = ? AND status = 'Completed'`,
      [doctorId]
    );

    const [cancelledCountRow] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM appointments WHERE doctor_id = ? AND status = 'Cancelled'`,
      [doctorId]
    );

    const [todayAppts] = await pool.query(
      `SELECT 
        a.id AS id,
        a.reference_id AS referenceId,
        CONCAT(u.first_name, ' ', u.last_name) AS patientName,
        u.phone AS patientPhone,
        DATE_FORMAT(a.appointment_date, '%Y-%m-%d') AS appointmentDate,
        a.time_slot AS timeSlot,
        a.status AS status,
        a.reason_for_visit AS reasonForVisit
       FROM appointments a
       JOIN patients p ON p.id = a.patient_id
       JOIN users u ON u.id = p.user_id
       WHERE a.doctor_id = ? AND a.appointment_date = CURDATE()
       ORDER BY a.time_slot ASC`,
      [doctorId]
    );

    return res.status(200).json({
      success: true,
      stats: {
        todayCount: todayCountRow[0].cnt,
        upcomingCount: upcomingCountRow[0].cnt,
        pendingCount: pendingCountRow[0].cnt,
        completedCount: completedCountRow[0].cnt,
        cancelledCount: cancelledCountRow[0].cnt
      },
      todayAppointments: todayAppts
    });
  } catch (error) {
    next(error);
  }
}

// ----------------------------------------------------------------------------
// 7. Get Assigned Doctor Appointments (GET /api/doctors/me/appointments)
// ----------------------------------------------------------------------------
async function getDoctorAppointments(req, res, next) {
  try {
    const doctorId = await getDoctorIdByUserId(req.user.id);
    if (!doctorId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Doctor record not associated with this user account.'
      });
    }

    const { date, status, search } = req.query;

    let query = `
      SELECT 
        a.id AS id,
        a.reference_id AS referenceId,
        a.patient_id AS patientId,
        u.first_name AS patientFirstName,
        u.last_name AS patientLastName,
        CONCAT(u.first_name, ' ', u.last_name) AS patientName,
        u.email AS patientEmail,
        u.phone AS patientPhone,
        p.date_of_birth AS patientDob,
        p.gender AS patientGender,
        p.blood_group AS patientBloodGroup,
        DATE_FORMAT(a.appointment_date, '%Y-%m-%d') AS appointmentDate,
        a.time_slot AS timeSlot,
        a.consultation_fee AS consultationFee,
        a.status AS status,
        a.reason_for_visit AS reasonForVisit,
        a.created_at AS createdAt,
        mr.id AS medicalRecordId,
        mr.record_code AS recordCode
      FROM appointments a
      JOIN patients p ON p.id = a.patient_id
      JOIN users u ON u.id = p.user_id
      LEFT JOIN medical_records mr ON mr.appointment_id = a.id
      WHERE a.doctor_id = ?
    `;

    const queryParams = [doctorId];

    if (date) {
      query += ` AND a.appointment_date = ?`;
      queryParams.push(String(date));
    }

    if (status) {
      query += ` AND a.status = ?`;
      queryParams.push(String(status));
    }

    if (search) {
      const searchTerm = `%${String(search).trim()}%`;
      query += ` AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.phone LIKE ? OR a.reference_id LIKE ?)`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    query += ` ORDER BY a.appointment_date DESC, a.time_slot ASC`;

    const [rows] = await pool.query(query, queryParams);

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
// 8. Get Single Assigned Appointment Details (GET /api/doctors/me/appointments/:id)
// ----------------------------------------------------------------------------
async function getDoctorAppointmentById(req, res, next) {
  try {
    const doctorId = await getDoctorIdByUserId(req.user.id);
    if (!doctorId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Doctor record not associated with this user account.'
      });
    }

    const appointmentId = Number(req.params.id);

    const query = `
      SELECT 
        a.id AS id,
        a.reference_id AS referenceId,
        a.patient_id AS patientId,
        u.first_name AS patientFirstName,
        u.last_name AS patientLastName,
        CONCAT(u.first_name, ' ', u.last_name) AS patientName,
        u.email AS patientEmail,
        u.phone AS patientPhone,
        p.date_of_birth AS patientDob,
        p.gender AS patientGender,
        p.blood_group AS patientBloodGroup,
        p.address AS patientAddress,
        p.emergency_contact AS patientEmergencyContact,
        p.medical_history_summary AS patientMedicalHistory,
        DATE_FORMAT(a.appointment_date, '%Y-%m-%d') AS appointmentDate,
        a.time_slot AS timeSlot,
        a.consultation_fee AS consultationFee,
        a.status AS status,
        a.reason_for_visit AS reasonForVisit,
        a.created_at AS createdAt,
        mr.id AS medicalRecordId,
        mr.record_code AS recordCode,
        mr.diagnosis,
        mr.prescription,
        mr.doctor_notes AS doctorNotes,
        DATE_FORMAT(mr.recommended_followup_date, '%Y-%m-%d') AS recommendedFollowupDate
      FROM appointments a
      JOIN patients p ON p.id = a.patient_id
      JOIN users u ON u.id = p.user_id
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

    // IDOR Ownership Security Assertion
    if (appt.patientId && appt.doctorId && appt.doctorId !== doctorId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to view this appointment.'
      });
    }

    // Double check doctor ID boundary directly against query result
    const [checkOwner] = await pool.query('SELECT doctor_id FROM appointments WHERE id = ?', [appointmentId]);
    if (checkOwner.length > 0 && checkOwner[0].doctor_id !== doctorId) {
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
// 9. Update Appointment Status (PUT /api/doctors/me/appointments/:id/status)
// ----------------------------------------------------------------------------
async function updateDoctorAppointmentStatus(req, res, next) {
  try {
    const doctorId = await getDoctorIdByUserId(req.user.id);
    if (!doctorId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Doctor record not associated with this user account.'
      });
    }

    const appointmentId = Number(req.params.id);
    const { status } = req.body;

    const allowedStatuses = ['Cancelled', 'Completed'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status update. Allowed values: ${allowedStatuses.join(', ')}`
      });
    }

    // Ownership & Current State Verification
    const [appts] = await pool.query(
      'SELECT id, doctor_id, status FROM appointments WHERE id = ?',
      [appointmentId]
    );

    if (!appts || appts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.'
      });
    }

    const appt = appts[0];
    if (appt.doctor_id !== doctorId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to update this appointment.'
      });
    }

    if (appt.status === 'Cancelled' || appt.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: `Cannot change status of an appointment that is already ${appt.status}.`
      });
    }

    await pool.query(
      'UPDATE appointments SET status = ? WHERE id = ?',
      [status, appointmentId]
    );

    return res.status(200).json({
      success: true,
      message: `Appointment status updated to ${status}.`,
      appointmentId,
      status
    });
  } catch (error) {
    next(error);
  }
}

// ----------------------------------------------------------------------------
// 10. Submit Consultation & Record Medical Record (POST /api/doctors/me/appointments/:id/consultation)
// ----------------------------------------------------------------------------
async function submitDoctorConsultation(req, res, next) {
  const connection = await pool.getConnection();
  try {
    const doctorId = await getDoctorIdByUserId(req.user.id);
    if (!doctorId) {
      connection.release();
      return res.status(403).json({
        success: false,
        message: 'Access denied. Doctor record not associated with this user account.'
      });
    }

    const appointmentId = Number(req.params.id);
    const { diagnosis, prescription, doctorNotes, recommendedFollowupDate } = req.body;

    if (!diagnosis || typeof diagnosis !== 'string' || diagnosis.trim().length === 0) {
      connection.release();
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid diagnostic summary.'
      });
    }

    await connection.beginTransaction();

    // Row Lock & Ownership Verification
    const [appts] = await connection.query(
      'SELECT id, patient_id, doctor_id, status FROM appointments WHERE id = ? FOR UPDATE',
      [appointmentId]
    );

    if (!appts || appts.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.'
      });
    }

    const appt = appts[0];
    if (appt.doctor_id !== doctorId) {
      await connection.rollback();
      connection.release();
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to perform consultation on this appointment.'
      });
    }

    if (appt.status === 'Cancelled') {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        success: false,
        message: 'Cannot perform consultation on a cancelled appointment.'
      });
    }

    if (appt.status === 'Completed') {
      await connection.rollback();
      connection.release();
      return res.status(400).json({
        success: false,
        message: 'Consultation has already been recorded for this appointment.'
      });
    }

    // Check if medical record already exists
    const [existingRecords] = await connection.query(
      'SELECT id FROM medical_records WHERE appointment_id = ?',
      [appointmentId]
    );

    if (existingRecords && existingRecords.length > 0) {
      await connection.rollback();
      connection.release();
      return res.status(409).json({
        success: false,
        message: 'A medical record already exists for this appointment.'
      });
    }

    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const recordCode = `MR-${new Date().getFullYear()}-${randomCode}`;

    const [recResult] = await connection.query(
      `INSERT INTO medical_records 
       (record_code, appointment_id, patient_id, doctor_id, diagnosis, prescription, doctor_notes, recommended_followup_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        recordCode,
        appointmentId,
        appt.patient_id,
        doctorId,
        diagnosis.trim(),
        prescription ? prescription.trim() : null,
        doctorNotes ? doctorNotes.trim() : null,
        recommendedFollowupDate || null
      ]
    );

    await connection.query(
      `UPDATE appointments SET status = 'Completed' WHERE id = ?`,
      [appointmentId]
    );

    await connection.commit();
    connection.release();

    return res.status(201).json({
      success: true,
      message: 'Consultation completed and medical record saved successfully.',
      medicalRecord: {
        id: recResult.insertId,
        recordCode,
        appointmentId,
        patientId: appt.patient_id,
        doctorId,
        diagnosis: diagnosis.trim(),
        prescription,
        doctorNotes,
        recommendedFollowupDate
      }
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    next(error);
  }
}

// ----------------------------------------------------------------------------
// 11. Get Medical Records Authored by Doctor (GET /api/doctors/me/records)
// ----------------------------------------------------------------------------
async function getDoctorAuthoredRecords(req, res, next) {
  try {
    const doctorId = await getDoctorIdByUserId(req.user.id);
    if (!doctorId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Doctor record not associated with this user account.'
      });
    }

    const query = `
      SELECT 
        mr.id AS id,
        mr.record_code AS recordCode,
        mr.appointment_id AS appointmentId,
        mr.patient_id AS patientId,
        CONCAT(patUser.first_name, ' ', patUser.last_name) AS patientName,
        patUser.phone AS patientPhone,
        p.date_of_birth AS patientDob,
        mr.diagnosis,
        mr.prescription,
        mr.doctor_notes AS doctorNotes,
        DATE_FORMAT(mr.recommended_followup_date, '%Y-%m-%d') AS recommendedFollowupDate,
        DATE_FORMAT(a.appointment_date, '%Y-%m-%d') AS appointmentDate,
        a.time_slot AS timeSlot,
        mr.created_at AS createdAt
      FROM medical_records mr
      JOIN appointments a ON a.id = mr.appointment_id
      JOIN patients p ON p.id = mr.patient_id
      JOIN users patUser ON patUser.id = p.user_id
      WHERE mr.doctor_id = ?
      ORDER BY mr.created_at DESC
    `;

    const [rows] = await pool.query(query, [doctorId]);

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
// 12. Update Authored Medical Record (PUT /api/doctors/me/records/:id)
// ----------------------------------------------------------------------------
async function updateAuthoredRecord(req, res, next) {
  try {
    const doctorId = await getDoctorIdByUserId(req.user.id);
    if (!doctorId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Doctor record not associated with this user account.'
      });
    }

    const recordId = Number(req.params.id);
    const { diagnosis, prescription, doctorNotes, recommendedFollowupDate } = req.body;

    const [records] = await pool.query(
      'SELECT id, doctor_id FROM medical_records WHERE id = ?',
      [recordId]
    );

    if (!records || records.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found.'
      });
    }

    if (records[0].doctor_id !== doctorId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You do not have permission to edit this medical record.'
      });
    }

    await pool.query(
      `UPDATE medical_records SET
        diagnosis = COALESCE(?, diagnosis),
        prescription = COALESCE(?, prescription),
        doctor_notes = COALESCE(?, doctor_notes),
        recommended_followup_date = COALESCE(?, recommended_followup_date)
       WHERE id = ?`,
      [
        diagnosis ? diagnosis.trim() : null,
        prescription ? prescription.trim() : null,
        doctorNotes ? doctorNotes.trim() : null,
        recommendedFollowupDate || null,
        recordId
      ]
    );

    return res.status(200).json({
      success: true,
      message: 'Medical record updated successfully.'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllDoctors,
  getDoctorById,
  getDoctorAvailableSlots,
  getDoctorProfile,
  updateDoctorProfile,
  getDoctorDashboard,
  getDoctorAppointments,
  getDoctorAppointmentById,
  updateDoctorAppointmentStatus,
  submitDoctorConsultation,
  getDoctorAuthoredRecords,
  updateAuthoredRecord
};
