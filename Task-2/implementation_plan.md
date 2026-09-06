# Task 2 Implementation Plan (Refined) — Doctor Appointment Booking System

**Organization:** iNeuBytes Technology & Services Private Limited  
**Intern Name:** Sangeetha (INBT022861)  
**Course ID:** WBINB10726  
**Brand Identity:** CareNova Health (Fictional Demonstration Booking Portal)  
**Target Directory:** `Task-2/`  

---

## 1. Project Objective

Develop a responsive, interactive, and accessible **Doctor Appointment Booking System** for **CareNova Health** using standard HTML5, CSS3, and Vanilla JavaScript.

The application allows users to:
1. Browse a list of fictional CareNova Health doctors across multiple departments.
2. Perform dynamic keyword searches (by doctor name, specialty, or condition).
3. Filter doctor listings by medical department.
4. View detailed doctor profiles containing all mandatory clinical metadata (Doctor Name, Department, Experience, Available Time Slots, and Consultation Fee).
5. Open an interactive booking interface to select an appointment date, available time slot, and enter patient details with real-time client-side validation.
6. Demonstrate full client-side **CRUD operations** (Create booking, Read confirmation/history, Update/reschedule date and slot, Delete/cancel booking with slot release).
7. Manage state transitions (`Confirmed`, `Rescheduled`, `Cancelled`) with automatic time slot reservation and double-booking prevention.
8. Persist appointment history reliably in browser `LocalStorage`.

---

## 2. iNeuBytes Requirements & Explicit Frontend CRUD Mapping

| CRUD Concept | User Action & Feature | Technical Implementation in Vanilla JS + LocalStorage |
|--------------|-----------------------|--------------------------------------------------------|
| **CREATE** | Book New Appointment | Form submit in `booking.js` validates inputs, generates reference ID (`CNH-2026-XXXX`), pushes record to `carenova_appointments` array, and saves to `LocalStorage`. |
| **READ** | View Receipt & History | `booking.js` renders dynamic confirmation receipt modal. `app.js` + `storage.js` reads LocalStorage array to render filterable history cards/table. |
| **UPDATE** | Reschedule Appointment | User clicks "Reschedule" in history; selects a new date/time slot. `storage.js` updates `appointmentDate`, `appointmentTime`, and sets status to `Rescheduled` while preserving the same `appointmentId`. Releases old date/time slot and reserves new slot. |
| **DELETE** | Cancel Appointment | User clicks "Cancel" in history. `storage.js` updates status to `Cancelled`. Releases the doctor + date + time slot so it becomes available for re-booking. Preserves record in history for audit trail. |

---

## 3. Mandatory Doctor Details & Data Architecture

Every doctor card and profile modal will explicitly display all 5 required iNeuBytes fields:

### Required Doctor Profile Fields:
1. **Doctor Name** (e.g., `Dr. Sarah Jenkins`)
2. **Department** (e.g., `Cardiology`)
3. **Experience** (e.g., `12 Years (Demo)`)
4. **Available Time Slots** (e.g., `["09:00 AM", "10:30 AM", "02:00 PM", "04:30 PM"]`)
5. **Consultation Fee** (e.g., `₹800 (Demo)`)

### Doctor Dataset Schema (`js/doctors.js`)
```javascript
const doctorsData = [
  {
    id: "doc-101",
    name: "Dr. Sarah Jenkins",
    qualification: "MD, FACC",
    department: "cardiology",
    departmentName: "Cardiology",
    experienceYears: 12,
    fee: 800, // INR Demo
    rating: 4.9,
    reviewsCount: 48,
    availableDays: ["Mon", "Tue", "Wed", "Thu"],
    timeSlots: ["09:00 AM", "10:30 AM", "02:00 PM", "04:30 PM"],
    avatarText: "SJ",
    bio: "Senior Consultant Cardiologist specializing in preventive heart health and non-invasive cardiac diagnostic evaluations."
  },
  {
    id: "doc-102",
    name: "Dr. Marcus Vance",
    qualification: "DM, Neuro",
    department: "neurology",
    departmentName: "Neurology",
    experienceYears: 10,
    fee: 900,
    rating: 4.8,
    reviewsCount: 36,
    availableDays: ["Tue", "Wed", "Fri", "Sat"],
    timeSlots: ["10:00 AM", "11:30 AM", "03:00 PM", "05:00 PM"],
    avatarText: "MV",
    bio: "Neurological specialist with expertise in headache management, nerve health assessment, and clinical neuro-wellness."
  },
  {
    id: "doc-103",
    name: "Dr. Elena Rostova",
    qualification: "MD, DCH",
    department: "pediatrics",
    departmentName: "Pediatrics",
    experienceYears: 8,
    fee: 650,
    rating: 4.9,
    reviewsCount: 52,
    availableDays: ["Mon", "Wed", "Thu", "Fri", "Sat"],
    timeSlots: ["09:30 AM", "11:00 AM", "02:30 PM", "04:00 PM"],
    avatarText: "ER",
    bio: "Pediatrician dedicated to compassionate child healthcare, growth monitoring, and adolescent development consultation."
  },
  {
    id: "doc-104",
    name: "Dr. David Chen",
    qualification: "MS, Ortho",
    department: "orthopedics",
    departmentName: "Orthopedics",
    experienceYears: 11,
    fee: 750,
    rating: 4.7,
    reviewsCount: 41,
    availableDays: ["Mon", "Tue", "Thu", "Sat"],
    timeSlots: ["10:00 AM", "01:00 PM", "03:30 PM", "05:30 PM"],
    avatarText: "DC",
    bio: "Orthopedic surgeon specializing in joint mobility, sports injuries, and musculoskeletal health consultations."
  },
  {
    id: "doc-105",
    name: "Dr. Priya Nair",
    qualification: "MD, DVL",
    department: "dermatology",
    departmentName: "Dermatology",
    experienceYears: 7,
    fee: 700,
    rating: 4.8,
    reviewsCount: 29,
    availableDays: ["Tue", "Wed", "Thu", "Fri"],
    timeSlots: ["11:00 AM", "02:00 PM", "04:00 PM", "06:00 PM"],
    avatarText: "PN",
    bio: "Dermatologist providing comprehensive skin health consultations, allergy evaluations, and preventive dermatological care."
  },
  {
    id: "doc-106",
    name: "Dr. Rajesh Sharma",
    qualification: "MD (General Medicine)",
    department: "general",
    departmentName: "General Medicine",
    experienceYears: 14,
    fee: 500,
    rating: 4.9,
    reviewsCount: 64,
    availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    timeSlots: ["08:30 AM", "10:30 AM", "01:30 PM", "05:00 PM"],
    avatarText: "RS",
    bio: "Senior General Physician specializing in primary care, chronic lifestyle condition management, and routine health checkups."
  }
];
```

---

## 4. Appointment State Management & Double-Booking Prevention

### A. Defined Appointment States:
1. **`Confirmed`:** Active booking. Reserves the selected `doctorId` + `appointmentDate` + `appointmentTime`.
2. **`Rescheduled`:** Updated booking. Releases the previous `appointmentDate` + `appointmentTime` and reserves the new date/time slot under the same `appointmentId`.
3. **`Cancelled`:** Cancelled booking. Immediately releases the `doctorId` + `date` + `timeSlot` reservation so other patients can book that slot. The record is preserved in history with a `Cancelled` status badge for historical audit integrity.

### B. Double-Booking Prevention Rules:
When rendering time slots for a doctor on a selected date:
1. Query LocalStorage array for all appointments where `doctorId === selectedDocId`, `appointmentDate === selectedDate`, and `status !== 'Cancelled'`.
2. Disable any time slot button matching active bookings (`.slot-btn.disabled` with `disabled` attribute & tooltip `"Slot Already Booked"`).
3. If rescheduling an appointment, exclude the active `appointmentId` from the slot conflict check so the patient can keep or change their own slot without artificial self-conflict.

---

## 5. User Workflow & Experience Journey

```
[Home Portal]
      │
      ▼
[Browse Doctor Listings]  <───>  [Search Bar & Department Filters]
      │
      ▼
[Click "View Details" or "Book Appointment"]
      │
      ▼
[Doctor Details Modal] (Mandatory Name, Dept, Experience, Slots, Fee)
      │
      ▼
[Appointment Booking Form]
   ├── 1. Select Date (min: Today, max: +30 Days)
   ├── 2. Select Available Time Slot (Disabled slots marked "Already Booked")
   └── 3. Fill Patient Details (Name, Email, Phone, Age, Gender)
      │
      ▼
[Client-Side Validation Check]
   ├── IF Errors ──> Display Field Error Highlights & Alert Banner
   └── IF Valid  ──> Create Record (CREATE) & Save to LocalStorage
      │
      ▼
[Appointment Confirmation Summary Receipt] (READ)
      │
      ▼
[Appointment History View] (READ)
   ├── Reschedule Action (UPDATE) ──> Modify Date/Slot & Set Status to 'Rescheduled'
   └── Cancel Action (DELETE)     ──> Set Status to 'Cancelled' & Release Reserved Slot
```

---

## 6. Page & Section Architecture

To ensure the application remains **fast, responsive, zero-page-reload, 100% client-side, and simple to maintain without frontend frameworks**, Task 2 adopts a **Single-Page Application (SPA) view-switching section model** inside `Task-2/index.html`.

Views managed dynamically via JavaScript:
- `#view-catalog`: Search bar, department filter pills, doctor listing cards.
- `#view-history`: Filterable appointment history table & management cards.
- `#modal-booking`: Doctor profile details, date picker, time slot buttons, patient details form.
- `#modal-confirmation`: Instant booking confirmation receipt summary with reference ID.

---

## 7. Proposed Task-2 File Structure

```
Task-2/
├── README.md               # Task 2 documentation & workflow instructions
├── index.html              # Main single-page booking application interface
├── css/
│   ├── style.css           # Core styling, CareNova theme tokens, cards, search/filter bars
│   ├── booking.css         # Modal overlays, booking form, slot selector, receipt card, history table
│   └── responsive.css      # Viewport media queries (375px, 768px, 1024px, 1440px)
├── js/
│   ├── doctors.js          # Doctor dataset & department metadata
│   ├── storage.js          # LocalStorage CRUD helper methods (Create, Read, Reschedule, Cancel)
│   ├── booking.js          # Modal workflow, date/slot manager, & form validator
│   └── app.js              # Application entry point, search, department filter, & tab manager
└── assets/
    └── images/             # CareNova brand graphics & SVG logo asset
```

---

## 8. Responsive Strategy (QA Viewports)

- **Mobile Viewport (375px):** Stacked cards, full-width touch-friendly buttons (min 44px height), hamburger toggle drawer.
- **Tablet Viewport (768px - 1024px):** 2-column doctor grid, flexible horizontal search/filter control bar, centered modal (max-width 640px).
- **Desktop Viewport (1440px):** 3-column doctor grid, side-by-side search & filter bar, full tabular appointment history.
- **0 Horizontal Overflow** across all breakpoints.

---

## 9. Validation & Edge Case Strategy

1. **Empty Search Result:** Show empty state card ("No doctors match your search query") + "Reset Filters" CTA.
2. **Past Date Selection:** Native HTML5 date `min` attribute set to `today` (`YYYY-MM-DD`).
3. **Already Booked Slot Handling:** Visual slot button disabling (`disabled`, `.slot-btn.disabled`).
4. **Blank Form Submission:** Field error highlight (`.is-invalid`) and top error alert banner.
5. **Invalid Phone / Email:** Strict regex checks before saving.

---

## 10. Comprehensive Testing & QA Strategy

Post-implementation test suite (`scratch/test_task2.js`) will verify:
1. Doctor card rendering & mandatory profile fields (Name, Dept, Experience, Slots, Fee).
2. Dynamic search and department filter pills.
3. **CREATE:** Booking new appointment and writing record to LocalStorage.
4. **READ:** Confirmation summary receipt and history view rendering.
5. **UPDATE:** Rescheduling an existing appointment, verifying slot release & reservation under same ID.
6. **DELETE:** Cancelling an appointment, verifying slot release and `Cancelled` status badge in history.
7. Double-booking prevention logic.
8. 375px, 768px, 1024px, 1440px responsive layout checks.
9. 0 JavaScript console errors.

---

## 11. Requirement Traceability Matrix

| Requirement | Application Feature | Verification Method |
|-------------|---------------------|---------------------|
| Doctor Browse | Doctor cards with 5 mandatory fields | Verify cards display Name, Dept, Exp, Slots, Fee |
| Doctor Search | `app.js` search input listener | Test keyword query matching |
| Dept Filter | `app.js` department pill filters | Test clicking department pills |
| Doctor Details | `booking.js` profile modal | Test clicking "View Profile" |
| Booking Form | `booking.js` form + slot selector | Test date/slot picker & client-side validation |
| Confirmation | Receipt modal with reference ID | Test receipt summary display |
| History View | LocalStorage history table/cards | Verify saved records persist across refresh |
| **CREATE** | Book appointment | Verify new record in LocalStorage |
| **READ** | Display confirmation & history | Verify receipt & history card rendering |
| **UPDATE** | Reschedule date & slot | Verify date/slot update under same ref ID |
| **DELETE** | Cancel booking | Verify slot release & `Cancelled` status badge |

---

## 12. Explicit Scope Exclusions (Reserved for Major Project)

- **No Node.js / Express Backend:** Task 2 is 100% frontend client-side.
- **No MySQL Database:** Data persistence is handled via `LocalStorage`.
- **No Real Payments or Telemedicine APIs:** Fictional demonstration content.
- **No Role-Based Login:** Authentication belongs strictly to the Major Project.

---

## 🛑 Status

All 3 user refinements have been incorporated into [`Task-2/implementation_plan.md`](file:///c:/Users/SANGEETHA%20S/.gemini/antigravity-ide/scratch/internsSangeetha_INBT022861_iNeuBytes/Task-2/implementation_plan.md):
1. **Explicit CRUD Mapping:** Defined CREATE (booking), READ (receipt/history), UPDATE (rescheduling), and DELETE (cancelling with slot release).
2. **Strengthened Doctor Details:** Explicitly mandated Doctor Name, Department, Experience, Available Time Slots, and Consultation Fee.
3. **Appointment State Management:** Explicitly defined `Confirmed`, `Rescheduled`, and `Cancelled` states, double-booking prevention, slot reservation/release, and LocalStorage consistency.

No source code files were created or modified. Task-1 and Major-Project remain untouched. Awaiting authorization to begin implementation.
