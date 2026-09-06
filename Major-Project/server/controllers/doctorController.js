// ============================================================================
// CareNova Health — Doctor Controller
// iNeuBytes Web Development Internship — Major Project Phase 3C Patient Module
// ============================================================================

const { pool } = require('../config/db');

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

    // Parse JSON string for available_slots if returned as string from DB
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

    // 1. Fetch Doctor's Default Slots
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

    // 2. Query Occupied Slots for Date
    const [occupiedRows] = await pool.query(
      `SELECT time_slot FROM appointments 
       WHERE doctor_id = ? AND appointment_date = ? AND status IN ('Confirmed', 'Pending', 'Rescheduled')`,
      [doctorId, date]
    );

    const occupiedSlots = occupiedRows.map(r => r.time_slot);

    // 3. Compute net available slots
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

module.exports = {
  getAllDoctors,
  getDoctorById,
  getDoctorAvailableSlots
};
