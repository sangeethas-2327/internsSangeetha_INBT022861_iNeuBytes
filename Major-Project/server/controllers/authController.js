// ============================================================================
// CareNova Health — Authentication Controller (MySQL Persistence)
// iNeuBytes Web Development Internship — Major Project Phase 3B Auth & RBAC
// ============================================================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const JWT_EXPIRES_IN = '24h';
const COOKIE_NAME = 'carenova_token';

// Cookie Security Configuration Helper
function getCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  };
}

// Helper: Find User By Email via MySQL
async function findUserByEmail(email) {
  const emailTrimmed = String(email).trim().toLowerCase();
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [emailTrimmed]);
  return (rows && rows.length > 0) ? rows[0] : null;
}

// Helper: Find User By ID via MySQL
async function findUserById(id) {
  const [rows] = await pool.query(
    'SELECT id, email, role, first_name, last_name, phone, is_active, created_at FROM users WHERE id = ?',
    [id]
  );
  return (rows && rows.length > 0) ? rows[0] : null;
}

// ----------------------------------------------------------------------------
// 1. Patient Self-Registration (POST /api/auth/register)
// ----------------------------------------------------------------------------
async function register(req, res, next) {
  try {
    const { firstName, lastName, email, password, phone, gender, dateOfBirth } = req.body;

    // Input Validation
    if (!firstName || !lastName || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Missing required registration fields: firstName, lastName, email, password, and phone are required.'
      });
    }

    const emailTrimmed = String(email).trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    if (String(password).length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    // Check duplicate email in MySQL
    const existing = await findUserByEmail(emailTrimmed);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.'
      });
    }

    // Hash Password using bcryptjs
    const passwordHash = await bcrypt.hash(String(password), 10);

    // CRITICAL ROLE CONTROL: Public registration defaults strictly to 'patient'
    const role = 'patient';
    const cleanFirstName = String(firstName).trim();
    const cleanLastName = String(lastName).trim();
    const cleanPhone = String(phone).trim();

    let createdUserId = null;

    // MySQL Transaction
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [userResult] = await connection.query(
        'INSERT INTO users (email, password_hash, role, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?, ?)',
        [emailTrimmed, passwordHash, role, cleanFirstName, cleanLastName, cleanPhone]
      );

      createdUserId = userResult.insertId;

      await connection.query(
        'INSERT INTO patients (user_id, date_of_birth, gender) VALUES (?, ?, ?)',
        [createdUserId, dateOfBirth || null, gender || 'female']
      );

      await connection.commit();
    } catch (dbErr) {
      await connection.rollback();
      throw dbErr;
    } finally {
      connection.release();
    }

    return res.status(201).json({
      success: true,
      message: 'Patient registration successful. You can now log in.',
      user: {
        id: createdUserId,
        email: emailTrimmed,
        role: role,
        firstName: cleanFirstName,
        lastName: cleanLastName
      }
    });
  } catch (error) {
    next(error);
  }
}

// ----------------------------------------------------------------------------
// 2. User Login (POST /api/auth/login)
// ----------------------------------------------------------------------------
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter both email address and password.'
      });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: JWT_SECRET environment variable is missing.'
      });
    }

    const emailTrimmed = String(email).trim().toLowerCase();

    // Query user from MySQL
    const user = await findUserByEmail(emailTrimmed);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password.'
      });
    }

    // Assert Active Status
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact CareNova Health administration.'
      });
    }

    // Verify Password
    const passwordMatch = await bcrypt.compare(String(password), user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password.'
      });
    }

    // Generate JWT Payload
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name
    };

    const token = jwt.sign(payload, jwtSecret, { expiresIn: JWT_EXPIRES_IN });

    // Set JWT in HttpOnly Cookie
    res.cookie(COOKIE_NAME, token, getCookieOptions());

    // Return Safe User Info
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name
      }
    });
  } catch (error) {
    next(error);
  }
}

// ----------------------------------------------------------------------------
// 3. User Logout (POST /api/auth/logout)
// ----------------------------------------------------------------------------
async function logout(req, res, next) {
  try {
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
}

// ----------------------------------------------------------------------------
// 4. Get Current Authenticated Profile (GET /api/auth/me)
// ----------------------------------------------------------------------------
async function getMe(req, res, next) {
  try {
    const userId = req.user.id;
    const user = await findUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.'
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  logout,
  getMe
};
