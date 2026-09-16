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
  console.log('CareNova Health — Phase 3F Master System Integration & Cross-Module Regression QA Suite');
  console.log('========================================================================================\n');

  let passed = 0;
  let failed = 0;
  const testResults = [];

  function assert(id, phase, description, expected, condition, actualMsg = '') {
    const actual = condition ? expected : (actualMsg || 'Assertion Failed');
    const status = condition ? 'PASS' : 'FAIL';
    if (condition) {
      console.log(`[PASS] [${id}] [${phase}] ${description}`);
      passed++;
    } else {
      console.log(`[FAIL] [${id}] [${phase}] ${description} — Expected: ${expected}, Got: ${actualMsg}`);
      failed++;
    }
    testResults.push({ id, phase, description, expected, actual, status });
  }

  const { pool } = require('../server/config/db');

  console.log('--- MODULE 1: SYSTEM HEALTH & PUBLIC DEPARTMENTS (PHASE 3A) ---');
  // M1-01
  const health = await request({ hostname: '127.0.0.1', port: 5000, path: '/api/health', method: 'GET' });
  assert('M1-01', 'Phase 3A', 'System Health Check API', 'HTTP 200 OK + success:true', health.status === 200 && health.body.success, `HTTP ${health.status}`);

  // M1-02
  const depts = await request({ hostname: '127.0.0.1', port: 5000, path: '/api/departments', method: 'GET' });
  assert('M1-02', 'Phase 3A', 'Public Clinical Departments Listing', 'HTTP 200 OK + count >= 6', depts.status === 200 && depts.body.count >= 6, `HTTP ${depts.status}, count: ${depts.body.count}`);

  // M1-03
  const doc1 = await request({ hostname: '127.0.0.1', port: 5000, path: '/api/doctors/1', method: 'GET' });
  assert('M1-03', 'Phase 3A', 'Public Doctor Details Query', 'HTTP 200 OK + Doctor 1', doc1.status === 200 && doc1.body.doctor && doc1.body.doctor.id === 1, `HTTP ${doc1.status}`);

  // M1-04
  const doc999 = await request({ hostname: '127.0.0.1', port: 5000, path: '/api/doctors/9999', method: 'GET' });
  assert('M1-04', 'Phase 3A', 'Non-Existent Doctor Query', 'HTTP 404 Not Found', doc999.status === 404, `HTTP ${doc999.status}`);

  // M1-05
  const docSearch = await request({ hostname: '127.0.0.1', port: 5000, path: '/api/doctors?departmentId=1', method: 'GET' });
  assert('M1-05', 'Phase 3A', 'Public Doctor Filter Search by Department', 'HTTP 200 OK + Doctor list', docSearch.status === 200 && Array.isArray(docSearch.body.doctors), `HTTP ${docSearch.status}`);


  console.log('\n--- MODULE 2: AUTHENTICATION & ROLE-BASED ACCESS CONTROL (PHASE 3B) ---');
  // M2-01
  const e2eEmail = `master.e2e.${Date.now()}@carenova.health`;
  const reg = await request({
    hostname: '127.0.0.1', port: 5000, path: '/api/auth/register', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { firstName: 'Master', lastName: 'Integration', email: e2eEmail, password: 'demo123', phone: '9876543888', gender: 'female' });
  assert('M2-01', 'Phase 3B', 'Patient Self-Registration', 'HTTP 201 Created + role patient', reg.status === 201 && reg.body.user && reg.body.user.role === 'patient', `HTTP ${reg.status}`);

  // M2-02
  const regDup = await request({
    hostname: '127.0.0.1', port: 5000, path: '/api/auth/register', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { firstName: 'Master', lastName: 'Integration', email: e2eEmail, password: 'demo123', phone: '9876543888', gender: 'female' });
  assert('M2-02', 'Phase 3B', 'Duplicate Email Registration Safeguard', 'HTTP 409 Conflict', regDup.status === 409, `HTTP ${regDup.status}`);

  // M2-03
  const pLogin = await request({
    hostname: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: e2eEmail, password: 'demo123' });
  const patientCookie = extractToken(pLogin.cookies);
  assert('M2-03', 'Phase 3B', 'Patient Login & Cookie Issuance', 'HTTP 200 OK + JWT Cookie', pLogin.status === 200 && patientCookie, `HTTP ${pLogin.status}`);

  // M2-04
  const pAuthMe = await request({ hostname: '127.0.0.1', port: 5000, path: '/api/auth/me', method: 'GET', headers: { 'Cookie': patientCookie } });
  assert('M2-04', 'Phase 3B', 'Session Verification /api/auth/me', 'HTTP 200 OK + User object', pAuthMe.status === 200 && pAuthMe.body.user.email === e2eEmail, `HTTP ${pAuthMe.status}`);

  // M2-05
  const badLogin = await request({
    hostname: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: e2eEmail, password: 'wrongpassword' });
  assert('M2-05', 'Phase 3B', 'Invalid Password Login Guard', 'HTTP 401 Unauthorized', badLogin.status === 401, `HTTP ${badLogin.status}`);

  // M2-06
  const dLogin = await request({
    hostname: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'sarah.jenkins@carenova.health', password: 'demo123' });
  const doctorACookie = extractToken(dLogin.cookies);
  assert('M2-06', 'Phase 3B', 'Doctor A Login Session', 'HTTP 200 OK + JWT Cookie', dLogin.status === 200 && doctorACookie, `HTTP ${dLogin.status}`);

  // M2-07
  const dBLogin = await request({
    hostname: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'marcus.vance@carenova.health', password: 'demo123' });
  const doctorBCookie = extractToken(dBLogin.cookies);
  assert('M2-07', 'Phase 3B', 'Doctor B Login Session', 'HTTP 200 OK + JWT Cookie', dBLogin.status === 200 && doctorBCookie, `HTTP ${dBLogin.status}`);

  // M2-08
  const aLogin = await request({
    hostname: '127.0.0.1', port: 5000, path: '/api/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@carenova.health', password: 'demo123' });
  const adminCookie = extractToken(aLogin.cookies);
  assert('M2-08', 'Phase 3B', 'Admin Login Session', 'HTTP 200 OK + JWT Cookie', aLogin.status === 200 && adminCookie, `HTTP ${aLogin.status}`);

  // M2-09
  const rUnauth = await request({ hostname: '127.0.0.1', port: 5000, path: '/api/admin/dashboard-stats', method: 'GET' });
  assert('M2-09', 'Phase 3B', 'RBAC: Unauthenticated Admin Endpoint Access', 'HTTP 401 Unauthorized', rUnauth.status === 401, `HTTP ${rUnauth.status}`);

  // M2-10
  const rPatAdmin = await request({ hostname: '127.0.0.1', port: 5000, path: '/api/admin/dashboard-stats', method: 'GET', headers: { 'Cookie': patientCookie } });
  assert('M2-10', 'Phase 3B', 'RBAC: Patient Access to Admin Endpoint', 'HTTP 403 Forbidden', rPatAdmin.status === 403, `HTTP ${rPatAdmin.status}`);

  // M2-11
  const rDocAdmin = await request({ hostname: '127.0.0.1', port: 5000, path: '/api/admin/dashboard-stats', method: 'GET', headers: { 'Cookie': doctorACookie } });
  assert('M2-11', 'Phase 3B', 'RBAC: Doctor Access to Admin Endpoint', 'HTTP 403 Forbidden', rDocAdmin.status === 403, `HTTP ${rDocAdmin.status}`);

  // M2-12
  const logoutRes = await request({ hostname: '127.0.0.1', port: 5000, path: '/api/auth/logout', method: 'POST', headers: { 'Cookie': patientCookie } });
  assert('M2-12', 'Phase 3B', 'User Session Logout', 'HTTP 200 OK + Cleared cookie', logoutRes.status === 200, `HTTP ${logoutRes.status}`);


  console.log('\n--- MODULE 3: PATIENT PORTAL & APPOINTMENTS (PHASE 3C) ---');
  const testDate = '2026-12-28';
  const testSlot = '10:30 AM';

  // M3-01
  const slotsRes = await request({ hostname: '127.0.0.1', port: 5000, path: `/api/doctors/1/available-slots?date=${testDate}`, method: 'GET' });
  assert('M3-01', 'Phase 3C', 'Available Time Slots Query', 'HTTP 200 OK + Array of slots', slotsRes.status === 200 && Array.isArray(slotsRes.body.slots), `HTTP ${slotsRes.status}`);

  // M3-02
  const pProfile = await request({ hostname: '127.0.0.1', port: 5000, path: '/api/patients/me', method: 'GET', headers: { 'Cookie': patientCookie } });
  assert('M3-02', 'Phase 3C', 'Patient Personal Profile View', 'HTTP 200 OK + Profile object', pProfile.status === 200 && pProfile.body.patient, `HTTP ${pProfile.status}`);

  // M3-03
  const pUpdate = await request({
    hostname: '127.0.0.1', port: 5000, path: '/api/patients/me', method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Cookie': patientCookie }
  }, { bloodGroup: 'O+', emergencyContact: '9876543210', address: '123 CareNova Ave' });
  assert('M3-03', 'Phase 3C', 'Patient Profile Update', 'HTTP 200 OK + Updated patient', pUpdate.status === 200 && pUpdate.body.patient && pUpdate.body.patient.bloodGroup === 'O+', `HTTP ${pUpdate.status}`);

  // M3-04
  const bookRes = await request({
    hostname: '127.0.0.1', port: 5000, path: '/api/appointments', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': patientCookie }
  }, { doctorId: 1, departmentId: 1, appointmentDate: testDate, timeSlot: testSlot, reasonForVisit: 'Phase 3F Master E2E Test' });
  const apptId = bookRes.body.appointment ? bookRes.body.appointment.id : null;
  assert('M3-04', 'Phase 3C', 'Patient Appointment Booking', 'HTTP 201 Created + Appt ID', bookRes.status === 201 && apptId, `HTTP ${bookRes.status}`);

  // M3-05
  const dupRes = await request({
    hostname: '127.0.0.1', port: 5000, path: '/api/appointments', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': patientCookie }
  }, { doctorId: 1, departmentId: 1, appointmentDate: testDate, timeSlot: testSlot, reasonForVisit: 'Duplicate check' });
  assert('M3-05', 'Phase 3C', 'Double-Booking Protection Safeguard', 'HTTP 409 Conflict', dupRes.status === 409, `HTTP ${dupRes.status}`);

  // M3-06
  const pAppts = await request({ hostname: '127.0.0.1', port: 5000, path: '/api/appointments/my', method: 'GET', headers: { 'Cookie': patientCookie } });
  assert('M3-06', 'Phase 3C', 'Patient Personal Appointments List View', 'HTTP 200 OK + count >= 1', pAppts.status === 200 && pAppts.body.count >= 1, `HTTP ${pAppts.status}`);

  // M3-07
  const pApptDetail = await request({ hostname: '127.0.0.1', port: 5000, path: `/api/appointments/${apptId}`, method: 'GET', headers: { 'Cookie': patientCookie } });
  assert('M3-07', 'Phase 3C', 'Patient Detailed Appointment View', 'HTTP 200 OK + Appointment record', pApptDetail.status === 200 && pApptDetail.body.appointment, `HTTP ${pApptDetail.status}`);


  console.log('\n--- MODULE 4: DOCTOR WORKSTATION & CONSULTATIONS (PHASE 3D) ---');
  // M4-01
  const dDash = await request({ hostname: '127.0.0.1', port: 5000, path: '/api/doctors/me/dashboard', method: 'GET', headers: { 'Cookie': doctorACookie } });
  assert('M4-01', 'Phase 3D', 'Doctor Workstation Dashboard Metrics', 'HTTP 200 OK + stats object', dDash.status === 200 && dDash.body.stats, `HTTP ${dDash.status}`);

  // M4-02
  const dQueue = await request({ hostname: '127.0.0.1', port: 5000, path: '/api/doctors/me/appointments', method: 'GET', headers: { 'Cookie': doctorACookie } });
  assert('M4-02', 'Phase 3D', 'Doctor Personal Appointments Queue', 'HTTP 200 OK + array', dQueue.status === 200 && Array.isArray(dQueue.body.appointments), `HTTP ${dQueue.status}`);

  // M4-03
  const dApptDetail = await request({ hostname: '127.0.0.1', port: 5000, path: `/api/doctors/me/appointments/${apptId}`, method: 'GET', headers: { 'Cookie': doctorACookie } });
  assert('M4-03', 'Phase 3D', 'Doctor Assigned Appointment View', 'HTTP 200 OK + appointment', dApptDetail.status === 200 && dApptDetail.body.appointment, `HTTP ${dApptDetail.status}`);

  // M4-04
  const dBIso = await request({ hostname: '127.0.0.1', port: 5000, path: `/api/doctors/me/appointments/${apptId}`, method: 'GET', headers: { 'Cookie': doctorBCookie } });
  assert('M4-04', 'Phase 3D', 'Cross-Doctor Data Isolation Guard (IDOR)', 'HTTP 403 Forbidden', dBIso.status === 403, `HTTP ${dBIso.status}`);

  // M4-05
  const consultRes = await request({
    hostname: '127.0.0.1', port: 5000, path: `/api/doctors/me/appointments/${apptId}/consultation`, method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': doctorACookie }
  }, { diagnosis: 'Essential Hypertension Grade 1', prescription: 'Tab Amlodipine 5mg OD x 30 days', doctorNotes: 'Patient advised routine exercise.', recommendedFollowupDate: '2027-01-28' });
  assert('M4-05', 'Phase 3D', 'Doctor Consultation Submission & Medical Record Creation', 'HTTP 201 Created + Record Code', consultRes.status === 201 && consultRes.body.medicalRecord && consultRes.body.medicalRecord.recordCode, `HTTP ${consultRes.status}`);

  // M4-06
  const dupConsult = await request({
    hostname: '127.0.0.1', port: 5000, path: `/api/doctors/me/appointments/${apptId}/consultation`, method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': doctorACookie }
  }, { diagnosis: 'Duplicate attempt', prescription: 'None', doctorNotes: 'None' });
  assert('M4-06', 'Phase 3D', 'Duplicate Consultation Prevention Safeguard', 'HTTP 400 Bad Request', dupConsult.status === 400, `HTTP ${dupConsult.status}`);

  // M4-07
  const pRecs = await request({ hostname: '127.0.0.1', port: 5000, path: '/api/medical-records/my', method: 'GET', headers: { 'Cookie': patientCookie } });
  assert('M4-07', 'Phase 3D', 'Patient Read Access to Personal Medical Records', 'HTTP 200 OK + count >= 1', pRecs.status === 200 && pRecs.body.count >= 1, `HTTP ${pRecs.status}`);


  console.log('\n--- MODULE 5: ADMIN CONSOLE, HARDENED CONTROLS & AUDIT REPORTS (PHASE 3E) ---');
  // M5-01
  const aStats = await request({ hostname: '127.0.0.1', port: 5000, path: '/api/admin/dashboard-stats', method: 'GET', headers: { 'Cookie': adminCookie } });
  assert('M5-01', 'Phase 3E', 'Admin System Overview Statistics', 'HTTP 200 OK + stats object', aStats.status === 200 && aStats.body.stats, `HTTP ${aStats.status}`);

  // M5-02
  const aReports = await request({ hostname: '127.0.0.1', port: 5000, path: '/api/admin/reports/summary', method: 'GET', headers: { 'Cookie': adminCookie } });
  assert('M5-02', 'Phase 3E', 'Admin Operational Analytics Summary Report', 'HTTP 200 OK + dept summary', aReports.status === 200 && Array.isArray(aReports.body.departmentSummary), `HTTP ${aReports.status}`);

  // M5-03
  const onboardEmail = `dr.onboard.${Date.now()}@carenova.health`;
  const onboardRes = await request({
    hostname: '127.0.0.1', port: 5000, path: '/api/admin/doctors', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': adminCookie }
  }, { firstName: 'Vikram', lastName: 'Sethi', email: onboardEmail, password: 'demo123', phone: '9876543777', departmentId: 1, qualification: 'MD Cardiology', experienceYears: 9, consultationFee: 850, bio: 'Expert in intervention.' });
  const onboardDocId = onboardRes.body.doctor ? onboardRes.body.doctor.id : null;
  assert('M5-03', 'Phase 3E', 'Admin Doctor Onboarding Atomic Transaction', 'HTTP 201 Created + Doctor ID', onboardRes.status === 201 && onboardDocId, `HTTP ${onboardRes.status}`);

  // M5-04
  const delDeptRes = await request({ hostname: '127.0.0.1', port: 5000, path: '/api/admin/departments/1', method: 'DELETE', headers: { 'Cookie': adminCookie } });
  assert('M5-04', 'Phase 3E', 'Active-Doctor Department Deletion Safeguard', 'HTTP 400 Bad Request', delDeptRes.status === 400 && delDeptRes.body.message.includes('active doctors'), `HTTP ${delDeptRes.status}`);

  // M5-05: Create appt B without consultation
  const bookB = await request({
    hostname: '127.0.0.1', port: 5000, path: '/api/appointments', method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Cookie': patientCookie }
  }, { doctorId: 1, departmentId: 1, appointmentDate: '2026-12-29', timeSlot: '11:30 AM', reasonForVisit: 'Hardening B' });
  const apptBId = bookB.body.appointment ? bookB.body.appointment.id : null;

  const adminCompNoRec = await request({
    hostname: '127.0.0.1', port: 5000, path: `/api/admin/appointments/${apptBId}/status`, method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Cookie': adminCookie }
  }, { status: 'Completed' });
  assert('M5-05', 'Phase 3E', 'Clinical Guardrail: Completion WITHOUT Medical Record', 'HTTP 400 REJECTED', adminCompNoRec.status === 400 && adminCompNoRec.body.message.includes('Completion requires a valid Doctor consultation'), `HTTP ${adminCompNoRec.status}`);

  // M5-06
  await request({
    hostname: '127.0.0.1', port: 5000, path: `/api/admin/appointments/${apptBId}/status`, method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Cookie': adminCookie }
  }, { status: 'Cancelled' });

  const adminCancComp = await request({
    hostname: '127.0.0.1', port: 5000, path: `/api/admin/appointments/${apptBId}/status`, method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Cookie': adminCookie }
  }, { status: 'Completed' });
  assert('M5-06', 'Phase 3E', 'Clinical Guardrail: Cancelled -> Completed State Transition', 'HTTP 400 REJECTED', adminCancComp.status === 400 && adminCancComp.body.message.includes('Cannot mark a cancelled appointment as completed'), `HTTP ${adminCancComp.status}`);


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
  console.log(`TOTAL EXPLICIT TESTS EXECUTED: ${passed + failed}`);
  console.log(`PASS: ${passed}`);
  console.log(`FAIL: ${failed}`);
  console.log('========================================================================================\n');

  process.exit(failed > 0 ? 1 : 0);
}

runMasterQA().catch(err => {
  console.error('Master QA error:', err);
  process.exit(1);
});
