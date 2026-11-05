

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

  
  pushTo(key, item) {
    const arr = this.get(key) || [];
    
    if (arr.length >= 100) arr.shift();
    arr.push(item);
    return this.set(key, arr);
  },

  
  updateIn(key, id, patch) {
    const arr = this.get(key) || [];
    const idx = arr.findIndex(x => x.id === id);
    if (idx === -1) return false;
    arr[idx] = { ...arr[idx], ...patch };
    return this.set(key, arr);
  },

  
  removeFrom(key, id) {
    const arr = this.get(key) || [];
    const next = arr.filter(x => x.id !== id);
    return this.set(key, next);
  }
};
