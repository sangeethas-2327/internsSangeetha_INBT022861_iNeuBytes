// ============================================================================
// CareNova Health — Client Authentication & Session Manager
// iNeuBytes Web Development Internship — Major Project Phase 3B Auth & RBAC
// ============================================================================

const AuthManager = {
  currentUser: null,

  // Check Active Session on Page Load (/api/auth/me)
  async checkSession() {
    const res = await ApiService.getMe();
    if (res.success && res.data && res.data.user) {
      this.currentUser = res.data.user;
      this.updateNavbarUserBadge(this.currentUser);
      return this.currentUser;
    } else {
      this.currentUser = null;
      this.updateNavbarUserBadge(null);
      return null;
    }
  },

  // Update Navbar User Status Badge
  updateNavbarUserBadge(user) {
    const navUserContainer = document.getElementById('navUserContainer');
    if (!navUserContainer) return;

    if (user) {
      navUserContainer.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <span style="font-size: 0.85rem; font-weight: 600; color: var(--primary-color);">
            👤 ${user.firstName} (${user.role.toUpperCase()})
          </span>
          <button id="logoutBtn" class="btn btn-outline" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;">Logout</button>
        </div>
      `;

      const logoutBtn = document.getElementById('logoutBtn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => this.handleLogout());
      }
    } else {
      navUserContainer.innerHTML = `
        <div style="display: flex; gap: 0.5rem;">
          <a href="login.html" class="btn btn-outline" style="padding: 0.35rem 0.75rem; font-size: 0.85rem;">Login</a>
          <a href="register.html" class="btn btn-primary" style="padding: 0.35rem 0.75rem; font-size: 0.85rem;">Register</a>
        </div>
      `;
    }
  },

  // Handle Login Submit
  async handleLogin(email, password, alertContainer, submitBtn) {
    if (alertContainer) {
      alertContainer.style.display = 'none';
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Authenticating...';
    }

    const res = await ApiService.login({ email, password });

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign In';
    }

    if (res.success) {
      this.currentUser = res.data.user;
      if (alertContainer) {
        alertContainer.className = 'form-alert success';
        alertContainer.style.display = 'block';
        alertContainer.textContent = `Login Successful! Welcome, ${res.data.user.firstName} (${res.data.user.role.toUpperCase()}).`;
      }

      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1200);
    } else {
      if (alertContainer) {
        alertContainer.className = 'form-alert error';
        alertContainer.style.display = 'block';
        alertContainer.textContent = res.message || 'Login failed. Invalid email or password.';
      }
    }
  },

  // Handle Registration Submit
  async handleRegister(formData, alertContainer, submitBtn) {
    if (alertContainer) {
      alertContainer.style.display = 'none';
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Creating Account...';
    }

    const res = await ApiService.register(formData);

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Register Patient Account';
    }

    if (res.success) {
      if (alertContainer) {
        alertContainer.className = 'form-alert success';
        alertContainer.style.display = 'block';
        alertContainer.textContent = 'Registration Successful! Redirecting to login page...';
      }

      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);
    } else {
      if (alertContainer) {
        alertContainer.className = 'form-alert error';
        alertContainer.style.display = 'block';
        alertContainer.textContent = res.message || 'Registration failed. Please check form details.';
      }
    }
  },

  // Handle Logout
  async handleLogout() {
    await ApiService.logout();
    this.currentUser = null;
    window.location.href = 'login.html';
  }
};
