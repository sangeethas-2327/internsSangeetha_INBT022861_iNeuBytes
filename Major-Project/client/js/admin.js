// ============================================================================
// CareNova Health — Admin Workstation Controller
// iNeuBytes Web Development Internship — Major Project Phase 3E Admin Module
// ============================================================================

const AdminApp = {
  currentAdmin: null,

  // --------------------------------------------------------------------------
  // 1. Initialize Admin Session & Security Guard
  // --------------------------------------------------------------------------
  async init(pageType) {
    const user = await AuthManager.checkSession();
    if (!user) {
      window.location.href = '../login.html';
      return;
    }

    if (user.role !== 'admin') {
      alert('Access Denied. The Admin Console is restricted to system administrators.');
      window.location.href = '../index.html';
      return;
    }

    this.currentAdmin = user;
    this.renderAdminHeader();

    if (pageType === 'dashboard') {
      await this.loadDashboard();
    } else if (pageType === 'doctors') {
      await this.loadDoctors();
    } else if (pageType === 'patients') {
      await this.loadPatients();
    } else if (pageType === 'departments') {
      await this.loadDepartments();
    } else if (pageType === 'appointments') {
      await this.loadAppointments();
    }
  },

  renderAdminHeader() {
    const headerTitle = document.getElementById('adminHeaderTitle');
    if (headerTitle && this.currentAdmin) {
      headerTitle.textContent = `Admin Console — ${this.currentAdmin.name || 'System Administrator'}`;
    }
  },

  // --------------------------------------------------------------------------
  // 2. Admin Dashboard & System Analytics
  // --------------------------------------------------------------------------
  async loadDashboard() {
    const res = await ApiService.getAdminDashboard();
    if (res.success && res.data) {
      const { stats, departmentLoad, recentAppointments } = res.data;

      const patEl = document.getElementById('statTotalPatients');
      const docEl = document.getElementById('statTotalDoctors');
      const deptEl = document.getElementById('statTotalDepartments');
      const apptEl = document.getElementById('statTotalAppointments');
      const revEl = document.getElementById('statTotalRevenue');

      if (patEl) patEl.textContent = stats.totalPatients || 0;
      if (docEl) docEl.textContent = stats.totalDoctors || 0;
      if (deptEl) deptEl.textContent = stats.totalDepartments || 0;
      if (apptEl) apptEl.textContent = stats.totalAppointments || 0;
      if (revEl) revEl.textContent = `₹${(stats.totalRevenue || 0).toLocaleString()}`;

      // Render Department Load Breakdown
      const deptLoadEl = document.getElementById('departmentLoadTable');
      if (deptLoadEl) {
        if (!departmentLoad || departmentLoad.length === 0) {
          deptLoadEl.innerHTML = `<tr><td colspan="4" style="text-align:center; color: var(--text-muted);">No department activity data.</td></tr>`;
        } else {
          deptLoadEl.innerHTML = departmentLoad.map(d => `
            <tr>
              <td><strong>${d.departmentName}</strong> (${d.departmentCode})</td>
              <td style="text-align: center;">${d.appointmentCount}</td>
              <td style="text-align: right; font-weight: 600; color: var(--primary-color);">₹${Number(d.departmentRevenue).toLocaleString()}</td>
            </tr>
          `).join('');
        }
      }

      // Render Recent Appointments Feed
      const recentFeedEl = document.getElementById('recentAppointmentsFeed');
      if (recentFeedEl) {
        if (!recentAppointments || recentAppointments.length === 0) {
          recentFeedEl.innerHTML = `<div style="padding: 2rem; text-align: center; color: var(--text-muted);">No recent appointments.</div>`;
        } else {
          recentFeedEl.innerHTML = recentAppointments.map(a => `
            <div class="card" style="margin-bottom: 0.75rem; border-left: 4px solid var(--primary-color);">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
                <div>
                  <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">REF: ${a.referenceId}</span>
                  <h4 style="margin: 0.25rem 0; color: var(--primary-color);">👤 ${a.patientName} ➔ 🩺 ${a.doctorName}</h4>
                  <p style="margin: 0; font-size: 0.85rem; color: var(--text-muted);">
                    📅 ${a.appointmentDate} at ⏰ ${a.timeSlot} | Dept: <strong>${a.departmentName}</strong>
                  </p>
                </div>
                <div>
                  <span class="badge badge-${a.status.toLowerCase()}">${a.status}</span>
                </div>
              </div>
            </div>
          `).join('');
        }
      }
    }
  },

  // --------------------------------------------------------------------------
  // 3. Doctor Roster & Onboarding Console
  // --------------------------------------------------------------------------
  async loadDoctors() {
    const listEl = document.getElementById('doctorsRosterList');
    const deptFilter = document.getElementById('filterDept');
    const statusFilter = document.getElementById('filterStatus');
    const searchInput = document.getElementById('filterSearch');

    // Populate department dropdown filter
    const deptRes = await ApiService.getDepartments();
    if (deptRes.success && deptRes.data && deptFilter) {
      deptFilter.innerHTML = `<option value="">All Departments</option>` + 
        deptRes.data.departments.map(d => `<option value="${d.id}">${d.name}</option>`).join('');

      const onboardDeptSel = document.getElementById('onboardDepartment');
      if (onboardDeptSel) {
        onboardDeptSel.innerHTML = `<option value="">Select Department...</option>` + 
          deptRes.data.departments.map(d => `<option value="${d.id}">${d.name} (${d.code})</option>`).join('');
      }
    }

    const fetchAndRender = async () => {
      let qs = [];
      if (deptFilter && deptFilter.value) qs.push(`departmentId=${encodeURIComponent(deptFilter.value)}`);
      if (statusFilter && statusFilter.value) qs.push(`isActive=${encodeURIComponent(statusFilter.value)}`);
      if (searchInput && searchInput.value) qs.push(`search=${encodeURIComponent(searchInput.value)}`);

      const res = await ApiService.getAdminDoctors(qs.join('&'));
      if (res.success && res.data) {
        const doctors = res.data.doctors;
        if (!doctors || doctors.length === 0) {
          listEl.innerHTML = `
            <div style="padding: 3rem; text-align: center; color: var(--text-muted);">
              <h3>No Doctors Found</h3>
              <p>Try adjusting your search criteria or onboard a new doctor.</p>
            </div>
          `;
          return;
        }

        listEl.innerHTML = doctors.map(d => `
          <div class="card" style="margin-bottom: 1rem; border-left: 4px solid ${d.userIsActive ? 'var(--primary-color)' : 'var(--error-color)'};">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
              <div>
                <span class="badge ${d.userIsActive ? 'badge-confirmed' : 'badge-cancelled'}" style="margin-bottom: 0.5rem; display: inline-block;">
                  ${d.userIsActive ? 'Active' : 'Deactivated'}
                </span>
                <h3 style="margin: 0.25rem 0; color: var(--primary-color);">${d.fullName}</h3>
                <p style="margin: 0.25rem 0; font-size: 0.85rem; color: var(--text-muted);">
                  ✉️ ${d.email} | 📞 ${d.phone} | Dept: <strong>${d.departmentName}</strong>
                </p>
                <p style="margin: 0.25rem 0; font-size: 0.9rem;">
                  🎓 <strong>${d.qualification}</strong> (${d.experienceYears} yrs exp) | Fee: <strong style="color: var(--secondary-color);">₹${d.consultationFee}</strong>
                </p>
                <p style="margin: 0; font-size: 0.85rem; font-style: italic; color: #475569;">
                  Available Days: "${d.availableDays}"
                </p>
              </div>
              <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                <button onclick="AdminApp.handleToggleDoctorStatus(${d.id}, ${!d.userIsActive})" class="btn ${d.userIsActive ? 'btn-outline' : 'btn-primary'}" style="padding: 0.4rem 0.85rem; font-size: 0.85rem; ${d.userIsActive ? 'color: var(--error-color); border-color: var(--error-color);' : ''}">
                  ${d.userIsActive ? 'Deactivate' : 'Reactivate'}
                </button>
              </div>
            </div>
          </div>
        `).join('');
      }
    };

    if (deptFilter) deptFilter.addEventListener('change', fetchAndRender);
    if (statusFilter) statusFilter.addEventListener('change', fetchAndRender);
    if (searchInput) searchInput.addEventListener('input', fetchAndRender);

    await fetchAndRender();

    // Onboard Doctor Form Submission Handler
    const onboardForm = document.getElementById('onboardDoctorForm');
    if (onboardForm) {
      onboardForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleOnboardDoctor();
      });
    }
  },

  async handleOnboardDoctor() {
    const alertEl = document.getElementById('onboardAlert');
    const email = document.getElementById('onboardEmail').value;
    const password = document.getElementById('onboardPassword').value;
    const firstName = document.getElementById('onboardFirstName').value;
    const lastName = document.getElementById('onboardLastName').value;
    const phone = document.getElementById('onboardPhone').value;
    const deptId = document.getElementById('onboardDepartment').value;
    const qualification = document.getElementById('onboardQualification').value;
    const expYears = document.getElementById('onboardExperience').value;
    const fee = document.getElementById('onboardFee').value;
    const bio = document.getElementById('onboardBio').value;

    const payload = {
      email,
      password,
      firstName,
      lastName,
      phone,
      departmentId: Number(deptId),
      qualification,
      experienceYears: Number(expYears || 0),
      consultationFee: Number(fee || 500),
      bio
    };

    const res = await ApiService.onboardDoctor(payload);
    if (res.success) {
      if (alertEl) {
        alertEl.className = 'form-alert success';
        alertEl.style.display = 'block';
        alertEl.textContent = res.message || 'Doctor onboarded successfully!';
      }
      setTimeout(async () => {
        if (alertEl) alertEl.style.display = 'none';
        document.getElementById('onboardDoctorForm').reset();
        await this.loadDoctors();
      }, 1500);
    } else {
      if (alertEl) {
        alertEl.className = 'form-alert error';
        alertEl.style.display = 'block';
        alertEl.textContent = res.message || 'Failed to onboard doctor.';
      }
    }
  },

  async handleToggleDoctorStatus(id, newStatus) {
    const actionText = newStatus ? 'reactivate' : 'deactivate';
    if (!confirm(`Are you sure you want to ${actionText} this doctor account?`)) return;

    const res = await ApiService.toggleDoctorStatus(id, { isActive: newStatus });
    if (res.success) {
      alert(res.message || `Doctor account ${actionText}d successfully.`);
      await this.loadDoctors();
    } else {
      alert(res.message || 'Failed to update doctor status.');
    }
  },

  // --------------------------------------------------------------------------
  // 4. Patient Directory Console
  // --------------------------------------------------------------------------
  async loadPatients() {
    const listEl = document.getElementById('patientsDirectoryList');
    const searchInput = document.getElementById('patientSearch');
    const statusFilter = document.getElementById('patientStatusFilter');

    const fetchAndRender = async () => {
      let qs = [];
      if (statusFilter && statusFilter.value) qs.push(`isActive=${encodeURIComponent(statusFilter.value)}`);
      if (searchInput && searchInput.value) qs.push(`search=${encodeURIComponent(searchInput.value)}`);

      const res = await ApiService.getAdminPatients(qs.join('&'));
      if (res.success && res.data) {
        const patients = res.data.patients;
        if (!patients || patients.length === 0) {
          listEl.innerHTML = `
            <div style="padding: 3rem; text-align: center; color: var(--text-muted);">
              <h3>No Patients Found</h3>
              <p>Try adjusting your search criteria.</p>
            </div>
          `;
          return;
        }

        listEl.innerHTML = patients.map(p => `
          <div class="card" style="margin-bottom: 1rem; border-left: 4px solid ${p.userIsActive ? 'var(--secondary-color)' : 'var(--error-color)'};">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
              <div>
                <span class="badge ${p.userIsActive ? 'badge-confirmed' : 'badge-cancelled'}" style="margin-bottom: 0.5rem; display: inline-block;">
                  ${p.userIsActive ? 'Active Patient' : 'Deactivated'}
                </span>
                <h3 style="margin: 0.25rem 0; color: var(--primary-color);">👤 ${p.fullName}</h3>
                <p style="margin: 0.25rem 0; font-size: 0.85rem; color: var(--text-muted);">
                  ✉️ ${p.email} | 📞 ${p.phone} | DOB: ${p.dateOfBirth || 'N/A'} (${p.gender || 'N/A'})
                </p>
                <p style="margin: 0.25rem 0; font-size: 0.85rem;">
                  🩸 Blood Group: <strong style="color: var(--error-color);">${p.bloodGroup || 'N/A'}</strong> | Emergency Contact: ${p.emergencyContact || 'N/A'}
                </p>
                ${p.address ? `<p style="margin: 0.25rem 0; font-size: 0.85rem; color: #475569;">📍 ${p.address}</p>` : ''}
              </div>
              <div>
                <button onclick="AdminApp.handleTogglePatientStatus(${p.id}, ${!p.userIsActive})" class="btn ${p.userIsActive ? 'btn-outline' : 'btn-primary'}" style="padding: 0.4rem 0.85rem; font-size: 0.85rem; ${p.userIsActive ? 'color: var(--error-color); border-color: var(--error-color);' : ''}">
                  ${p.userIsActive ? 'Deactivate' : 'Reactivate'}
                </button>
              </div>
            </div>
          </div>
        `).join('');
      }
    };

    if (statusFilter) statusFilter.addEventListener('change', fetchAndRender);
    if (searchInput) searchInput.addEventListener('input', fetchAndRender);

    await fetchAndRender();
  },

  async handleTogglePatientStatus(id, newStatus) {
    const actionText = newStatus ? 'reactivate' : 'deactivate';
    if (!confirm(`Are you sure you want to ${actionText} this patient account?`)) return;

    const res = await ApiService.togglePatientStatus(id, { isActive: newStatus });
    if (res.success) {
      alert(res.message || `Patient account ${actionText}d successfully.`);
      await this.loadPatients();
    } else {
      alert(res.message || 'Failed to update patient status.');
    }
  },

  // --------------------------------------------------------------------------
  // 5. Department CRUD Console
  // --------------------------------------------------------------------------
  async loadDepartments() {
    const listEl = document.getElementById('departmentsCrudList');
    const res = await ApiService.getAdminDepartments();

    if (res.success && res.data) {
      const depts = res.data.departments;
      if (!depts || depts.length === 0) {
        listEl.innerHTML = `<div style="padding: 3rem; text-align: center; color: var(--text-muted);">No departments configured.</div>`;
        return;
      }

      listEl.innerHTML = depts.map(d => `
        <div class="card" style="margin-bottom: 1rem; border-left: 4px solid ${d.isActive ? 'var(--primary-color)' : 'var(--error-color)'};">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
            <div>
              <span class="badge ${d.isActive ? 'badge-confirmed' : 'badge-cancelled'}" style="margin-bottom: 0.5rem; display: inline-block;">
                ${d.isActive ? 'Active' : 'Inactive'}
              </span>
              <h3 style="margin: 0.25rem 0; color: var(--primary-color);">${d.name} <span style="font-size: 0.85rem; color: var(--text-muted);">(${d.code})</span></h3>
              <p style="margin: 0.25rem 0; font-size: 0.9rem; color: #475569;">${d.description || 'No description.'}</p>
              <p style="margin: 0.25rem 0; font-size: 0.85rem; color: var(--text-muted);">
                👨‍⚕️ Assigned Active Doctors: <strong>${d.activeDoctorCount || 0}</strong>
              </p>
            </div>
            <div style="display: flex; gap: 0.5rem;">
              <button onclick="AdminApp.handleDeleteDepartment(${d.id}, '${d.name}')" class="btn btn-outline" style="padding: 0.4rem 0.85rem; font-size: 0.85rem; color: var(--error-color); border-color: var(--error-color);">
                Deactivate / Delete
              </button>
            </div>
          </div>
        </div>
      `).join('');
    }

    const deptForm = document.getElementById('createDepartmentForm');
    if (deptForm) {
      deptForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.handleCreateDepartment();
      });
    }
  },

  async handleCreateDepartment() {
    const alertEl = document.getElementById('deptAlert');
    const name = document.getElementById('deptName').value;
    const code = document.getElementById('deptCode').value;
    const description = document.getElementById('deptDescription').value;
    const icon = document.getElementById('deptIcon').value;

    const res = await ApiService.createDepartment({ name, code, description, icon });
    if (res.success) {
      if (alertEl) {
        alertEl.className = 'form-alert success';
        alertEl.style.display = 'block';
        alertEl.textContent = res.message || 'Department created successfully!';
      }
      setTimeout(async () => {
        if (alertEl) alertEl.style.display = 'none';
        document.getElementById('createDepartmentForm').reset();
        await this.loadDepartments();
      }, 1500);
    } else {
      if (alertEl) {
        alertEl.className = 'form-alert error';
        alertEl.style.display = 'block';
        alertEl.textContent = res.message || 'Failed to create department.';
      }
    }
  },

  async handleDeleteDepartment(id, name) {
    if (!confirm(`Are you sure you want to deactivate/delete department '${name}'?`)) return;

    const res = await ApiService.deleteDepartment(id);
    if (res.success) {
      alert(res.message || 'Department deactivated successfully.');
      await this.loadDepartments();
    } else {
      alert(res.message || 'Failed to delete department.');
    }
  },

  // --------------------------------------------------------------------------
  // 6. Global Appointment Control Console
  // --------------------------------------------------------------------------
  async loadAppointments() {
    const listEl = document.getElementById('globalAppointmentsList');
    const statusFilter = document.getElementById('filterStatus');
    const dateFilter = document.getElementById('filterDate');
    const searchInput = document.getElementById('filterSearch');

    const fetchAndRender = async () => {
      let qs = [];
      if (statusFilter && statusFilter.value) qs.push(`status=${encodeURIComponent(statusFilter.value)}`);
      if (dateFilter && dateFilter.value) qs.push(`date=${encodeURIComponent(dateFilter.value)}`);
      if (searchInput && searchInput.value) qs.push(`search=${encodeURIComponent(searchInput.value)}`);

      const res = await ApiService.getAdminAppointments(qs.join('&'));
      if (res.success && res.data) {
        const appts = res.data.appointments;
        if (!appts || appts.length === 0) {
          listEl.innerHTML = `
            <div style="padding: 3rem; text-align: center; color: var(--text-muted);">
              <h3>No Appointments Found</h3>
              <p>Try adjusting your search filters.</p>
            </div>
          `;
          return;
        }

        listEl.innerHTML = appts.map(a => `
          <div class="card" style="margin-bottom: 1rem; border-left: 4px solid ${a.status === 'Completed' ? '#10b981' : a.status === 'Cancelled' ? '#ef4444' : 'var(--primary-color)'};">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
              <div>
                <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">REF: ${a.referenceId}</span>
                <h3 style="margin: 0.25rem 0; color: var(--primary-color);">👤 ${a.patientName} ➔ 🩺 ${a.doctorName}</h3>
                <p style="margin: 0.25rem 0; font-size: 0.85rem; color: var(--text-muted);">
                  📅 <strong>${a.appointmentDate}</strong> at ⏰ <strong>${a.timeSlot}</strong> | Dept: ${a.departmentName}
                </p>
                <p style="margin: 0; font-size: 0.85rem; font-style: italic; color: #475569;">
                  Reason: "${a.reasonForVisit || 'N/A'}"
                </p>
              </div>
              <div style="text-align: right;">
                <span class="badge badge-${a.status.toLowerCase()}" style="margin-bottom: 0.5rem; display: inline-block;">${a.status}</span>
                <div style="display: flex; gap: 0.5rem; justify-content: flex-end; flex-wrap: wrap; margin-top: 0.5rem;">
                  ${a.status !== 'Cancelled' ? `
                    <button onclick="AdminApp.handleAdminCancelAppt(${a.id})" class="btn btn-outline" style="padding: 0.35rem 0.75rem; font-size: 0.8rem; color: var(--error-color); border-color: var(--error-color);">
                      Cancel & Release Slot
                    </button>
                  ` : ''}
                </div>
              </div>
            </div>
          </div>
        `).join('');
      }
    };

    if (statusFilter) statusFilter.addEventListener('change', fetchAndRender);
    if (dateFilter) dateFilter.addEventListener('change', fetchAndRender);
    if (searchInput) searchInput.addEventListener('input', fetchAndRender);

    await fetchAndRender();
  },

  async handleAdminCancelAppt(id) {
    if (!confirm('Admin Override: Are you sure you want to cancel this appointment and release the time slot?')) return;

    const res = await ApiService.adminCancelAppointment(id);
    if (res.success) {
      alert(res.message || 'Appointment cancelled successfully.');
      await this.loadAppointments();
    } else {
      alert(res.message || 'Failed to cancel appointment.');
    }
  }
};
