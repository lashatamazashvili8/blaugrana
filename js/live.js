/**
 * live.js — Live and upcoming events listing with member-only lock state
 */
import { Storage } from './storage.js';
import { isMember, updateNavUI } from './auth.js';
import { initTheme, toggleTheme } from './theme.js';
import { initNav, formatDate, seedIfNeeded } from './ui.js';

let activeFilter = 'all';

function renderEvents() {
  const events = Storage.get('events') || [];
  const container = document.getElementById('events-grid-container');
  if (!container) return;

  const userIsMember = isMember();

  let filtered = events;
  if (activeFilter === 'match') {
    filtered = events.filter(e => e.type === 'match');
  } else if (activeFilter === 'podcast') {
    filtered = events.filter(e => e.type === 'podcast');
  } else if (activeFilter === 'members') {
    filtered = events.filter(e => e.memberOnly);
  }

  container.innerHTML = filtered.map(ev => {
    const isLocked = ev.memberOnly && !userIsMember;
    const lockOverlay = isLocked ? `
      <div class="lock-overlay" aria-label="Members-only event">
        <span class="lock-overlay__icon" aria-hidden="true">🔒</span>
        <h4 class="lock-overlay__title">Members Only</h4>
        <p class="text-xs" style="color:rgba(255,255,255,0.85);margin-bottom:var(--sp-2);">Upgrade to access exclusive watch parties &amp; live podcasts.</p>
        <a href="membership.html" class="btn btn--gold btn--sm">Unlock Access</a>
      </div>` : '';

    const actionBtn = ev.type === 'match'
      ? `<a href="match-room.html" class="btn btn--primary btn--sm" style="flex:1;">Enter Match Room</a>`
      : `<button type="button" class="btn btn--outline btn--sm" style="flex:1;" onclick="alert('Simulated stream starting shortly! Please enjoy the match room.')">Join Stream</button>`;

    return `
      <article class="event-card event-card--type-${ev.type}" role="listitem">
        ${lockOverlay}
        <div class="event-card__banner">
          <span>${ev.type.toUpperCase()}</span>
          ${ev.memberOnly ? '<span class="badge badge--gold event-card__lock">⭐ Members</span>' : ''}
        </div>
        <div class="event-card__body">
          <span class="event-card__type">📡 ${ev.type}</span>
          <h3 class="event-card__title">${ev.title}</h3>
          <p class="card__excerpt">${ev.description}</p>
          <div class="event-card__detail">
            <span>📅 ${formatDate(ev.date)}</span>
            <span>·</span>
            <span>👥 ${ev.attendees} attending</span>
          </div>
        </div>
        <div class="event-card__footer">
          ${actionBtn}
        </div>
      </article>`;
  }).join('');
}

function initEventFilters() {
  document.querySelectorAll('[data-event-filter]').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('[data-event-filter]').forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      activeFilter = chip.dataset.eventFilter || 'all';
      renderEvents();
    });
  });
}

async function init() {
  initTheme();
  await seedIfNeeded();
  initNav();
  updateNavUI();
  initEventFilters();
  renderEvents();
  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
}

init();
