import { Storage } from './storage.js';
import { showToast } from './ui.js';

const USERS_KEY = 'users';
const SESSION_KEY = 'session';
const SALT = ':blaugrana_salt_2026';

export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + SALT);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

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

export function requireAuth(redirectUrl = 'auth.html') {
  if (!isLoggedIn()) {
    const isSubdir = window.location.pathname.includes('/pages/');
    window.location.href = isSubdir ? redirectUrl : `pages/${redirectUrl}`;
    return false;
  }
  return true;
}

export function requireMember() {
  if (!isMember()) {
    const isSubdir = window.location.pathname.includes('/pages/');
    window.location.href = isSubdir ? 'membership.html' : 'pages/membership.html';
    return false;
  }
  return true;
}

export async function login(emailOrUsername, password) {
  const users = Storage.get(USERS_KEY) || [];
  const hashed = await hashPassword(password);
  
  const user = users.find(u =>
    (u.email === emailOrUsername || u.username === emailOrUsername) &&
    (u.passwordHash === hashed || u.password === password)
  );

  if (!user) return { ok: false, error: 'Invalid email/username or password.' };

  if (user.password && !user.passwordHash) {
    user.passwordHash = hashed;
    delete user.password;
    Storage.updateIn(USERS_KEY, user.id, { passwordHash: hashed, password: null });
  }

  const session = {
    userId: user.id,
    username: user.username,
    displayName: user.displayName || user.username,
    tier: user.tier || 'free',
    memberSince: user.memberSince,
    avatarInitials: user.avatarInitials || user.username.slice(0, 2).toUpperCase()
  };
  Storage.set(SESSION_KEY, session);
  return { ok: true, session };
}

export async function register(data) {
  const users = Storage.get(USERS_KEY) || [];

  if (users.find(u => u.email === data.email)) {
    return { ok: false, error: 'An account with this email already exists.' };
  }
  if (users.find(u => u.username === data.username)) {
    return { ok: false, error: 'Username already taken.' };
  }

  const passwordHash = await hashPassword(data.password);

  const user = {
    id: 'u' + Date.now(),
    username: data.username,
    email: data.email,
    passwordHash,
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
  const isSubdir = window.location.pathname.includes('/pages/');
  window.location.href = isSubdir ? '../index.html' : 'index.html';
}

export function upgradeTier(newTier) {
  const session = getSession();
  if (!session) return false;
  session.tier = newTier;
  Storage.set(SESSION_KEY, session);

  Storage.updateIn(USERS_KEY, session.userId, { tier: newTier });
  return true;
}

export function updateNavUI() {
  const session = getSession();
  const loginLink = document.getElementById('nav-login');
  const userPill = document.getElementById('nav-user');
  const userLabel = document.getElementById('nav-user-label');
  const avatarEl = document.getElementById('nav-user-avatar');
  const logoutBtn = document.getElementById('nav-logout');

  if (session) {
    loginLink?.classList.add('hidden');
    if (userPill) userPill.style.display = 'flex';
    if (userLabel) userLabel.textContent = session.username;
    if (avatarEl) avatarEl.textContent = session.avatarInitials || session.username.slice(0, 2).toUpperCase();
  } else {
    loginLink?.classList.remove('hidden');
    if (userPill) userPill.style.display = 'none';
  }

  logoutBtn?.addEventListener('click', () => {
    logout();
    showToast('Logged out successfully.', 'success');
  });
}
