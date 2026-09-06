/**
 * CareNova Health — Task 2: Booking Modal Workflow, Slot Manager, & Form Validator
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // DOM Elements
  const bookingModal = document.getElementById('bookingModal');
  const closeBookingModalBtn = document.getElementById('closeBookingModal');
  const cancelBookingBtn = document.getElementById('cancelBookingModal');
  const bookingForm = document.getElementById('bookingForm');

  // Confirmation Modal Elements
  const confirmationModal = document.getElementById('confirmationModal');
  const closeConfirmationModalBtn = document.getElementById('closeConfirmationModal');
  const confirmDoneBtn = document.getElementById('confirmDoneBtn');

  // Modal Form Inputs
  const modalDocAvatar = document.getElementById('modalDocAvatar');
  const modalDocName = document.getElementById('modalDocName');
  const modalDocQual = document.getElementById('modalDocQual');
  const modalDocDept = document.getElementById('modalDocDept');
  const modalDocExp = document.getElementById('modalDocExp');
  const modalDocFee = document.getElementById('modalDocFee');
  const modalDocSlots = document.getElementById('modalDocSlots');

  const bookingDocId = document.getElementById('bookingDocId');
  const rescheduleIdInput = document.getElementById('rescheduleId');
  const bookingDate = document.getElementById('bookingDate');
  const selectedSlotInput = document.getElementById('selectedSlot');
  const timeSlotsContainer = document.getElementById('timeSlotsContainer');

  const patientName = document.getElementById('patientName');
  const patientEmail = document.getElementById('patientEmail');
  const patientPhone = document.getElementById('patientPhone');
  const patientAge = document.getElementById('patientAge');
  const patientGender = document.getElementById('patientGender');

  const bookingFormAlertError = document.getElementById('bookingFormAlertError');
  const modalTitle = document.getElementById('modalTitle');
  const submitBookingBtn = document.getElementById('submitBookingBtn');

  let activeDoctor = null;

  // Set Date Input Minimum to Today (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];
  if (bookingDate) {
    bookingDate.setAttribute('min', todayStr);
  }

  /* ==========================================================================
     1. Open Booking Modal (Create or Reschedule Mode)
     ========================================================================== */
  window.openBookingModal = function(doctorId, rescheduleId = null) {
    const doctor = getDoctorById(doctorId);
    if (!doctor) return;

    activeDoctor = doctor;
    bookingDocId.value = doctor.id;
    rescheduleIdInput.value = rescheduleId || '';

    // Populate Doctor Profile Details (5 Mandatory Fields)
    modalDocAvatar.textContent = doctor.avatarText;
    modalDocName.textContent = doctor.name;
    modalDocQual.textContent = doctor.qualification;
    modalDocDept.textContent = doctor.departmentName;
    modalDocExp.textContent = `${doctor.experienceYears} Years (Demo)`;
    modalDocFee.textContent = `₹${doctor.fee}`;
    modalDocSlots.textContent = doctor.availableDays.join(', ');

    // Reset Form Errors
    clearBookingFormErrors();

    if (rescheduleId) {
      // RESCHEDULE MODE
      const existingApt = getAppointmentById(rescheduleId);
      if (existingApt) {
        modalTitle.textContent = `Reschedule Appointment (${existingApt.appointmentId})`;
        submitBookingBtn.textContent = 'Confirm Reschedule';
        bookingDate.value = existingApt.appointmentDate;
        patientName.value = existingApt.patientName;
        patientEmail.value = existingApt.patientEmail;
        patientPhone.value = existingApt.patientPhone;
        patientAge.value = existingApt.patientAge || 30;
        patientGender.value = existingApt.patientGender || 'female';
        
        renderTimeSlots(doctor, existingApt.appointmentDate, existingApt.appointmentTime, rescheduleId);
      }
    } else {
      // NEW CREATE MODE
      modalTitle.textContent = 'Book Doctor Appointment';
      submitBookingBtn.textContent = 'Confirm & Book Appointment';
      bookingForm.reset();
      bookingDocId.value = doctor.id;
      rescheduleIdInput.value = '';
      bookingDate.value = todayStr;
      selectedSlotInput.value = '';
      
      renderTimeSlots(doctor, todayStr, null, null);
    }

    // Display Modal with Backdrop Lock
    bookingModal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  };

  /* ==========================================================================
     2. Close Booking Modal
     ========================================================================== */
  window.closeBookingModal = function() {
    if (bookingModal) {
      bookingModal.classList.remove('is-open');
      document.body.style.overflow = 'auto';
    }
  };

  if (closeBookingModalBtn) closeBookingModalBtn.addEventListener('click', window.closeBookingModal);
  if (cancelBookingBtn) cancelBookingBtn.addEventListener('click', window.closeBookingModal);

  /* ==========================================================================
     3. Render Time Slot Picker Buttons
     ========================================================================== */
  function renderTimeSlots(doctor, selectedDate, preselectedSlot = null, rescheduleId = null) {
    timeSlotsContainer.innerHTML = '';
    selectedSlotInput.value = preselectedSlot || '';

    if (!selectedDate) {
      timeSlotsContainer.innerHTML = '<p class="slot-hint">Please select an appointment date first.</p>';
      return;
    }

    doctor.timeSlots.forEach(slot => {
      const isBooked = isSlotBooked(doctor.id, selectedDate, slot, rescheduleId);
      
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'slot-btn';
      btn.textContent = slot;

      if (isBooked) {
        btn.classList.add('disabled');
        btn.disabled = true;
        btn.title = 'Slot Already Booked';
      } else {
        if (slot === preselectedSlot) {
          btn.classList.add('selected');
          selectedSlotInput.value = slot;
        }

        btn.addEventListener('click', () => {
          document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          selectedSlotInput.value = slot;
          setFieldError(selectedSlotInput, 'selectedSlotError', false);
        });
      }

      timeSlotsContainer.appendChild(btn);
    });
  }

  // Listen to Date Picker Change
  if (bookingDate) {
    bookingDate.addEventListener('change', () => {
      if (activeDoctor) {
        const rescheduleId = rescheduleIdInput.value || null;
        renderTimeSlots(activeDoctor, bookingDate.value, null, rescheduleId);
        setFieldError(bookingDate, 'bookingDateError', false);
      }
    });
  }

  /* ==========================================================================
     4. Client-Side Validation Helpers
     ========================================================================== */
  function setFieldError(inputElement, errorId, isError) {
    const errorElement = document.getElementById(errorId);
    if (isError) {
      if (inputElement.classList) inputElement.classList.add('is-invalid');
      if (errorElement) errorElement.style.display = 'block';
    } else {
      if (inputElement.classList) inputElement.classList.remove('is-invalid');
      if (errorElement) errorElement.style.display = 'none';
    }
  }

  function clearBookingFormErrors() {
    if (bookingFormAlertError) bookingFormAlertError.style.display = 'none';
    [patientName, patientEmail, patientPhone, bookingDate, selectedSlotInput].forEach(input => {
      if (input) {
        const errorId = input.id + 'Error';
        setFieldError(input, errorId, false);
      }
    });
  }

  // Real-time input listeners
  [patientName, patientEmail, patientPhone, patientAge].forEach(input => {
    if (input) {
      input.addEventListener('input', () => {
        const errorId = input.id + 'Error';
        setFieldError(input, errorId, false);
        if (bookingFormAlertError) bookingFormAlertError.style.display = 'none';
      });
    }
  });

  /* ==========================================================================
     5. Booking Form Submit Handler (CREATE & UPDATE)
     ========================================================================== */
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let hasErrors = false;

      // 1. Patient Name Validation
      if (!patientName.value.trim() || patientName.value.trim().length < 2) {
        setFieldError(patientName, 'patientNameError', true);
        hasErrors = true;
      } else {
        setFieldError(patientName, 'patientNameError', false);
      }

      // 2. Email Validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!patientEmail.value.trim() || !emailRegex.test(patientEmail.value.trim())) {
        setFieldError(patientEmail, 'patientEmailError', true);
        hasErrors = true;
      } else {
        setFieldError(patientEmail, 'patientEmailError', false);
      }

      // 3. Phone Validation (10 digits minimum)
      const cleanedPhone = patientPhone.value.replace(/[\s\-\(\)]/g, '');
      if (!patientPhone.value.trim() || !/^\+?[0-9]{10,15}$/.test(cleanedPhone)) {
        setFieldError(patientPhone, 'patientPhoneError', true);
        hasErrors = true;
      } else {
        setFieldError(patientPhone, 'patientPhoneError', false);
      }

      // 4. Date Validation
      if (!bookingDate.value || bookingDate.value < todayStr) {
        setFieldError(bookingDate, 'bookingDateError', true);
        hasErrors = true;
      } else {
        setFieldError(bookingDate, 'bookingDateError', false);
      }

      // 5. Time Slot Selection Validation
      if (!selectedSlotInput.value) {
        setFieldError(selectedSlotInput, 'selectedSlotError', true);
        hasErrors = true;
      } else {
        setFieldError(selectedSlotInput, 'selectedSlotError', false);
      }

      if (hasErrors) {
        if (bookingFormAlertError) bookingFormAlertError.style.display = 'flex';
        return;
      }

      // Validated Payload
      const rescheduleId = rescheduleIdInput.value;
      const payload = {
        doctorId: activeDoctor.id,
        doctorName: activeDoctor.name,
        departmentName: activeDoctor.departmentName,
        consultationFee: activeDoctor.fee,
        patientName: patientName.value.trim(),
        patientEmail: patientEmail.value.trim(),
        patientPhone: patientPhone.value.trim(),
        patientAge: parseInt(patientAge.value, 10) || 30,
        patientGender: patientGender.value || 'Not Specified',
        appointmentDate: bookingDate.value,
        appointmentTime: selectedSlotInput.value
      };

      let resultRecord = null;
      if (rescheduleId) {
        // UPDATE: Reschedule existing booking
        resultRecord = updateAppointment(rescheduleId, payload);
      } else {
        // CREATE: New booking
        resultRecord = createAppointment(payload);
      }

      // Close Booking Modal and Open Confirmation Receipt Modal
      window.closeBookingModal();
      openConfirmationModal(resultRecord);

      // Refresh History View if render function exists
      if (window.renderAppointmentHistory) {
        window.renderAppointmentHistory();
      }
    });
  }

  /* ==========================================================================
     6. Confirmation Summary Receipt Modal (READ)
     ========================================================================== */
  function openConfirmationModal(record) {
    if (!record || !confirmationModal) return;

    document.getElementById('confirmRefId').textContent = record.appointmentId;
    document.getElementById('confirmStatus').textContent = record.status;
    document.getElementById('confirmDocName').textContent = record.doctorName;
    document.getElementById('confirmDept').textContent = record.departmentName;
    document.getElementById('confirmFee').textContent = `₹${record.consultationFee}`;
    document.getElementById('confirmDate').textContent = record.appointmentDate;
    document.getElementById('confirmTime').textContent = record.appointmentTime;
    document.getElementById('confirmPatientName').textContent = record.patientName;
    document.getElementById('confirmPatientPhone').textContent = record.patientPhone;

    confirmationModal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  window.closeConfirmationModal = function() {
    if (confirmationModal) {
      confirmationModal.classList.remove('is-open');
      document.body.style.overflow = 'auto';
    }
  };

  if (closeConfirmationModalBtn) closeConfirmationModalBtn.addEventListener('click', window.closeConfirmationModal);
  if (confirmDoneBtn) confirmDoneBtn.addEventListener('click', window.closeConfirmationModal);
});
