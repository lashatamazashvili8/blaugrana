/**
 * squad.js — Squad explorer: 3D interactive flip cards with performance statistics
 */
import { Storage } from './storage.js';
import { updateNavUI } from './auth.js';
import { initTheme, toggleTheme } from './theme.js';
import { initNav, seedIfNeeded } from './ui.js';

let activePosition = 'all';

function renderSquad() {
  const players = Storage.get('players') || [];
  const container = document.getElementById('squad-grid-container');
  if (!container) return;

  const filtered = activePosition === 'all'
    ? players
    : players.filter(p => p.position.toLowerCase() === activePosition.toLowerCase());

  container.innerHTML = filtered.map(player => {
    const isGK = player.positionShort === 'GK';
    const stats = player.stats || {};

    const specificStatHTML = isGK
      ? `<div class="player-stat"><span class="player-stat__label">Clean Sheets</span><span class="player-stat__value">${stats.cleanSheets || 0}</span></div>`
      : `<div class="player-stat"><span class="player-stat__label">Goals</span><span class="player-stat__value">${stats.goals || 0}</span></div>
         <div class="player-stat"><span class="player-stat__label">Assists</span><span class="player-stat__value">${stats.assists || 0}</span></div>`;

    const ratingPct = Math.round(((stats.rating || 7.0) / 10) * 100);

    return `
      <div class="player-card-wrap is-visible" tabindex="0" role="listitem" aria-label="${player.name}, #${player.number}, ${player.position}. Press Enter to flip card.">
        <div class="player-card">
          <!-- Card Front -->
          <div class="player-card__front">
            <div class="player-card__portrait" aria-hidden="true">${player.emoji || '⚽'}</div>
            <div class="player-card__info">
              <span class="player-card__num">#${player.number}</span>
              <h3 class="player-card__name">${player.name}</h3>
              <p class="player-card__pos">${player.position} · ${player.nationality}</p>
            </div>
          </div>

          <!-- Card Back -->
          <div class="player-card__back">
            <h3 class="player-card__back-name">#${player.number} ${player.name}</h3>
            <div class="player-stat">
              <span class="player-stat__label">Age</span>
              <span class="player-stat__value">${player.age} yrs</span>
            </div>
            <div class="player-stat">
              <span class="player-stat__label">Apps</span>
              <span class="player-stat__value">${stats.appearances || 0}</span>
            </div>
            ${specificStatHTML}
            <div class="player-stat" style="margin-top:auto;">
              <span class="player-stat__label">Rating</span>
              <div class="player-stat__bar" aria-hidden="true">
                <div class="player-stat__fill" style="width: ${ratingPct}%;"></div>
              </div>
              <span class="player-stat__value" style="color:var(--color-gold);">${stats.rating}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Keyboard flip support (Enter or Space) and click toggle for touch devices
  container.querySelectorAll('.player-card-wrap').forEach(wrap => {
    wrap.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        wrap.classList.toggle('is-flipped');
      }
    });
    wrap.addEventListener('click', () => {
      wrap.classList.toggle('is-flipped');
    });
  });
}

function initPositionFilters() {
  document.querySelectorAll('[data-pos-filter]').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('[data-pos-filter]').forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      activePosition = chip.dataset.posFilter || 'all';
      renderSquad();
    });
  });
}

async function init() {
  initTheme();
  await seedIfNeeded();
  initNav();
  updateNavUI();
  initPositionFilters();
  renderSquad();
  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
}

init();
