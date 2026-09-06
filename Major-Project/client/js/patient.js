// ============================================================================
// CareNova Health — Client Patient Portal Controller
// iNeuBytes Web Development Internship — Major Project Phase 3C Patient Module
// ============================================================================

const PatientApp = {

  // --------------------------------------------------------------------------
  // 1. Initialize Patient Dashboard View (patient-dashboard.html)
  // --------------------------------------------------------------------------
  async initDashboard() {
    const user = await AuthManager.checkSession();
    if (!user || user.role !== 'patient') {
      window.location.href = 'login.html';
      return;
    }

    const patientNameEl = document.getElementById('patientNameText');
    if (patientNameEl) {
      patientNameEl.textContent = `${user.firstName} ${user.lastName}`;
    }

    // Fetch Profile
    const profileRes = await ApiService.getPatientProfile();
    if (profileRes.success && profileRes.data.patient) {
      const p = profileRes.data.patient;
      const profileInfoEl = document.getElementById('profileSummaryText');
      if (profileInfoEl) {
        profileInfoEl.textContent = `Gender: ${p.gender || 'N/A'} | DOB: ${p.dateOfBirth ? p.dateOfBirth.split('T')[0] : 'N/A'} | Blood Group: ${p.bloodGroup || 'N/A'}`;
      }
    }

    // Fetch Appointments
    const apptsRes = await ApiService.getMyAppointments();
    if (apptsRes.success && apptsRes.data.appointments) {
      const appointments = apptsRes.data.appointments;
      
      // Compute Metrics
      const totalCount = appointments.length;
      const upcomingAppts = appointments.filter(a => (a.status === 'Confirmed' || a.status === 'Rescheduled'));
      const completedCount = appointments.filter(a => a.status === 'Completed').length;
      const cancelledCount = appointments.filter(a => a.status === 'Cancelled').length;

      const totalCountEl = document.getElementById('statTotalAppts');
      const upcomingCountEl = document.getElementById('statUpcomingAppts');
      const completedCountEl = document.getElementById('statCompletedAppts');

      if (totalCountEl) totalCountEl.textContent = totalCount;
      if (upcomingCountEl) upcomingCountEl.textContent = upcomingAppts.length;
      if (completedCountEl) completedCountEl.textContent = completedCount;

      // Render Upcoming Appointment Banner
      const upcomingBanner = document.getElementById('upcomingApptBanner');
      if (upcomingBanner) {
        if (upcomingAppts.length > 0) {
          const nextAppt = upcomingAppts[0];
          upcomingBanner.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
              <div>
                <span class="status-pill confirmed" style="font-size: 0.75rem;">UPCOMING APPOINTMENT</span>
                <h3 style="margin-top: 0.5rem; font-size: 1.1rem; color: var(--primary-color);">
                  ${nextAppt.doctorName} (${nextAppt.departmentName})
                </h3>
                <p style="font-size: 0.9rem; color: var(--text-muted); margin-top: 0.25rem;">
                  📅 <strong>${nextAppt.appointmentDate}</strong> at ⏰ <strong>${nextAppt.timeSlot}</strong> | Ref: <code>${nextAppt.referenceId}</code>
                </p>
              </div>
              <a href="appointments.html" class="btn btn-primary" style="font-size: 0.85rem;">Manage Booking</a>
            </div>
          `;
        } else {
          upcomingBanner.innerHTML = `
            <p style="color: var(--text-muted); font-size: 0.9rem;">
              No upcoming appointments scheduled. <a href="doctors.html" style="color: var(--primary-color); font-weight: 600;">Browse Doctors & Book Now →</a>
            </p>
          `;
        }
      }

      // Render Recent Appointments Table Widget
      const recentTableBody = document.getElementById('recentApptsTableBody');
      if (recentTableBody) {
        if (appointments.length === 0) {
          recentTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">No appointment history found.</td></tr>`;
        } else {
          const recentList = appointments.slice(0, 5);
          recentTableBody.innerHTML = recentList.map(a => `
            <tr>
              <td><code>${a.referenceId}</code></td>
              <td><strong>${a.doctorName}</strong><br><small style="color: var(--text-muted);">${a.departmentName}</small></td>
              <td>${a.appointmentDate}</td>
              <td>${a.timeSlot}</td>
              <td>₹${Number(a.consultationFee).toFixed(2)}</td>
              <td><span class="status-pill ${a.status.toLowerCase()}">${a.status}</span></td>
            </tr>
          `).join('');
        }
      }
    }
  },

  // --------------------------------------------------------------------------
  // 2. Initialize Patient Profile View (patient-profile.html)
  // --------------------------------------------------------------------------
  async initProfile() {
    const user = await AuthManager.checkSession();
    if (!user || user.role !== 'patient') {
      window.location.href = 'login.html';
      return;
    }

    const res = await ApiService.getPatientProfile();
    if (res.success && res.data.patient) {
      const p = res.data.patient;

      // Populate Form Fields
      document.getElementById('firstName').value = p.firstName || '';
      document.getElementById('lastName').value = p.lastName || '';
      document.getElementById('email').value = p.email || '';
      document.getElementById('phone').value = p.phone || '';
      document.getElementById('dateOfBirth').value = p.dateOfBirth ? p.dateOfBirth.split('T')[0] : '';
      document.getElementById('gender').value = p.gender || 'female';
      document.getElementById('bloodGroup').value = p.bloodGroup || '';
      document.getElementById('address').value = p.address || '';
      document.getElementById('emergencyContact').value = p.emergencyContact || '';
      document.getElementById('medicalHistorySummary').value = p.medicalHistorySummary || '';
    }

    // Attach Profile Form Submit Handler
    const profileForm = document.getElementById('patientProfileForm');
    if (profileForm) {
      profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const alertEl = document.getElementById('profileAlert');
        const submitBtn = document.getElementById('saveProfileBtn');

        alertEl.style.display = 'none';
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving Profile...';

        const updateData = {
          firstName: document.getElementById('firstName').value.trim(),
          lastName: document.getElementById('lastName').value.trim(),
          phone: document.getElementById('phone').value.trim(),
          dateOfBirth: document.getElementById('dateOfBirth').value,
          gender: document.getElementById('gender').value,
          bloodGroup: document.getElementById('bloodGroup').value.trim(),
          address: document.getElementById('address').value.trim(),
          emergencyContact: document.getElementById('emergencyContact').value.trim(),
          medicalHistorySummary: document.getElementById('medicalHistorySummary').value.trim()
        };

        const updateRes = await ApiService.updatePatientProfile(updateData);
        submitBtn.disabled = false;
        submitBtn.textContent = 'Save Profile Changes';

        if (updateRes.success) {
          alertEl.className = 'form-alert success';
          alertEl.style.display = 'block';
          alertEl.textContent = 'Profile updated successfully!';
          AuthManager.checkSession();
        } else {
          alertEl.className = 'form-alert error';
          alertEl.style.display = 'block';
          alertEl.textContent = updateRes.message || 'Failed to update profile.';
        }
      });
    }
  },

  // --------------------------------------------------------------------------
  // 3. Initialize Doctor Discovery & Booking View (doctors.html)
  // --------------------------------------------------------------------------
  async initDoctorsView() {
    await AuthManager.checkSession();

    // Load Departments into Filter & Form Select
    const deptRes = await ApiService.getDepartments();
    const deptSelect = document.getElementById('departmentFilter');
    if (deptSelect && deptRes.success && deptRes.data.departments) {
      deptSelect.innerHTML = `<option value="">All Clinical Departments</option>` +
        deptRes.data.departments.map(d => `<option value="${d.id}">${d.name} (${d.code})</option>`).join('');
    }

    // Load Initial Doctor List
    await this.loadDoctorsList();

    // Attach Search & Filter Listeners
    if (deptSelect) {
      deptSelect.addEventListener('change', () => this.loadDoctorsList());
    }

    const searchInput = document.getElementById('doctorSearchInput');
    if (searchInput) {
      let debounceTimeout;
      searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => this.loadDoctorsList(), 300);
      });
    }
  },

  async loadDoctorsList() {
    const deptId = document.getElementById('departmentFilter')?.value || '';
    const search = document.getElementById('doctorSearchInput')?.value || '';

    let queryParams = [];
    if (deptId) queryParams.push(`departmentId=${deptId}`);
    if (search) queryParams.push(`search=${encodeURIComponent(search)}`);

    const res = await ApiService.getDoctors(queryParams.join('&'));
    const grid = document.getElementById('doctorsGrid');

    if (!grid) return;

    if (!res.success || !res.data.doctors || res.data.doctors.length === 0) {
      grid.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-muted);">No qualified doctors match your filter criteria.</div>`;
      return;
    }

    grid.innerHTML = res.data.doctors.map(d => `
      <div class="module-card" style="display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
            <span class="module-tag implemented">${d.departmentName}</span>
            <span style="font-weight: 700; color: var(--primary-color); font-size: 1.05rem;">₹${Number(d.consultationFee).toFixed(2)}</span>
          </div>
          <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.25rem;">${d.fullName}</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); font-weight: 500; margin-bottom: 0.75rem;">${d.qualification} (${d.experienceYears} Years Exp)</p>
          <p style="font-size: 0.85rem; color: var(--text-main); line-height: 1.4; margin-bottom: 1rem;">${d.bio || 'Dedicated medical specialist.'}</p>
          <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1rem;">
            📅 Days: <strong>${d.availableDays}</strong>
          </div>
        </div>
        <button class="btn btn-primary" onclick="PatientApp.openBookingModal(${d.id})" style="width: 100%; font-size: 0.85rem;">Book Appointment</button>
      </div>
    `).join('');
  },

  // Open Booking Modal for Selected Doctor
  async openBookingModal(doctorId) {
    const user = AuthManager.currentUser;
    if (!user || user.role !== 'patient') {
      alert('Please log in as a Patient to book an appointment.');
      window.location.href = 'login.html';
      return;
    }

    const res = await ApiService.getDoctorById(doctorId);
    if (!res.success || !res.data.doctor) {
      alert('Unable to retrieve doctor details.');
      return;
    }

    const doc = res.data.doctor;
    document.getElementById('modalDoctorId').value = doc.id;
    document.getElementById('modalDepartmentId').value = doc.departmentId;
    document.getElementById('modalDoctorName').textContent = doc.fullName;
    document.getElementById('modalDoctorDept').textContent = `${doc.departmentName} — Consultation Fee: ₹${Number(doc.consultationFee).toFixed(2)}`;

    // Set Default Date to Today
    const dateInput = document.getElementById('modalApptDate');
    const todayStr = new Date().toISOString().split('T')[0];
    dateInput.value = todayStr;
    dateInput.min = todayStr;

    // Load Time Slots
    await this.loadModalSlots(doc.id, dateInput.value);

    dateInput.onchange = () => this.loadModalSlots(doc.id, dateInput.value);

    // Show Modal
    const modal = document.getElementById('bookingModal');
    if (modal) modal.style.display = 'flex';
  },

  async loadModalSlots(doctorId, dateStr) {
    const slotContainer = document.getElementById('modalSlotContainer');
    if (!slotContainer) return;

    slotContainer.innerHTML = '<span style="font-size: 0.85rem; color: var(--text-muted);">Loading available slots...</span>';

    const res = await ApiService.getDoctorAvailableSlots(doctorId, dateStr);
    if (res.success && res.data.slots) {
      const slots = res.data.slots;
      slotContainer.innerHTML = slots.map((s, idx) => `
        <label style="display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.75rem; border: 1px solid var(--border-color); border-radius: 6px; font-size: 0.85rem; cursor: ${s.isAvailable ? 'pointer' : 'not-allowed'}; background-color: ${s.isAvailable ? '#FFFFFF' : '#F1F5F9'}; color: ${s.isAvailable ? 'var(--text-main)' : '#94A3B8'};">
          <input type="radio" name="timeSlotRadio" value="${s.slot}" ${!s.isAvailable ? 'disabled' : (idx === 0 ? 'checked' : '')}>
          <span>${s.slot} ${!s.isAvailable ? '(Booked)' : ''}</span>
        </label>
      `).join('');
    } else {
      slotContainer.innerHTML = '<span style="font-size: 0.85rem; color: var(--error-color);">No slots available for this date.</span>';
    }
  },

  closeBookingModal() {
    const modal = document.getElementById('bookingModal');
    if (modal) modal.style.display = 'none';
  },

  async submitBooking() {
    const doctorId = document.getElementById('modalDoctorId').value;
    const departmentId = document.getElementById('modalDepartmentId').value;
    const appointmentDate = document.getElementById('modalApptDate').value;
    const reasonForVisit = document.getElementById('modalReason').value.trim();
    
    const selectedSlotRadio = document.querySelector('input[name="timeSlotRadio"]:checked');
    if (!selectedSlotRadio) {
      alert('Please select an available time slot.');
      return;
    }
    const timeSlot = selectedSlotRadio.value;

    const alertEl = document.getElementById('bookingAlert');
    const submitBtn = document.getElementById('submitBookingBtn');

    alertEl.style.display = 'none';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Confirming Booking...';

    const res = await ApiService.bookAppointment({
      doctorId,
      departmentId,
      appointmentDate,
      timeSlot,
      reasonForVisit
    });

    submitBtn.disabled = false;
    submitBtn.textContent = 'Confirm Booking';

    if (res.success) {
      alertEl.className = 'form-alert success';
      alertEl.style.display = 'block';
      alertEl.textContent = `Appointment Confirmed! Reference Code: ${res.data.appointment.referenceId}`;

      setTimeout(() => {
        this.closeBookingModal();
        window.location.href = 'appointments.html';
      }, 1500);
    } else {
      alertEl.className = 'form-alert error';
      alertEl.style.display = 'block';
      alertEl.textContent = res.message || 'Booking failed. Selected slot may be reserved.';
    }
  },

  // --------------------------------------------------------------------------
  // 4. Initialize Appointments History View (appointments.html)
  // --------------------------------------------------------------------------
  async initAppointmentsView() {
    const user = await AuthManager.checkSession();
    if (!user || user.role !== 'patient') {
      window.location.href = 'login.html';
      return;
    }

    const res = await ApiService.getMyAppointments();
    const tableBody = document.getElementById('appointmentsTableBody');
    if (!tableBody) return;

    if (!res.success || !res.data.appointments || res.data.appointments.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 3rem; color: var(--text-muted);">No appointments booked yet. <a href="doctors.html">Book your first appointment →</a></td></tr>`;
      return;
    }

    const appts = res.data.appointments;
    tableBody.innerHTML = appts.map(a => {
      const isCancellable = (a.status === 'Confirmed' || a.status === 'Rescheduled' || a.status === 'Pending');
      return `
        <tr>
          <td><code>${a.referenceId}</code></td>
          <td><strong>${a.doctorName}</strong><br><small style="color: var(--text-muted);">${a.departmentName}</small></td>
          <td>${a.appointmentDate}</td>
          <td>${a.timeSlot}</td>
          <td>₹${Number(a.consultationFee).toFixed(2)}</td>
          <td><span class="status-pill ${a.status.toLowerCase()}">${a.status}</span></td>
          <td>
            <div style="display: flex; gap: 0.4rem;">
              ${isCancellable ? `
                <button class="btn btn-outline" onclick="PatientApp.openRescheduleModal(${a.id}, '${a.doctorId}', '${a.appointmentDate}')" style="padding: 0.25rem 0.5rem; font-size: 0.78rem;">Reschedule</button>
                <button class="btn btn-outline" onclick="PatientApp.cancelBooking(${a.id})" style="padding: 0.25rem 0.5rem; font-size: 0.78rem; border-color: var(--error-color); color: var(--error-color);">Cancel</button>
              ` : '<span style="font-size: 0.8rem; color: var(--text-muted);">No Actions</span>'}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  async openRescheduleModal(appointmentId, doctorId, currentDate) {
    document.getElementById('rescheduleApptId').value = appointmentId;
    document.getElementById('rescheduleDoctorId').value = doctorId;

    const dateInput = document.getElementById('rescheduleDate');
    const todayStr = new Date().toISOString().split('T')[0];
    dateInput.value = currentDate || todayStr;
    dateInput.min = todayStr;

    await this.loadRescheduleSlots(doctorId, dateInput.value);

    dateInput.onchange = () => this.loadRescheduleSlots(doctorId, dateInput.value);

    const modal = document.getElementById('rescheduleModal');
    if (modal) modal.style.display = 'flex';
  },

  async loadRescheduleSlots(doctorId, dateStr) {
    const slotContainer = document.getElementById('rescheduleSlotContainer');
    if (!slotContainer) return;

    slotContainer.innerHTML = '<span style="font-size: 0.85rem; color: var(--text-muted);">Loading slots...</span>';

    const res = await ApiService.getDoctorAvailableSlots(doctorId, dateStr);
    if (res.success && res.data.slots) {
      slotContainer.innerHTML = res.data.slots.map((s, idx) => `
        <label style="display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.75rem; border: 1px solid var(--border-color); border-radius: 6px; font-size: 0.85rem; cursor: ${s.isAvailable ? 'pointer' : 'not-allowed'}; background-color: ${s.isAvailable ? '#FFFFFF' : '#F1F5F9'}; color: ${s.isAvailable ? 'var(--text-main)' : '#94A3B8'};">
          <input type="radio" name="rescheduleSlotRadio" value="${s.slot}" ${!s.isAvailable ? 'disabled' : (idx === 0 ? 'checked' : '')}>
          <span>${s.slot} ${!s.isAvailable ? '(Booked)' : ''}</span>
        </label>
      `).join('');
    } else {
      slotContainer.innerHTML = '<span style="font-size: 0.85rem; color: var(--error-color);">No slots available.</span>';
    }
  },

  closeRescheduleModal() {
    const modal = document.getElementById('rescheduleModal');
    if (modal) modal.style.display = 'none';
  },

  async submitReschedule() {
    const appointmentId = document.getElementById('rescheduleApptId').value;
    const newDate = document.getElementById('rescheduleDate').value;
    const selectedSlotRadio = document.querySelector('input[name="rescheduleSlotRadio"]:checked');

    if (!selectedSlotRadio) {
      alert('Please select an available time slot.');
      return;
    }
    const newTimeSlot = selectedSlotRadio.value;

    const alertEl = document.getElementById('rescheduleAlert');
    const submitBtn = document.getElementById('submitRescheduleBtn');

    alertEl.style.display = 'none';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Rescheduling...';

    const res = await ApiService.rescheduleAppointment(appointmentId, { newDate, newTimeSlot });

    submitBtn.disabled = false;
    submitBtn.textContent = 'Confirm Reschedule';

    if (res.success) {
      alertEl.className = 'form-alert success';
      alertEl.style.display = 'block';
      alertEl.textContent = 'Appointment rescheduled successfully!';

      setTimeout(() => {
        this.closeRescheduleModal();
        this.initAppointmentsView();
      }, 1200);
    } else {
      alertEl.className = 'form-alert error';
      alertEl.style.display = 'block';
      alertEl.textContent = res.message || 'Rescheduling failed.';
    }
  },

  async cancelBooking(appointmentId) {
    if (!confirm('Are you sure you want to cancel this appointment? The time slot will be released.')) {
      return;
    }

    const res = await ApiService.cancelAppointment(appointmentId);
    if (res.success) {
      alert('Appointment cancelled successfully.');
      this.initAppointmentsView();
    } else {
      alert(res.message || 'Failed to cancel appointment.');
    }
  },

  // --------------------------------------------------------------------------
  // 5. Initialize Medical Records View (medical-records.html)
  // --------------------------------------------------------------------------
  async initMedicalRecordsView() {
    const user = await AuthManager.checkSession();
    if (!user || user.role !== 'patient') {
      window.location.href = 'login.html';
      return;
    }

    const res = await ApiService.getMyMedicalRecords();
    const container = document.getElementById('medicalRecordsContainer');
    if (!container) return;

    if (!res.success || !res.data.records || res.data.records.length === 0) {
      container.innerHTML = `<div class="status-monitor-card" style="text-align: center; padding: 3rem; color: var(--text-muted);">No clinical medical records found. Records are entered by attending physicians after completed consultations.</div>`;
      return;
    }

    const records = res.data.records;
    container.innerHTML = records.map(r => `
      <div class="status-monitor-card" style="margin-bottom: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
          <div>
            <span class="status-pill confirmed" style="font-size: 0.75rem;">RECORD CODE: ${r.recordCode}</span>
            <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-main); margin-top: 0.4rem;">${r.doctorName} (${r.departmentName})</h3>
            <p style="font-size: 0.85rem; color: var(--text-muted);">Consultation Date: <strong>${r.appointmentDate}</strong> (${r.timeSlot})</p>
          </div>
          ${r.recommendedFollowupDate ? `<span class="status-pill pending" style="font-size: 0.75rem;">Follow-up: ${r.recommendedFollowupDate}</span>` : ''}
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem;">
          <div style="background-color: #F8FAFC; padding: 1rem; border-radius: 6px; border: 1px solid var(--border-color);">
            <h4 style="font-size: 0.85rem; font-weight: 700; color: var(--primary-color); text-transform: uppercase; margin-bottom: 0.4rem;">🩺 Clinical Diagnosis</h4>
            <p style="font-size: 0.9rem; color: var(--text-main); line-height: 1.4;">${r.diagnosis}</p>
          </div>

          <div style="background-color: #F8FAFC; padding: 1rem; border-radius: 6px; border: 1px solid var(--border-color);">
            <h4 style="font-size: 0.85rem; font-weight: 700; color: var(--primary-color); text-transform: uppercase; margin-bottom: 0.4rem;">💊 Digital Prescription</h4>
            <p style="font-size: 0.9rem; color: var(--text-main); line-height: 1.4;">${r.prescription || 'None prescribed.'}</p>
          </div>
        </div>

        ${r.doctorNotes ? `
          <div style="margin-top: 1rem; padding-top: 0.75rem; border-top: 1px dashed var(--border-color);">
            <h4 style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.25rem;">📝 Doctor Clinical Notes</h4>
            <p style="font-size: 0.88rem; color: var(--text-main);">${r.doctorNotes}</p>
          </div>
        ` : ''}
      </div>
    `).join('');
  }
};
