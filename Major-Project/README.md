# Major Project: Healthcare / Clinic Management System

**Project Name:** CareNova Health Enterprise Management System  
**Intern Name:** Sangeetha  
**Registration Number:** INBT022861  
**Course ID:** WBINB10726  

---

## 🎯 Objective
Develop a complete full-stack Healthcare and Clinic Management System enabling patients to register, log in, book appointments, and view medical records; doctors to manage schedules, view patient details, and record consultation notes; and clinic administrators to manage doctors, patients, departments, appointments, and view clinical analytics.

---

## 🛠️ Technology Stack
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla ES6+)
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **API Testing:** Postman Test Suite

---

## 📁 Directory Structure
```
Major-Project/
├── README.md               # Major Project detailed documentation
├── frontend/               # Single Page / Multi-Page dashboard interfaces
│   ├── css/                # Global and dashboard stylesheets
│   ├── js/                 # API client, auth service, dashboard logic
│   └── pages/              # Patient, Doctor, Admin dashboards & auth pages
├── backend/                # Node.js backend server
│   ├── src/
│   │   ├── config/         # Database connection configuration
│   │   ├── controllers/    # Auth, User, Doctor, Patient, Appointment controllers
│   │   ├── middleware/     # Auth JWT verification and RBAC middleware
│   │   ├── models/         # Database query models
│   │   └── routes/         # Express API route declarations
│   ├── .env.example        # Environment variable safe template
│   ├── package.json        # Dependencies (express, mysql2, bcryptjs, jsonwebtoken, etc.)
│   └── server.js           # Server entry point
├── database/
│   ├── schema.sql          # MySQL database DDL table definitions
│   └── seeds.sql           # Initial sample seed data for testing
└── assets/                 # Architecture diagrams and schema ERDs
```

---

## 🔒 Role-Based Access Control (RBAC)
- **Patient Role:** View personal profile, book appointments, view appointment status, view medical records, receive notifications.
- **Doctor Role:** View assigned department schedules, manage appointment statuses (`Confirmed`, `Completed`, `Cancelled`), view patient consultation history.
- **Admin Role:** Full system control — manage doctors, patients, departments, appointments, assign doctors to departments, and view clinic statistics.
