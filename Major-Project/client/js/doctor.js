// ============================================================================
// CareNova Health — Doctor Workstation Controller
// iNeuBytes Web Development Internship — Major Project Phase 3D Doctor Module
// ============================================================================

const DoctorApp = {
  currentDoctor: null,

  // --------------------------------------------------------------------------
  // 1. Initialize Doctor Session & Portal Security Guard
  // --------------------------------------------------------------------------
  async init(pageType) {
    const user = await AuthManager.checkSession();
    if (!user) {
      window.location.href = '../login.html';
      return;
    }

    if (user.role !== 'doctor') {
      alert('Access Denied. The Doctor Workstation is restricted to authorized medical providers.');
      window.location.href = '../index.html';
      return;
    }

    // Fetch Doctor Profile
    const profRes = await ApiService.getDoctorProfile();
    if (profRes.success && profRes.data && profRes.data.doctor) {
      this.currentDoctor = profRes.data.doctor;
      this.renderDoctorHeader();
    } else {
      alert('Could not resolve doctor profile details.');
    }

    // Route page logic
    if (pageType === 'dashboard') {
      await this.loadDashboard();
    } else if (pageType === 'profile') {
      await this.loadProfile();
    } else if (pageType === 'appointments') {
      await this.loadAppointments();
    } else if (pageType === 'consultation') {
      await this.loadConsultation();
    } else if (pageType === 'records') {
      await this.loadRecords();
    }
  },

  // Render Doctor Navigation Header
  renderDoctorHeader() {
    const headerTitle = document.getElementById('doctorHeaderTitle');
    if (headerTitle && this.currentDoctor) {
      headerTitle.textContent = `${this.currentDoctor.fullName} (${this.currentDoctor.departmentName})`;
    }
  },

  // --------------------------------------------------------------------------
  // 2. Doctor Dashboard Overview
  // --------------------------------------------------------------------------
  async loadDashboard() {
    const todayCntEl = document.getElementById('statTodayCount');
    const upcomingCntEl = document.getElementById('statUpcomingCount');
    const pendingCntEl = document.getElementById('statPendingCount');
    const completedCntEl = document.getElementById('statCompletedCount');
    const cancelledCntEl = document.getElementById('statCancelledCount');
    const todayFeedEl = document.getElementById('todayScheduleFeed');

    const res = await ApiService.getDoctorDashboard();
    if (res.success && res.data) {
      const { stats, todayAppointments } = res.data;
      if (todayCntEl) todayCntEl.textContent = stats.todayCount || 0;
      if (upcomingCntEl) upcomingCntEl.textContent = stats.upcomingCount || 0;
      if (pendingCntEl) pendingCntEl.textContent = stats.pendingCount || 0;
      if (completedCntEl) completedCntEl.textContent = stats.completedCount || 0;
      if (cancelledCntEl) cancelledCntEl.textContent = stats.cancelledCount || 0;

      if (todayFeedEl) {
        if (!todayAppointments || todayAppointments.length === 0) {
          todayFeedEl.innerHTML = `
            <div style="padding: 2rem; text-align: center; color: var(--text-muted);">
              <p>No consultations scheduled for today.</p>
            </div>
          `;
        } else {
          todayFeedEl.innerHTML = todayAppointments.map(appt => `
            <div class="card" style="margin-bottom: 1rem; border-left: 4px solid var(--primary-color);">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
                <div>
                  <h4 style="margin: 0; color: var(--primary-color);">👤 ${appt.patientName}</h4>
                  <p style="margin: 0.25rem 0; font-size: 0.85rem; color: var(--text-muted);">
                    Ref: <strong>${appt.referenceId}</strong> | 📞 ${appt.patientPhone}
                  </p>
                  <p style="margin: 0; font-size: 0.9rem;">
                    ⏰ <strong>${appt.timeSlot}</strong> — <em>${appt.reasonForVisit || 'General Consultation'}</em>
                  </p>
                </div>
                <div>
                  <span class="badge badge-${appt.status.toLowerCase()}">${appt.status}</span>
                  ${(appt.status === 'Confirmed' || appt.status === 'Rescheduled') ? `
                    <a href="consultation.html?id=${appt.id}" class="btn btn-primary" style="padding: 0.35rem 0.75rem; font-size: 0.8rem; margin-left: 0.5rem;">Start Consultation</a>
                  ` : ''}
                </div>
              </div>
            </div>
          `).join('');
        }
      }
    }
  },

  // --------------------------------------------------------------------------
  // 3. Doctor Profile & Schedule Management
  // --------------------------------------------------------------------------
  async loadProfile() {
    if (!this.currentDoctor) return;
    const d = this.currentDoctor;

    const qualInput = document.getElementById('profQualification');
    const expInput = document.getElementById('profExperience');
    const feeInput = document.getElementById('profFee');
    const bioInput = document.getElementById('profBio');
    const daysInput = document.getElementById('profAvailableDays');
    const slotsContainer = document.getElementById('slotsCheckGrid');

    if (qualInput) qualInput.value = d.qualification || '';
    if (expInput) expInput.value = d.experienceYears || 0;
    if (feeInput) feeInput.value = d.consultationFee || 500;
    if (bioInput) bioInput.value = d.bio || '';
    if (daysInput) daysInput.value = d.availableDays || 'Mon,Tue,Wed,Thu,Fri';

    // Standard Slot Options
    const allSlots = [
      "08:30 AM", "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
      "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM"
    ];
    const activeSlots = d.availableSlots || ["09:00 AM", "10:30 AM", "02:00 PM", "04:00 PM"];

    if (slotsContainer) {
      slotsContainer.innerHTML = allSlots.map(s => `
        <label style="display: flex; align-items: center; gap: 0.5rem; background: var(--bg-slate); padding: 0.5rem; border-radius: 6px; font-size: 0.85rem;">
          <input type="checkbox" name="doctorSlot" value="${s}" ${activeSlots.includes(s) ? 'checked' : ''} />
          ${s}
        </label>
      `).join('');
    }

    const form = document.getElementById('doctorProfileForm');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.saveProfile();
      });
    }
  },

  async saveProfile() {
    const alertEl = document.getElementById('profileAlert');
    const qual = document.getElementById('profQualification').value;
    const exp = Number(document.getElementById('profExperience').value);
    const fee = Number(document.getElementById('profFee').value);
    const bio = document.getElementById('profBio').value;
    const days = document.getElementById('profAvailableDays').value;

    const checkedBoxes = document.querySelectorAll('input[name="doctorSlot"]:checked');
    const selectedSlots = Array.from(checkedBoxes).map(cb => cb.value);

    if (selectedSlots.length === 0) {
      if (alertEl) {
        alertEl.className = 'form-alert error';
        alertEl.style.display = 'block';
        alertEl.textContent = 'Please select at least one available time slot for your schedule.';
      }
      return;
    }

    const payload = {
      qualification: qual,
      experienceYears: exp,
      consultationFee: fee,
      bio: bio,
      availableDays: days,
      availableSlots: selectedSlots
    };

    const res = await ApiService.updateDoctorProfile(payload);
    if (res.success) {
      if (alertEl) {
        alertEl.className = 'form-alert success';
        alertEl.style.display = 'block';
        alertEl.textContent = 'Profile & schedule updated successfully!';
      }
      this.currentDoctor = res.data.doctor;
    } else {
      if (alertEl) {
        alertEl.className = 'form-alert error';
        alertEl.style.display = 'block';
        alertEl.textContent = res.message || 'Failed to update profile.';
      }
    }
  },

  // --------------------------------------------------------------------------
  // 4. Assigned Appointments Roster
  // --------------------------------------------------------------------------
  async loadAppointments() {
    const dateFilter = document.getElementById('filterDate');
    const statusFilter = document.getElementById('filterStatus');
    const searchInput = document.getElementById('filterSearch');
    const listEl = document.getElementById('appointmentsRosterList');

    const fetchAndRender = async () => {
      let qs = [];
      if (dateFilter && dateFilter.value) qs.push(`date=${encodeURIComponent(dateFilter.value)}`);
      if (statusFilter && statusFilter.value) qs.push(`status=${encodeURIComponent(statusFilter.value)}`);
      if (searchInput && searchInput.value) qs.push(`search=${encodeURIComponent(searchInput.value)}`);

      const queryString = qs.join('&');
      const res = await ApiService.getDoctorAppointments(queryString);

      if (res.success && res.data) {
        const appts = res.data.appointments;
        if (!appts || appts.length === 0) {
          listEl.innerHTML = `
            <div style="padding: 3rem; text-align: center; color: var(--text-muted);">
              <h3>No appointments found</h3>
              <p>Try adjusting your date or status filters.</p>
            </div>
          `;
          return;
        }

        listEl.innerHTML = appts.map(a => `
          <div class="card" style="margin-bottom: 1rem; border-left: 4px solid ${a.status === 'Completed' ? 'var(--secondary-color)' : a.status === 'Cancelled' ? 'var(--error-color)' : 'var(--primary-color)'};">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
              <div>
                <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">REF: ${a.referenceId}</span>
                <h3 style="margin: 0.25rem 0; color: var(--primary-color);">👤 ${a.patientName}</h3>
                <p style="margin: 0.25rem 0; font-size: 0.85rem; color: var(--text-muted);">
                  📞 ${a.patientPhone} | ✉️ ${a.patientEmail} | DOB: ${a.patientDob || 'N/A'} (${a.patientGender || 'N/A'})
                </p>
                <p style="margin: 0.5rem 0; font-size: 0.95rem;">
                  📅 <strong>${a.appointmentDate}</strong> at ⏰ <strong>${a.timeSlot}</strong>
                </p>
                <p style="margin: 0; font-size: 0.85rem; font-style: italic; color: #475569;">
                  Reason for visit: "${a.reasonForVisit || 'Routine Checkup'}"
                </p>
              </div>
              <div style="text-align: right;">
                <span class="badge badge-${a.status.toLowerCase()}" style="margin-bottom: 0.5rem; display: inline-block;">${a.status}</span>
                <div style="display: flex; gap: 0.5rem; justify-content: flex-end; flex-wrap: wrap; margin-top: 0.5rem;">
                  ${(a.status === 'Confirmed' || a.status === 'Rescheduled') ? `
                    <a href="consultation.html?id=${a.id}" class="btn btn-primary" style="padding: 0.4rem 0.85rem; font-size: 0.85rem;">Conduct Consultation</a>
                    <button onclick="DoctorApp.handleCancelAppt(${a.id})" class="btn btn-outline" style="padding: 0.4rem 0.85rem; font-size: 0.85rem; color: var(--error-color); border-color: var(--error-color);">Cancel</button>
                  ` : a.status === 'Completed' ? `
                    <span style="font-size: 0.85rem; color: var(--secondary-color); font-weight: 600;">✓ Consultation Complete</span>
                  ` : ''}
                </div>
              </div>
            </div>
          </div>
        `).join('');
      }
    };

    if (dateFilter) dateFilter.addEventListener('change', fetchAndRender);
    if (statusFilter) statusFilter.addEventListener('change', fetchAndRender);
    if (searchInput) searchInput.addEventListener('input', fetchAndRender);

    await fetchAndRender();
  },

  async handleCancelAppt(id) {
    if (!confirm('Are you sure you want to cancel this patient appointment? The slot will be released.')) return;

    const res = await ApiService.updateDoctorAppointmentStatus(id, { status: 'Cancelled' });
    if (res.success) {
      alert('Appointment cancelled successfully.');
      await this.loadAppointments();
    } else {
      alert(res.message || 'Failed to cancel appointment.');
    }
  },

  // --------------------------------------------------------------------------
  // 5. Active Consultation Workspace
  // --------------------------------------------------------------------------
  async loadConsultation() {
    const urlParams = new URLSearchParams(window.location.search);
    const apptId = urlParams.get('id');

    if (!apptId) {
      alert('No appointment ID provided.');
      window.location.href = 'appointments.html';
      return;
    }

    const res = await ApiService.getDoctorAppointmentById(apptId);
    if (!res.success || !res.data || !res.data.appointment) {
      alert(res.message || 'Appointment not found or unauthorized access.');
      window.location.href = 'appointments.html';
      return;
    }

    const appt = res.data.appointment;

    const infoEl = document.getElementById('consultationPatientHeader');
    if (infoEl) {
      infoEl.innerHTML = `
        <div class="card" style="background: var(--bg-slate); border-left: 4px solid var(--primary-color); margin-bottom: 1.5rem;">
          <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
            <div>
              <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">REF: ${appt.referenceId}</span>
              <h2 style="margin: 0.25rem 0; color: var(--primary-color);">Patient: ${appt.patientName}</h2>
              <p style="margin: 0.25rem 0; font-size: 0.9rem;">
                📞 <strong>${appt.patientPhone}</strong> | ✉️ ${appt.patientEmail}
              </p>
              <p style="margin: 0.25rem 0; font-size: 0.9rem;">
                DOB: <strong>${appt.patientDob || 'N/A'}</strong> | Gender: <strong>${appt.patientGender || 'N/A'}</strong> | Blood Group: <strong style="color: var(--error-color);">${appt.patientBloodGroup || 'N/A'}</strong>
              </p>
            </div>
            <div>
              <p style="margin: 0; font-size: 0.9rem;">📅 Date: <strong>${appt.appointmentDate}</strong> (${appt.timeSlot})</p>
              <p style="margin: 0.25rem 0; font-size: 0.9rem;">Reason: <em>"${appt.reasonForVisit || 'N/A'}"</em></p>
              <span class="badge badge-${appt.status.toLowerCase()}">${appt.status}</span>
            </div>
          </div>
          ${appt.patientMedicalHistory ? `
            <div style="margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid #e2e8f0; font-size: 0.85rem;">
              <strong>Medical History Summary:</strong> ${appt.patientMedicalHistory}
            </div>
          ` : ''}
        </div>
      `;
    }

    const form = document.getElementById('consultationForm');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const diagnosis = document.getElementById('consultDiagnosis').value;
        const prescription = document.getElementById('consultPrescription').value;
        const doctorNotes = document.getElementById('consultDoctorNotes').value;
        const recommendedFollowupDate = document.getElementById('consultFollowupDate').value;
        const alertEl = document.getElementById('consultAlert');

        if (!diagnosis || !diagnosis.trim()) {
          if (alertEl) {
            alertEl.className = 'form-alert error';
            alertEl.style.display = 'block';
            alertEl.textContent = 'Please enter a diagnostic outcome.';
          }
          return;
        }

        const payload = {
          diagnosis: diagnosis.trim(),
          prescription: prescription ? prescription.trim() : null,
          doctorNotes: doctorNotes ? doctorNotes.trim() : null,
          recommendedFollowupDate: recommendedFollowupDate || null
        };

        const result = await ApiService.submitDoctorConsultation(apptId, payload);
        if (result.success) {
          if (alertEl) {
            alertEl.className = 'form-alert success';
            alertEl.style.display = 'block';
            alertEl.textContent = 'Consultation completed and medical record saved successfully! Redirecting...';
          }
          setTimeout(() => {
            window.location.href = 'appointments.html';
          }, 1500);
        } else {
          if (alertEl) {
            alertEl.className = 'form-alert error';
            alertEl.style.display = 'block';
            alertEl.textContent = result.message || 'Failed to submit consultation.';
          }
        }
      });
    }
  },

  // --------------------------------------------------------------------------
  // 6. Doctor Authored Medical Records Repository
  // --------------------------------------------------------------------------
  async loadRecords() {
    const listEl = document.getElementById('authoredRecordsList');
    const res = await ApiService.getDoctorAuthoredRecords();

    if (res.success && res.data) {
      const records = res.data.records;
      if (!records || records.length === 0) {
        listEl.innerHTML = `
          <div style="padding: 3rem; text-align: center; color: var(--text-muted);">
            <h3>No Medical Records Authored Yet</h3>
            <p>Completed patient consultations will automatically generate clinical medical records here.</p>
          </div>
        `;
        return;
      }

      listEl.innerHTML = records.map(r => `
        <div class="card" style="margin-bottom: 1.25rem; border-left: 4px solid var(--secondary-color);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.75rem;">
            <div>
              <span style="font-size: 0.8rem; color: var(--primary-color); font-weight: 700;">RECORD CODE: ${r.recordCode}</span>
              <h3 style="margin: 0.25rem 0; color: var(--primary-color);">Patient: ${r.patientName}</h3>
              <p style="margin: 0; font-size: 0.85rem; color: var(--text-muted);">
                📞 ${r.patientPhone} | Consultation Date: <strong>${r.appointmentDate} (${r.timeSlot})</strong>
              </p>
            </div>
            <span style="font-size: 0.8rem; color: var(--text-muted);">
              Authored on: ${new Date(r.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div style="background: var(--bg-slate); padding: 0.85rem; border-radius: 6px; font-size: 0.9rem;">
            <p style="margin: 0 0 0.5rem 0;"><strong>🩺 Diagnosis:</strong> ${r.diagnosis}</p>
            ${r.prescription ? `<p style="margin: 0 0 0.5rem 0;"><strong>💊 Prescription:</strong> ${r.prescription}</p>` : ''}
            ${r.doctorNotes ? `<p style="margin: 0 0 0.5rem 0;"><strong>📝 Clinical Notes:</strong> ${r.doctorNotes}</p>` : ''}
            ${r.recommendedFollowupDate ? `<p style="margin: 0;"><strong>📅 Recommended Follow-up:</strong> ${r.recommendedFollowupDate}</p>` : ''}
          </div>
        </div>
      `).join('');
    }
  }
};
