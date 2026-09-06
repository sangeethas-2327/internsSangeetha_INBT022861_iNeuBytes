// ============================================================================
// CareNova Health — UI Renderer & Status Monitor
// iNeuBytes Web Development Internship — Major Project Phase 3A Foundation
// ============================================================================

const UiManager = {
  // Update Health Status Monitor Card
  renderHealthStatus(result) {
    const statusPill = document.getElementById('apiStatusPill');
    const apiStatusText = document.getElementById('apiStatusText');
    const dbStatusText = document.getElementById('dbStatusText');
    const timestampText = document.getElementById('timestampText');

    if (!statusPill || !apiStatusText) return;

    if (result.success && result.data) {
      statusPill.className = 'status-pill online';
      statusPill.innerHTML = '🟢 Express API Operational';
      
      apiStatusText.textContent = `${result.data.message} (${result.data.version})`;
      dbStatusText.textContent = result.data.databaseNotice || result.data.database;
      timestampText.textContent = new Date(result.data.timestamp).toLocaleString();
    } else {
      statusPill.className = 'status-pill offline';
      statusPill.innerHTML = '🔴 Backend Disconnected';
      
      apiStatusText.textContent = result.error || 'Server offline';
      dbStatusText.textContent = 'Backend server must be started (npm start in server/ folder)';
      timestampText.textContent = new Date().toLocaleString();
    }
  },

  // Setup Placeholder Navigation Notifications
  setupPlaceholderLinks() {
    const placeholders = document.querySelectorAll('.nav-link.placeholder, .placeholder-action');
    placeholders.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const moduleName = link.dataset.module || 'This module';
        alert(`ℹ️ CareNova Health Phase 3A Foundation Notice:\n\n${moduleName} is planned for Phase 3B/3C implementation.\n\nAuthentication, Dashboards, and CRUD endpoints will be enabled in subsequent phase releases upon review.`);
      });
    });
  }
};
