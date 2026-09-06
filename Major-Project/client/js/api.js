// ============================================================================
// CareNova Health — Client API Connectivity Layer
// iNeuBytes Web Development Internship — Major Project Phase 3B Auth & RBAC
// ============================================================================

const ApiService = {
  // Generic HTTP Request Helper with Credentials (HttpOnly Cookie Support)
  async request(endpoint, options = {}) {
    const url = `${CONFIG.API_BASE_URL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    const config = {
      ...options,
      credentials: 'include', // Includes HttpOnly cookies across origins
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          status: response.status,
          message: data.message || `HTTP Error ${response.status}`
        };
      }

      return {
        success: true,
        status: response.status,
        data: data
      };
    } catch (error) {
      return {
        success: false,
        status: 0,
        message: error.message || 'Network error connecting to Express server.'
      };
    }
  },

  // Health Endpoint Check
  async checkHealth() {
    return this.request('/health', { method: 'GET' });
  },

  // Auth: Register Patient
  async register(patientData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(patientData)
    });
  },

  // Auth: User Login
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },

  // Auth: User Logout
  async logout() {
    return this.request('/auth/logout', {
      method: 'POST'
    });
  },

  // Auth: Get Current Profile
  async getMe() {
    return this.request('/auth/me', {
      method: 'GET'
    });
  },

  // RBAC Test Endpoint Verification Call
  async testRbac(role) {
    return this.request(`/test/${role}`, {
      method: 'GET'
    });
  }
};
