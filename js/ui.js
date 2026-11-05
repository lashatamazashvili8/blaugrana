/**
 * ui.js — Shared UI utilities:
 *   - Toast notifications
 *   - Navbar hamburger + focus trap
 *   - Modal open/close
 *   - Tabs
 *   - Accordion
 *   - Lazy image loading
 *   - Scroll-triggered count-up
 */

/* ── Toast ── */
let toastContainer = null;

function getToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    toastContainer.setAttribute('aria-live', 'polite');
    toastContainer.setAttribute('aria-atomic', 'false');
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

export function showToast(message, type = 'info', duration = 3500) {
  const container = getToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.setAttribute('role', 'status');
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);
  // Trigger animation
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('is-visible'));
  });
  setTimeout(() => {
    toast.classList.remove('is-visible');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }, duration);
}

/* ── Hamburger / Mobile nav + focus trap ── */
export function initNav() {
  const hamburger  = document.getElementById('hamburger');
  const mobileNav  = document.getElementById('mobile-nav');
  const overlay    = document.getElementById('nav-overlay');
  if (!hamburger || !mobileNav) return;

  let isOpen = false;
  const focusableSelectors = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function openNav() {
    isOpen = true;
    hamburger.setAttribute('aria-expanded', 'true');
    mobileNav.classList.add('is-open');
    overlay?.classList.add('is-active');
    document.body.style.overflow = 'hidden';
    // Focus first item
    const first = mobileNav.querySelector(focusableSelectors);
    first?.focus();
  }

  function closeNav() {
    isOpen = false;
    hamburger.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('is-open');
    overlay?.classList.remove('is-active');
    document.body.style.overflow = '';
    hamburger.focus();
  }

  hamburger.addEventListener('click', () => isOpen ? closeNav() : openNav());
  overlay?.addEventListener('click', closeNav);

  // Focus trap
  mobileNav.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeNav(); return; }
    if (e.key !== 'Tab') return;
    const focusable = [...mobileNav.querySelectorAll(focusableSelectors)];
    if (!focusable.length) return;
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
    }
  });

  // Close on link click
  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));

  // Set active link
  const path = window.location.pathname;
  document.querySelectorAll('.navbar__link, .mobile-nav__link').forEach(link => {
    if (link.getAttribute('href') && path.endsWith(link.getAttribute('href').split('/').pop())) {
      link.classList.add('is-active');
    }
  });
}

/* ── Tabs ── */
export function initTabs(container = document) {
  container.querySelectorAll('[role="tablist"]').forEach(tablist => {
    const tabs   = [...tablist.querySelectorAll('[role="tab"]')];
    const panels = tabs.map(t => document.getElementById(t.getAttribute('aria-controls')));

    function activate(tab) {
      tabs.forEach((t, i) => {
        const active = t === tab;
        t.setAttribute('aria-selected', String(active));
        t.classList.toggle('is-active', active);
        t.setAttribute('tabindex', active ? '0' : '-1');
        panels[i]?.classList.toggle('is-active', active);
      });
    }

    tablist.addEventListener('click', e => {
      const tab = e.target.closest('[role="tab"]');
      if (tab) activate(tab);
    });

    tablist.addEventListener('keydown', e => {
      const idx = tabs.indexOf(document.activeElement);
      if (idx === -1) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault(); const next = tabs[(idx + 1) % tabs.length]; next.focus(); activate(next);
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault(); const prev = tabs[(idx - 1 + tabs.length) % tabs.length]; prev.focus(); activate(prev);
      }
    });

    // Activate first by default
    const initial = tabs.find(t => t.classList.contains('is-active')) || tabs[0];
    if (initial) activate(initial);
  });
}

// Also support simple .tab-btn / .tab-panel pattern
export function initSimpleTabs(wrapper) {
  if (!wrapper) return;
  const btns   = [...wrapper.querySelectorAll('.tab-btn')];
  const panels = btns.map(b => document.getElementById(b.dataset.tab));

  btns.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      btns.forEach((b, j) => {
        const active = j === i;
        b.classList.toggle('is-active', active);
        panels[j]?.classList.toggle('is-active', active);
      });
    });
  });

  if (btns.length && !btns.some(b => b.classList.contains('is-active'))) {
    btns[0].classList.add('is-active');
    panels[0]?.classList.add('is-active');
  }
}

/* ── Accordion ── */
export function initAccordion(container = document) {
  container.querySelectorAll('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      const panelId  = trigger.getAttribute('aria-controls');
      const panel    = document.getElementById(panelId);

      trigger.setAttribute('aria-expanded', String(!expanded));
      panel?.classList.toggle('is-open', !expanded);
    });
  });
}

/* ── Modal ── */
export function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  const first = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  first?.focus();
}

export function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

export function initModals() {
  document.querySelectorAll('[data-modal-open]').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.modalOpen));
  });
  document.querySelectorAll('[data-modal-close]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.modalClose || btn.closest('.modal')?.id));
  });
  document.querySelectorAll('.modal__backdrop').forEach(bd => {
    bd.addEventListener('click', () => closeModal(bd.closest('.modal')?.id));
  });
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeModal(modal.id);
    });
  });
}

/* ── Lazy images ── */
export function initLazyImages() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('img[data-src]').forEach(img => {
      img.src = img.dataset.src;
    });
    return;
  }
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const img = entry.target;
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
      obs.unobserve(img);
    });
  }, { rootMargin: '200px' });

  document.querySelectorAll('img[data-src]').forEach(img => observer.observe(img));
}

/* ── Count-up on scroll ── */
export function initCountUp(selector = '[data-count]') {
  const els = document.querySelectorAll(selector);
  if (!els.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el  = entry.target;
      const end = parseInt(el.dataset.count, 10);
      const dur = 1800;
      const start = performance.now();

      function step(now) {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / dur, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * end);
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = end;
      }
      requestAnimationFrame(step);
      obs.unobserve(el);
    });
  }, { threshold: 0.4 });

  els.forEach(el => observer.observe(el));
}

/* ── Debounce ── */
export function debounce(fn, ms = 200) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/* ── Generate avatar initials SVG ── */
export function avatarInitials(initials, size = 40) {
  const colors = ['#004D98', '#A50044', '#1a7a4a', '#7a5500', '#4a2d7a'];
  const color  = colors[initials.charCodeAt(0) % colors.length];
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect width="${size}" height="${size}" rx="${size/2}" fill="${color}"/>
      <text x="50%" y="50%" dy=".35em" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-weight="bold" font-size="${size*0.4}">${initials}</text>
    </svg>`
  )}`;
}

/* ── Format date ── */
export function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
export function formatRelative(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7)   return `${days}d ago`;
  return formatDate(iso);
}

/* ── Seed check ── */
export async function seedIfNeeded() {
  const { Storage } = await import('./storage.js');
  if (Storage.get('seeded')) return;

  const files = ['users', 'posts', 'comments', 'fixtures', 'players', 'trophies', 'events'];
  const base  = findBase();

  await Promise.all(files.map(async f => {
    try {
      const res  = await fetch(`${base}/js/data/${f}.json`);
      const data = await res.json();
      Storage.set(f, data);
    } catch (e) {
      console.warn('[seed] Could not load', f, e);
    }
  }));
  Storage.set('seeded', true);
}

function findBase() {
  // Work out the root path regardless of which page we're on
  const depth = window.location.pathname.split('/').filter(Boolean).length;
  // If in /pages/ subdir, go up one level
  if (window.location.pathname.includes('/pages/')) return '..';
  return '.';
}
