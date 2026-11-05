/**
 * storage.js — localStorage CRUD wrapper with try/catch
 * All keys are prefixed with "bh_" (blaugrana-hub).
 *
 * ⚠️ This module is for demo/educational use only.
 *    Data is stored unencrypted in browser localStorage.
 */

const PREFIX = 'bh_';

export const Storage = {
  get(key) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn('[Storage] Write failed:', e);
      return false;
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(PREFIX + key);
      return true;
    } catch {
      return false;
    }
  },

  clear() {
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith(PREFIX))
        .forEach(k => localStorage.removeItem(k));
      return true;
    } catch {
      return false;
    }
  },

  // Convenience: get array, append item, write back
  pushTo(key, item) {
    const arr = this.get(key) || [];
    // Cap arrays at 100 items to avoid quota issues
    if (arr.length >= 100) arr.shift();
    arr.push(item);
    return this.set(key, arr);
  },

  // Update item in array by id
  updateIn(key, id, patch) {
    const arr = this.get(key) || [];
    const idx = arr.findIndex(x => x.id === id);
    if (idx === -1) return false;
    arr[idx] = { ...arr[idx], ...patch };
    return this.set(key, arr);
  },

  // Remove item from array by id
  removeFrom(key, id) {
    const arr = this.get(key) || [];
    const next = arr.filter(x => x.id !== id);
    return this.set(key, next);
  }
};
