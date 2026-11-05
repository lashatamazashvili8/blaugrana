/**
 * auth.js — Mock authentication, session, and route guards.
 *
 * ⚠️ SECURITY DISCLAIMER: Passwords are stored in plain text in localStorage.
 *    This is a client-side demo ONLY. Do NOT use this in production.
 *    A real implementation would use a backend with hashed passwords (bcrypt/argon2),
 *    HTTPS, and server-managed sessions or JWTs.
 */
import { Storage } from './storage.js';
import { showToast } from './ui.js';

const USERS_KEY    = 'users';
const SESSION_KEY  = 'session';

export function getSession() {
  return Storage.get(SESSION_KEY);
}

export function isLoggedIn() {
  return !!getSession();
}

export function getTier() {
  const session = getSession();
  return session?.tier || 'free';
}

export function isMember() {
  const tier = getTier();
  return tier === 'member' || tier === 'supporter';
}

export function isSupporter() {
  return getTier() === 'supporter';
}

/** Guard: redirect to auth if not logged in */
export function requireAuth(redirectUrl = '/pages/auth.html') {
  if (!isLoggedIn()) {
    window.location.href = redirectUrl;
    return false;
  }
  return true;
}

/** Guard: redirect to membership if not member/supporter */
export function requireMember() {
  if (!isMember()) {
    window.location.href = '/pages/membership.html';
    return false;
  }
  return true;
}

export function login(emailOrUsername, password) {
  const users = Storage.get(USERS_KEY) || [];
  const user = users.find(u =>
    (u.email === emailOrUsername || u.username === emailOrUsername) &&
    u.password === password
  );
  if (!user) return { ok: false, error: 'Invalid email/username or password.' };

  const session = {
    userId: user.id,
    username: user.username,
    displayName: user.displayName,
    tier: user.tier,
    memberSince: user.memberSince,
    avatarInitials: user.avatarInitials
  };
  Storage.set(SESSION_KEY, session);
  return { ok: true, session };
}

export function register(data) {
  const users = Storage.get(USERS_KEY) || [];

  if (users.find(u => u.email === data.email))
    return { ok: false, error: 'An account with this email already exists.' };
  if (users.find(u => u.username === data.username))
    return { ok: false, error: 'Username already taken.' };

  const user = {
    id: 'u' + Date.now(),
    username: data.username,
    email: data.email,
    password: data.password,
    displayName: data.username,
    bio: '',
    favoritePlayer: '',
    tier: 'free',
    memberSince: new Date().toISOString().split('T')[0],
    avatarInitials: data.username.slice(0, 2).toUpperCase()
  };
  Storage.pushTo(USERS_KEY, user);

  const session = {
    userId: user.id,
    username: user.username,
    displayName: user.displayName,
    tier: user.tier,
    memberSince: user.memberSince,
    avatarInitials: user.avatarInitials
  };
  Storage.set(SESSION_KEY, session);
  return { ok: true, session };
}

export function logout() {
  Storage.remove(SESSION_KEY);
  window.location.href = '/index.html';
}

export function upgradeTier(newTier) {
  const session = getSession();
  if (!session) return false;
  session.tier = newTier;
  Storage.set(SESSION_KEY, session);

  const users = Storage.get(USERS_KEY) || [];
  Storage.updateIn(USERS_KEY, session.userId, { tier: newTier });
  return true;
}

/** Update navbar UI based on session */
export function updateNavUI() {
  const session = getSession();
  const loginLink  = document.getElementById('nav-login');
  const userPill   = document.getElementById('nav-user');
  const userLabel  = document.getElementById('nav-user-label');
  const avatarEl   = document.getElementById('nav-user-avatar');
  const logoutBtn  = document.getElementById('nav-logout');

  if (session) {
    loginLink?.classList.add('hidden');
    if (userPill) userPill.style.display = 'flex';
    if (userLabel) userLabel.textContent = session.username;
    if (avatarEl)  avatarEl.textContent  = session.avatarInitials || session.username.slice(0,2).toUpperCase();
  } else {
    loginLink?.classList.remove('hidden');
    if (userPill) userPill.style.display = 'none';
  }

  logoutBtn?.addEventListener('click', () => {
    logout();
    showToast('Logged out successfully.', 'success');
  });
}
