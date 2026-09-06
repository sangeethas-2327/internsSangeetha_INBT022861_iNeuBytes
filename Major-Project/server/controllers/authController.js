// ============================================================================
// CareNova Health — Authentication Controller (Hybrid MySQL / Seed Fallback)
// iNeuBytes Web Development Internship — Major Project Phase 3B Auth & RBAC
// ============================================================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool, testDbConnection } = require('../config/db');

const JWT_EXPIRES_IN = '24h';
const COOKIE_NAME = 'carenova_token';

// Verified demo password hash for "demo123"
const DEMO_PASSWORD_HASH = '$2b$10$wTKvSbQj1NHr65EHlGimD.thWkKTTcWwR7xc66zXNHJumsq/owGTq';

// In-Memory Seed Repository (Used when MySQL connection is unavailable)
const inMemoryUsers = [
  { id: 1, email: 'admin@carenova.health', password_hash: DEMO_PASSWORD_HASH, role: 'admin', first_name: 'System', last_name: 'Administrator', phone: '+91 99000 11223', is_active: true, created_at: new Date() },
  { id: 2, email: 'sarah.jenkins@carenova.health', password_hash: DEMO_PASSWORD_HASH, role: 'doctor', first_name: 'Sarah', last_name: 'Jenkins', phone: '+91 98765 11101', is_active: true, created_at: new Date() },
  { id: 3, email: 'marcus.vance@carenova.health', password_hash: DEMO_PASSWORD_HASH, role: 'doctor', first_name: 'Marcus', last_name: 'Vance', phone: '+91 98765 11102', is_active: true, created_at: new Date() },
  { id: 4, email: 'elena.rostova@carenova.health', password_hash: DEMO_PASSWORD_HASH, role: 'doctor', first_name: 'Elena', last_name: 'Rostova', phone: '+91 98765 11103', is_active: true, created_at: new Date() },
  { id: 5, email: 'david.chen@carenova.health', password_hash: DEMO_PASSWORD_HASH, role: 'doctor', first_name: 'David', last_name: 'Chen', phone: '+91 98765 11104', is_active: true, created_at: new Date() },
  { id: 6, email: 'priya.nair@carenova.health', password_hash: DEMO_PASSWORD_HASH, role: 'doctor', first_name: 'Priya', last_name: 'Nair', phone: '+91 98765 11105', is_active: true, created_at: new Date() },
  { id: 7, email: 'rajesh.sharma@carenova.health', password_hash: DEMO_PASSWORD_HASH, role: 'doctor', first_name: 'Rajesh', last_name: 'Sharma', phone: '+91 98765 11106', is_active: true, created_at: new Date() },
  { id: 8, email: 'sangeetha.patient@example.com', password_hash: DEMO_PASSWORD_HASH, role: 'patient', first_name: 'Sangeetha', last_name: 'Gowda', phone: '+91 98765 43210', is_active: true, created_at: new Date() },
  { id: 9, email: 'rahul.verma@example.com', password_hash: DEMO_PASSWORD_HASH, role: 'patient', first_name: 'Rahul', last_name: 'Verma', phone: '+91 98765 43211', is_active: true, created_at: new Date() }
];

let nextUserId = 10;

// Cookie Security Configuration Helper
function getCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  };
}

// Helper: Find User By Email
async function findUserByEmail(email) {
  const emailTrimmed = String(email).trim().toLowerCase();
  
  // Try MySQL Query First
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [emailTrimmed]);
    if (rows && rows.length > 0) {
      return rows[0];
    }
  } catch (err) {
    // MySQL query failed or not connected, use in-memory fallback
  }

  // In-Memory Fallback
  return inMemoryUsers.find(u => u.email.toLowerCase() === emailTrimmed) || null;
}

// Helper: Find User By ID
async function findUserById(id) {
  try {
    const [rows] = await pool.query('SELECT id, email, role, first_name, last_name, phone, is_active, created_at FROM users WHERE id = ?', [id]);
    if (rows && rows.length > 0) {
      return rows[0];
    }
  } catch (err) {
    // MySQL query failed, use fallback
  }

  return inMemoryUsers.find(u => u.id === Number(id)) || null;
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

    // Check duplicate email
    const existing = await findUserByEmail(emailTrimmed);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please log in.'
      });
    }

    // Hash Password
    const passwordHash = await bcrypt.hash(String(password), 10);

    // CRITICAL ROLE CONTROL: Public registration defaults strictly to 'patient'
    const role = 'patient';
    const cleanFirstName = String(firstName).trim();
    const cleanLastName = String(lastName).trim();
    const cleanPhone = String(phone).trim();

    let createdUserId = null;

    // Attempt MySQL Insert Transaction
    let mysqlSuccess = false;
    try {
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
        connection.release();
        mysqlSuccess = true;
      } catch (dbErr) {
        await connection.rollback();
        connection.release();
      }
    } catch (poolErr) {
      // MySQL unavailable
    }

    // If MySQL was not available, save to In-Memory Fallback
    if (!mysqlSuccess) {
      createdUserId = nextUserId++;
      const newUser = {
        id: createdUserId,
        email: emailTrimmed,
        password_hash: passwordHash,
        role: role,
        first_name: cleanFirstName,
        last_name: cleanLastName,
        phone: cleanPhone,
        is_active: true,
        created_at: new Date()
      };
      inMemoryUsers.push(newUser);
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

    const emailTrimmed = String(email).trim().toLowerCase();

    // Query user
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

    const jwtSecret = process.env.JWT_SECRET || 'replace_with_a_long_random_secret';
    const token = jwt.sign(payload, jwtSecret, { expiresIn: JWT_EXPIRES_IN });

    // Set JWT in HttpOnly Cookie
    res.cookie(COOKIE_NAME, token, getCookieOptions());

    // Return Safe User Info (NO password_hash or raw token in JSON body)
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
    // Clear HttpOnly Authentication Cookie
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
        firstName: user.first_name || user.firstName,
        lastName: user.last_name || user.lastName,
        phone: user.phone,
        createdAt: user.created_at || user.createdAt
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
