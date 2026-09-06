// ============================================================================
// CareNova Health — Client Application Entry Initializer
// iNeuBytes Web Development Internship — Major Project Phase 3A Foundation
// ============================================================================

document.addEventListener('DOMContentLoaded', async () => {
  console.log(`[CareNova Health] Initializing Phase 3A Client Shell...`);
  
  // Setup placeholder navigation links
  UiManager.setupPlaceholderLinks();

  // Test backend connectivity
  const healthResult = await ApiService.checkHealth();
  console.log(`[CareNova Health API Status]:`, healthResult);
  
  // Render health status badge
  UiManager.renderHealthStatus(healthResult);
});
