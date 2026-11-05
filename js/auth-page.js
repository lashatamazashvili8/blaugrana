import { z } from './vendor/zod.js';
import { createFormik } from './vendor/formik.js';
import { login, register, getSession, updateNavUI } from './auth.js';
import { initTheme, toggleTheme } from './theme.js';
import { initNav, initTabs, showToast, seedIfNeeded } from './ui.js';

const loginSchema = z.object({
  loginId: z.string('Email or username is required').min(1, 'Please enter your username or email address.'),
  loginPassword: z.string('Password is required').min(1, 'Password is required.')
});

const registerSchema = z.object({
  username: z.string('Username is required')
    .min(3, 'Username must be at least 3 characters.')
    .max(20, 'Username cannot exceed 20 characters.')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores.'),
  email: z.string('Email is required')
    .email('Please enter a valid email address.'),
  password: z.string('Password is required')
    .min(6, 'Password must have at least 6 characters.'),
  confirmPassword: z.string('Confirm password is required')
    .min(6, 'Passwords do not match.')
}).refine(data => data.password === data.confirmPassword, 'Passwords do not match.');

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

function initAuthPage() {
  const loginFormEl = document.getElementById('login-form');
  const regFormEl = document.getElementById('register-form');

  const loginIdInput = document.getElementById('login-id');
  const loginPassInput = document.getElementById('login-password');
  const loginIdErr = document.getElementById('login-id-error');
  const loginPassErr = document.getElementById('login-password-error');

  const regUserInput = document.getElementById('reg-username');
  const regEmailInput = document.getElementById('reg-email');
  const regPassInput = document.getElementById('reg-password');
  const regConfirmInput = document.getElementById('reg-confirm');

  const regUserErr = document.getElementById('reg-username-error');
  const regEmailErr = document.getElementById('reg-email-error');
  const regPassErr = document.getElementById('reg-password-error');
  const regConfirmErr = document.getElementById('reg-confirm-error');

  const strengthBar = document.getElementById('strength-meter-bar');
  const strengthLabel = document.getElementById('strength-meter-label');

  const loginFormik = createFormik({
    initialValues: { loginId: '', loginPassword: '' },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      const result = await login(values.loginId.trim(), values.loginPassword);
      if (!result.ok) {
        showToast(result.error || 'Authentication failed', 'error');
        loginPassInput.classList.add('is-error');
        return;
      }
      showToast(`Welcome back, ${result.session.username}!`, 'success');
      setTimeout(() => {
        window.location.href = 'profile.html';
      }, 700);
    }
  });

  loginFormik.subscribe(({ errors, touched }) => {
    if (touched.loginId && errors.loginId) {
      loginIdErr.textContent = errors.loginId;
      loginIdErr.classList.add('is-visible');
      loginIdInput.classList.add('is-error');
    } else {
      loginIdErr.classList.remove('is-visible');
      loginIdInput.classList.remove('is-error');
    }

    if (touched.loginPassword && errors.loginPassword) {
      loginPassErr.textContent = errors.loginPassword;
      loginPassErr.classList.add('is-visible');
      loginPassInput.classList.add('is-error');
    } else {
      loginPassErr.classList.remove('is-visible');
      loginPassInput.classList.remove('is-error');
    }
  });

  loginIdInput?.addEventListener('input', (e) => loginFormik.handleChange(e));
  loginIdInput?.addEventListener('blur', (e) => loginFormik.handleBlur(e));
  loginPassInput?.addEventListener('input', (e) => loginFormik.handleChange(e));
  loginPassInput?.addEventListener('blur', (e) => loginFormik.handleBlur(e));

  loginFormEl?.addEventListener('submit', (e) => {
    e.preventDefault();
    loginFormik.setFieldValue('loginId', loginIdInput.value.trim(), false);
    loginFormik.setFieldValue('loginPassword', loginPassInput.value, false);
    loginFormik.handleSubmit(e);
  });

  const registerFormik = createFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationSchema: registerSchema,
    onSubmit: async (values) => {
      const result = await register({
        username: values.username.trim(),
        email: values.email.trim(),
        password: values.password
      });

      if (!result.ok) {
        showToast(result.error, 'error');
        return;
      }

      showToast(`Account created and saved in local storage! Welcome, @${result.session.username}!`, 'success');
      setTimeout(() => {
        window.location.href = 'profile.html';
      }, 700);
    }
  });

  registerFormik.subscribe(({ errors, touched }) => {
    if (touched.username && errors.username) {
      regUserErr.textContent = errors.username;
      regUserErr.classList.add('is-visible');
      regUserInput.classList.add('is-error');
      regUserInput.classList.remove('is-success');
    } else if (touched.username && !errors.username) {
      regUserErr.classList.remove('is-visible');
      regUserInput.classList.remove('is-error');
      regUserInput.classList.add('is-success');
    }

    if (touched.email && errors.email) {
      regEmailErr.textContent = errors.email;
      regEmailErr.classList.add('is-visible');
      regEmailInput.classList.add('is-error');
      regEmailInput.classList.remove('is-success');
    } else if (touched.email && !errors.email) {
      regEmailErr.classList.remove('is-visible');
      regEmailInput.classList.remove('is-error');
      regEmailInput.classList.add('is-success');
    }

    if (touched.password && errors.password) {
      regPassErr.textContent = errors.password;
      regPassErr.classList.add('is-visible');
      regPassInput.classList.add('is-error');
      regPassInput.classList.remove('is-success');
    } else if (touched.password && !errors.password) {
      regPassErr.classList.remove('is-visible');
      regPassInput.classList.remove('is-error');
      regPassInput.classList.add('is-success');
    }

    const confirmMismatch = errors.confirmPassword || errors._general;
    if (touched.confirmPassword && confirmMismatch) {
      regConfirmErr.textContent = confirmMismatch;
      regConfirmErr.classList.add('is-visible');
      regConfirmInput.classList.add('is-error');
      regConfirmInput.classList.remove('is-success');
    } else if (touched.confirmPassword && !confirmMismatch) {
      regConfirmErr.classList.remove('is-visible');
      regConfirmInput.classList.remove('is-error');
      regConfirmInput.classList.add('is-success');
    }
  });

  regUserInput?.addEventListener('input', (e) => registerFormik.handleChange(e));
  regUserInput?.addEventListener('blur', (e) => registerFormik.handleBlur(e));

  regEmailInput?.addEventListener('input', (e) => registerFormik.handleChange(e));
  regEmailInput?.addEventListener('blur', (e) => registerFormik.handleBlur(e));

  regPassInput?.addEventListener('input', (e) => {
    registerFormik.handleChange(e);
    const { label, cls } = calculatePasswordStrength(e.target.value);
    strengthLabel.textContent = label;
    strengthLabel.className = `strength-label ${cls ? `strength-label--${cls}` : ''}`;
    strengthBar.className = `strength-bar__fill ${cls ? `strength-bar__fill--${cls}` : ''}`;
  });
  regPassInput?.addEventListener('blur', (e) => registerFormik.handleBlur(e));

  regConfirmInput?.addEventListener('input', (e) => registerFormik.handleChange(e));
  regConfirmInput?.addEventListener('blur', (e) => registerFormik.handleBlur(e));

  regFormEl?.addEventListener('submit', (e) => {
    e.preventDefault();
    registerFormik.setFieldValue('username', regUserInput.value.trim(), false);
    registerFormik.setFieldValue('email', regEmailInput.value.trim(), false);
    registerFormik.setFieldValue('password', regPassInput.value, false);
    registerFormik.setFieldValue('confirmPassword', regConfirmInput.value, false);
    registerFormik.handleSubmit(e);
  });

  document.getElementById('fill-demo-supporter')?.addEventListener('click', () => {
    loginIdInput.value = 'culerdemo';
    loginPassInput.value = 'Demo1234!';
    loginFormik.setFieldValue('loginId', 'culerdemo');
    loginFormik.setFieldValue('loginPassword', 'Demo1234!');
    showToast('Filled credentials for Supporter demo user', 'info', 2000);
  });

  document.getElementById('fill-demo-member')?.addEventListener('click', () => {
    loginIdInput.value = 'blaugrana_fan';
    loginPassInput.value = 'Fan12345!';
    loginFormik.setFieldValue('loginId', 'blaugrana_fan');
    loginFormik.setFieldValue('loginPassword', 'Fan12345!');
    showToast('Filled credentials for Member demo user', 'info', 2000);
  });

  document.getElementById('fill-demo-free')?.addEventListener('click', () => {
    loginIdInput.value = 'freeuser';
    loginPassInput.value = 'Free1234!';
    loginFormik.setFieldValue('loginId', 'freeuser');
    loginFormik.setFieldValue('loginPassword', 'Free1234!');
    showToast('Filled credentials for Free demo user', 'info', 2000);
  });
}

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
