/**
 * CareNova Health — Task 1: Main JavaScript Module
 * Fictional Demonstration Project for iNeuBytes Web Development Internship
 * 
 * Handles:
 * 1. Mobile responsive navigation toggle & keyboard accessibility
 * 2. Active section link highlighting on scroll
 * 3. Smooth scrolling for internal anchor links
 * 4. Client-side form validation for Appointment Enquiry Form
 * 5. Standalone feedback state rendering without backend dependencies
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ==========================================================================
     1. Mobile Navigation Toggle & Accessibility
     ========================================================================== */
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', !isExpanded);
      navMenu.classList.toggle('is-active');

      // Update screen reader icon label if present
      const hamburgerIcon = navToggle.querySelector('.hamburger-icon');
      if (hamburgerIcon) {
        hamburgerIcon.setAttribute('aria-hidden', 'true');
      }
    });

    // Close mobile nav when clicking any nav link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (navMenu.classList.contains('is-active')) {
          navMenu.classList.remove('is-active');
          navToggle.setAttribute('aria-expanded', 'false');
        }
      });
    });

    // Close mobile nav when pressing Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('is-active')) {
        navMenu.classList.remove('is-active');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.focus();
      }
    });
  }

  /* ==========================================================================
     2. Active Link Highlighting on Scroll (Intersection Observer)
     ========================================================================== */
  const sections = document.querySelectorAll('section[id]');
  
  if ('IntersectionObserver' in window && sections.length > 0) {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const currentId = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentId}`) {
              link.classList.add('active');
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
  }

  /* ==========================================================================
     3. Smooth Scroll to Anchor Sections
     ========================================================================== */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  /* ==========================================================================
     4. Appointment Enquiry Form Client-Side Validation
     ========================================================================== */
  const enquiryForm = document.getElementById('enquiryForm');
  const alertSuccess = document.getElementById('formAlertSuccess');
  const alertError = document.getElementById('formAlertError');

  // Input Field References
  const patientName = document.getElementById('patientName');
  const patientEmail = document.getElementById('patientEmail');
  const patientPhone = document.getElementById('patientPhone');
  const preferredDept = document.getElementById('preferredDept');
  const enquiryMessage = document.getElementById('enquiryMessage');

  // Helper Validation Functions
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const isValidPhone = (phone) => {
    // Allows digits, spaces, hyphens, plus sign; min 10 digits
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    return /^\+?[0-9]{10,15}$/.test(cleaned);
  };

  const setFieldError = (inputElement, errorId, isError) => {
    const errorElement = document.getElementById(errorId);
    if (isError) {
      inputElement.classList.add('is-invalid');
      inputElement.setAttribute('aria-invalid', 'true');
      if (errorElement) errorElement.style.display = 'block';
    } else {
      inputElement.classList.remove('is-invalid');
      inputElement.removeAttribute('aria-invalid');
      if (errorElement) errorElement.style.display = 'none';
    }
  };

  // Real-time input cleaning on type
  [patientName, patientEmail, patientPhone, preferredDept, enquiryMessage].forEach(input => {
    if (input) {
      input.addEventListener('input', () => {
        const errorId = input.id + 'Error';
        setFieldError(input, errorId, false);
        if (alertError) alertError.style.display = 'none';
      });

      if (input.tagName === 'SELECT') {
        input.addEventListener('change', () => {
          const errorId = input.id + 'Error';
          setFieldError(input, errorId, false);
        });
      }
    }
  });

  // Form Submit Handler
  if (enquiryForm) {
    enquiryForm.addEventListener('submit', (e) => {
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
      if (!patientEmail.value.trim() || !isValidEmail(patientEmail.value)) {
        setFieldError(patientEmail, 'patientEmailError', true);
        hasErrors = true;
      } else {
        setFieldError(patientEmail, 'patientEmailError', false);
      }

      // 3. Phone Validation
      if (!patientPhone.value.trim() || !isValidPhone(patientPhone.value)) {
        setFieldError(patientPhone, 'patientPhoneError', true);
        hasErrors = true;
      } else {
        setFieldError(patientPhone, 'patientPhoneError', false);
      }

      // 4. Department Selection Validation
      if (!preferredDept.value) {
        setFieldError(preferredDept, 'preferredDeptError', true);
        hasErrors = true;
      } else {
        setFieldError(preferredDept, 'preferredDeptError', false);
      }

      // 5. Message Validation
      if (!enquiryMessage.value.trim() || enquiryMessage.value.trim().length < 10) {
        setFieldError(enquiryMessage, 'enquiryMessageError', true);
        hasErrors = true;
      } else {
        setFieldError(enquiryMessage, 'enquiryMessageError', false);
      }

      // Handle Validation Results
      if (hasErrors) {
        if (alertError) {
          alertError.style.display = 'flex';
          alertError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        if (alertSuccess) alertSuccess.style.display = 'none';
        return;
      }

      // Successful Validation Demo Submission
      if (alertError) alertError.style.display = 'none';
      if (alertSuccess) {
        const submittedName = patientName.value.trim();
        const submittedDept = preferredDept.options[preferredDept.selectedIndex].text;
        
        alertSuccess.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke-linecap="round" stroke-linejoin="round"/>
            <polyline points="22 4 12 14.01 9 11.01" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <div>
            <strong>Enquiry Submitted Successfully (Demo)!</strong><br>
            Thank you, ${submittedName}. Our CareNova team will review your enquiry for <em>${submittedDept}</em> and contact you shortly.
          </div>
        `;
        alertSuccess.style.display = 'flex';
        alertSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      // Reset form controls
      enquiryForm.reset();
    });
  }

  /* ==========================================================================
     5. Back to Top Button
     ========================================================================== */
  const backToTopBtn = document.getElementById('backToTop');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        backToTopBtn.classList.add('is-visible');
      } else {
        backToTopBtn.classList.remove('is-visible');
      }
    });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
});
