# Task 2: Doctor Appointment Booking System

**Project Name:** CareNova Health Appointment Booking Portal  
**Intern Name:** Sangeetha  
**Registration Number:** INBT022861  
**Course ID:** WBINB10726  

---

## 🎯 Objective
Develop an interactive frontend web application allowing patients to search and filter doctors by department, view detailed doctor profiles, book appointments with dynamic date and time slot selection, view instant booking summaries, and persist appointment history using browser LocalStorage.

---

## 🛠️ Technology Stack
- **HTML5:** Semantic UI templates and accessibility attributes.
- **CSS3:** Responsive layout, card designs, modal overlays, form styling, and interactive states.
- **JavaScript (Vanilla ES6+):** Client-side application state, department filtering, keyword search, dynamic time slot management, form validation, and LocalStorage data handling.

---

## 📁 Directory Structure
```
Task-2/
├── README.md           # Task 2 documentation
├── index.html          # Booking portal main interface
├── css/
│   ├── style.css       # Core layout and component styling
│   └── booking.css     # Booking form, modal, and appointment history styles
├── js/
│   ├── doctors.js      # Fictional doctor database & dataset
│   ├── app.js          # Main app initialization, search, and filtering
│   ├── booking.js      # Booking modal workflow and slot selection
│   └── storage.js      # LocalStorage helper functions for appointment history
└── assets/
    └── images/         # Doctor photos and department icons
```

---

## 🔁 User Workflow
1. **Browse / Search Doctors:** Filter doctors by department (Cardiology, Neurology, Pediatrics, Orthopedics, General Medicine) or search by keyword.
2. **View Doctor Profile:** Inspect experience, qualifications, consultation fees, and available days.
3. **Book Appointment:** Click "Book Appointment", fill in patient details, select date and available time slot.
4. **Instant Confirmation:** View appointment summary modal with generated reference ID.
5. **Appointment History:** Review past and upcoming bookings stored in LocalStorage.
