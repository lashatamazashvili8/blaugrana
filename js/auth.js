import { Storage } from './storage.js';
import { showToast } from './ui.js';

const USERS_KEY = 'users';
const SESSION_KEY = 'session';
const SALT = ':blaugrana_salt_2026';

function rightRotate(value, amount) {
  return (value >>> amount) | (value << (32 - amount));
}


function sha256Fallback(message) {
  const bytes = new TextEncoder().encode(message);
  let ascii = '';
  for (const byte of bytes) ascii += String.fromCharCode(byte);

  const maxWord = 2 ** 32;
  const words = [];
  const bitLength = ascii.length * 8;
  let hash = [];
  const k = [];
  const composite = {};
  for (let candidate = 2, prime = 0; prime < 64; candidate++) {
    if (composite[candidate]) continue;
    for (let i = 0; i < 313; i += candidate) composite[i] = candidate;
    hash[prime] = (candidate ** 0.5 * maxWord) | 0;
    k[prime] = (candidate ** (1 / 3) * maxWord) | 0;
    prime++;
  }

  ascii += '\x80';
  while (ascii.length % 64 - 56) ascii += '\x00';
  for (let i = 0; i < ascii.length; i++) {
    words[i >> 2] |= ascii.charCodeAt(i) << ((3 - i) % 4) * 8;
  }
  words[words.length] = (bitLength / maxWord) | 0;
  words[words.length] = bitLength;

  for (let j = 0; j < words.length;) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash;
    hash = hash.slice(0, 8);
    for (let i = 0; i < 64; i++) {
      const w15 = w[i - 15];
      const w2 = w[i - 2];
      const a = hash[0];
      const e = hash[4];
      const temp1 = hash[7]
        + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
        + ((e & hash[5]) ^ (~e & hash[6]))
        + k[i]
        + (w[i] = i < 16 ? w[i] : (
          w[i - 16]
          + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
          + w[i - 7]
          + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
        ) | 0);
      const temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
        + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
    }
    for (let i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
  }

  let result = '';
  for (let i = 0; i < 8; i++) {
    for (let j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

export async function hashPassword(password) {
  const payload = String(password) + SALT;
  if (globalThis.crypto?.subtle) {
    try {
      const data = new TextEncoder().encode(payload);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      
    }
  }
  return sha256Fallback(payload);
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
  const normalizedId = emailOrUsername.trim().toLowerCase();
  
  const user = users.find(u =>
    (u.email && u.email.toLowerCase() === normalizedId) ||
    (u.username && u.username.toLowerCase() === normalizedId)
  );

  if (!user) {
    return {
      ok: false,
      error: `User "${emailOrUsername}" does not exist in local storage. Please check credentials or register.`
    };
  }

  const hashed = await hashPassword(password);
  const passwordMatches = (user.passwordHash === hashed) || (user.password === password);

  if (!passwordMatches) {
    return { ok: false, error: 'Incorrect password. Please verify and try again.' };
  }

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
  const normalizedUser = data.username.trim().toLowerCase();
  const normalizedEmail = data.email.trim().toLowerCase();

  if (users.find(u => u.email && u.email.toLowerCase() === normalizedEmail)) {
    return { ok: false, error: 'An account with this email already exists in local storage.' };
  }
  if (users.find(u => u.username && u.username.toLowerCase() === normalizedUser)) {
    return { ok: false, error: 'Username already taken in local storage.' };
  }

  const passwordHash = await hashPassword(data.password);

  const newUser = {
    id: 'u' + Date.now(),
    username: data.username.trim(),
    email: data.email.trim(),
    passwordHash,
    displayName: data.username.trim(),
    bio: 'Proud Culer! 🔵🔴',
    favoritePlayer: 'Lamine Yamal',
    tier: 'free',
    memberSince: new Date().toISOString().split('T')[0],
    avatarInitials: data.username.trim().slice(0, 2).toUpperCase()
  };

  Storage.pushTo(USERS_KEY, newUser);

  const session = {
    userId: newUser.id,
    username: newUser.username,
    displayName: newUser.displayName,
    tier: newUser.tier,
    memberSince: newUser.memberSince,
    avatarInitials: newUser.avatarInitials
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
