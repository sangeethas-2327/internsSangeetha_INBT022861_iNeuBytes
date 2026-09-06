# CareNova Health — Major Project Master Implementation Specification
## Full-Stack Healthcare / Clinic Management System

**Intern Name:** Sangeetha  
**Registration Number:** INBT022861  
**Course ID:** WBINB10726  
**Repository:** `internsSangeetha_INBT022861_iNeuBytes`  
**Brand Identity:** CareNova Health (Fictional Demonstration Healthcare System)  
**Approved Technology Stack:** HTML5, CSS3, Vanilla JavaScript (ES6+), Node.js, Express.js, MySQL, Postman  

---

## 1. PROJECT OBJECTIVE

### 1.1 Overview
The **CareNova Health Healthcare / Clinic Management System** is a production-grade full-stack web application designed for the fictional healthcare brand *CareNova Health*. It serves as the primary capstone deliverable (Major Project) for the iNeuBytes Web Development Virtual Internship.

### 1.2 Target Users
1. **Patients:** Individuals seeking outpatient medical care who register, browse qualified medical specialists, book/reschedule/cancel consultation slots, view upcoming appointment reminders, and access their personal medical records.
2. **Doctors:** Healthcare professionals who log in to manage their consultation schedules, review assigned patient rosters, update appointment consultation statuses (`Pending`, `Confirmed`, `Completed`, `Cancelled`), and record clinical diagnostic notes and prescriptions.
3. **Admins:** Healthcare system administrators who utilize a centralized command console to manage patient profiles, onboard doctors, assign clinical departments, maintain department listings, oversee system-wide appointment schedules, and analyze operational statistics.

### 1.3 Main Problem Solved
The system solves the operational complexity of manual healthcare administration by providing a unified, secure, role-restricted web platform that automates appointment scheduling, double-booking prevention, patient record maintenance, department management, and administrative reporting without relying on third-party frameworks or external backend services.

### 1.4 Internship Qualification & Full-Stack Architecture
This project qualifies as the Major Project by demonstrating end-to-end full-stack software engineering principles:
- **Frontend Layer:** Semantic HTML5, Vanilla CSS3 (Custom Design System with Zero Frameworks like Bootstrap/Tailwind), and ES6+ Vanilla JavaScript.
- **Backend API Layer:** RESTful web services built with Node.js and Express.js, structured into modular controllers, routes, middleware, and database access layers.
- **Database Layer:** A normalized relational MySQL database utilizing primary/foreign key constraints, explicit data types, indexes, and parameterized queries.
- **Testing & Verification Layer:** Postman API test collection, JSDOM automated DOM/JS testing script, cross-browser validation, and responsive breakpoint verification across 375px, 768px, 1024px, and 1440px viewports.

---

## 2. COMPLETE REQUIREMENTS MAPPING

| Official Requirement | Planned Feature / Module | Frontend Implementation | Backend Implementation | Database Implementation | Test Verification Method |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Registration & Login** | Authentication Module | `register.html`, `login.html`, `auth.js` | `POST /api/auth/register`<br>`POST /api/auth/login` | `users` table (`email`, `password_hash`, `role`) | Postman Test 01 & Auth Form UI Test |
| **2. Role-Based Auth (Patient, Doctor, Admin)** | Authentication & RBAC Module | `auth.js` (Route guards & Token storage) | `middleware/authMiddleware.js`<br>`middleware/roleMiddleware.js` | `users.role` ENUM (`patient`, `doctor`, `admin`) | Postman Unauthorized (401) & Forbidden (403) Tests |
| **3. Patient Management** | Patient Portal & Admin Console | `client/patient/`, `client/admin/patients.html` | `/api/patients/*`<br>`GET/POST/PUT/DELETE /api/admin/patients` | `patients` table linked to `users` via 1:1 FK | Admin Patient CRUD Test & Patient Profile Test |
| **4. Doctor Management** | Doctor Roster & Admin Console | `client/patient/book.html`, `client/admin/doctors.html` | `/api/doctors/*`<br>`POST/PUT/DELETE /api/admin/doctors` | `doctors` table linked to `users` & `departments` | Admin Doctor Onboarding & Department Assignment Test |
| **5. Department Management** | Department Module | `client/admin/departments.html` | `GET/POST/PUT/DELETE /api/departments` | `departments` table (`name`, `code`, `description`) | Admin Department CRUD & Doctor Filter Test |
| **6. Appointment Management** | Appointment Engine | `client/patient/book.html`, `client/doctor/schedule.html`, `client/admin/appointments.html` | `/api/appointments/*` (Create, Reschedule, Status, Cancel) | `appointments` table (`status` ENUM, date/time slot FKs) | Appointment CRUD, Status Transition & Slot Release Test |
| **7. Double-Booking Prevention** | Slot Conflict Prevention Engine | `client/patient/book.html` (Disabled slot buttons) | `appointmentController.js` (Conflict check query) | `idx_appt_doctor_date` unique composite index | Double-Booking Conflict Postman Test (409 Conflict) |
| **8. Reschedule Self-Exclusion** | Reschedule Engine | `client/patient/history.html` | `appointmentController.js` (`AND id != rescheduleId`) | MySQL query exclusion logic | Reschedule Self-Conflict Exclusion QA Test |
| **9. Medical Records** | Medical Records Module | `client/patient/history.html`, `client/doctor/records.html` | `POST/GET/PUT /api/medical-records` | `medical_records` table linked to `appointments` | Doctor Clinical Entry & Patient Read Boundary Test |
| **10. Dashboards** | Role-Specific Portals | `client/patient/index.html`, `client/doctor/index.html`, `client/admin/index.html` | `/api/admin/dashboard-stats`, `/api/doctors/schedule` | Aggregate SQL queries (`COUNT`, `GROUP BY`) | Role Dashboard Navigation & Analytics Data Test |
| **11. Notifications** | Appointment Reminders Feed | Dashboard Banner Component (`ui.js`) | `GET /api/patients/upcoming-notifications` | Query `appointments` where `date >= CURDATE()` | Upcoming Appointment Notification Feed Test |
| **12. Search & Filter** | Search & Department Filter Bar | `doctorSearchInput`, `deptFilterContainer` | `GET /api/doctors?search=query&dept=code` | SQL `LIKE` & `WHERE department_id = ?` | Combined Search + Department Filter Accuracy Test |
| **13. Full CRUD Operations** | System-Wide Data Layer | All portal management views | Complete RESTful API endpoints | Full MySQL INSERT, SELECT, UPDATE, DELETE/UPDATE | Complete CRUD Verification Suite |
| **14. Responsive UI** | CSS Design System | `css/responsive.css` | N/A (Static CSS Assets) | N/A | Breakpoint audit at 375px, 768px, 1024px, 1440px |
| **15. MySQL Database Integration** | Relational Database Layer | N/A | `server/config/db.js` (`mysql2/promise`) | Relational schema (`schema.sql`, `seed.sql`) | Direct MySQL Query Execution & Connection Test |
| **16. Node.js + Express API** | Backend Web Application | N/A | `server/app.js`, `server/server.js` | N/A | Express Server Route Listener & API Response Test |
| **17. Postman Collection** | Postman Test Suite | N/A | N/A | N/A | Executing `postman/CareNova_API_Collection.json` |
| **18. Technical Documentation** | Documentation Package | `Major-Project/README.md`, `CHECKLIST.md` | N/A | N/A | Complete Requirements & Architectural Audit |

---

## 3. USER ROLES & ACCESS CONTROL PERMISSIONS

```
+---------------------------------------------------+---------+--------+-------+
| Operation / System Resource                       | Patient | Doctor | Admin |
+---------------------------------------------------+---------+--------+-------+
| Self-Registration (`POST /api/auth/register`)     |   YES   |   NO   |  NO   |
| Account Login (`POST /api/auth/login`)            |   YES   |  YES   |  YES  |
| Read Own User Profile (`GET /api/auth/me`)        |   YES   |  YES   |  YES  |
| Edit Own Profile Info (`PUT /api/patients/profile`)|  YES   |  YES   |  YES  |
| Browse Doctors & Departments (`GET /api/doctors`) |   YES   |  YES   |  YES  |
| Book New Appointment (`POST /api/appointments`)   |   YES   |   NO   |  YES  |
| Reschedule Own Appointment (`PUT /api/.../resched`)|  YES   |   NO   |  YES  |
| Cancel Own Appointment (`DELETE /api/.../cancel`) |   YES   |  YES   |  YES  |
| View Personal History (`GET /api/patients/appts`) |   YES   |   NO   |  YES  |
| View Personal Medical Records (`GET /api/.../med`)|   YES   |   NO   |  YES  |
| View Assigned Patient List (`GET /api/.../pat`)   |   NO    |  YES   |  YES  |
| View Schedule (`GET /api/doctors/schedule`)       |   NO    |  YES   |  YES  |
| Update Appointment Status (`PATCH /api/.../status`)|  NO    |  YES   |  YES  |
| Add Clinical Medical Notes (`POST /api/medical..`)|   NO    |  YES   |  YES  |
| Update Availability Slots (`PUT /api/.../avail`)  |   NO    |  YES   |  YES  |
| Access Admin Dashboard (`GET /api/admin/dashboard`)|  NO    |   NO   |  YES  |
| Create Doctor Account (`POST /api/admin/doctors`) |   NO    |   NO   |  YES  |
| Assign Doctor to Department (`PUT /api/.../dept`) |   NO    |   NO   |  YES  |
| Manage Departments (`POST/PUT/DELETE /api/dept`)  |   NO    |   NO   |  YES  |
| Override / Delete Any Record (`DELETE /api/...`)  |   NO    |   NO   |  YES  |
+---------------------------------------------------+---------+--------+-------+
```

### Role Boundaries & Access Restrictions:
- **PATIENT MUST NOT ACCESS:** Doctor schedules of other patients, clinical note authoring controls, admin analytics, department CRUD endpoints, user deactivation commands.
- **DOCTOR MUST NOT ACCESS:** Medical records of patients not assigned to them, admin system analytics, doctor onboarding controls, financial/department CRUD operations.
- **ADMIN ACCESS:** Granted full systemic read/write/override access across all modules for management and audit purposes.

---

## 4. USER WORKFLOWS

### 4.1 Patient Workflow
```text
Arrive at Portal (index.html)
  │
  ├──> If New User ──> Navigate to register.html ──> Enter Name, Email, Password, Phone ──> Submit Registration
  │                                                                                             │
  └──> Navigate to login.html ◄─────────────────────────────────────────────────────────────────┘
        │
        ├──> Enter Email & Password ──> Server Validates & Returns JWT Token ──> Saved to Storage
        │
        └──> Redirect to Patient Dashboard (client/patient/index.html)
              │
              ├──> 1. Dashboard Overview: View upcoming appointment reminder banner & notifications
              ├──> 2. Browse Doctors (client/patient/book.html):
              │       ├──> Filter doctors by keyword search or department pill
              │       ├──> Click "View Details" to view doctor profile modal
              │       └──> Click "Book Appointment" ──> Select Date ──> Select Available Time Slot ──> Confirm
              │             └──> Backend verifies slot ──> Generates CNH-2026-XXXX ──> Displays Receipt Modal
              │
              ├──> 3. Appointment History (client/patient/history.html):
              │       ├──> View list of Confirmed, Rescheduled, Completed, and Cancelled bookings
              │       ├──> Click "Reschedule" ──> Select New Date/Time ──> Submits update (Excludes self-conflict)
              │       └──> Click "Cancel" ──> Confirms cancellation ──> Status updated to Cancelled ──> Slot released
              │
              └──> 4. Medical Records: View digital diagnosis, doctor clinical notes, and prescriptions
```

### 4.2 Doctor Workflow
```text
Navigate to login.html ──> Enter Doctor Credentials ──> Server verifies role 'doctor' ──> Issued Doctor JWT Token
  │
  └──> Redirect to Doctor Dashboard (client/doctor/index.html)
        │
        ├──> 1. Schedule & Status Manager (client/doctor/schedule.html):
        │       ├──> View today's consultation schedule sorted chronologically
        │       ├──> Filter appointments by status (Pending, Confirmed, Completed, Cancelled)
        │       └──> Update Appointment Status (e.g., mark as 'Completed' or 'Rescheduled')
        │
        ├──> 2. Assigned Patient Roster: View details, contact numbers, and medical history of assigned patients
        │
        └──> 3. Clinical Medical Records (client/doctor/records.html):
                ├──> Select completed consultation appointment
                ├──> Enter Clinical Diagnosis, Doctor Notes, Prescription details, and Follow-up date
                └──> Submit Record ──> Persisted to MySQL `medical_records` table linked to appointment
```

### 4.3 Admin Workflow
```text
Navigate to login.html ──> Enter Admin Credentials ──> Server verifies role 'admin' ──> Issued Admin JWT Token
  │
  └──> Redirect to Admin Command Console (client/admin/index.html)
        │
        ├──> 1. System Analytics Dashboard:
        │       └──> View total patients count, active doctors count, total appointments count, revenue metrics
        │
        ├──> 2. Doctor Management (client/admin/doctors.html):
        │       ├──> Onboard new doctor (Create user account + Assign Department + Set Consultation Fee)
        │       ├──> Edit doctor qualifications, department assignment, and available days
        │       └──> Deactivate/Reactivate doctor profile
        │
        ├──> 3. Department Management (client/admin/departments.html):
        │       ├──> Create new clinical department (Name, Code, Description, Icon)
        │       ├──> Update department details
        │       └──> Delete/Deactivate clinical department
        │
        ├──> 4. Patient Management (client/admin/patients.html): View, edit, or deactivate patient accounts
        │
        └──> 5. Global Appointment Override (client/admin/appointments.html):
                └──> View all system bookings, override appointment statuses, reschedule, or cancel bookings
```

---

## 5. FEATURE / MODULE ARCHITECTURE

```
+---------------------------------------------------------------------------------------------------------+
|                                    CareNova Health Modular Architecture                                 |
+-------------------+--------------------+--------------------+--------------------+----------------------+
| Module Name       | Responsible Roles  | Frontend Views     | Backend Controllers| MySQL Database Tables|
+-------------------+--------------------+--------------------+--------------------+----------------------+
| 1. Authentication | All Roles          | `login.html`       | `authController`   | `users`              |
|                   |                    | `register.html`    |                    |                      |
+-------------------+--------------------+--------------------+--------------------+----------------------+
| 2. Patient        | Patient, Admin     | `client/patient/`  | `patientController`| `patients`, `users`  |
+-------------------+--------------------+--------------------+--------------------+----------------------+
| 3. Doctor         | Doctor, Admin      | `client/doctor/`   | `doctorController` | `doctors`, `users`,  |
|                   |                    |                    |                    | `departments`        |
+-------------------+--------------------+--------------------+--------------------+----------------------+
| 4. Department     | All Roles (Read),  | `client/admin/`    | `department-       | `departments`        |
|                   | Admin (CRUD)       | `departments.html` |   Controller`      |                      |
+-------------------+--------------------+--------------------+--------------------+----------------------+
| 5. Appointment    | Patient (Book/Cancel)|`client/patient/`  | `appointment-      | `appointments`,      |
|                   | Doctor (Status),   | `client/doctor/`   |   Controller`      | `doctors`, `patients`|
|                   | Admin (Global)     | `client/admin/`    |                    |                      |
+-------------------+--------------------+--------------------+--------------------+----------------------+
| 6. Medical Record | Doctor (Write),    | `client/doctor/`   | `medicalRecord-    | `medical_records`,   |
|                   | Patient (Read Own),| `client/patient/`  |   Controller`      | `appointments`       |
|                   | Admin (Full)       |                    |                    |                      |
+-------------------+--------------------+--------------------+--------------------+----------------------+
| 7. Admin & Stats  | Admin Only         | `client/admin/`    | `adminController`  | All Tables           |
|                   |                    | `index.html`       |                    | (Aggregate Queries)  |
+-------------------+--------------------+--------------------+--------------------+----------------------+
```

---

## 6. FRONTEND ARCHITECTURE

### 6.1 View Layout & Page Organization
The frontend uses a clean multi-page application structure with shared CSS tokens, shared header/footer components, and dedicated role portals:
- **`index.html`:** Portal landing page featuring brand hero section, clinic metrics, and public doctor search preview.
- **`login.html`:** Single unified authentication entry point for Patients, Doctors, and Admins.
- **`register.html`:** Self-service registration page for new patients.
- **`client/patient/` Directory:** Patient Dashboard, Doctor Search & Booking Engine, Appointment History, and Personal Medical Records.
- **`client/doctor/` Directory:** Doctor Dashboard, Today's Consultation Schedule, Patient Roster, and Clinical Notes Manager.
- **`client/admin/` Directory:** Admin Console, Doctor Onboarding, Patient Management, Department CRUD Manager, and Global Appointment Overrides.

### 6.2 Client-Side JavaScript Layer
- **`js/config.js`:** API base URL definition (`http://localhost:5000/api`) and system environment flags.
- **`js/api.js`:** Central HTTP service built on Vanilla `fetch()` that automatically attaches `Authorization: Bearer <token>`, handles JSON parsing, and redirects to `login.html` on `401 Unauthorized`.
- **`js/auth.js`:** Session state manager handling token storage (`localStorage`), user role validation, header badge rendering, and logout execution.
- **`js/ui.js`:** Toast notification manager, modal opener/closer, tab switcher, and date/currency formatters.

---

## 7. BACKEND ARCHITECTURE

```
server/
├── config/
│   └── db.js                  # Connection Pool (mysql2/promise)
├── middleware/
│   ├── authMiddleware.js      # JWT Authentication Guard
│   ├── roleMiddleware.js      # Role-Based Authorization Guard
│   ├── validationMiddleware.js# Request Input Sanitizer & Validator
│   └── errorMiddleware.js     # Centralized Error Handler (400, 401, 403, 404, 409, 500)
├── controllers/
│   ├── authController.js      # Register, Login, Me, Logout
│   ├── patientController.js   # Profile & History Query Controllers
│   ├── doctorController.js    # Doctor Roster & Schedule Controllers
│   ├── departmentController.js# Department CRUD Controllers
│   ├── appointmentController.js# Slot Check, Booking, Reschedule, Status & Cancellation
│   ├── medicalRecordController.js# Clinical Notes CRUD Controllers
│   └── adminController.js     # Dashboard Analytics & User Management Controllers
├── routes/
│   ├── authRoutes.js          # /api/auth
│   ├── patientRoutes.js       # /api/patients
│   ├── doctorRoutes.js        # /api/doctors
│   ├── departmentRoutes.js    # /api/departments
│   ├── appointmentRoutes.js   # /api/appointments
│   ├── medicalRecordRoutes.js # /api/medical-records
│   └── adminRoutes.js         # /api/admin
├── app.js                     # Express Application Core Setup
└── server.js                  # HTTP Server Initialization (Port 5000)
```

---

## 8. REST API ARCHITECTURE

### 8.1 Authentication Endpoints (`/api/auth`)
| Method | Route | Purpose | Authorized Role(s) | Request Data Payload | Response Structure |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Patient registration | Public | `{ email, password, firstName, lastName, phone, gender, dob }` | `{ success: true, message, user }` |
| `POST` | `/api/auth/login` | Account authentication | Public | `{ email, password }` | `{ success: true, token, user: { id, email, role, name } }` |
| `GET` | `/api/auth/me` | Resolve active profile | Patient, Doctor, Admin | None (Header Token) | `{ success: true, user }` |
| `POST` | `/api/auth/logout` | Client logout signal | Patient, Doctor, Admin | None (Header Token) | `{ success: true, message: "Logged out" }` |

### 8.2 Patient Endpoints (`/api/patients`)
| Method | Route | Purpose | Authorized Role(s) | Request Data Payload | Response Structure |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/patients/profile` | View profile | Patient | None (Header Token) | `{ success: true, patientProfile }` |
| `PUT` | `/api/patients/profile` | Update profile | Patient, Admin | `{ firstName, lastName, phone, address, bloodGroup }` | `{ success: true, message, updatedPatient }` |
| `GET` | `/api/patients/appointments` | Get appointments | Patient | Query: `?status=Confirmed` | `{ success: true, appointments: [...] }` |
| `GET` | `/api/patients/medical-records`| Get medical history | Patient | None (Header Token) | `{ success: true, records: [...] }` |

### 8.3 Doctor Endpoints (`/api/doctors`)
| Method | Route | Purpose | Authorized Role(s) | Request Data Payload | Response Structure |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/doctors` | List doctors | Public, All Roles | Query: `?search=name&dept=cardiology` | `{ success: true, doctors: [...] }` |
| `GET` | `/api/doctors/:id` | Doctor details | Public, All Roles | Route Param `:id` | `{ success: true, doctor }` |
| `GET` | `/api/doctors/schedule` | View schedule | Doctor | Query: `?date=2026-09-15` | `{ success: true, schedule: [...] }` |
| `PUT` | `/api/doctors/availability`| Update time slots | Doctor, Admin | `{ availableDays, availableSlots }` | `{ success: true, message }` |

### 8.4 Department Endpoints (`/api/departments`)
| Method | Route | Purpose | Authorized Role(s) | Request Data Payload | Response Structure |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/departments` | List departments | Public, All Roles | None | `{ success: true, departments: [...] }` |
| `POST` | `/api/departments` | Create department | Admin | `{ name, code, description, icon }` | `{ success: true, department }` |
| `PUT` | `/api/departments/:id` | Update department | Admin | `{ name, description, icon }` | `{ success: true, department }` |
| `DELETE` | `/api/departments/:id` | Delete department | Admin | Route Param `:id` | `{ success: true, message }` |

### 8.5 Appointment Endpoints (`/api/appointments`)
| Method | Route | Purpose | Authorized Role(s) | Request Data Payload | Response Structure |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/appointments` | Book appointment | Patient, Admin | `{ doctorId, appointmentDate, timeSlot, reason }` | `{ success: true, appointment: { referenceId, ... } }` |
| `GET` | `/api/appointments/available-slots` | Slot availability | Public, All Roles | Query: `?doctorId=1&date=2026-09-15` | `{ success: true, availableSlots: [...] }` |
| `PUT` | `/api/appointments/:id/reschedule`| Reschedule slot | Patient, Admin | `{ newDate, newTimeSlot }` | `{ success: true, message, appointment }` |
| `PATCH` | `/api/appointments/:id/status` | Update status | Doctor, Admin | `{ status: "Completed" }` | `{ success: true, message, appointment }` |
| `DELETE` | `/api/appointments/:id/cancel` | Cancel booking | Patient, Doctor, Admin | None | `{ success: true, message: "Slot released" }` |

### 8.6 Medical Record Endpoints (`/api/medical-records`)
| Method | Route | Purpose | Authorized Role(s) | Request Data Payload | Response Structure |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/medical-records` | Create clinical note | Doctor, Admin | `{ appointmentId, diagnosis, prescription, notes }` | `{ success: true, record }` |
| `GET` | `/api/medical-records/:id` | Get record | Patient (own), Doctor, Admin| Route Param `:id` | `{ success: true, record }` |
| `PUT` | `/api/medical-records/:id` | Edit clinical note | Doctor (author), Admin | `{ diagnosis, prescription, notes }` | `{ success: true, record }` |

### 8.7 Admin Endpoints (`/api/admin`)
| Method | Route | Purpose | Authorized Role(s) | Request Data Payload | Response Structure |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard-stats` | System analytics | Admin | None | `{ success: true, stats: { totalPatients, totalDoctors, ... } }` |
| `POST` | `/api/admin/doctors` | Onboard doctor | Admin | `{ email, password, firstName, lastName, phone, deptId, fee, exp }` | `{ success: true, message, doctor }` |
| `GET` | `/api/admin/patients` | List all patients | Admin | Query: `?page=1` | `{ success: true, patients: [...] }` |

---

## 9. DATABASE SCHEMA DESIGN (MySQL)

```sql
CREATE DATABASE IF NOT EXISTS carenova_health_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE carenova_health_db;

-- 1. Users Table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('patient', 'doctor', 'admin') NOT NULL DEFAULT 'patient',
  first_name VARCHAR(75) NOT NULL,
  last_name VARCHAR(75) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role)
) ENGINE=InnoDB;

-- 2. Departments Table
CREATE TABLE departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(20) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50) DEFAULT 'hospital',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_dept_code (code)
) ENGINE=InnoDB;

-- 3. Doctors Table
CREATE TABLE doctors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  department_id INT NOT NULL,
  qualification VARCHAR(150) NOT NULL,
  experience_years INT NOT NULL DEFAULT 0,
  consultation_fee DECIMAL(10,2) NOT NULL DEFAULT 500.00,
  bio TEXT,
  available_days VARCHAR(100) DEFAULT 'Mon,Tue,Wed,Thu,Fri',
  available_slots JSON,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
  INDEX idx_doctors_dept (department_id)
) ENGINE=InnoDB;

-- 4. Patients Table
CREATE TABLE patients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  date_of_birth DATE,
  gender ENUM('male', 'female', 'other') DEFAULT 'female',
  blood_group VARCHAR(10),
  address TEXT,
  emergency_contact VARCHAR(20),
  medical_history_summary TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Appointments Table
CREATE TABLE appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reference_id VARCHAR(30) NOT NULL UNIQUE,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  department_id INT NOT NULL,
  appointment_date DATE NOT NULL,
  time_slot VARCHAR(20) NOT NULL,
  consultation_fee DECIMAL(10,2) NOT NULL,
  status ENUM('Pending', 'Confirmed', 'Rescheduled', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Confirmed',
  reason_for_visit TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
  INDEX idx_appt_conflict (doctor_id, appointment_date, time_slot),
  INDEX idx_appt_patient (patient_id),
  INDEX idx_appt_status (status)
) ENGINE=InnoDB;

-- 6. Medical Records Table
CREATE TABLE medical_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  record_code VARCHAR(30) NOT NULL UNIQUE,
  appointment_id INT NOT NULL UNIQUE,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  diagnosis TEXT NOT NULL,
  prescription TEXT,
  doctor_notes TEXT,
  recommended_followup_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
  INDEX idx_records_patient (patient_id),
  INDEX idx_records_doctor (doctor_id)
) ENGINE=InnoDB;
```

---

## 10. ENTITY RELATIONSHIPS

```
 [ USERS ] 1 ─── 1 [ PATIENTS ] 1 ─── N [ APPOINTMENTS ] 1 ─── 1 [ MEDICAL_RECORDS ]
    │                                          │
    │ 1                                        │ N
    └─── 1 [ DOCTORS ] 1 ──────────────────────┘
               │ N
               │
               │ 1
       [ DEPARTMENTS ]
```

- **Users → Patients (1:1):** Each patient profile references exactly one authentication user record (`ON DELETE CASCADE`).
- **Users → Doctors (1:1):** Each doctor profile references exactly one authentication user record (`ON DELETE CASCADE`).
- **Departments → Doctors (1:N):** One department contains multiple doctors (`ON DELETE RESTRICT` ensures departments with active doctors cannot be accidentally dropped).
- **Patients → Appointments (1:N):** A patient can have multiple historical and upcoming bookings (`ON DELETE CASCADE`).
- **Doctors → Appointments (1:N):** A doctor manages multiple scheduled consultations (`ON DELETE CASCADE`).
- **Appointments → Medical Records (1:1 Optional):** A completed appointment generates exactly one clinical record (`ON DELETE CASCADE`).

---

## 11. AUTHENTICATION ARCHITECTURE

1. **Registration Flow:** Patient submits registration form → `validationMiddleware` validates inputs → `bcryptjs.hash(password, 10)` encrypts password → Transaction creates `users` record and linked `patients` record.
2. **Login Verification:** User posts credentials → Server fetches `users` record by email → `bcryptjs.compare(password, user.password_hash)` verifies match → Generates JWT signed payload:
   ```javascript
   const token = jwt.sign(
     { userId: user.id, role: user.role, email: user.email },
     process.env.JWT_SECRET,
     { expiresIn: '24h' }
   );
   ```
3. **Protected API Access:** Client includes token in `Authorization: Bearer <token>` header. `authMiddleware` verifies signature and populates `req.user`.

---

## 12. AUTHORIZATION / ROLE-BASED ACCESS CONTROL (RBAC)

```javascript
// Express RBAC Middleware Pattern
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Insufficient privileges for this resource.'
      });
    }
    next();
  };
};

// Route Security Example:
router.post('/api/admin/doctors', authMiddleware, requireRole('admin'), adminController.createDoctor);
router.post('/api/medical-records', authMiddleware, requireRole('doctor', 'admin'), medicalRecordController.createRecord);
```

---

## 13. APPOINTMENT / SLOT LOGIC & CONFLICT PREVENTION

### 13.1 Appointment Lifecycle States
- **`Confirmed`:** Active reservation blocking doctor date/time slot.
- **`Pending`:** Provisional booking undergoing review.
- **`Rescheduled`:** Active updated reservation blocking the *new* date/time slot.
- **`Completed`:** Consultation finalized by doctor; slot remains archived.
- **`Cancelled`:** Booking cancelled; slot is **released immediately** for future bookings.

### 13.2 Double-Booking Prevention Query
Before inserting or updating a booking, the backend executes:
```sql
SELECT id FROM appointments 
WHERE doctor_id = ? 
  AND appointment_date = ? 
  AND time_slot = ? 
  AND status IN ('Confirmed', 'Pending', 'Rescheduled')
  AND id != ?; -- Excludes self during reschedule check
```
If count > 0, the API aborts with HTTP `409 Conflict` and message `"Selected time slot is already booked for this doctor."`

---

## 14. MEDICAL RECORD ARCHITECTURE

- **Fields:** `record_code`, `appointment_id`, `patient_id`, `doctor_id`, `diagnosis`, `prescription`, `doctor_notes`, `recommended_followup_date`, `created_at`, `updated_at`.
- **Role Permissions:**
  - **Doctor:** Authors record for assigned patient completed appointment. Can edit authored notes.
  - **Patient:** Read-only access restricted strictly to records matching their `patient_id`.
  - **Admin:** System audit read access.

---

## 15. CLIENT-SIDE JAVASCRIPT ARCHITECTURE

```
client/js/
├── config.js         # Base URL & System Constants
├── api.js            # Fetch Wrapper (JWT Injection, Error Interceptor)
├── auth.js           # Auth Session Guard & Login/Register Handlers
├── patient.js        # Patient Dashboard & Booking UI Controller
├── doctor.js         # Doctor Schedule & Clinical Note Controller
├── admin.js          # Admin Console & Department/User CRUD Controller
├── appointments.js   # Shared Slot Grid & Booking Receipt Renderer
├── records.js        # Medical Record Renderer Component
├── notifications.js  # Reminder Banner Component
└── ui.js             # Toast Alerts, Modals & Formatters
```

---

## 16. UI / DESIGN SYSTEM

Consistent with CareNova Health visual tokens:
- **Primary Brand Color:** `#0F4C81` (Deep Clinical Blue)
- **Secondary Accent:** `#0D9488` (Teal)
- **Background Slate:** `#F8FAFC`
- **Text Primary:** `#1E293B`
- **Success Green:** `#10B981` | **Warning Amber:** `#F59E0B` | **Error Red:** `#EF4444`
- **Typography:** `Inter`, sans-serif
- **Status Pills:** Color-coded badges for `Confirmed` (Green), `Rescheduled` (Blue), `Pending` (Amber), `Completed` (Teal), and `Cancelled` (Red).

---

## 17. RESPONSIVE STRATEGY

- **375px (Mobile):** Single column stacked layout, drawer navigation, full-screen modals, horizontally scrollable data tables (`overflow-x: auto`).
- **768px (Tablet):** 2-column form grids, flexible stats cards, adaptive sidebar.
- **1024px (Small Desktop):** 3-column doctor grid, side-by-side dashboard widgets.
- **1440px (Widescreen):** Centered max-width `1280px` container, multi-column admin console.

---

## 18. VALIDATION STRATEGY

- **Client-Side:** Real-time regex input formatting, min/max dates on datepickers, submit button state management.
- **Server-Side (Authoritative):** Sanitization middleware, SQL prepared statements, email format assertion, phone 10-digit assertion, date future-only assertion, slot availability assertion.

---

## 19. SECURITY STRATEGY

- **Passwords:** Encrypted via `bcryptjs` (10 salt rounds). Plaintext never saved.
- **SQL Injection Prevention:** 100% parametrized queries using `mysql2/promise` placeholders (`?`).
- **XSS & CORS:** Output escaping, CORS configuration, Helmet security headers.
- **Secrets Management:** Loaded from `.env` via `dotenv`. `.env` is git-ignored.

---

## 20. POSTMAN TESTING STRATEGY

Collection location: `postman/CareNova_API_Collection.json`
Folders:
1. `01_Authentication` (Register, Login, Token Check, 401 Invalid Credentials)
2. `02_Patient_Module` (Profile, Appointments, History)
3. `03_Doctor_Module` (Schedule, Patient List, Consultation Status)
4. `04_Department_Module` (Get All, Admin Create/Update/Delete)
5. `05_Appointment_Module` (Available Slots, Book, Reschedule, 409 Conflict Check, Cancel)
6. `06_Medical_Record_Module` (Create Note, Patient Read, 403 Forbidden Read Check)
7. `07_Admin_Module` (Dashboard Stats, Doctor Onboarding, User Management)

---

## 21. COMPLETE QA STRATEGY

| Test Category | Test Target | Method / Tool | Expected Result |
| :--- | :--- | :--- | :--- |
| **Functional** | Booking & Rescheduling | JSDOM & Browser | Slot booked, status updated, slot released on cancel |
| **Double Booking**| Same Doctor/Date/Time | Postman & Script | HTTP `409 Conflict` response |
| **Authorization** | Patient accessing Admin API | Postman | HTTP `403 Forbidden` response |
| **Authentication** | Request without token | Postman | HTTP `401 Unauthorized` response |
| **Database** | Relational CRUD | MySQL CLI / Node | Data persisted across tables with valid FKs |
| **Responsive** | 375px, 768px, 1024px, 1440px | CSS Audit & DevTools | 0 horizontal overflow, fully readable layout |

---

## 22. COMPLETE FILE/FOLDER STRUCTURE

```
Major-Project/
├── client/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── patient/
│   │   ├── index.html
│   │   ├── book.html
│   │   └── history.html
│   ├── doctor/
│   │   ├── index.html
│   │   ├── schedule.html
│   │   └── records.html
│   ├── admin/
│   │   ├── index.html
│   │   ├── doctors.html
│   │   ├── patients.html
│   │   ├── departments.html
│   │   └── appointments.html
│   ├── css/
│   │   ├── style.css
│   │   ├── components.css
│   │   └── responsive.css
│   ├── js/
│   │   ├── config.js
│   │   ├── api.js
│   │   ├── auth.js
│   │   ├── patient.js
│   │   ├── doctor.js
│   │   ├── admin.js
│   │   ├── appointments.js
│   │   ├── records.js
│   │   ├── notifications.js
│   │   └── ui.js
│   └── assets/
│       └── images/
│           └── logo.svg
│
├── server/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── roleMiddleware.js
│   │   ├── validationMiddleware.js
│   │   └── errorMiddleware.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── patientController.js
│   │   ├── doctorController.js
│   │   ├── departmentController.js
│   │   ├── appointmentController.js
│   │   ├── medicalRecordController.js
│   │   └── adminController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── patientRoutes.js
│   │   ├── doctorRoutes.js
│   │   ├── departmentRoutes.js
│   │   ├── appointmentRoutes.js
│   │   ├── medicalRecordRoutes.js
│   │   └── adminRoutes.js
│   ├── .env.example
│   ├── app.js
│   ├── server.js
│   └── package.json
│
├── database/
│   ├── schema.sql
│   └── seed.sql
│
├── postman/
│   └── CareNova_API_Collection.json
│
├── README.md
└── implementation_plan.md
```

---

## 23. DOCUMENTATION PLAN

The final project documentation will include:
1. `Major-Project/README.md`: Architecture overview, setup steps, environment variables, DB setup, user credentials for demo evaluation, API summary, Postman execution instructions.
2. Master `CHECKLIST.md`: Complete update marking all Phase 3 tasks as `[x]`.

---

## 24. IMPLEMENTATION SEQUENCE (21 STAGES)

1. Project structure initialization (`Major-Project/`)
2. Database Schema DDL creation (`database/schema.sql`)
3. Database Seed script creation (`database/seed.sql`)
4. Node.js + Express server core setup (`server/package.json`, `server.js`, `app.js`)
5. MySQL Database connection pool configuration (`server/config/db.js`)
6. Authentication Controller & Middleware (`authController.js`, `authMiddleware.js`, `bcryptjs`, JWT)
7. RBAC Authorization Middleware (`roleMiddleware.js`)
8. Department REST API endpoints (`departmentController.js`, `departmentRoutes.js`)
9. Doctor REST API endpoints (`doctorController.js`, `doctorRoutes.js`)
10. Patient REST API endpoints (`patientController.js`, `patientRoutes.js`)
11. Appointment REST API & Slot Conflict Engine (`appointmentController.js`, `appointmentRoutes.js`)
12. Medical Record REST API endpoints (`medicalRecordController.js`, `medicalRecordRoutes.js`)
13. Admin & Analytics REST API endpoints (`adminController.js`, `adminRoutes.js`)
14. Client API Layer & Auth State (`client/js/api.js`, `client/js/auth.js`)
15. Frontend Gateway Pages (`login.html`, `register.html`)
16. Patient Portal Views & Controllers (`client/patient/`)
17. Doctor Portal Views & Controllers (`client/doctor/`)
18. Admin Console Views & Controllers (`client/admin/`)
19. Postman Collection Creation (`postman/CareNova_API_Collection.json`)
20. Automated QA Audit Execution & Bug Fixes
21. Final Documentation & Clean Git Commit

---

## 25. REQUIREMENT-TO-FEATURE TRACEABILITY MATRIX

| Requirement | Planned Feature | Frontend | Backend | Database | Test Method |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Auth & Roles** | Register / Login / JWT | `login.html`, `auth.js` | `authController.js` | `users` | Postman Test 01 |
| **Patient Module** | Profile, Book, History | `client/patient/` | `patientController.js` | `patients` | Patient Portal QA |
| **Doctor Module** | Schedule, Status, Notes | `client/doctor/` | `doctorController.js` | `doctors` | Doctor Portal QA |
| **Admin Module** | Stats, Onboarding, CRUD | `client/admin/` | `adminController.js` | All Tables | Admin Console QA |
| **Departments** | Department Management | `client/admin/dept.html`| `departmentController` | `departments`| Postman Test 04 |
| **Appointments** | Booking & Slot Engine | `client/patient/book.html`| `appointmentController`| `appointments`| Conflict Check (409) |
| **Medical Records**| Consultation Clinical Notes| `client/doctor/records` | `medicalRecordController`| `medical_records`| Boundary Read Test |

---

## 26. RISKS AND MITIGATIONS

- **Risk 1: Double-Booking Conflict:** Mitigated via atomic SQL conflict verification query (`SELECT ... WHERE status IN ('Confirmed', 'Rescheduled')`).
- **Risk 2: Unauthorized Route Access:** Mitigated via dual-layer server middleware (`authMiddleware` + `requireRole`).
- **Risk 3: Unhandled Server Crash:** Mitigated via Express centralized `errorMiddleware.js`.

---

## 27. SCOPE EXCLUSIONS

Explicitly excluded to maintain internship focus:
- External paid SMS/Email gateways (mock loggers used).
- Real payment gateway processing (demo fee display only).
- Live video conferencing integration.
- Production cloud deployment infrastructure.

---

## 28. FINAL DELIVERABLE CHECKLIST

- [ ] Complete full-stack codebase in `Major-Project/`
- [ ] MySQL DDL & Seed scripts in `database/`
- [ ] Postman collection in `postman/`
- [ ] Complete `Major-Project/README.md`
- [ ] Updated master `CHECKLIST.md`
- [ ] Git commit under clear commit message

---

**USER REVIEW REQUIRED:**  
Please review this master implementation plan. Implementation will begin immediately upon your approval.
