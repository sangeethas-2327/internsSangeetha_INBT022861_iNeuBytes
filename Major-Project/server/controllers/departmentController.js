// ============================================================================
// CareNova Health — Department Controller
// iNeuBytes Web Development Internship — Major Project Phase 3C Patient Module
// ============================================================================

const { pool } = require('../config/db');

// ----------------------------------------------------------------------------
// 1. List Active Clinical Departments (GET /api/departments)
// ----------------------------------------------------------------------------
async function getAllDepartments(req, res, next) {
  try {
    const query = `
      SELECT 
        id,
        name,
        code,
        description,
        icon,
        is_active AS isActive,
        created_at AS createdAt
      FROM departments
      WHERE is_active = TRUE
      ORDER BY name ASC
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

module.exports = {
  getAllDepartments
};
