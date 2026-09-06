// ============================================================================
// CareNova Health — Client API Connectivity Layer
// iNeuBytes Web Development Internship — Major Project Phase 3C Patient Module
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
  },

  // --- Phase 3C Patient Module Methods ---

  // Patient Profile
  async getPatientProfile() {
    return this.request('/patients/me', { method: 'GET' });
  },

  async updatePatientProfile(profileData) {
    return this.request('/patients/me', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  },

  // Departments
  async getDepartments() {
    return this.request('/departments', { method: 'GET' });
  },

  // Doctors
  async getDoctors(queryString = '') {
    const ep = queryString ? `/doctors?${queryString}` : '/doctors';
    return this.request(ep, { method: 'GET' });
  },

  async getDoctorById(id) {
    return this.request(`/doctors/${id}`, { method: 'GET' });
  },

  async getDoctorAvailableSlots(id, date) {
    return this.request(`/doctors/${id}/available-slots?date=${encodeURIComponent(date)}`, { method: 'GET' });
  },

  // Appointments
  async bookAppointment(appointmentData) {
    return this.request('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData)
    });
  },

  async getMyAppointments() {
    return this.request('/appointments/my', { method: 'GET' });
  },

  async getAppointmentById(id) {
    return this.request(`/appointments/${id}`, { method: 'GET' });
  },

  async rescheduleAppointment(id, rescheduleData) {
    return this.request(`/appointments/${id}/reschedule`, {
      method: 'PUT',
      body: JSON.stringify(rescheduleData)
    });
  },

  async cancelAppointment(id) {
    return this.request(`/appointments/${id}/cancel`, {
      method: 'PUT'
    });
  },

  // Medical Records
  async getMyMedicalRecords() {
    return this.request('/medical-records/my', { method: 'GET' });
  },

  async getMedicalRecordById(id) {
    return this.request(`/medical-records/${id}`, { method: 'GET' });
  },

  // --- Phase 3D Doctor Module Methods ---
  async getDoctorProfile() {
    return this.request('/doctors/me', { method: 'GET' });
  },

  async updateDoctorProfile(profileData) {
    return this.request('/doctors/me', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  },

  async getDoctorDashboard() {
    return this.request('/doctors/me/dashboard', { method: 'GET' });
  },

  async getDoctorAppointments(queryString = '') {
    const ep = queryString ? `/doctors/me/appointments?${queryString}` : '/doctors/me/appointments';
    return this.request(ep, { method: 'GET' });
  },

  async getDoctorAppointmentById(id) {
    return this.request(`/doctors/me/appointments/${id}`, { method: 'GET' });
  },

  async updateDoctorAppointmentStatus(id, statusData) {
    return this.request(`/doctors/me/appointments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusData)
    });
  },

  async submitDoctorConsultation(id, consultationData) {
    return this.request(`/doctors/me/appointments/${id}/consultation`, {
      method: 'POST',
      body: JSON.stringify(consultationData)
    });
  },

  async getDoctorAuthoredRecords() {
    return this.request('/doctors/me/records', { method: 'GET' });
  },

  async updateAuthoredRecord(id, recordData) {
    return this.request(`/doctors/me/records/${id}`, {
      method: 'PUT',
      body: JSON.stringify(recordData)
    });
  }
};
