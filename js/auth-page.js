/**
 * auth-page.js — Form validation, real-time feedback, and auth state handler
 */
import { login, register, getSession, updateNavUI } from './auth.js';
import { initTheme, toggleTheme } from './theme.js';
import { initNav, initTabs, showToast, seedIfNeeded } from './ui.js';

// Compute password strength: 0=empty, 1=weak, 2=fair, 3=strong
function calculatePasswordStrength(pass) {
  if (!pass) return { score: 0, label: 'Enter password', cls: '' };
  let score = 0;
  if (pass.length >= 6) score++;
  if (pass.length >= 8 && /[A-Z]/.test(pass) && /[0-9]/.test(pass)) score++;
  if (pass.length >= 10 && /[^A-Za-z0-9]/.test(pass)) score++;

  if (score === 1) return { score: 1, label: 'Weak', cls: 'weak' };
  if (score === 2) return { score: 2, label: 'Fair', cls: 'fair' };
  return { score: 3, label: 'Strong', cls: 'strong' };
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateUsername(username) {
  return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}

function initAuthPage() {
  const loginForm = document.getElementById('login-form');
  const regForm = document.getElementById('register-form');

  const regPassInput = document.getElementById('reg-password');
  const regConfirmInput = document.getElementById('reg-confirm');
  const regUserInput = document.getElementById('reg-username');
  const regEmailInput = document.getElementById('reg-email');

  const strengthBar = document.getElementById('strength-meter-bar');
  const strengthLabel = document.getElementById('strength-meter-label');

  // Real-time password strength
  regPassInput?.addEventListener('input', () => {
    const val = regPassInput.value;
    const { label, cls } = calculatePasswordStrength(val);
    strengthLabel.textContent = label;
    strengthLabel.className = `strength-label ${cls ? `strength-label--${cls}` : ''}`;
    strengthBar.className = `strength-bar__fill ${cls ? `strength-bar__fill--${cls}` : ''}`;

    const err = document.getElementById('reg-password-error');
    if (val.length > 0 && val.length < 6) {
      err.classList.add('is-visible');
      regPassInput.classList.add('is-error');
      regPassInput.classList.remove('is-success');
    } else if (val.length >= 6) {
      err.classList.remove('is-visible');
      regPassInput.classList.remove('is-error');
      regPassInput.classList.add('is-success');
    } else {
      err.classList.remove('is-visible');
      regPassInput.classList.remove('is-error', 'is-success');
    }

    // Also revalidate confirm if non-empty
    if (regConfirmInput.value) {
      checkConfirmMatch();
    }
  });

  function checkConfirmMatch() {
    const err = document.getElementById('reg-confirm-error');
    if (regConfirmInput.value !== regPassInput.value) {
      err.classList.add('is-visible');
      regConfirmInput.classList.add('is-error');
      regConfirmInput.classList.remove('is-success');
      return false;
    } else {
      err.classList.remove('is-visible');
      regConfirmInput.classList.remove('is-error');
      regConfirmInput.classList.add('is-success');
      return true;
    }
  }

  regConfirmInput?.addEventListener('input', checkConfirmMatch);

  // Real-time username check
  regUserInput?.addEventListener('input', () => {
    const valid = validateUsername(regUserInput.value.trim());
    const err = document.getElementById('reg-username-error');
    if (!valid && regUserInput.value.length > 0) {
      err.classList.add('is-visible');
      regUserInput.classList.add('is-error');
      regUserInput.classList.remove('is-success');
    } else if (valid) {
      err.classList.remove('is-visible');
      regUserInput.classList.remove('is-error');
      regUserInput.classList.add('is-success');
    } else {
      err.classList.remove('is-visible');
      regUserInput.classList.remove('is-error', 'is-success');
    }
  });

  // Real-time email check
  regEmailInput?.addEventListener('input', () => {
    const valid = validateEmail(regEmailInput.value.trim());
    const err = document.getElementById('reg-email-error');
    if (!valid && regEmailInput.value.length > 0) {
      err.classList.add('is-visible');
      regEmailInput.classList.add('is-error');
      regEmailInput.classList.remove('is-success');
    } else if (valid) {
      err.classList.remove('is-visible');
      regEmailInput.classList.remove('is-error');
      regEmailInput.classList.add('is-success');
    } else {
      err.classList.remove('is-visible');
      regEmailInput.classList.remove('is-error', 'is-success');
    }
  });

  // Login submission
  loginForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const loginIdInput = document.getElementById('login-id');
    const loginPassInput = document.getElementById('login-password');
    const idVal = loginIdInput.value.trim();
    const passVal = loginPassInput.value;

    let hasError = false;
    const idErr = document.getElementById('login-id-error');
    const passErr = document.getElementById('login-password-error');

    if (!idVal) {
      idErr.classList.add('is-visible');
      loginIdInput.classList.add('is-error');
      hasError = true;
    } else {
      idErr.classList.remove('is-visible');
      loginIdInput.classList.remove('is-error');
    }

    if (!passVal) {
      passErr.classList.add('is-visible');
      loginPassInput.classList.add('is-error');
      hasError = true;
    } else {
      passErr.classList.remove('is-visible');
      loginPassInput.classList.remove('is-error');
    }

    if (hasError) return;

    const result = login(idVal, passVal);
    if (!result.ok) {
      showToast(result.error || 'Authentication failed', 'error');
      loginPassInput.classList.add('is-error');
      return;
    }

    showToast(`Welcome back, ${result.session.username}!`, 'success');
    setTimeout(() => {
      window.location.href = 'profile.html';
    }, 800);
  });

  // Register submission
  regForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = regUserInput.value.trim();
    const email = regEmailInput.value.trim();
    const password = regPassInput.value;
    const confirm = regConfirmInput.value;

    let hasError = false;

    if (!validateUsername(username)) {
      document.getElementById('reg-username-error').classList.add('is-visible');
      regUserInput.classList.add('is-error');
      hasError = true;
    }
    if (!validateEmail(email)) {
      document.getElementById('reg-email-error').classList.add('is-visible');
      regEmailInput.classList.add('is-error');
      hasError = true;
    }
    if (password.length < 6) {
      document.getElementById('reg-password-error').classList.add('is-visible');
      regPassInput.classList.add('is-error');
      hasError = true;
    }
    if (password !== confirm) {
      document.getElementById('reg-confirm-error').classList.add('is-visible');
      regConfirmInput.classList.add('is-error');
      hasError = true;
    }

    if (hasError) return;

    const result = register({ username, email, password });
    if (!result.ok) {
      showToast(result.error, 'error');
      return;
    }

    showToast('Account created successfully! Welcome to Blaugrana Hub.', 'success');
    setTimeout(() => {
      window.location.href = 'profile.html';
    }, 800);
  });

  // Quick fill buttons
  document.getElementById('fill-demo-supporter')?.addEventListener('click', () => {
    document.getElementById('login-id').value = 'culerdemo';
    document.getElementById('login-password').value = 'Demo1234!';
    showToast('Filled credentials for Supporter demo user', 'info', 2000);
  });
  document.getElementById('fill-demo-member')?.addEventListener('click', () => {
    document.getElementById('login-id').value = 'blaugrana_fan';
    document.getElementById('login-password').value = 'Fan12345!';
    showToast('Filled credentials for Member demo user', 'info', 2000);
  });
  document.getElementById('fill-demo-free')?.addEventListener('click', () => {
    document.getElementById('login-id').value = 'freeuser';
    document.getElementById('login-password').value = 'Free1234!';
    showToast('Filled credentials for Free demo user', 'info', 2000);
  });
}

// Redirect or inform if already signed in
function checkExistingSession() {
  const session = getSession();
  if (session) {
    const container = document.getElementById('auth-container');
    if (container) {
      const banner = document.createElement('div');
      banner.style.padding = '12px 16px';
      banner.style.background = 'rgba(0, 77, 152, 0.1)';
      banner.style.borderBottom = '1px solid var(--color-border)';
      banner.style.textAlign = 'center';
      banner.style.fontSize = 'var(--fs-sm)';
      banner.innerHTML = `Signed in as <strong>@${session.username}</strong> (${session.tier}). <a href="profile.html" style="color:var(--color-navy);font-weight:600;text-decoration:underline;">View Profile</a>`;
      container.prepend(banner);
    }
  }
}

async function init() {
  initTheme();
  await seedIfNeeded();
  initNav();
  updateNavUI();
  initTabs(document.querySelector('.auth-card__tabs'));
  initAuthPage();
  checkExistingSession();
  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
}

init();
