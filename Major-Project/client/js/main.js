// ============================================================================
// CareNova Health — Client Application Entry Initializer
// iNeuBytes Web Development Internship — Major Project Phase 3B Auth & RBAC
// ============================================================================

document.addEventListener('DOMContentLoaded', async () => {
  console.log(`[CareNova Health] Initializing Phase 3B Client Shell...`);
  
  // Setup placeholder navigation links
  UiManager.setupPlaceholderLinks();

  // Test backend health
  const healthResult = await ApiService.checkHealth();
  console.log(`[CareNova Health API Status]:`, healthResult);
  UiManager.renderHealthStatus(healthResult);

  // Check Active Session (/api/auth/me)
  const user = await AuthManager.checkSession();
  const sessionText = document.getElementById('userSessionText');
  if (sessionText) {
    if (user) {
      sessionText.textContent = `Logged in as ${user.firstName} (${user.role.toUpperCase()})`;
    } else {
      sessionText.textContent = `Unauthenticated (Guest)`;
    }
  }

  // Setup Live RBAC Test Buttons
  setupRbacTestButtons();
});

function setupRbacTestButtons() {
  const rbacResult = document.getElementById('rbacTestResult');
  const testPatientBtn = document.getElementById('testPatientBtn');
  const testDoctorBtn = document.getElementById('testDoctorBtn');
  const testAdminBtn = document.getElementById('testAdminBtn');

  if (!rbacResult) return;

  const runTest = async (role) => {
    rbacResult.style.display = 'block';
    rbacResult.style.backgroundColor = '#F8FAFC';
    rbacResult.style.border = '1px solid var(--border-color)';
    rbacResult.textContent = `Testing GET /api/test/${role}...`;

    const res = await ApiService.testRbac(role);

    if (res.success) {
      rbacResult.style.backgroundColor = '#D1FAE5';
      rbacResult.style.color = '#065F46';
      rbacResult.style.borderColor = '#A7F3D0';
      rbacResult.textContent = `✓ SUCCESS (200 OK): ${res.data.message}`;
    } else {
      rbacResult.style.backgroundColor = '#FEE2E2';
      rbacResult.style.color = '#991B1B';
      rbacResult.style.borderColor = '#FCA5A5';
      rbacResult.textContent = `✕ ACCESS DENIED (${res.status}): ${res.message}`;
    }
  };

  if (testPatientBtn) testPatientBtn.addEventListener('click', () => runTest('patient'));
  if (testDoctorBtn) testDoctorBtn.addEventListener('click', () => runTest('doctor'));
  if (testAdminBtn) testAdminBtn.addEventListener('click', () => runTest('admin'));
}
