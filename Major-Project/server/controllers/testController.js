// ============================================================================
// CareNova Health — RBAC Verification Test Controller
// iNeuBytes Web Development Internship — Major Project Phase 3B Auth & RBAC
// ============================================================================

function testPatientEndpoint(req, res) {
  res.status(200).json({
    success: true,
    message: 'Access Granted: Patient Test Endpoint Verified',
    user: req.user
  });
}

function testDoctorEndpoint(req, res) {
  res.status(200).json({
    success: true,
    message: 'Access Granted: Doctor Test Endpoint Verified',
    user: req.user
  });
}

function testAdminEndpoint(req, res) {
  res.status(200).json({
    success: true,
    message: 'Access Granted: Admin Test Endpoint Verified',
    user: req.user
  });
}

module.exports = {
  testPatientEndpoint,
  testDoctorEndpoint,
  testAdminEndpoint
};
