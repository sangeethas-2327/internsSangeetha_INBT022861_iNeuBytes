# CareNova Health — Full-Stack Healthcare Management System
## iNeuBytes Web Development Internship — Major Project Phase 3C Patient Module

**Intern Name:** Sangeetha  
**Registration Number:** INBT022861  
**Course ID:** WBINB10726  
**Repository:** `internsSangeetha_INBT022861_iNeuBytes`  
**Brand Identity:** CareNova Health (Fictional Demonstration Healthcare System)  
**Status:** Phase 3C Patient Module Implemented & Verified  

---

## 1. Project Overview

**CareNova Health Management System** is a full-stack web application developed as the capstone Major Project for the iNeuBytes Web Development Virtual Internship. 

The system provides a unified platform for Healthcare Administration across three user roles:
- **Patients:** Browse medical specialists, book/reschedule/cancel appointments, view reminders, edit profile, and access personal medical history.
- **Doctors:** Manage daily consultation schedules, view assigned patients, update appointment statuses, and record clinical diagnostic notes.
- **Admins:** View aggregate analytics, onboard doctors, manage clinical departments, and oversee system-wide appointments.

> [!NOTE]
> **Phase 3C Status:** This release implements the complete **Patient Module**:
> - Patient Profile viewing and updating (`GET/PUT /api/patients/me`).
> - Department listing (`GET /api/departments`).
> - Doctor discovery, filtering, and time slot lookup (`GET /api/doctors`, `GET /api/doctors/:id/available-slots`).
> - Appointment booking with double-booking conflict prevention (`POST /api/appointments`).
> - Appointment history (`GET /api/appointments/my`).
> - Appointment rescheduling (`PUT /api/appointments/:id/reschedule`).
> - Appointment cancellation & slot release (`PUT /api/appointments/:id/cancel`).
> - Patient-side medical records viewing (`GET /api/medical-records/my`).
> - Strict server-side ownership enforcement (`req.user.id -> patient.user_id`).
> - Frontend Patient Portal views (`patient-dashboard.html`, `patient-profile.html`, `doctors.html`, `appointments.html`, `medical-records.html`).

---

## 2. Technology Stack

- **Frontend:** HTML5, Vanilla CSS3 (Custom Design System, Zero Frameworks), Vanilla JavaScript (ES6+)
- **Backend:** Node.js, Express.js (Layered MVC Architecture: Routes, Controllers, Middleware, Services, DB Pool)
- **Database:** MySQL Relational Database (`mysql2/promise` connection pool)
- **Authentication & Security:** `bcryptjs`, `jsonwebtoken` (HttpOnly Cookie strategy), `cookie-parser`, `cors` (`credentials: true`)
- **Testing & Tooling:** Postman API verification, Node.js automated test suites

---

## 3. Directory Structure

```
Major-Project/
├── client/
│   ├── index.html                 # Main Landing Page & Health Status Monitor
│   ├── login.html                 # Unified Authentication Login View
│   ├── register.html              # Patient Self-Registration View
│   ├── patient-dashboard.html     # Patient Portal Dashboard & Notifications
│   ├── patient-profile.html       # Patient Profile Viewer & Editor
│   ├── doctors.html               # Doctor Discovery & Slot Booking View
│   ├── appointments.html          # Patient Appointment History & Reschedule/Cancel
│   ├── medical-records.html       # Patient Clinical Medical Records View
│   ├── css/
│   │   ├── style.css              # Core Design Tokens & Visual Styles
│   │   ├── components.css         # Reusable Cards, Buttons, Status Pills, Modals
│   │   └── responsive.css         # Responsive Breakpoints (375px, 768px, 1024px, 1440px)
│   ├── js/
│   │   ├── config.js              # API Base URL & Environment Settings
│   │   ├── api.js                 # Central Fetch Wrapper (`credentials: 'include'`)
│   │   ├── auth.js                # Auth State & Session Guard
│   │   ├── patient.js             # Patient Portal Client Controller
│   │   ├── ui.js                  # Toast Alerts, Modals & Formatters
│   │   └── main.js                # App Initializer
│   └── assets/images/logo.svg     # CareNova Health Vector Logo
├── server/
│   ├── config/db.js               # MySQL Connection Pool (`mysql2/promise`)
│   ├── controllers/
│   │   ├── authController.js      # Auth Handlers (Register, Login, Logout, Me)
│   │   ├── patientController.js   # Profile Management Handlers
│   │   ├── departmentController.js# Department Browsing Handlers
│   │   ├── doctorController.js    # Doctor Discovery & Slot Availability Handlers
│   │   ├── appointmentController.js# Booking, Rescheduling, Conflict Check & Cancellation
│   │   ├── medicalRecordController.js# Patient Medical Record Handlers
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
│   ├── CareNova_API_Collection.json # Postman API Test Suite
│   └── README.md                  # Postman Verification Guide
├── README.md                      # Phase 3C Documentation
└── implementation_plan.md         # Master Implementation Specification
```

---

## 4. Patient Module API Endpoints Overview

| Method | Endpoint | Authorization | Description |
|---|---|---|---|
| `GET` | `/api/patients/me` | `patient` | Retrieve authenticated patient profile |
| `PUT` | `/api/patients/me` | `patient` | Update authenticated patient profile |
| `GET` | `/api/departments` | Public / `patient` | List active clinical departments |
| `GET` | `/api/doctors` | Public / `patient` | Search and filter active doctors roster |
| `GET` | `/api/doctors/:id` | Public / `patient` | Get detailed doctor profile |
| `GET` | `/api/doctors/:id/available-slots` | Public / `patient` | Get doctor available time slots for a given date |
| `POST` | `/api/appointments` | `patient` | Book appointment (Conflict check: 409 if reserved) |
| `GET` | `/api/appointments/my` | `patient` | Get authenticated patient appointment history |
| `GET` | `/api/appointments/:id` | `patient` | Get appointment details (Ownership check: 403 if unowned) |
| `PUT` | `/api/appointments/:id/reschedule` | `patient` | Reschedule appointment date and time slot |
| `PUT` | `/api/appointments/:id/cancel` | `patient` | Cancel appointment and release booked slot |
| `GET` | `/api/medical-records/my` | `patient` | Get authenticated patient medical records history |
| `GET` | `/api/medical-records/:id` | `patient` | Get medical record details (Ownership check: 403 if unowned) |

---

## 5. Demo Credentials (Development & Evaluation)

All seeded accounts use password: `demo123`

- **Patient Demo Account:** `sangeetha.patient@example.com` / `demo123`
- **Patient Demo Account 2:** `rahul.verma@example.com` / `demo123`
- **Doctor Demo Account:** `sarah.jenkins@carenova.health` / `demo123`
- **Admin Demo Account:** `admin@carenova.health` / `demo123`

---

## 6. Implementation Roadmap & Status

- [x] **Phase 3A:** Full-stack project foundation, Express backend server, health endpoint, MySQL DDL schema, seed data, client shell.
- [x] **Phase 3B:** User Registration, Login Authentication, `bcryptjs` password hashing, JWT token authorization, HttpOnly cookie strategy, and RBAC middleware.
- [x] **Phase 3C (Current):** Patient Module (Profile management, doctor/department browsing, appointment booking, double-booking conflict prevention, rescheduling, cancellation, and medical records).
- [ ] **Phase 3D (Next):** Doctor Module (Schedule manager, patient list, consultation status updates, clinical notes).
- [ ] **Phase 3E:** Admin Command Console (Doctor onboarding, patient management, department CRUD, system analytics).
- [ ] **Phase 3F:** Postman Collection updates, Automated QA, and final internship deliverables.
