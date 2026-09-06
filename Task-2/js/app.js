/**
 * CareNova Health — Task 2: Main Application Controller & UI Orchestrator
 * Manages search bar inputs, department filter pills, doctor card grid, and appointment history tab views.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // UI Element References
  const doctorsContainer = document.getElementById('doctorsContainer');
  const searchInput = document.getElementById('doctorSearchInput');
  const clearSearchBtn = document.getElementById('clearSearchInput');
  const deptFilterContainer = document.getElementById('deptFilterContainer');

  const catalogView = document.getElementById('catalogView');
  const historyView = document.getElementById('historyView');
  const viewCatalogTab = document.getElementById('viewCatalogTab');
  const viewHistoryTab = document.getElementById('viewHistoryTab');
  const appointmentHistoryContainer = document.getElementById('appointmentHistoryContainer');

  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  let activeDepartment = 'all';
  let activeSearchQuery = '';

  /* ==========================================================================
     1. Mobile Navigation & Tab Switcher
     ========================================================================== */
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !isExpanded);
      navMenu.classList.toggle('is-active');
    });
  }

  function switchTab(targetTab) {
    if (targetTab === 'history') {
      catalogView.style.display = 'none';
      historyView.style.display = 'block';
      viewCatalogTab.classList.remove('active');
      viewHistoryTab.classList.add('active');
      renderAppointmentHistory();
    } else {
      catalogView.style.display = 'block';
      historyView.style.display = 'none';
      viewCatalogTab.classList.add('active');
      viewHistoryTab.classList.remove('active');
    }
  }

  if (viewCatalogTab) viewCatalogTab.addEventListener('click', (e) => { e.preventDefault(); switchTab('catalog'); });
  if (viewHistoryTab) viewHistoryTab.addEventListener('click', (e) => { e.preventDefault(); switchTab('history'); });

  /* ==========================================================================
     2. Render Department Filter Pills
     ========================================================================== */
  function renderDepartmentFilters() {
    if (!deptFilterContainer) return;
    deptFilterContainer.innerHTML = '';

    departmentsData.forEach(dept => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `dept-pill ${dept.id === activeDepartment ? 'active' : ''}`;
      btn.innerHTML = `<span>${dept.icon}</span> ${dept.name}`;
      btn.addEventListener('click', () => {
        activeDepartment = dept.id;
        document.querySelectorAll('.dept-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filterAndRenderDoctors();
      });
      deptFilterContainer.appendChild(btn);
    });
  }

  /* ==========================================================================
     3. Search Input & Reset Action Listener
     ========================================================================== */
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      activeSearchQuery = searchInput.value;
      if (clearSearchBtn) {
        clearSearchBtn.style.display = activeSearchQuery.length > 0 ? 'block' : 'none';
      }
      filterAndRenderDoctors();
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      activeSearchQuery = '';
      clearSearchBtn.style.display = 'none';
      filterAndRenderDoctors();
    });
  }

  /* ==========================================================================
     4. Filter & Render Doctor Cards (With 5 Mandatory Required Fields)
     ========================================================================== */
  function filterAndRenderDoctors() {
    const results = searchDoctors(activeSearchQuery, activeDepartment);
    doctorsContainer.innerHTML = '';

    if (results.length === 0) {
      doctorsContainer.innerHTML = `
        <div class="empty-state-card">
          <div class="empty-icon">🔍</div>
          <h3>No Doctors Found</h3>
          <p>No medical specialists match your search criteria "${activeSearchQuery}".</p>
          <button type="button" class="btn btn-outline" id="resetFiltersBtn">Reset All Filters</button>
        </div>
      `;

      const resetBtn = document.getElementById('resetFiltersBtn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          activeDepartment = 'all';
          activeSearchQuery = '';
          if (searchInput) searchInput.value = '';
          if (clearSearchBtn) clearSearchBtn.style.display = 'none';
          renderDepartmentFilters();
          filterAndRenderDoctors();
        });
      }
      return;
    }

    results.forEach(doc => {
      const card = document.createElement('article');
      card.className = 'doctor-card';
      card.innerHTML = `
        <div class="doctor-avatar-box">
          <div class="doctor-avatar-icon">${doc.avatarText}</div>
          <span class="doctor-dept-badge">${doc.departmentName}</span>
        </div>
        <div class="doctor-info">
          <h3 class="doctor-name">${doc.name}</h3>
          <p class="doctor-qual">${doc.qualification}</p>
          <ul class="doctor-details-list">
            <li><strong>Experience:</strong> ${doc.experienceYears} Years (Demo)</li>
            <li><strong>Available Slots:</strong> ${doc.availableDays.join(', ')}</li>
            <li><strong>Consultation Fee:</strong> <span class="fee-highlight">₹${doc.fee}</span></li>
          </ul>
          <div class="doctor-actions">
            <button type="button" class="btn btn-outline" onclick="openBookingModal('${doc.id}')">View Details</button>
            <button type="button" class="btn btn-primary" onclick="openBookingModal('${doc.id}')">Book Appointment</button>
          </div>
        </div>
      `;
      doctorsContainer.appendChild(card);
    });
  }

  /* ==========================================================================
     5. Render Appointment History View (READ, UPDATE, DELETE)
     ========================================================================== */
  window.renderAppointmentHistory = function() {
    if (!appointmentHistoryContainer) return;
    const appointments = getAllAppointments();
    appointmentHistoryContainer.innerHTML = '';

    if (appointments.length === 0) {
      appointmentHistoryContainer.innerHTML = `
        <div class="empty-state-card">
          <div class="empty-icon">📅</div>
          <h3>No Appointment History Saved</h3>
          <p>You have not booked any appointments yet. Saved appointments will appear here.</p>
          <button type="button" class="btn btn-primary" onclick="window.location.hash='#catalogView'; switchTab('catalog');">Browse Doctors & Book</button>
        </div>
      `;
      return;
    }

    const historyGrid = document.createElement('div');
    historyGrid.className = 'history-grid';

    appointments.forEach(apt => {
      const statusClass = apt.status.toLowerCase(); // confirmed, rescheduled, cancelled
      const card = document.createElement('div');
      card.className = `history-card status-${statusClass}`;
      
      card.innerHTML = `
        <div class="history-card-header">
          <div>
            <span class="ref-badge">${apt.appointmentId}</span>
            <h4 class="history-doc-name">${apt.doctorName}</h4>
            <span class="history-dept">${apt.departmentName} Department</span>
          </div>
          <span class="status-badge ${statusClass}">${apt.status}</span>
        </div>
        
        <div class="history-card-body">
          <div class="history-detail-row">
            <span>📅 Appointment Date:</span> <strong>${apt.appointmentDate}</strong>
          </div>
          <div class="history-detail-row">
            <span>🕒 Reserved Time Slot:</span> <strong>${apt.appointmentTime}</strong>
          </div>
          <div class="history-detail-row">
            <span>👤 Patient Name:</span> <strong>${apt.patientName} (${apt.patientPhone})</strong>
          </div>
          <div class="history-detail-row">
            <span>💳 Consultation Fee:</span> <strong>₹${apt.consultationFee}</strong>
          </div>
        </div>

        <div class="history-card-actions">
          ${apt.status !== 'Cancelled' ? `
            <button type="button" class="btn btn-outline btn-sm" onclick="openBookingModal('${apt.doctorId}', '${apt.appointmentId}')">Reschedule</button>
            <button type="button" class="btn btn-danger btn-sm" onclick="handleCancelAppointment('${apt.appointmentId}')">Cancel Booking</button>
          ` : `
            <span class="cancelled-note">Slot Released for Re-booking</span>
          `}
        </div>
      `;
      historyGrid.appendChild(card);
    });

    appointmentHistoryContainer.appendChild(historyGrid);
  };

  /* ==========================================================================
     6. Handle Appointment Cancellation (DELETE Helper)
     ========================================================================== */
  window.handleCancelAppointment = function(appointmentId) {
    if (confirm(`Are you sure you want to cancel appointment ${appointmentId}? This will release the reserved time slot.`)) {
      cancelAppointment(appointmentId);
      renderAppointmentHistory();
    }
  };

  // Global Tab Switcher helper
  window.switchTab = switchTab;

  // App Initialization
  renderDepartmentFilters();
  filterAndRenderDoctors();
});
