-- ============================================================================
-- CareNova Health — Full-Stack Healthcare Management System
-- MySQL Demonstration Seed Data Specification
-- iNeuBytes Web Development Internship — Major Project Phase 3A Foundation
-- Intern: Sangeetha (INBT022861) | Course: WBINB10726
-- ============================================================================
-- DEMO CREDENTIAL STRATEGY NOTE:
-- All demo user accounts use bcrypt hashed passwords corresponding to: "demo123"
-- Hash: $2b$10$wTKvSbQj1NHr65EHlGimD.thWkKTTcWwR7xc66zXNHJumsq/owGTq (bcrypt demo hash)
-- Plaintext passwords are NEVER stored in production.
-- ============================================================================

USE carenova_health_db;

-- 1. Seed Clinical Departments
INSERT INTO departments (id, name, code, description, icon) VALUES
(1, 'Cardiology', 'CARD', 'Comprehensive cardiovascular diagnosis, heart disease management, and preventative cardiology care.', 'heart-pulse'),
(2, 'Neurology', 'NEUR', 'Expert neurological evaluations, brain care, movement disorders, and spine health management.', 'brain'),
(3, 'Pediatrics', 'PEDI', 'Dedicated compassionate healthcare services for infants, children, and adolescents.', 'baby'),
(4, 'Orthopedics', 'ORTH', 'Specialized bone, joint, sports injury, and musculoskeletal surgical care.', 'bone'),
(5, 'Dermatology', 'DERM', 'Advanced skin health, clinical dermatology, allergy testing, and cosmetic care.', 'sparkles'),
(6, 'General Medicine', 'GENM', 'Primary healthcare consultations, routine health checkups, and wellness advice.', 'stethoscope')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. Seed Demo Users (Admin, Doctors, Patients)
INSERT INTO users (id, email, password_hash, role, first_name, last_name, phone) VALUES
-- Admin User
(1, 'admin@carenova.health', '$2b$10$wTKvSbQj1NHr65EHlGimD.thWkKTTcWwR7xc66zXNHJumsq/owGTq', 'admin', 'System', 'Administrator', '+91 99000 11223'),
-- Doctor Users
(2, 'sarah.jenkins@carenova.health', '$2b$10$wTKvSbQj1NHr65EHlGimD.thWkKTTcWwR7xc66zXNHJumsq/owGTq', 'doctor', 'Sarah', 'Jenkins', '+91 98765 11101'),
(3, 'marcus.vance@carenova.health', '$2b$10$wTKvSbQj1NHr65EHlGimD.thWkKTTcWwR7xc66zXNHJumsq/owGTq', 'doctor', 'Marcus', 'Vance', '+91 98765 11102'),
(4, 'elena.rostova@carenova.health', '$2b$10$wTKvSbQj1NHr65EHlGimD.thWkKTTcWwR7xc66zXNHJumsq/owGTq', 'doctor', 'Elena', 'Rostova', '+91 98765 11103'),
(5, 'david.chen@carenova.health', '$2b$10$wTKvSbQj1NHr65EHlGimD.thWkKTTcWwR7xc66zXNHJumsq/owGTq', 'doctor', 'David', 'Chen', '+91 98765 11104'),
(6, 'priya.nair@carenova.health', '$2b$10$wTKvSbQj1NHr65EHlGimD.thWkKTTcWwR7xc66zXNHJumsq/owGTq', 'doctor', 'Priya', 'Nair', '+91 98765 11105'),
(7, 'rajesh.sharma@carenova.health', '$2b$10$wTKvSbQj1NHr65EHlGimD.thWkKTTcWwR7xc66zXNHJumsq/owGTq', 'doctor', 'Rajesh', 'Sharma', '+91 98765 11106'),
-- Patient Users
(8, 'sangeetha.patient@example.com', '$2b$10$wTKvSbQj1NHr65EHlGimD.thWkKTTcWwR7xc66zXNHJumsq/owGTq', 'patient', 'Sangeetha', 'Gowda', '+91 98765 43210'),
(9, 'rahul.verma@example.com', '$2b$10$wTKvSbQj1NHr65EHlGimD.thWkKTTcWwR7xc66zXNHJumsq/owGTq', 'patient', 'Rahul', 'Verma', '+91 98765 43211')
ON DUPLICATE KEY UPDATE email=VALUES(email);

-- 3. Seed Doctors Profiles
INSERT INTO doctors (id, user_id, department_id, qualification, experience_years, consultation_fee, bio, available_days, available_slots) VALUES
(1, 2, 1, 'MD, FACC (Cardiology)', 12, 800.00, 'Senior Cardiologist specializing in non-invasive cardiology, lipid management, and preventative heart care.', 'Mon,Tue,Wed,Thu', '["09:00 AM", "10:30 AM", "02:00 PM", "04:00 PM"]'),
(2, 3, 2, 'MD, DM (Neurology)', 10, 900.00, 'Consultant Neurologist focusing on headache management, epilepsy, and peripheral neuropathy.', 'Mon,Wed,Fri', '["09:30 AM", "11:00 AM", "02:30 PM", "05:00 PM"]'),
(3, 4, 3, 'MD, DCH (Pediatrics)', 8, 650.00, 'Pediatrician dedicated to developmental assessments, childhood immunizations, and general pediatric health.', 'Tue,Thu,Sat', '["10:00 AM", "11:30 AM", "03:00 PM", "04:30 PM"]'),
(4, 5, 4, 'MS, DNB (Orthopedics)', 11, 750.00, 'Orthopedic Specialist with expertise in sports traumatology, joint pain, and arthroscopic procedures.', 'Mon,Tue,Thu,Fri', '["09:00 AM", "10:30 AM", "01:30 PM", "03:30 PM"]'),
(5, 6, 5, 'MD, DVL (Dermatology)', 7, 700.00, 'Dermatologist specializing in eczema, psoriasis management, acne care, and clinical skin health.', 'Wed,Fri,Sat', '["10:30 AM", "12:00 PM", "02:30 PM", "04:00 PM"]'),
(6, 7, 6, 'MBBS, MD (General Medicine)', 14, 500.00, 'Senior General Physician providing comprehensive primary health checkups and chronic illness management.', 'Mon,Tue,Wed,Thu,Fri', '["08:30 AM", "10:00 AM", "11:30 AM", "03:00 PM"]')
ON DUPLICATE KEY UPDATE qualification=VALUES(qualification);

-- 4. Seed Patients Profiles
INSERT INTO patients (id, user_id, date_of_birth, gender, blood_group, address, emergency_contact, medical_history_summary) VALUES
(1, 8, '1998-05-15', 'female', 'O+', 'Koramangala, Bengaluru, Karnataka', '+91 98765 00001', 'No known drug allergies. Minor seasonal asthma.'),
(2, 9, '1992-09-20', 'male', 'A+', 'Indiranagar, Bengaluru, Karnataka', '+91 98765 00002', 'Mild hypertension.')
ON DUPLICATE KEY UPDATE address=VALUES(address);

-- 5. Seed Demonstration Appointments
INSERT INTO appointments (id, reference_id, patient_id, doctor_id, department_id, appointment_date, time_slot, consultation_fee, status, reason_for_visit) VALUES
(1, 'CNH-2026-1001', 1, 1, 1, '2026-09-15', '10:30 AM', 800.00, 'Confirmed', 'Routine cardiovascular health screening and lipid review.'),
(2, 'CNH-2026-1002', 2, 2, 2, '2026-09-18', '02:30 PM', 900.00, 'Confirmed', 'Consultation for tension headaches and sleep hygiene advice.')
ON DUPLICATE KEY UPDATE reference_id=VALUES(reference_id);

-- 6. Seed Demonstration Medical Records
INSERT INTO medical_records (id, record_code, appointment_id, patient_id, doctor_id, diagnosis, prescription, doctor_notes, recommended_followup_date) VALUES
(1, 'MR-2026-5001', 1, 1, 1, 'Normal sinus rhythm. Mild elevation in LDL cholesterol.', 'Tab Atorvastatin 10mg OD x 30 days. Dietary modifications.', 'Patient advised low-sodium, heart-healthy diet. Regular exercise recommended.', '2026-10-15')
ON DUPLICATE KEY UPDATE record_code=VALUES(record_code);
