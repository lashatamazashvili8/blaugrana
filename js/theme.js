
import { Storage } from './storage.js';

const THEME_KEY = 'theme';

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.getElementById('theme-toggle');
  if (btn) {
    btn.setAttribute('aria-pressed', String(theme === 'dark'));
    btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  }
}

export function initTheme() {
  const saved = Storage.get(THEME_KEY) || 'light';
  applyTheme(saved);
}

export function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'light' ? 'dark' : 'light';
  applyTheme(next);
  Storage.set(THEME_KEY, next);
}

export function getTheme() {
  return document.documentElement.getAttribute('data-theme') || 'light';
}
