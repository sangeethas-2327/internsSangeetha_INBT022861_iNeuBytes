# Task 2: Doctor Appointment Booking System

**Project Name:** CareNova Health Appointment Booking Portal  
**Intern Name:** Sangeetha  
**Registration Number:** INBT022861  
**Course ID:** WBINB10726  

---

## 🎯 Objective
Develop a responsive, interactive Doctor Appointment Booking System for **CareNova Health**. The system allows patients to browse doctor listings, search specialists by keyword, filter doctors by medical department, view detailed doctor profiles, book appointments with dynamic date and time slot selection, receive instant confirmation receipts, and manage appointment history (reschedule & cancel) with browser `LocalStorage` persistence.

---

## 🛠️ Technology Stack
- **HTML5:** Semantic markup structure (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<dialog>`, `<footer>`).
- **CSS3:** Custom responsive design system, CareNova theme tokens (`#0F4C81`, `#0D9488`), card layouts, modal dialog overlays, slot picker buttons, and breakpoint media queries.
- **JavaScript (Vanilla ES6+):** Dynamic doctor search, department filter pills, interactive time slot generator, client-side form validation, modal state management, and LocalStorage CRUD data handling.
- **Browser LocalStorage:** Storage key `carenova_appointments` storing structured JSON appointment records.

---

## 📁 Directory Structure
```
Task-2/
├── README.md               # Task 2 documentation
├── index.html              # Main application single-page interface
├── css/
│   ├── style.css           # Core styles, cards, search & filter bars
│   ├── booking.css         # Booking modal, time slot picker, confirmation receipt
│   └── responsive.css      # Media queries for 375px, 768px, 1024px, 1440px
├── js/
│   ├── doctors.js          # Doctor dataset (6 specialists) & metadata query helpers
│   ├── storage.js          # LocalStorage CRUD helper methods & conflict checker
│   ├── booking.js          # Modal workflow, time slot generator, & form validator
│   └── app.js              # Main application controller, search listener, & history view
└── assets/
    └── images/
        └── logo.svg        # CareNova Health Booking SVG logo
```

---

## 🔄 User Workflow
1. **Browse Doctors:** View doctor listing cards featuring 5 mandatory fields: Doctor Name, Department, Experience, Available Slots, and Consultation Fee.
2. **Search & Filter:** Search by doctor name or specialty, or click department filter pills (`Cardiology`, `Neurology`, `Pediatrics`, `Orthopedics`, `Dermatology`, `General Medicine`).
3. **View Profile & Book:** Click "Book Appointment" to open the interactive booking modal.
4. **Select Date & Time Slot:** Select an appointment date (min = today) and pick an available time slot. Already-booked slots on that date are disabled.
5. **Client-Side Validation:** Enter Patient Name, Email, Phone Number, Age, and Gender. JavaScript validates format and required fields.
6. **Instant Confirmation Receipt (CREATE / READ):** View booking summary modal with reference ID (e.g. `CNH-2026-8942`).
7. **Appointment History (READ, UPDATE, DELETE):**
   - **Reschedule (UPDATE):** Select a new date and time slot. Updates appointment status to `Rescheduled` while preserving the same reference ID. Self-conflict is automatically excluded.
   - **Cancel (DELETE):** Changes status to `Cancelled` and releases reserved time slot for re-booking.

---

## 🚦 How to Run
Open `Task-2/index.html` directly in any modern web browser or serve via any static HTTP server.
