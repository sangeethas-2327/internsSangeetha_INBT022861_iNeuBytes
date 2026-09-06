# CareNova Health — Full-Stack Healthcare Management System
## iNeuBytes Web Development Internship — Major Project Phase 3A Foundation

**Intern Name:** Sangeetha  
**Registration Number:** INBT022861  
**Course ID:** WBINB10726  
**Repository:** `internsSangeetha_INBT022861_iNeuBytes`  
**Brand Identity:** CareNova Health (Fictional Demonstration Healthcare System)  
**Status:** Phase 3A Foundation Established & Verified  

---

## 1. Project Overview

**CareNova Health Management System** is a full-stack web application developed as the capstone Major Project for the iNeuBytes Web Development Virtual Internship. 

The system provides a unified platform for Healthcare Administration across three user roles:
- **Patients:** Browse medical specialists, book/reschedule/cancel appointments, view reminders, and access medical history.
- **Doctors:** Manage daily consultation schedules, view assigned patients, update appointment statuses, and record clinical diagnostic notes.
- **Admins:** View aggregate analytics, onboard doctors, manage clinical departments, and oversee system-wide appointments.

> [!NOTE]
> **Phase 3A Status:** This release establishes the full-stack project foundation (directory structure, Express backend server, health-check API, MySQL schema DDL, demo seed data, environment template, and client landing shell). Business modules (Authentication, JWT, RBAC, Dashboards, and CRUD endpoints) are planned for controlled implementation in subsequent phases.

---

## 2. Technology Stack

- **Frontend:** HTML5, Vanilla CSS3 (Custom Design System, Zero Frameworks), Vanilla JavaScript (ES6+)
- **Backend:** Node.js, Express.js (Layered MVC Architecture: Routes, Controllers, Middleware, Services, DB Pool)
- **Database:** MySQL Relational Database (`mysql2/promise` connection pool)
- **Environment & Tools:** `dotenv`, `cors`, Postman (API verification)

---

## 3. Directory Structure

```
Major-Project/
├── client/
│   ├── index.html                 # Frontend Landing Shell & Health Monitor
│   ├── css/
│   │   ├── style.css              # Core Visual Tokens & Base Theme
│   │   ├── components.css         # Reusable Cards, Buttons, Status Pills
│   │   └── responsive.css         # Media Queries (375px, 768px, 1024px, 1440px)
│   ├── js/
│   │   ├── config.js              # API Base URL & Environment Config
│   │   ├── api.js                 # Fetch API Client Wrapper
│   │   ├── ui.js                  # Health Status Card Renderer & Nav Handlers
│   │   └── main.js                # App Initializer Script
│   └── assets/
│       └── images/
│           └── logo.svg           # CareNova Health SVG Vector Logo
├── server/
│   ├── config/
│   │   └── db.js                  # MySQL Connection Pool (mysql2/promise)
│   ├── controllers/
│   │   └── healthController.js    # Health Check API Handler
│   ├── middleware/
│   │   └── errorMiddleware.js     # 404 & Centralized Express Error Handler
│   ├── routes/
│   │   └── healthRoutes.js        # /api/health Route Definition
│   ├── services/                  # Business Logic Services Placeholder
│   ├── models/                    # Data Model Placeholders
│   ├── .env.example               # Environment Configuration Template
│   ├── app.js                     # Express Application Setup
│   ├── server.js                  # HTTP Server Entry Point (Port 5000)
│   └── package.json               # Backend Node Dependencies
├── database/
│   ├── schema.sql                 # Complete MySQL Relational Table DDL
│   └── seed.sql                   # Fictional Demonstration Seed Data
├── postman/
│   └── README.md                  # API Test Suite Setup Guide
├── .env.example                   # Root Environment Template
├── .gitignore                     # Git Exclusions (.env, node_modules)
├── README.md                      # Phase 3A Documentation
└── implementation_plan.md         # Master Implementation Specification
```

---

## 4. Setup & Installation Instructions

### Prerequisites
- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **MySQL Server:** v8.0 or higher (or MariaDB equivalent)

---

### Step 1: Backend Setup
1. Navigate to the server directory:
   ```bash
   cd Major-Project/server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create environment configuration file:
   ```bash
   cp .env.example .env
   ```
4. Configure `.env` with your local MySQL credentials:
   ```env
   PORT=5000
   CLIENT_ORIGIN=http://127.0.0.1:8080
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=carenova_health_db
   ```

---

### Step 2: Database Setup (MySQL)
1. Open your MySQL client or terminal:
   ```bash
   mysql -u root -p
   ```
2. Execute the schema DDL script:
   ```sql
   SOURCE Major-Project/database/schema.sql;
   ```
3. Import demonstration seed data:
   ```sql
   SOURCE Major-Project/database/seed.sql;
   ```

---

### Step 3: Running the Express Backend Server
From `Major-Project/server/`:
```bash
npm start
```
*Expected Server Terminal Output:*
```text
================================================================
  CareNova Health Express Backend Server Started               
  Port: 5000
  Environment: development
  Health Endpoint: http://localhost:5000/api/health
================================================================
  [DB Status]: MySQL Database pool connected successfully
================================================================
```

---

### Step 4: Accessing the Frontend
Open `Major-Project/client/index.html` in your web browser or serve `Major-Project/client/` using a local HTTP server:
```bash
# Example using npx http-server from workspace root
http://127.0.0.1:8080/Major-Project/client/index.html
```

---

## 5. Health Check API Endpoint Verification

- **Endpoint:** `GET http://localhost:5000/api/health`
- **Response Format (JSON):**
  ```json
  {
    "success": true,
    "message": "CareNova Health API is running",
    "version": "1.0.0-phase3a",
    "environment": "development",
    "timestamp": "2026-09-06T18:30:00.000Z",
    "database": "connected",
    "databaseNotice": "MySQL Database pool connected successfully"
  }
  ```

---

## 6. Implementation Roadmap & Upcoming Phases

- [x] **Phase 3A (Current):** Full-stack project foundation, Express backend server, health endpoint, MySQL DDL schema, seed data, client shell.
- [ ] **Phase 3B (Next):** User Registration, Login Authentication, `bcryptjs` password hashing, JWT token authorization, and RBAC middleware.
- [ ] **Phase 3C:** Patient Portal (Doctor search, booking, rescheduling, medical history) & Doctor Portal (Schedule manager, status updates, clinical notes).
- [ ] **Phase 3D:** Admin Command Console (Doctor onboarding, patient management, department CRUD, analytics).
- [ ] **Phase 3E:** Complete Postman Collection, Automated QA, and final internship deliverables.
