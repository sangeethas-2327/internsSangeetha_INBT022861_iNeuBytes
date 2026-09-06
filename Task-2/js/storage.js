/**
 * CareNova Health — Task 2: LocalStorage Persistence & CRUD Data Layer
 * Manages appointment records, status transitions, and slot conflict checking.
 */

const STORAGE_KEY = 'carenova_appointments';

// In-Memory Fallback if LocalStorage is disabled/unavailable
let memoryStore = [];

/**
 * READ: Fetch all appointment records from LocalStorage
 */
function getAllAppointments() {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (!rawData) return memoryStore;
    const parsed = JSON.parse(rawData);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('LocalStorage unavailable; returning memory store.', err);
    return memoryStore;
  }
}

/**
 * READ: Fetch a single appointment record by ID
 */
function getAppointmentById(appointmentId) {
  const appointments = getAllAppointments();
  return appointments.find(apt => apt.appointmentId === appointmentId) || null;
}

/**
 * CONFLICT CHECK: Verify if doctor + date + timeSlot is reserved by an active booking
 * Excludes cancelled appointments, and excludes excludeAppointmentId for self-reschedule!
 */
function isSlotBooked(doctorId, appointmentDate, timeSlot, excludeAppointmentId = null) {
  const appointments = getAllAppointments();
  return appointments.some(apt => {
    // Ignore cancelled bookings
    if (apt.status === 'Cancelled') return false;
    
    // CRITICAL: Exclude self during rescheduling conflict check
    if (excludeAppointmentId && apt.appointmentId === excludeAppointmentId) return false;
    
    return apt.doctorId === doctorId && 
           apt.appointmentDate === appointmentDate && 
           apt.appointmentTime === timeSlot;
  });
}

/**
 * Save helper to persist appointments array to LocalStorage
 */
function persistAppointments(appointmentsArray) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appointmentsArray));
    memoryStore = appointmentsArray;
    return true;
  } catch (err) {
    console.warn('Failed to save to LocalStorage; updating memory store.', err);
    memoryStore = appointmentsArray;
    return false;
  }
}

/**
 * CREATE: Book a new appointment
 */
function createAppointment(data) {
  const appointments = getAllAppointments();
  
  // Generate Reference ID: CNH-2026-XXXX
  const randomCode = Math.floor(1000 + Math.random() * 9000);
  const newAppointment = {
    appointmentId: `CNH-2026-${randomCode}`,
    doctorId: data.doctorId,
    doctorName: data.doctorName,
    departmentName: data.departmentName,
    consultationFee: data.consultationFee,
    patientName: data.patientName,
    patientEmail: data.patientEmail,
    patientPhone: data.patientPhone,
    patientAge: data.patientAge || 30,
    patientGender: data.patientGender || 'Not Specified',
    appointmentDate: data.appointmentDate,
    appointmentTime: data.appointmentTime,
    status: 'Confirmed', // Confirmed, Rescheduled, Cancelled
    bookedAt: new Date().toISOString()
  };

  appointments.unshift(newAppointment); // Latest first
  persistAppointments(appointments);
  return newAppointment;
}

/**
 * UPDATE: Reschedule an existing appointment
 */
function updateAppointment(appointmentId, updatedFields) {
  const appointments = getAllAppointments();
  const index = appointments.findIndex(apt => apt.appointmentId === appointmentId);
  
  if (index === -1) return null;
  
  const existing = appointments[index];
  const updatedAppointment = {
    ...existing,
    ...updatedFields,
    appointmentId: existing.appointmentId, // Preserve ID
    status: 'Rescheduled',
    updatedAt: new Date().toISOString()
  };

  appointments[index] = updatedAppointment;
  persistAppointments(appointments);
  return updatedAppointment;
}

/**
 * DELETE (Cancel): Change appointment status to Cancelled and release reserved slot
 */
function cancelAppointment(appointmentId) {
  const appointments = getAllAppointments();
  const index = appointments.findIndex(apt => apt.appointmentId === appointmentId);
  
  if (index === -1) return null;

  appointments[index].status = 'Cancelled';
  appointments[index].cancelledAt = new Date().toISOString();

  persistAppointments(appointments);
  return appointments[index];
}
