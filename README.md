# iNeuBytes Internship Projects

**Organization:** iNeuBytes Technology & Services Private Limited  
**Intern:** Sangeetha  
**Registration Number:** INBT022861  
**Course ID:** WBINB10726  
**Internship Domain:** Web Development  
**Duration:** 24-08-2026 to 23-09-2026  

---

## 🛠️ Official Technology Stack

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla JS ES6+)
- **Backend:** Node.js (Major Project)
- **Database:** MySQL (Major Project)
- **API Testing:** Postman (Major Project)

---

## 🏥 Fictional Brand Identity: CareNova Health

Across all three projects, a unified, professional fictional healthcare brand identity is maintained: **CareNova Health**.

- **Brand Focus:** Modern, trustworthy, accessible healthcare and clinical services.
- **Design Language:** Clean medical palette (deep blue, soothing teal, soft gray backgrounds), high contrast, clear typography hierarchy, responsive card layouts, accessible forms, and subtle visual transitions.
- **Fictional Data:** All doctor profiles, departments, schedules, consultation fees, and patient testimonials are fictional sample data for demonstration purposes.

---

## 📂 Repository Structure

```
internsSangeetha_INBT022861_iNeuBytes/
│
├── README.md                   # Root documentation and project overview
├── CHECKLIST.md                # Comprehensive requirements tracking checklist
├── .gitignore                  # Git ignore rules for Node, MySQL, and environment secrets
│
├── Task-1/                     # Healthcare / Clinic Landing Page
│   ├── README.md               # Task 1 specific documentation
│   ├── index.html              # Landing page main HTML markup
│   ├── css/                    # Task 1 CSS stylesheets
│   ├── js/                     # Task 1 JavaScript logic
│   └── assets/                 # Task 1 images, icons, and graphic resources
│
├── Task-2/                     # Doctor Appointment Booking System
│   ├── README.md               # Task 2 specific documentation
│   ├── index.html              # Booking system main interface
│   ├── css/                    # Task 2 stylesheets
│   ├── js/                     # Task 2 JavaScript modules
│   └── assets/                 # Task 2 icons and visual assets
│
└── Major-Project/              # Healthcare / Clinic Management System
    ├── README.md               # Major Project detailed documentation
    ├── frontend/               # Full-stack frontend application (HTML/CSS/JS)
    ├── backend/                # Node.js backend server and REST API routes
    ├── database/               # MySQL schema scripts and seed data
    └── assets/                 # Shared media assets and diagrams
```

---

## 🚀 Projects Summary

### 1. Task-1 — Healthcare / Clinic Landing Page
A responsive clinic landing page for CareNova Health showcasing clinic overview, medical services, doctor highlights, patient testimonials, interactive contact information, Google Maps embed placeholder/integration, and a client-side validated appointment enquiry form.

### 2. Task-2 — Doctor Appointment Booking System
An interactive frontend web application allowing users to browse doctors, filter by department, search by doctor name/specialty, view detailed doctor profiles, book appointments with dynamic date/time slot selection, and manage appointment history using LocalStorage persistence.

### 3. Major-Project — Healthcare / Clinic Management System
A full-stack web application featuring role-based access control (Patient, Doctor, Administrator), secure authentication, complete CRUD operations for appointments, departments, patient records, and doctor schedules, powered by a Node.js REST API backend and a normalized MySQL database.

---

## 📋 Development Progression

1. **Phase 0:** Master Workspace Setup, Git Initialization, Folder Structure & Baseline Documentation.
2. **Phase 1 (Task-1):** Healthcare Landing Page implementation, responsive layout design, form validation, and verification.
3. **Phase 2 (Task-2):** Doctor Appointment Booking System implementation, filtering, state management, and user history verification.
4. **Phase 3 (Major Project):** Database design, Node.js backend architecture, RBAC authentication, frontend integration, and API testing.
5. **Phase 4:** Full-system integration testing and cross-browser quality assurance.
6. **Phase 5:** Comprehensive Google Doc documentation preparation.
7. **Phase 6:** Repository cleanup and final audit.
8. **Phase 7:** Demonstration video production.
9. **Phase 8:** Formal P1 Submission Preparation.

---

## 💻 Setup & Local Development Instructions

### Task 1 & Task 2
- Open `Task-1/index.html` or `Task-2/index.html` directly in any modern web browser or run a simple local HTTP server (e.g. `npx serve` or Live Server).

### Major Project (Full-Stack)
1. **Prerequisites:** Node.js (v18+) and MySQL Server installed.
2. **Database Setup:** Execute `Major-Project/database/schema.sql` in MySQL to initialize tables and sample seed data.
3. **Environment Setup:** Copy `Major-Project/backend/.env.example` to `Major-Project/backend/.env` and update your MySQL connection credentials.
4. **Backend Server:**
   ```bash
   cd Major-Project/backend
   npm install
   npm run dev
   ```
5. **Frontend Application:** Open `Major-Project/frontend/index.html` or serve via HTTP server.

---

## 🧪 Testing Information

- **Frontend Validation:** Responsive layout testing across Mobile (370px-480px), Tablet (768px-1024px), and Desktop (1200px+). Form validation tests for input formats, required fields, and boundary cases.
- **Backend API Testing:** Postman test suites validating HTTP status codes (200, 201, 400, 401, 403, 404, 500), JWT authentication token flow, payload validation, and SQL transaction safety.

---

## 🔮 Future Scope

- Integration with telemedicine video consultation platforms.
- Automated SMS and email reminder notifications for patients.
- Payment gateway integration for online consultation fee settlement.
- Advanced clinical analytics dashboards with graphical reporting.
