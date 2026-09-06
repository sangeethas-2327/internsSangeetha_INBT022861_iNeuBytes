# iNeuBytes Internship Master Requirements Checklist

**Intern Name:** Sangeetha  
**Registration Number:** INBT022861  
**Course ID:** WBINB10726  
**Repository:** `internsSangeetha_INBT022861_iNeuBytes`  

---

## 🏗️ Phase 0: Master Workspace & Foundation
- [x] Create root workspace directory `internsSangeetha_INBT022861_iNeuBytes`
- [x] Create top-level directories: `Task-1/`, `Task-2/`, `Major-Project/`
- [x] Create root `.gitignore` configuration for Node, MySQL, and environment secrets
- [x] Create professional root `README.md` with internship details & technology stack
- [x] Create master `CHECKLIST.md` tracking all requirements
- [x] Initialize Git repository
- [x] Create initial `README.md` files for Task-1, Task-2, and Major-Project

---

## 🩺 Phase 1: Task 1 — Healthcare / Clinic Landing Page
- [x] Responsive Home Page layout
- [x] Navigation Bar (Logo, links, responsive toggle menu)
- [x] Hero Section with Call-to-Action button
- [x] About the Clinic section (Fictional demonstration overview)
- [x] Medical Services section (Cardiology, Neurology, Pediatrics, Orthopedics, Dermatology, Emergency Care)
- [x] Why Choose Us section (Fictional demonstration differentiators)
- [x] Doctor Highlights section (Fictional demonstration doctors)
- [x] Patient Testimonials section (Fictional demonstration reviews)
- [x] Contact Information section (Fictional demo address, phone, email, hours)
- [x] Google Maps Integration / Embed (Fictional location map iframe)
- [x] Footer with quick links, academic disclaimers, and copyright
- [x] Appointment Enquiry Form:
  - [x] Patient Name field
  - [x] Email Address field
  - [x] Phone Number field
  - [x] Preferred Department field
  - [x] Message Box
  - [x] Client-side JavaScript validation (Name, Email, Phone formatting, Error feedback)
- [x] JavaScript Features:
  - [x] Dynamic form validation (real-time & submit validation, 0 backend dependency)
  - [x] Smooth scrolling navigation (`html { scroll-behavior: smooth; }`)
  - [x] Responsive navbar mobile toggle menu with accessibility
- [x] CSS Styling:
  - [x] CareNova Health color palette & visual theme (`#0F4C81`, `#0D9488`)
  - [x] Mobile (375px), tablet (768px), desktop (1440px) responsiveness
  - [x] Button, card, form, and hover interactions
- [x] Task 1 Verification & Testing:
  - [x] Cross-browser static & programmatic QA script validation (0 syntax errors)
  - [x] Form submission validation testing (Success/Error banners)
  - [x] Mobile & tablet breakpoint layout verification

---

## 📅 Phase 2: Task 2 — Doctor Appointment Booking System
- [ ] Home Page / Portal interface
- [ ] Doctor Listings view
- [ ] Doctor Search functionality (by name / keyword)
- [ ] Department Filter dropdown/buttons
- [ ] Doctor Profile modal / detailed view (Name, Department, Experience, Time slots, Consultation Fee)
- [ ] Appointment Booking Form:
  - [ ] Patient details entry
  - [ ] Selected doctor auto-fill / confirmation
  - [ ] Date picker selection
  - [ ] Available time slot selector
  - [ ] Booking confirmation state
- [ ] Appointment Summary dynamic display
- [ ] Appointment History (Frontend view with LocalStorage persistence)
- [ ] JavaScript Features:
  - [ ] Search and filter logic
  - [ ] Dynamic time slot availability update
  - [ ] Appointment state management & LocalStorage persistence
  - [ ] Form validation
- [ ] Task 2 Verification & Testing:
  - [ ] End-to-end booking workflow verification
  - [ ] Filter & search accuracy verification
  - [ ] LocalStorage persistence check

---

## 🏥 Phase 3: Major Project — Healthcare / Clinic Management System
### Architecture & Setup
- [ ] Database Schema Design (MySQL normalized tables with primary & foreign key constraints)
- [ ] Node.js Express REST API backend architecture
- [ ] Modular HTML5/CSS3/JS Frontend structure
- [ ] Environment variable security (`.env.example` safe configuration template)

### User Authentication & Security
- [ ] User registration endpoint & page
- [ ] Secure user login endpoint & page
- [ ] Password hashing (no plain text storage)
- [ ] Secure token/session handling
- [ ] Role-Based Access Control (RBAC) middleware:
  - [ ] Patient role authorization
  - [ ] Doctor role authorization
  - [ ] Admin role authorization

### Patient Module
- [ ] Patient Dashboard overview
- [ ] Patient profile management & update
- [ ] Book new appointment interface
- [ ] View patient appointment history
- [ ] View medical / consultation records
- [ ] Upcoming appointment notifications

### Doctor Module
- [ ] Doctor Dashboard overview
- [ ] Doctor profile & availability management
- [ ] Assigned department display
- [ ] Consultation schedule view
- [ ] Patient consultation history view
- [ ] Update appointment consultation status (Pending, Confirmed, Completed, Cancelled)

### Admin Module
- [ ] Admin Dashboard with overall stats & analytics
- [ ] Manage Patients (View, Update, Delete)
- [ ] Manage Doctors (View, Create, Assign Department, Update, Delete)
- [ ] Manage Appointments (View, Reschedule, Cancel, Reassign)
- [ ] Manage Departments (Create, Edit, Delete)
- [ ] System reports overview

### Department Management
- [ ] Create & update departments
- [ ] Assign doctors to departments
- [ ] Department-wise doctor listings

### Appointment Lifecycle & CRUD
- [ ] Book appointment
- [ ] Reschedule appointment
- [ ] Cancel appointment
- [ ] Status transitions: `Pending` → `Confirmed` → `Completed` / `Cancelled`
- [ ] Double-booking & slot validation logic

---

## 🧪 Phase 4: Full-Stack Testing & Postman API Verification
- [ ] Postman API Test Suite:
  - [ ] Auth endpoints (Register, Login, Invalid credentials, Token check)
  - [ ] User & Profile CRUD endpoints
  - [ ] Doctor & Department endpoints
  - [ ] Appointment CRUD endpoints
  - [ ] Validation failure & boundary tests (400, 401, 403, 404, 500 status codes)
- [ ] Frontend integration testing:
  - [ ] Form validations
  - [ ] API error handling & user alert feedback
  - [ ] Cross-browser UI check
  - [ ] Mobile & tablet layout verification

---

## 📝 Phase 5 & 6: Documentation, GitHub & Audit
- [ ] Task 1 README detailed documentation
- [ ] Task 2 README detailed documentation
- [ ] Major Project README detailed architecture & DB schema documentation
- [ ] Comprehensive Google Doc draft covering Task 1, Task 2, Major Project (Objectives, Architecture, Screenshots, Test Results, Learnings)
- [ ] One single GitHub repository check (`internsSangeetha_INBT022861_iNeuBytes`)
- [ ] Clean folder structure audit (`Task-1/`, `Task-2/`, `Major-Project/`)
- [ ] No hardcoded credentials or `.env` secrets in git commits

---

## 🎥 Phase 7 & 8: Demonstration Videos & P1 Submission
- [ ] Task 1 demonstration video recording
- [ ] Task 2 demonstration video recording
- [ ] Major Project demonstration video recording
- [ ] Final requirement audit & P1 checklist verification
- [ ] Public Google Doc link preparation
- [ ] Public GitHub repository link preparation
