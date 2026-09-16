const http = require('http');

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      const cookies = res.headers['set-cookie'] || [];
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const body = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, body, cookies });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body: data, cookies });
        }
      });
    });
    req.on('error', err => reject(err));
    if (postData) {
      req.write(typeof postData === 'object' ? JSON.stringify(postData) : postData);
    }
    req.end();
  });
}

function extractToken(cookies) {
  if (!cookies || !cookies.length) return '';
  for (const c of cookies) {
    if (c.startsWith('token=')) {
      return c.split(';')[0];
    }
  }
  return cookies[0] ? cookies[0].split(';')[0] : '';
}

async function runMasterQA() {
  console.log('========================================================================================');
  console.log('CareNova Health — Phase 3F Master System Integration & Regression QA Suite');
  console.log('========================================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.log(`[FAIL] ${message}`);
      failed++;
    }
  }

  const { pool } = require('../server/config/db');

  console.log('--- MODULE 1: SYSTEM HEALTH & PUBLIC DEPARTMENTS ---');
  const health = await request({ hostname: '127.0.0.1', port: 5000, path: '/api/health', method: 'GET' });
  assert(health.status === 200 && health.body.success, 'M1: System Health API (HTTP 200 OK)');

  const depts = await request({ hostname: '127.0.0.1', port: 5000, path: '/api/departments', method: 'GET' });
  assert(depts.status === 200 && depts.body.count >= 6, 'M1: Public Clinical Departments Listing (HTTP 200 OK)');

  console.log('\n--- MODULE 2: AUTHENTICATION & ROLE-BASED ACCESS CONTROL (RBAC) ---');
  // Patient Registration
  const e2eEmail = `master.e2e.${Date.now()}@carenova.health`;
  const reg = await request({
    hostname: '127.0.0.1', port: 5000, path: '/api/auth/register', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { firstName: 'Master', lastName: 'Integration', email: e2eEmail, password: 'demo123', phone: '9876543888', gender: 'female' });
  assert(reg.status === 201 && reg.body.user && reg.body.user.role === 'patient', 'M2: Patient Self-Registration (HTTP 201 Created)');

  // Patient Login
  const pLogin = await request({
    hostname: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: e2eEmail, password: 'demo123' });
  const patientCookie = extractToken(pLogin.cookies);
  assert(pLogin.status === 200 && patientCookie, 'M2: Patient Login Session (HTTP 200 OK + JWT Cookie)');

  // Doctor Login
  const dLogin = await request({
    hostname: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'sarah.jenkins@carenova.health', password: 'demo123' });
  const doctorACookie = extractToken(dLogin.cookies);
  assert(dLogin.status === 200 && doctorACookie, 'M2: Doctor A Login Session (HTTP 200 OK + JWT Cookie)');

  // Doctor B Login
  const dBLogin = await request({
    hostname: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'marcus.vance@carenova.health', password: 'demo123' });
  const doctorBCookie = extractToken(dBLogin.cookies);
  assert(dBLogin.status === 200 && doctorBCookie, 'M2: Doctor B Login Session (HTTP 200 OK + JWT Cookie)');

  // Admin Login
  const aLogin = await request({
    hostname: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@carenova.health', password: 'demo123' });
  const adminCookie = extractToken(aLogin.cookies);
  assert(aLogin.status === 200 && adminCookie, 'M2: Admin Login Session (HTTP 200 OK + JWT Cookie)');

  // RBAC Guards
  const r1 = await request({ hostname: '127.0.0.1', port: 5000, path: '/api/admin/dashboard-stats', method: 'GET', headers: { 'Cookie': patientCookie } });
  const r2 = await request({ hostname: '127.0.0.1', port: 5000, path: '/api/admin/dashboard-stats', method: 'GET', headers: { 'Cookie': doctorACookie } });
  const r3 = await request({ hostname: '127.0.0.1', port: 5000, path: '/api/admin/dashboard-stats', method: 'GET' });
  assert(r1.status === 403 && r2.status === 403 && r3.status === 401, 'M2: RBAC Enforcement (Patient 403, Doctor 403, Unauthenticated 401)');

  console.log('\n--- MODULE 3: PATIENT PORTAL & APPOINTMENT BOOKING ---');
  // Check Slot Availability via GET /api/doctors/1/available-slots
  const testDate = '2026-12-28';
  const testSlot = '10:30 AM';
  const slotsRes = await request({ hostname: '127.0.0.1', port: 5000, path: `/api/doctors/1/available-slots?date=${testDate}`, method: 'GET' });
  assert(slotsRes.status === 200 && Array.isArray(slotsRes.body.slots), 'M3: Available Time Slots Query (HTTP 200 OK)');

  // Patient Books Appointment
  const bookRes = await request({
    hostname: '127.0.0.1', port: 5000, path: '/api/appointments', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': patientCookie }
  }, { doctorId: 1, departmentId: 1, appointmentDate: testDate, timeSlot: testSlot, reasonForVisit: 'Phase 3F Master E2E Test' });
  const apptId = bookRes.body.appointment ? bookRes.body.appointment.id : null;
  assert(bookRes.status === 201 && apptId, 'M3: Patient Appointment Booking (HTTP 201 Created)');

  // Duplicate Booking Anti-Conflict Check
  const dupRes = await request({
    hostname: '127.0.0.1', port: 5000, path: '/api/appointments', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': patientCookie }
  }, { doctorId: 1, departmentId: 1, appointmentDate: testDate, timeSlot: testSlot, reasonForVisit: 'Duplicate check' });
  assert(dupRes.status === 409, 'M3: Double-Booking Protection Safeguard (HTTP 409 Conflict)');

  // Patient My Appointments View
  const pAppts = await request({ hostname: '127.0.0.1', port: 5000, path: '/api/appointments/my', method: 'GET', headers: { 'Cookie': patientCookie } });
  assert(pAppts.status === 200 && pAppts.body.count >= 1, 'M3: Patient Personal Appointments View (HTTP 200 OK)');

  console.log('\n--- MODULE 4: DOCTOR WORKSTATION & CLINICAL CONSULTATIONS ---');
  // Doctor Dashboard
  const dDash = await request({ hostname: '127.0.0.1', port: 5000, path: '/api/doctors/me/dashboard', method: 'GET', headers: { 'Cookie': doctorACookie } });
  assert(dDash.status === 200 && dDash.body.stats, 'M4: Doctor Personal Dashboard & Stats (HTTP 200 OK)');

  // Cross-Doctor Isolation: Doctor B should NOT see Doctor A's appointment
  const dBIso = await request({ hostname: '127.0.0.1', port: 5000, path: `/api/doctors/me/appointments/${apptId}`, method: 'GET', headers: { 'Cookie': doctorBCookie } });
  assert(dBIso.status === 403, 'M4: Cross-Doctor Data Isolation Guard (HTTP 403 Forbidden)');

  // Doctor A Consults Appointment & Creates Medical Record
  const consultRes = await request({
    hostname: '127.0.0.1', port: 5000, path: `/api/doctors/me/appointments/${apptId}/consultation`, method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': doctorACookie }
  }, { diagnosis: 'Essential Hypertension Grade 1', prescription: 'Tab Amlodipine 5mg OD x 30 days', doctorNotes: 'Patient advised routine exercise.', recommendedFollowupDate: '2027-01-28' });
  assert(consultRes.status === 201 && consultRes.body.medicalRecord && consultRes.body.medicalRecord.recordCode, 'M4: Doctor Consultation Submission & Medical Record Authoring (HTTP 201 Created)');

  // Patient Reads Own Medical Record
  const pRecs = await request({ hostname: '127.0.0.1', port: 5000, path: '/api/medical-records/my', method: 'GET', headers: { 'Cookie': patientCookie } });
  assert(pRecs.status === 200 && pRecs.body.count >= 1, 'M4: Patient Read Access to Medical Records (HTTP 200 OK)');

  console.log('\n--- MODULE 5: ADMIN CONSOLE, HARDENED CONTROLS & AUDIT REPORTS ---');
  // Admin Dashboard Overview Stats
  const aStats = await request({ hostname: '127.0.0.1', port: 5000, path: '/api/admin/dashboard-stats', method: 'GET', headers: { 'Cookie': adminCookie } });
  assert(aStats.status === 200 && aStats.body.stats, 'M5: Admin System Dashboard Statistics (HTTP 200 OK)');

  // Admin Reports Summary
  const aReports = await request({ hostname: '127.0.0.1', port: 5000, path: '/api/admin/reports/summary', method: 'GET', headers: { 'Cookie': adminCookie } });
  assert(aReports.status === 200 && Array.isArray(aReports.body.departmentSummary), 'M5: Admin Operational Analytics & Department Summary (HTTP 200 OK)');

  // Admin Doctor Onboarding Transaction
  const onboardEmail = `dr.onboard.${Date.now()}@carenova.health`;
  const onboardRes = await request({
    hostname: '127.0.0.1', port: 5000, path: '/api/admin/doctors', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': adminCookie }
  }, { firstName: 'Vikram', lastName: 'Sethi', email: onboardEmail, password: 'demo123', phone: '9876543777', departmentId: 1, qualification: 'MD Cardiology', experienceYears: 9, consultationFee: 850, bio: 'Expert in intervention.' });
  const onboardDocId = onboardRes.body.doctor ? onboardRes.body.doctor.id : null;
  assert(onboardRes.status === 201 && onboardDocId, 'M5: Admin Doctor Onboarding Atomic Transaction (HTTP 201 Created)');

  // Admin Department Deletion Protection Guard (Cardiology has active doctors)
  const delDeptRes = await request({ hostname: '127.0.0.1', port: 5000, path: '/api/admin/departments/1', method: 'DELETE', headers: { 'Cookie': adminCookie } });
  assert(delDeptRes.status === 400 && delDeptRes.body.message.includes('active doctors'), 'M5: Department Active-Doctor Deletion Protection Guard (HTTP 400 Bad Request)');

  // Admin Status Guardrail 1: Completion without medical record REJECTED
  // Create dummy appt B without medical record
  const bookB = await request({
    hostname: '127.0.0.1', port: 5000, path: '/api/appointments', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': patientCookie }
  }, { doctorId: 1, departmentId: 1, appointmentDate: '2026-12-29', timeSlot: '11:30 AM', reasonForVisit: 'Hardening B' });
  const apptBId = bookB.body.appointment ? bookB.body.appointment.id : null;

  const adminCompNoRec = await request({
    hostname: '127.0.0.1', port: 5000, path: `/api/admin/appointments/${apptBId}/status`, method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Cookie': adminCookie }
  }, { status: 'Completed' });
  assert(adminCompNoRec.status === 400 && adminCompNoRec.body.message.includes('Completion requires a valid Doctor consultation'), 'M5: Admin Status Guardrail: Completion WITHOUT medical record (HTTP 400 REJECTED)');

  // Admin Status Guardrail 2: Cancelled -> Completed REJECTED
  await request({
    hostname: '127.0.0.1', port: 5000, path: `/api/admin/appointments/${apptBId}/status`, method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Cookie': adminCookie }
  }, { status: 'Cancelled' });

  const adminCancComp = await request({
    hostname: '127.0.0.1', port: 5000, path: `/api/admin/appointments/${apptBId}/status`, method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Cookie': adminCookie }
  }, { status: 'Completed' });
  assert(adminCancComp.status === 400 && adminCancComp.body.message.includes('Cannot mark a cancelled appointment as completed'), 'M5: Admin Status Guardrail: Cancelled -> Completed (HTTP 400 REJECTED)');

  // Clean Teardown
  if (apptId) {
    await pool.query('DELETE FROM medical_records WHERE appointment_id = ?', [apptId]);
    await pool.query('DELETE FROM appointments WHERE id = ?', [apptId]);
  }
  if (apptBId) {
    await pool.query('DELETE FROM medical_records WHERE appointment_id = ?', [apptBId]);
    await pool.query('DELETE FROM appointments WHERE id = ?', [apptBId]);
  }
  if (onboardDocId) {
    const [docs] = await pool.query('SELECT user_id FROM doctors WHERE id = ?', [onboardDocId]);
    if (docs.length > 0) {
      await pool.query('DELETE FROM doctors WHERE id = ?', [onboardDocId]);
      await pool.query('DELETE FROM users WHERE id = ?', [docs[0].user_id]);
    }
  }
  await pool.query('DELETE FROM patients WHERE user_id = (SELECT id FROM users WHERE email = ?)', [e2eEmail]);
  await pool.query('DELETE FROM users WHERE email = ?', [e2eEmail]);

  console.log('\nMaster Data Teardown Completed Cleanly.');

  console.log('\n========================================================================================');
  console.log('SUMMARY OF MASTER SYSTEM INTEGRATION & REGRESSION QA RESULTS:');
  console.log(`TOTAL TESTS EXECUTED: ${passed + failed}`);
  console.log(`PASS: ${passed}`);
  console.log(`FAIL: ${failed}`);
  console.log('========================================================================================\n');

  process.exit(failed > 0 ? 1 : 0);
}

runMasterQA().catch(err => {
  console.error('Master QA error:', err);
  process.exit(1);
});
