// ============================================================================
// CareNova Health — Client API Connectivity Layer
// iNeuBytes Web Development Internship — Major Project Phase 3A Foundation
// ============================================================================

const ApiService = {
  // Fetch Backend Health Endpoint
  async checkHealth() {
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Unable to connect to Express Backend Server (Port 5000)'
      };
    }
  }
};
