# CareNova Health — Full-Stack Healthcare Management System

**Intern Name:** Sangeetha  
**Registration Number:** INBT022861  
**Course ID:** WBINB10726  
**Repository:** `internsSangeetha_INBT022861_iNeuBytes`  
**Brand Identity:** CareNova Health (Fictional Demonstration Healthcare System)  
**Status:** Phase 3F Master Integration Complete & Verified  
**Master Integration Commit:** `20f6f9d`  
**Phase 3E Admin Commit:** `d652ce5`  
**QA Result:** 37/37 PASS | 0 FAIL | 0 BLOCKED  
**Postman API Verification:** 10/10 Requests Verified (`07_Master_Integration_Suite`)  

---

## 1. Project Overview

**CareNova Health Management System** is a full-stack web application developed as the capstone Major Project for the iNeuBytes Web Development Virtual Internship.

The application provides a role-based, end-to-end clinical workflow across three user roles:
- **Patients:** Self-registration, secure login, doctor roster discovery, availability lookup, appointment booking, rescheduling, cancellation, upcoming appointment reminders, in-app status alerts, and personal medical history access.
- **Doctors:** Dedicated workstation for consultation schedules, patient roster, status updates (`Pending` → `Confirmed` → `Completed` / `Cancelled`), clinical diagnostic note entry, and authored medical records tracking.
- **Administrators:** Command console for overall system analytics, patient account management, doctor onboarding & department assignments, department CRUD operations, and administrative appointment overrides.

> [!NOTE]
> **Phase 3F Status:** The complete full-stack application (Phases 3A through 3F) has been implemented, integrated, and verified against MySQL DB constraints, JWT HttpOnly authentication security, and RBAC authorization middleware.

---

## 2. Technology Stack

- **Frontend:** HTML5, Vanilla CSS3 (Custom Design System, Zero Frameworks), Vanilla JavaScript ES6+ (Module pattern, central API fetch wrapper with `credentials: 'include'`).
- **Backend:** Node.js, Express.js (Layered MVC Architecture: Routes, Controllers, Middleware, MySQL Connection Pool).
- **Database:** MySQL Relational Database (`mysql2/promise` connection pool, normalized tables, foreign key constraints).
- **Authentication & Security:** `bcryptjs` password hashing, `jsonwebtoken` with HttpOnly cookie strategy (`SameSite=Lax`), `cookie-parser`, `cors` (`credentials: true`).
- **API Testing & Verification:** Postman test suites (`07_Master_Integration_Suite`), full-system programmatic QA script (37/37 PASS).

---

## 3. Directory Structure

```
Major-Project/
├── client/
│   ├── index.html                 # Main Landing Page & System Status Monitor
│   ├── login.html                 # Unified Authentication Login View
│   ├── register.html              # Patient Self-Registration View
│   ├── patient-dashboard.html     # Patient Portal Dashboard & In-App Alerts
│   ├── patient-profile.html       # Patient Profile Viewer & Editor
│   ├── doctors.html               # Doctor Discovery & Slot Availability View
│   ├── appointments.html          # Patient Appointment History & Actions
│   ├── medical-records.html       # Patient Clinical Medical Records View
│   ├── doctor-dashboard.html     # Doctor Workstation Dashboard Overview
│   ├── doctor-profile.html       # Doctor Profile & Availability Settings
│   ├── doctor-appointments.html  # Doctor Consultation Schedule View
│   ├── doctor-consultation.html  # Doctor Clinical Consultation & Notes Form
│   ├── doctor-records.html       # Doctor Authored Clinical Records View
│   ├── admin/
│   │   ├── index.html             # Admin Command Console Dashboard
│   │   ├── patients.html          # Admin Patient Management Page
│   │   ├── doctors.html           # Admin Doctor Onboarding & Roster Page
│   │   ├── departments.html       # Admin Department CRUD Management Page
│   │   └── appointments.html      # Admin Global Appointment Overrides Page
│   ├── css/
│   │   ├── style.css              # Core Design Tokens & Visual Styles
│   │   ├── components.css         # Reusable Cards, Buttons, Status Pills, Modals
│   │   └── responsive.css         # Responsive Breakpoints (375px, 768px, 1024px, 1440px)
│   ├── js/
│   │   ├── config.js              # API Base URL & Environment Settings
│   │   ├── api.js                 # Central Fetch Wrapper (`credentials: 'include'`)
│   │   ├── auth.js                # Auth State & Session Guard
│   │   ├── patient.js             # Patient Portal Client Controller (`PatientApp.initDashboard()`)
│   │   ├── doctor.js              # Doctor Workstation Client Controller
│   │   ├── admin.js               # Admin Console Client Controller
│   │   ├── ui.js                  # Toast Alerts, Modals & Formatters
│   │   └── main.js                # App Initializer & Status Checker
│   └── assets/images/logo.svg     # CareNova Health Vector Logo
├── server/
│   ├── config/
│   │   └── db.js                  # MySQL Connection Pool (`mysql2/promise`)
│   ├── controllers/
│   │   ├── authController.js      # Auth Handlers (Register, Login, Logout, Me)
│   │   ├── patientController.js   # Patient Profile Handlers
│   │   ├── departmentController.js# Department Handlers
│   │   ├── doctorController.js    # Doctor Discovery, Profile & Workstation Handlers
│   │   ├── appointmentController.js# Booking, Reschedule, Cancellation & Conflict Check
│   │   ├── medicalRecordController.js# Patient & Doctor Medical Record Handlers
│   │   ├── adminController.js     # Admin Console Analytics, Roster & Overrides
│   │   ├── testController.js      # Protected Test Handlers for RBAC
│   │   └── healthController.js    # System Health Check Handler
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT HttpOnly Cookie Authenticator
│   │   ├── roleMiddleware.js      # Role Authorization Guard (`requireRole`)
│   │   └── errorMiddleware.js     # 404 & Express Centralized Error Handler
│   ├── routes/
│   │   ├── authRoutes.js          # /api/auth Endpoints
│   │   ├── patientRoutes.js       # /api/patients Endpoints
│   │   ├── departmentRoutes.js    # /api/departments Endpoints
│   │   ├── doctorRoutes.js        # /api/doctors Endpoints
│   │   ├── appointmentRoutes.js   # /api/appointments Endpoints
│   │   ├── medicalRecordRoutes.js # /api/medical-records Endpoints
│   │   ├── adminRoutes.js        # /api/admin Endpoints
│   │   ├── testRoutes.js          # /api/test Endpoints
│   │   └── healthRoutes.js        # /api/health Endpoints
│   ├── .env.example               # Environment Variables Template
│   ├── app.js                     # Express Application Setup & Route Registration
│   ├── server.js                  # HTTP Server Listener (Port 5000)
│   └── package.json               # Server Node Dependencies
├── database/
│   ├── schema.sql                 # MySQL Relational Database DDL Schema
│   └── seed.sql                   # Demonstration Seed Data Script
├── postman/
│   ├── CareNova_API_Collection.json # Postman API Test Collection
│   └── README.md                  # Postman Verification Guide
├── scratch/                       # Temporary QA scripts & utility logs
├── walkthrough.md                 # Complete Verification & Master Integration Walkthrough
├── implementation_plan.md         # Technical Master Specification
└── README.md                      # Phase 3F Master Documentation
```

---

## 4. Implemented API Endpoints Overview

Every endpoint listed below (47 active API endpoints in total across 7 route modules) is verified against the actual route implementation in `server/routes/`.

### 4.1 System & Authentication Endpoints
| Method | Endpoint | Auth / Role | Purpose |
|---|---|---|---|
| `GET` | `/api/health` | Public | System health & MySQL connection pool status |
| `POST` | `/api/auth/register` | Public | Patient self-registration (creates `users` & `patients` records) |
| `POST` | `/api/auth/login` | Public | User login & HttpOnly JWT cookie issuance (`SameSite=Lax`) |
| `POST` | `/api/auth/logout` | Public | User logout & session cookie clearance |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current session user profile & assigned role |

### 4.2 Patient Endpoints (`/api/patients`)
| Method | Endpoint | Auth / Role | Purpose |
|---|---|---|---|
| `GET` | `/api/patients/me` | `patient` | Retrieve authenticated patient profile details |
| `PUT` | `/api/patients/me` | `patient` | Update authenticated patient profile (phone, address, emergency contact) |

### 4.3 Department Endpoints (`/api/departments`)
| Method | Endpoint | Auth / Role | Purpose |
|---|---|---|---|
| `GET` | `/api/departments` | Public / `patient` | List all active clinical departments with doctor counts |

### 4.4 Doctor Endpoints (`/api/doctors`)
| Method | Endpoint | Auth / Role | Purpose |
|---|---|---|---|
| `GET` | `/api/doctors` | Public / `patient` | Search and filter active doctors roster by department/keyword |
| `GET` | `/api/doctors/:id` | Public / `patient` | Get detailed public profile of a specific doctor |
| `GET` | `/api/doctors/:id/available-slots` | Public / `patient` | Lookup available time slots for a doctor on a selected date |
| `GET` | `/api/doctors/me` | `doctor` | Retrieve authenticated doctor profile details |
| `PUT` | `/api/doctors/me` | `doctor` | Update doctor profile, bio, and availability settings |
| `GET` | `/api/doctors/me/dashboard` | `doctor` | Retrieve doctor workstation metrics (today's schedule, pending counts) |
| `GET` | `/api/doctors/me/appointments` | `doctor` | Get doctor assigned consultation schedule with status filters |
| `GET` | `/api/doctors/me/appointments/:id` | `doctor` | Get detailed appointment record for patient consultation |
| `PUT` | `/api/doctors/me/appointments/:id/status` | `doctor` | Update appointment status (`Confirmed`, `Completed`, `Cancelled`) |
| `POST` | `/api/doctors/me/appointments/:id/consultation` | `doctor` | Submit clinical diagnostic notes & generate medical record |
| `GET` | `/api/doctors/me/records` | `doctor` | List medical records authored by the logged-in doctor |
| `PUT` | `/api/doctors/me/records/:id` | `doctor` | Update an authored clinical medical record |

### 4.5 Appointment Endpoints (`/api/appointments`)
| Method | Endpoint | Auth / Role | Purpose |
|---|---|---|---|
| `POST` | `/api/appointments` | `patient` | Book new appointment (includes double-booking conflict check) |
| `GET` | `/api/appointments/my` | `patient` | Get authenticated patient appointment history |
| `GET` | `/api/appointments/:id` | `patient` | Get appointment details (server-side ownership check enforced) |
| `PUT` | `/api/appointments/:id/reschedule` | `patient` | Reschedule appointment date and time slot |
| `PUT` | `/api/appointments/:id/cancel` | `patient` | Cancel appointment and release reserved slot |

### 4.6 Medical Record Endpoints (`/api/medical-records`)
| Method | Endpoint | Auth / Role | Purpose |
|---|---|---|---|
| `GET` | `/api/medical-records/my` | `patient` | Get authenticated patient medical records history |
| `GET` | `/api/medical-records/:id` | `patient` | Get medical record details (server-side ownership check enforced) |

### 4.7 Admin Command Console Endpoints (`/api/admin`)
| Method | Endpoint | Auth / Role | Purpose |
|---|---|---|---|
| `GET` | `/api/admin/dashboard-stats` | `admin` | Retrieve system-wide analytics, metrics, and operational counts |
| `GET` | `/api/admin/reports/summary` | `admin` | Retrieve system summary report metrics |
| `GET` | `/api/admin/doctors` | `admin` | List all doctors roster (active and inactive) |
| `POST` | `/api/admin/doctors` | `admin` | Onboard new doctor (creates `users` account and `doctors` profile) |
| `GET` | `/api/admin/doctors/:id` | `admin` | Get detailed doctor profile for administrative review |
| `PUT` | `/api/admin/doctors/:id` | `admin` | Update doctor profile and department assignment |
| `PATCH` | `/api/admin/doctors/:id/status` | `admin` | Toggle doctor active/inactive status |
| `GET` | `/api/admin/patients` | `admin` | List all registered patient accounts |
| `GET` | `/api/admin/patients/:id` | `admin` | Get detailed patient profile for administrative review |
| `PUT` | `/api/admin/patients/:id` | `admin` | Update patient profile information |
| `PATCH` | `/api/admin/patients/:id/status` | `admin` | Toggle patient active/inactive status |
| `GET` | `/api/admin/departments` | `admin` | List all clinical departments |
| `POST` | `/api/admin/departments` | `admin` | Create a new clinical department |
| `PUT` | `/api/admin/departments/:id` | `admin` | Update clinical department details |
| `DELETE` | `/api/admin/departments/:id` | `admin` | Delete clinical department (if unassigned) |
| `GET` | `/api/admin/appointments` | `admin` | List system-wide appointments with multi-criteria filters |
| `GET` | `/api/admin/appointments/:id` | `admin` | Get system-wide appointment details |
| `PATCH` | `/api/admin/appointments/:id/status` | `admin` | Administrative override of appointment status |
| `PUT` | `/api/admin/appointments/:id/reschedule` | `admin` | Administrative reschedule of appointment date/time |
| `DELETE` | `/api/admin/appointments/:id/cancel` | `admin` | Administrative cancellation of appointment |

---

## 5. System Notifications & In-App Alerts

The CareNova Health application implements client-side and server-backed notification mechanisms for real-time user feedback:
- **In-App Appointment & Status Alerts:** UI toast notifications (`ui.js`) and status alert banners notify patients, doctors, and admins upon successful booking, rescheduling, status changes, or validation errors.
- **Upcoming Appointment Reminders:** Handled on the patient dashboard (`PatientApp.initDashboard()`), highlighting appointments scheduled within the upcoming 48 hours.
- **Audit Visibility:** Admin endpoints provide system-wide visibility of appointment records, their current statuses, creation/update timestamps, and operational metrics. A separate historical status-transition audit log is not implemented, and no `audit_logs` table was introduced.
- **External Notifications Notice:** Integration with external SMS or email gateways (e.g., Twilio, SendGrid) remains out of scope for demonstration purposes.

---

## 6. Setup & Local Development Instructions

### Prerequisites
- **Node.js:** v18+ installed
- **MySQL Server:** v8.0+ running on `127.0.0.1:3306`

### 1. Database Initialization
Execute the DDL schema and seed scripts in MySQL:
```sql
SOURCE Major-Project/database/schema.sql;
SOURCE Major-Project/database/seed.sql;
```

### 2. Environment Configuration
Copy `.env.example` to `.env` in `Major-Project/server/`:
```bash
cp Major-Project/server/.env.example Major-Project/server/.env
```
Ensure DB credentials (`DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`) match your local environment.

### 3. Backend Server Execution
```bash
cd Major-Project/server
npm install
npm start
```
The Express server starts on **Port 5000**. Health endpoint available at `http://127.0.0.1:5000/api/health`.

### 4. Frontend Application Access
The Express backend automatically serves the client static application. Access:
- **Landing Page:** [http://127.0.0.1:5000/index.html](http://127.0.0.1:5000/index.html)
- **Login Portal:** [http://127.0.0.1:5000/login.html](http://127.0.0.1:5000/login.html)
- **Patient Dashboard:** [http://127.0.0.1:5000/patient-dashboard.html](http://127.0.0.1:5000/patient-dashboard.html)
- **Doctor Workstation:** [http://127.0.0.1:5000/doctor-dashboard.html](http://127.0.0.1:5000/doctor-dashboard.html)
- **Admin Command Console:** [http://127.0.0.1:5000/admin/index.html](http://127.0.0.1:5000/admin/index.html)

---

## 7. Demo Credentials for Evaluation

All seeded demonstration accounts use password: `demo123`

| Role | Account Email | Password | Primary Interface |
|---|---|---|---|
| **Patient** | `sangeetha.patient@example.com` | `demo123` | Patient Portal Dashboard |
| **Patient 2** | `rahul.verma@example.com` | `demo123` | Patient Portal Dashboard |
| **Doctor** | `sarah.jenkins@carenova.health` | `demo123` | Doctor Workstation |
| **Doctor 2** | `marcus.vance@carenova.health` | `demo123` | Doctor Workstation |
| **Admin** | `admin@carenova.health` | `demo123` | Admin Command Console |

---

## 8. Implementation Roadmap & Completed Milestones

- [x] **Phase 3A — Foundation:** Full-stack architecture, Node.js Express backend, MySQL connection pool (`mysql2/promise`), database DDL schema (`schema.sql`), seed data (`seed.sql`), health check endpoint.
- [x] **Phase 3B — Authentication & RBAC:** User Registration, Login Authentication, `bcryptjs` password hashing, JWT HttpOnly cookie strategy (`SameSite=Lax`), and role authorization middleware (`requireRole`).
- [x] **Phase 3C — Patient Module:** Patient profile management, doctor roster discovery, time slot lookup, appointment booking with double-booking prevention, rescheduling, cancellation, and personal medical history.
- [x] **Phase 3D — Doctor Module:** Doctor workstation dashboard, consultation schedule management, appointment status transitions (`Pending` → `Confirmed` → `Completed` / `Cancelled`), diagnostic consultation entry, and authored medical records tracking.
- [x] **Phase 3E — Admin Module (Commit: `d652ce5`):** Administrative command console, system analytics, doctor onboarding & roster management, patient account management, department CRUD operations, and global appointment overrides.
- [x] **Phase 3F — Master Integration & QA (Commit: `20f6f9d`):** Full system integration testing, end-to-end QA verification (37/37 PASS, 0 FAIL, 0 BLOCKED), and Postman API Master Suite verification (`07_Master_Integration_Suite`, 10/10 PASS).

---

## 9. Phase 3F Verification & QA Results

- **Programmatic Integration QA Suite:** 37/37 tests PASS (`0 FAIL`, `0 BLOCKED`).
- **Postman API Test Collection:** `07_Master_Integration_Suite` verified 10/10 HTTP requests returning correct HTTP status codes (200, 201, 400, 401, 403, 404, 500) and proper payload structures.
- **Security & Authorization:** Tested strict role isolation (Patients cannot access Doctor or Admin routes; Doctors cannot access Admin routes; unauthorized requests rejected with `401 Unauthorized` or `403 Forbidden`).
- **Transaction Safety & Data Integrity:** Verified double-booking prevention (HTTP `409 Conflict`), cascading deletions, foreign key enforcement, and slot release upon cancellation.
