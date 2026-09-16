// ============================================================================
// CareNova Health — Admin Controller (System Administration & Analytics)
// iNeuBytes Web Development Internship — Major Project Phase 3E Admin Module
// ============================================================================

const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');

// ============================================================================
// 1. DASHBOARD & SYSTEM ANALYTICS
// ============================================================================

// GET /api/admin/dashboard-stats
async function getDashboardStats(req, res, next) {
  try {
    const [patientCount] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM patients p JOIN users u ON u.id = p.user_id WHERE u.is_active = TRUE`
    );

    const [doctorCount] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.is_active = TRUE AND d.is_available = TRUE`
    );

    const [deptCount] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM departments WHERE is_active = TRUE`
    );

    const [apptTotalCount] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM appointments`
    );

    const [apptPendingCount] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM appointments WHERE status IN ('Confirmed', 'Rescheduled', 'Pending')`
    );

    const [apptCompletedCount] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM appointments WHERE status = 'Completed'`
    );

    const [apptCancelledCount] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM appointments WHERE status = 'Cancelled'`
    );

    const [revenueRow] = await pool.query(
      `SELECT COALESCE(SUM(consultation_fee), 0) AS totalRevenue FROM appointments WHERE status = 'Completed'`
    );

    const [deptLoad] = await pool.query(
      `SELECT 
        dept.id AS departmentId,
        dept.name AS departmentName,
        dept.code AS departmentCode,
        COUNT(a.id) AS appointmentCount,
        COALESCE(SUM(a.consultation_fee), 0) AS departmentRevenue
       FROM departments dept
       LEFT JOIN appointments a ON a.department_id = dept.id AND a.status != 'Cancelled'
       WHERE dept.is_active = TRUE
       GROUP BY dept.id, dept.name, dept.code
       ORDER BY appointmentCount DESC`
    );

    const [recentAppts] = await pool.query(
      `SELECT 
        a.id,
        a.reference_id AS referenceId,
        CONCAT(pu.first_name, ' ', pu.last_name) AS patientName,
        CONCAT('Dr. ', du.first_name, ' ', du.last_name) AS doctorName,
        dept.name AS departmentName,
        DATE_FORMAT(a.appointment_date, '%Y-%m-%d') AS appointmentDate,
        a.time_slot AS timeSlot,
        a.status AS status,
        a.consultation_fee AS consultationFee
       FROM appointments a
       JOIN patients p ON p.id = a.patient_id
       JOIN users pu ON pu.id = p.user_id
       JOIN doctors d ON d.id = a.doctor_id
       JOIN users du ON du.id = d.user_id
       JOIN departments dept ON dept.id = a.department_id
       ORDER BY a.created_at DESC
       LIMIT 10`
    );

    return res.status(200).json({
      success: true,
      stats: {
        totalPatients: patientCount[0].cnt,
        totalDoctors: doctorCount[0].cnt,
        totalDepartments: deptCount[0].cnt,
        totalAppointments: apptTotalCount[0].cnt,
        pendingAppointments: apptPendingCount[0].cnt,
        completedAppointments: apptCompletedCount[0].cnt,
        cancelledAppointments: apptCancelledCount[0].cnt,
        totalRevenue: Number(revenueRow[0].totalRevenue)
      },
      departmentLoad: deptLoad,
      recentAppointments: recentAppts
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// 2. DOCTOR MANAGEMENT & ONBOARDING
// ============================================================================

// GET /api/admin/doctors
async function getAllDoctors(req, res, next) {
  try {
    const { search, departmentId, isActive } = req.query;

    let query = `
      SELECT 
        d.id AS id,
        d.user_id AS userId,
        u.first_name AS firstName,
        u.last_name AS lastName,
        CONCAT('Dr. ', u.first_name, ' ', u.last_name) AS fullName,
        u.email,
        u.phone,
        u.is_active AS userIsActive,
        d.department_id AS departmentId,
        dept.name AS departmentName,
        dept.code AS departmentCode,
        d.qualification,
        d.experience_years AS experienceYears,
        d.consultation_fee AS consultationFee,
        d.bio,
        d.available_days AS availableDays,
        d.available_slots AS availableSlots,
        d.is_available AS isAvailable,
        d.created_at AS createdAt
      FROM doctors d
      JOIN users u ON u.id = d.user_id
      JOIN departments dept ON dept.id = d.department_id
      WHERE 1=1
    `;

    const queryParams = [];

    if (departmentId) {
      query += ` AND d.department_id = ?`;
      queryParams.push(Number(departmentId));
    }

    if (isActive !== undefined && isActive !== '') {
      query += ` AND u.is_active = ?`;
      queryParams.push(isActive === 'true' || isActive === '1');
    }

    if (search) {
      const searchTerm = `%${String(search).trim()}%`;
      query += ` AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR dept.name LIKE ? OR d.qualification LIKE ?)`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    query += ` ORDER BY d.id DESC`;

    const [rows] = await pool.query(query, queryParams);

    const processed = rows.map(doc => {
      let slots = doc.availableSlots;
      if (typeof slots === 'string') {
        try { slots = JSON.parse(slots); } catch (e) { slots = []; }
      }
      return {
        ...doc,
        availableSlots: slots || ["09:00 AM", "10:30 AM", "02:00 PM", "04:00 PM"]
      };
    });

    return res.status(200).json({
      success: true,
      count: processed.length,
      doctors: processed
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/admin/doctors (Atomic MySQL Transaction)
async function onboardDoctor(req, res, next) {
  const connection = await pool.getConnection();
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      departmentId,
      qualification,
      experienceYears,
      consultationFee,
      bio,
      availableDays,
      availableSlots
    } = req.body;

    if (!email || !password || !firstName || !lastName || !phone || !departmentId || !qualification) {
      connection.release();
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required doctor fields (email, password, firstName, lastName, phone, departmentId, qualification).'
      });
    }

    if (password.length < 6) {
      connection.release();
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const parsedFee = Number(consultationFee || 500);
    if (isNaN(parsedFee) || parsedFee < 100) {
      connection.release();
      return res.status(400).json({
        success: false,
        message: 'Consultation fee must be a valid amount of at least ₹100.'
      });
    }

    // Check email existence
    const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [email.trim()]);
    if (existing && existing.length > 0) {
      connection.release();
      return res.status(409).json({
        success: false,
        message: 'A user account with this email address already exists.'
      });
    }

    // Check department existence
    const [depts] = await connection.query('SELECT id FROM departments WHERE id = ? AND is_active = TRUE', [Number(departmentId)]);
    if (!depts || depts.length === 0) {
      connection.release();
      return res.status(400).json({
        success: false,
        message: 'Invalid clinical department ID provided.'
      });
    }

    await connection.beginTransaction();

    const hashedPassword = await bcrypt.hash(password, 10);

    const [userResult] = await connection.query(
      `INSERT INTO users (email, password_hash, role, first_name, last_name, phone, is_active)
       VALUES (?, ?, 'doctor', ?, ?, ?, TRUE)`,
      [email.trim().toLowerCase(), hashedPassword, firstName.trim(), lastName.trim(), phone.trim()]
    );

    const userId = userResult.insertId;

    let formattedSlots = JSON.stringify(Array.isArray(availableSlots) ? availableSlots : ["09:00 AM", "10:30 AM", "02:00 PM", "04:00 PM"]);

    const [docResult] = await connection.query(
      `INSERT INTO doctors 
       (user_id, department_id, qualification, experience_years, consultation_fee, bio, available_days, available_slots, is_available)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [
        userId,
        Number(departmentId),
        qualification.trim(),
        Number(experienceYears || 0),
        parsedFee,
        bio ? bio.trim() : '',
        availableDays || 'Mon,Tue,Wed,Thu,Fri',
        formattedSlots
      ]
    );

    await connection.commit();
    connection.release();

    return res.status(201).json({
      success: true,
      message: `Doctor Dr. ${firstName} ${lastName} onboarded successfully!`,
      doctor: {
        id: docResult.insertId,
        userId,
        email: email.trim().toLowerCase(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        fullName: `Dr. ${firstName.trim()} ${lastName.trim()}`,
        departmentId: Number(departmentId),
        qualification: qualification.trim(),
        experienceYears: Number(experienceYears || 0),
        consultationFee: parsedFee
      }
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    next(error);
  }
}

// GET /api/admin/doctors/:id
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
        u.is_active AS userIsActive,
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
        message: 'Doctor record not found.'
      });
    }

    const doc = rows[0];
    let slots = doc.availableSlots;
    if (typeof slots === 'string') {
      try { slots = JSON.parse(slots); } catch (e) { slots = []; }
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

// PUT /api/admin/doctors/:id
async function updateDoctor(req, res, next) {
  try {
    const doctorId = Number(req.params.id);
    const { firstName, lastName, phone, departmentId, qualification, experienceYears, consultationFee, bio, availableDays, availableSlots } = req.body;

    const [docs] = await pool.query('SELECT user_id FROM doctors WHERE id = ?', [doctorId]);
    if (!docs || docs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Doctor record not found.'
      });
    }

    const userId = docs[0].user_id;

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

    if (firstName || lastName || phone) {
      await pool.query(
        `UPDATE users SET
          first_name = COALESCE(?, first_name),
          last_name = COALESCE(?, last_name),
          phone = COALESCE(?, phone)
         WHERE id = ?`,
        [firstName || null, lastName || null, phone || null, userId]
      );
    }

    await pool.query(
      `UPDATE doctors SET
        department_id = COALESCE(?, department_id),
        qualification = COALESCE(?, qualification),
        experience_years = COALESCE(?, experience_years),
        consultation_fee = COALESCE(?, consultation_fee),
        bio = COALESCE(?, bio),
        available_days = COALESCE(?, available_days),
        available_slots = COALESCE(?, available_slots)
       WHERE id = ?`,
      [
        departmentId ? Number(departmentId) : null,
        qualification || null,
        experienceYears !== undefined ? Number(experienceYears) : null,
        consultationFee !== undefined ? Number(consultationFee) : null,
        bio || null,
        availableDays || null,
        formattedSlots || null,
        doctorId
      ]
    );

    return getDoctorById(req, res, next);
  } catch (error) {
    next(error);
  }
}

// PATCH /api/admin/doctors/:id/status
async function toggleDoctorStatus(req, res, next) {
  try {
    const doctorId = Number(req.params.id);
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please specify isActive boolean flag (true/false).'
      });
    }

    const [docs] = await pool.query('SELECT user_id FROM doctors WHERE id = ?', [doctorId]);
    if (!docs || docs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Doctor record not found.'
      });
    }

    const userId = docs[0].user_id;
    const activeBool = Boolean(isActive);

    await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [activeBool, userId]);
    await pool.query('UPDATE doctors SET is_available = ? WHERE id = ?', [activeBool, doctorId]);

    return res.status(200).json({
      success: true,
      message: `Doctor account has been ${activeBool ? 'activated' : 'deactivated'} successfully.`,
      doctorId,
      isActive: activeBool
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// 3. PATIENT MANAGEMENT
// ============================================================================

// GET /api/admin/patients
async function getAllPatients(req, res, next) {
  try {
    const { search, isActive, gender } = req.query;

    let query = `
      SELECT 
        p.id AS id,
        p.user_id AS userId,
        u.first_name AS firstName,
        u.last_name AS lastName,
        CONCAT(u.first_name, ' ', u.last_name) AS fullName,
        u.email,
        u.phone,
        u.is_active AS userIsActive,
        DATE_FORMAT(p.date_of_birth, '%Y-%m-%d') AS dateOfBirth,
        p.gender,
        p.blood_group AS bloodGroup,
        p.address,
        p.emergency_contact AS emergencyContact,
        p.medical_history_summary AS medicalHistorySummary,
        p.created_at AS createdAt
      FROM patients p
      JOIN users u ON u.id = p.user_id
      WHERE 1=1
    `;

    const queryParams = [];

    if (isActive !== undefined && isActive !== '') {
      query += ` AND u.is_active = ?`;
      queryParams.push(isActive === 'true' || isActive === '1');
    }

    if (gender) {
      query += ` AND p.gender = ?`;
      queryParams.push(String(gender));
    }

    if (search) {
      const searchTerm = `%${String(search).trim()}%`;
      query += ` AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    query += ` ORDER BY p.id DESC`;

    const [rows] = await pool.query(query, queryParams);

    return res.status(200).json({
      success: true,
      count: rows.length,
      patients: rows
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/admin/patients/:id
async function getPatientById(req, res, next) {
  try {
    const patientId = Number(req.params.id);

    const query = `
      SELECT 
        p.id AS id,
        p.user_id AS userId,
        u.first_name AS firstName,
        u.last_name AS lastName,
        CONCAT(u.first_name, ' ', u.last_name) AS fullName,
        u.email,
        u.phone,
        u.is_active AS userIsActive,
        DATE_FORMAT(p.date_of_birth, '%Y-%m-%d') AS dateOfBirth,
        p.gender,
        p.blood_group AS bloodGroup,
        p.address,
        p.emergency_contact AS emergencyContact,
        p.medical_history_summary AS medicalHistorySummary,
        p.created_at AS createdAt
      FROM patients p
      JOIN users u ON u.id = p.user_id
      WHERE p.id = ?
    `;

    const [rows] = await pool.query(query, [patientId]);
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

// PUT /api/admin/patients/:id
async function updatePatient(req, res, next) {
  try {
    const patientId = Number(req.params.id);
    const { firstName, lastName, phone, dateOfBirth, gender, bloodGroup, address, emergencyContact, medicalHistorySummary } = req.body;

    const [pats] = await pool.query('SELECT user_id FROM patients WHERE id = ?', [patientId]);
    if (!pats || pats.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient record not found.'
      });
    }

    const userId = pats[0].user_id;

    if (firstName || lastName || phone) {
      await pool.query(
        `UPDATE users SET
          first_name = COALESCE(?, first_name),
          last_name = COALESCE(?, last_name),
          phone = COALESCE(?, phone)
         WHERE id = ?`,
        [firstName || null, lastName || null, phone || null, userId]
      );
    }

    await pool.query(
      `UPDATE patients SET
        date_of_birth = COALESCE(?, date_of_birth),
        gender = COALESCE(?, gender),
        blood_group = COALESCE(?, blood_group),
        address = COALESCE(?, address),
        emergency_contact = COALESCE(?, emergency_contact),
        medical_history_summary = COALESCE(?, medical_history_summary)
       WHERE id = ?`,
      [
        dateOfBirth || null,
        gender || null,
        bloodGroup || null,
        address || null,
        emergencyContact || null,
        medicalHistorySummary || null,
        patientId
      ]
    );

    return getPatientById(req, res, next);
  } catch (error) {
    next(error);
  }
}

// PATCH /api/admin/patients/:id/status
async function togglePatientStatus(req, res, next) {
  try {
    const patientId = Number(req.params.id);
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please specify isActive boolean flag (true/false).'
      });
    }

    const [pats] = await pool.query('SELECT user_id FROM patients WHERE id = ?', [patientId]);
    if (!pats || pats.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient record not found.'
      });
    }

    const userId = pats[0].user_id;
    const activeBool = Boolean(isActive);

    await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [activeBool, userId]);

    return res.status(200).json({
      success: true,
      message: `Patient account has been ${activeBool ? 'activated' : 'deactivated'} successfully.`,
      patientId,
      isActive: activeBool
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// 4. DEPARTMENT MANAGEMENT (FULL CRUD)
// ============================================================================

// GET /api/admin/departments
async function getAllDepartments(req, res, next) {
  try {
    const query = `
      SELECT 
        d.id,
        d.name,
        d.code,
        d.description,
        d.icon,
        d.is_active AS isActive,
        d.created_at AS createdAt,
        COUNT(doc.id) AS activeDoctorCount
      FROM departments d
      LEFT JOIN doctors doc ON doc.department_id = d.id AND doc.is_available = TRUE
      GROUP BY d.id, d.name, d.code, d.description, d.icon, d.is_active, d.created_at
      ORDER BY d.name ASC
    `;

    const [rows] = await pool.query(query);

    return res.status(200).json({
      success: true,
      count: rows.length,
      departments: rows
    });
  } catch (error) {
    next(error);
  }
}

// POST /api/admin/departments
async function createDepartment(req, res, next) {
  try {
    const { name, code, description, icon } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid department name and unique code.'
      });
    }

    const cleanCode = String(code).trim().toUpperCase();
    const cleanName = String(name).trim();

    // Check unique code & name
    const [existing] = await pool.query(
      'SELECT id FROM departments WHERE name = ? OR code = ?',
      [cleanName, cleanCode]
    );

    if (existing && existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A clinical department with this name or code already exists.'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO departments (name, code, description, icon, is_active)
       VALUES (?, ?, ?, ?, TRUE)`,
      [cleanName, cleanCode, description ? description.trim() : '', icon ? icon.trim() : 'hospital']
    );

    return res.status(201).json({
      success: true,
      message: `Department '${cleanName}' created successfully.`,
      department: {
        id: result.insertId,
        name: cleanName,
        code: cleanCode,
        description: description ? description.trim() : '',
        icon: icon ? icon.trim() : 'hospital',
        isActive: true
      }
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/admin/departments/:id
async function updateDepartment(req, res, next) {
  try {
    const deptId = Number(req.params.id);
    const { name, code, description, icon, isActive } = req.body;

    const [depts] = await pool.query('SELECT id FROM departments WHERE id = ?', [deptId]);
    if (!depts || depts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Department not found.'
      });
    }

    if (name || code) {
      const cleanCode = code ? String(code).trim().toUpperCase() : null;
      const cleanName = name ? String(name).trim() : null;

      const [existing] = await pool.query(
        'SELECT id FROM departments WHERE (name = ? OR code = ?) AND id != ?',
        [cleanName || '', cleanCode || '', deptId]
      );

      if (existing && existing.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Another department with this name or code already exists.'
        });
      }
    }

    await pool.query(
      `UPDATE departments SET
        name = COALESCE(?, name),
        code = COALESCE(?, code),
        description = COALESCE(?, description),
        icon = COALESCE(?, icon),
        is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [
        name ? String(name).trim() : null,
        code ? String(code).trim().toUpperCase() : null,
        description ? String(description).trim() : null,
        icon ? String(icon).trim() : null,
        isActive !== undefined ? Boolean(isActive) : null,
        deptId
      ]
    );

    const [updated] = await pool.query('SELECT * FROM departments WHERE id = ?', [deptId]);

    return res.status(200).json({
      success: true,
      message: 'Department updated successfully.',
      department: updated[0]
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/admin/departments/:id (Safe Deletion Check)
async function deleteDepartment(req, res, next) {
  try {
    const deptId = Number(req.params.id);

    const [depts] = await pool.query('SELECT name FROM departments WHERE id = ?', [deptId]);
    if (!depts || depts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Department not found.'
      });
    }

    // Deletion Safety Check: Prevent deletion if active doctors are assigned
    const [docCheck] = await pool.query(
      'SELECT COUNT(*) AS cnt FROM doctors WHERE department_id = ? AND is_available = TRUE',
      [deptId]
    );

    if (docCheck[0].cnt > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department '${depts[0].name}'. There are currently ${docCheck[0].cnt} active doctors assigned to this department.`
      });
    }

    await pool.query('UPDATE departments SET is_active = FALSE WHERE id = ?', [deptId]);

    return res.status(200).json({
      success: true,
      message: `Department '${depts[0].name}' has been deactivated successfully.`
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// 5. GLOBAL APPOINTMENT MANAGEMENT & OVERRIDES
// ============================================================================

// GET /api/admin/appointments
async function getAllAppointments(req, res, next) {
  try {
    const { doctorId, patientId, departmentId, status, date, search } = req.query;

    let query = `
      SELECT 
        a.id AS id,
        a.reference_id AS referenceId,
        a.patient_id AS patientId,
        CONCAT(pu.first_name, ' ', pu.last_name) AS patientName,
        pu.phone AS patientPhone,
        pu.email AS patientEmail,
        a.doctor_id AS doctorId,
        CONCAT('Dr. ', du.first_name, ' ', du.last_name) AS doctorName,
        a.department_id AS departmentId,
        dept.name AS departmentName,
        dept.code AS departmentCode,
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
      JOIN users pu ON pu.id = p.user_id
      JOIN doctors d ON d.id = a.doctor_id
      JOIN users du ON du.id = d.user_id
      JOIN departments dept ON dept.id = a.department_id
      LEFT JOIN medical_records mr ON mr.appointment_id = a.id
      WHERE 1=1
    `;

    const queryParams = [];

    if (doctorId) {
      query += ` AND a.doctor_id = ?`;
      queryParams.push(Number(doctorId));
    }

    if (patientId) {
      query += ` AND a.patient_id = ?`;
      queryParams.push(Number(patientId));
    }

    if (departmentId) {
      query += ` AND a.department_id = ?`;
      queryParams.push(Number(departmentId));
    }

    if (status) {
      query += ` AND a.status = ?`;
      queryParams.push(String(status));
    }

    if (date) {
      query += ` AND a.appointment_date = ?`;
      queryParams.push(String(date));
    }

    if (search) {
      const searchTerm = `%${String(search).trim()}%`;
      query += ` AND (a.reference_id LIKE ? OR pu.first_name LIKE ? OR pu.last_name LIKE ? OR du.first_name LIKE ? OR du.last_name LIKE ?)`;
      queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
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

// GET /api/admin/appointments/:id
async function getAppointmentById(req, res, next) {
  try {
    const apptId = Number(req.params.id);

    const query = `
      SELECT 
        a.id AS id,
        a.reference_id AS referenceId,
        a.patient_id AS patientId,
        CONCAT(pu.first_name, ' ', pu.last_name) AS patientName,
        pu.phone AS patientPhone,
        pu.email AS patientEmail,
        p.date_of_birth AS patientDob,
        p.gender AS patientGender,
        p.blood_group AS patientBloodGroup,
        a.doctor_id AS doctorId,
        CONCAT('Dr. ', du.first_name, ' ', du.last_name) AS doctorName,
        a.department_id AS departmentId,
        dept.name AS departmentName,
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
        mr.doctor_notes AS doctorNotes
      FROM appointments a
      JOIN patients p ON p.id = a.patient_id
      JOIN users pu ON pu.id = p.user_id
      JOIN doctors d ON d.id = a.doctor_id
      JOIN users du ON du.id = d.user_id
      JOIN departments dept ON dept.id = a.department_id
      LEFT JOIN medical_records mr ON mr.appointment_id = a.id
      WHERE a.id = ?
    `;

    const [rows] = await pool.query(query, [apptId]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment record not found.'
      });
    }

    return res.status(200).json({
      success: true,
      appointment: rows[0]
    });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/admin/appointments/:id/status
async function overrideAppointmentStatus(req, res, next) {
  try {
    const apptId = Number(req.params.id);
    const { status } = req.body;

    const allowed = ['Confirmed', 'Pending', 'Rescheduled', 'Completed', 'Cancelled'];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status override. Allowed values: ${allowed.join(', ')}`
      });
    }

    const [appts] = await pool.query('SELECT id, status FROM appointments WHERE id = ?', [apptId]);
    if (!appts || appts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment record not found.'
      });
    }

    await pool.query('UPDATE appointments SET status = ? WHERE id = ?', [status, apptId]);

    return res.status(200).json({
      success: true,
      message: `Appointment status overridden to '${status}'.`,
      appointmentId: apptId,
      status
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/admin/appointments/:id/reschedule
async function rescheduleAppointment(req, res, next) {
  try {
    const apptId = Number(req.params.id);
    const { newDate, newTimeSlot } = req.body;

    if (!newDate || !newTimeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Please provide newDate (YYYY-MM-DD) and newTimeSlot.'
      });
    }

    const [appts] = await pool.query('SELECT doctor_id, status FROM appointments WHERE id = ?', [apptId]);
    if (!appts || appts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.'
      });
    }

    const appt = appts[0];

    // Conflict check excluding current appt
    const [conflicts] = await pool.query(
      `SELECT id FROM appointments 
       WHERE doctor_id = ? AND appointment_date = ? AND time_slot = ? 
         AND status IN ('Confirmed', 'Pending', 'Rescheduled') AND id != ?`,
      [appt.doctor_id, newDate, newTimeSlot, apptId]
    );

    if (conflicts && conflicts.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'The requested time slot is already booked for this doctor.'
      });
    }

    await pool.query(
      `UPDATE appointments SET appointment_date = ?, time_slot = ?, status = 'Rescheduled' WHERE id = ?`,
      [newDate, newTimeSlot, apptId]
    );

    return res.status(200).json({
      success: true,
      message: 'Appointment rescheduled successfully.',
      appointmentId: apptId,
      newDate,
      newTimeSlot
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/admin/appointments/:id/cancel
async function cancelAppointment(req, res, next) {
  try {
    const apptId = Number(req.params.id);

    const [appts] = await pool.query('SELECT id, status FROM appointments WHERE id = ?', [apptId]);
    if (!appts || appts.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.'
      });
    }

    await pool.query(`UPDATE appointments SET status = 'Cancelled' WHERE id = ?`, [apptId]);

    return res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully and time slot released.',
      appointmentId: apptId
    });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// 6. SYSTEM OPERATIONAL REPORTS
// ============================================================================

// GET /api/admin/reports/summary
async function getReportsSummary(req, res, next) {
  try {
    const [deptMetrics] = await pool.query(
      `SELECT 
        dept.name AS departmentName,
        dept.code AS departmentCode,
        COUNT(a.id) AS totalAppointments,
        SUM(CASE WHEN a.status = 'Completed' THEN 1 ELSE 0 END) AS completedCount,
        SUM(CASE WHEN a.status = 'Cancelled' THEN 1 ELSE 0 END) AS cancelledCount,
        COALESCE(SUM(CASE WHEN a.status = 'Completed' THEN a.consultation_fee ELSE 0 END), 0) AS totalRevenue
       FROM departments dept
       LEFT JOIN appointments a ON a.department_id = dept.id
       GROUP BY dept.id, dept.name, dept.code
       ORDER BY totalRevenue DESC`
    );

    const [doctorPerformance] = await pool.query(
      `SELECT 
        d.id AS doctorId,
        CONCAT('Dr. ', u.first_name, ' ', u.last_name) AS doctorName,
        dept.name AS departmentName,
        COUNT(a.id) AS totalAppointments,
        SUM(CASE WHEN a.status = 'Completed' THEN 1 ELSE 0 END) AS completedConsultations,
        COALESCE(SUM(CASE WHEN a.status = 'Completed' THEN a.consultation_fee ELSE 0 END), 0) AS generatedRevenue
       FROM doctors d
       JOIN users u ON u.id = d.user_id
       JOIN departments dept ON dept.id = d.department_id
       LEFT JOIN appointments a ON a.doctor_id = d.id
       GROUP BY d.id, u.first_name, u.last_name, dept.name
       ORDER BY generatedRevenue DESC`
    );

    return res.status(200).json({
      success: true,
      reportTimestamp: new Date().toISOString(),
      departmentSummary: deptMetrics,
      doctorPerformance: doctorPerformance
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboardStats,
  getAllDoctors,
  onboardDoctor,
  getDoctorById,
  updateDoctor,
  toggleDoctorStatus,
  getAllPatients,
  getPatientById,
  updatePatient,
  togglePatientStatus,
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getAllAppointments,
  getAppointmentById,
  overrideAppointmentStatus,
  rescheduleAppointment,
  cancelAppointment,
  getReportsSummary
};
