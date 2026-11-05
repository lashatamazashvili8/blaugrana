import { Storage } from './storage.js';
import { updateNavUI } from './auth.js';
import { initTheme, toggleTheme } from './theme.js';
import { initNav, initModals, openModal, closeModal, seedIfNeeded } from './ui.js';

let activePosition = 'all';
let searchQuery = '';
let currentSort = 'number';

function renderSummary(players) {
  const box = document.getElementById('squad-summary');
  if (!box) return;

  const goals = players.reduce((sum, p) => sum + (p.stats?.goals || 0), 0);
  const assists = players.reduce((sum, p) => sum + (p.stats?.assists || 0), 0);
  const cleanSheets = players
    .filter(p => p.positionShort === 'GK')
    .reduce((sum, p) => sum + (p.stats?.cleanSheets || 0), 0);
  const scorers = players.filter(p => p.stats?.goals);
  const topScorer = scorers.sort((a, b) => (b.stats.goals || 0) - (a.stats.goals || 0))[0];

  const cards = [
    { label: 'Squad', value: String(players.length || '—'), detail: 'First team · 4-3-3' },
    { label: 'Season goals', value: String(goals), detail: topScorer ? `Top scorer: ${topScorer.name} (${topScorer.stats.goals})` : 'No goals recorded' },
    { label: 'Assists', value: String(assists), detail: 'Combined first-team assists' },
    { label: 'Clean sheets', value: String(cleanSheets), detail: 'Goalkeepers combined' }
  ];

  box.innerHTML = cards.map(card => `
    <article class="squad-summary__card">
      <span class="squad-summary__label">${card.label}</span>
      <span class="squad-summary__value">${card.value}</span>
      <span class="squad-summary__detail">${card.detail}</span>
    </article>
  `).join('');
}

function renderSquad() {
  const players = Storage.get('players') || [];
  renderSummary(players);
  const container = document.getElementById('squad-grid-container');
  const countAll = document.getElementById('count-all');
  if (countAll) countAll.textContent = players.length;
  if (!container) return;

  let filtered = players;

  if (activePosition !== 'all') {
    filtered = filtered.filter(p => p.position.toLowerCase() === activePosition.toLowerCase());
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      String(p.number).includes(q) ||
      p.nationality.toLowerCase().includes(q)
    );
  }

  filtered = [...filtered].sort((a, b) => {
    if (currentSort === 'number') return a.number - b.number;
    if (currentSort === 'rating') return (b.stats?.rating || 0) - (a.stats?.rating || 0);
    if (currentSort === 'name') return a.name.localeCompare(b.name);
    if (currentSort === 'appearances') return (b.stats?.appearances || 0) - (a.stats?.appearances || 0);
    return 0;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: var(--sp-12); background: var(--color-surface); border-radius: var(--radius-card); border: 1px solid var(--color-border);">
        <span style="font-size: 3rem; display: block; margin-bottom: var(--sp-2);">🔍</span>
        <h3 class="heading-2">No players found</h3>
        <p class="text-sm text-muted">No squad member matching "${searchQuery}".</p>
      </div>
    `;
    return;
  }

  const posBadgeColors = {
    Goalkeeper: 'navy',
    Defender: 'garnet',
    Midfielder: 'gold',
    Forward: 'navy'
  };

  container.innerHTML = filtered.map(player => {
    const isGK = player.positionShort === 'GK';
    const stats = player.stats || {};
    const ratingPct = Math.round(((stats.rating || 7.0) / 10) * 100);

    const quickStat1 = isGK ? (stats.cleanSheets || 0) : (stats.goals || 0);
    const quickStat1Label = isGK ? 'Clean Sh.' : 'Goals';
    const quickStat2 = isGK ? (stats.appearances || 0) : (stats.assists || 0);
    const quickStat2Label = isGK ? 'Matches' : 'Assists';

    return `
      <div class="player-card-wrap" id="wrap-player-${player.id}" role="listitem">
        <div class="player-card">
          
          <div class="player-card__front">
            <div class="player-card__top">
              <span class="player-card__badge-num">#${player.number}</span>
              <span class="badge badge--${posBadgeColors[player.position] || 'navy'} player-card__pos-tag">${player.positionShort}</span>
              <div class="player-card__portrait" aria-hidden="true">${player.emoji || '⚽'}</div>
            </div>

            <div class="player-card__body">
              <div>
                <h3 class="player-card__name">${player.name}</h3>
                <div class="player-card__sub">
                  <span>${player.position}</span>
                  <span>·</span>
                  <span>${player.nationality}</span>
                  <span>·</span>
                  <span>${player.age} yrs</span>
                </div>

                <div class="player-card__quick-stats">
                  <div class="quick-stat-box">
                    <span class="val">${stats.appearances || 0}</span>
                    <span class="lbl">Apps</span>
                  </div>
                  <div class="quick-stat-box">
                    <span class="val">${quickStat1}</span>
                    <span class="lbl">${quickStat1Label}</span>
                  </div>
                  <div class="quick-stat-box">
                    <span class="val" style="color:var(--color-garnet);">${stats.rating || 7.5}</span>
                    <span class="lbl">Rating</span>
                  </div>
                </div>
              </div>

              <div class="player-card__actions">
                <button type="button" class="btn btn--outline btn--sm" style="flex:1;" data-view-player="${player.id}">
                  Profile
                </button>
                <button type="button" class="btn btn--primary btn--sm" style="flex:1;" data-flip-player="${player.id}">
                  Stats ⟳
                </button>
              </div>
            </div>
          </div>

          
          <div class="player-card__back">
            <div class="player-card__back-header">
              <span class="player-card__back-title">#${player.number} ${player.name}</span>
              <span class="badge badge--outline">${player.positionShort}</span>
            </div>

            <div class="player-card__stats-list">
              <div class="player-stat-row">
                <span class="lbl">Nationality</span>
                <span class="val">${player.nationality}</span>
              </div>
              <div class="player-stat-row">
                <span class="lbl">Age</span>
                <span class="val">${player.age} years old</span>
              </div>
              <div class="player-stat-row">
                <span class="lbl">Season Appearances</span>
                <span class="val">${stats.appearances || 0}</span>
              </div>
              ${isGK ? `
                <div class="player-stat-row">
                  <span class="lbl">Clean Sheets</span>
                  <span class="val">${stats.cleanSheets || 0}</span>
                </div>
              ` : `
                <div class="player-stat-row">
                  <span class="lbl">Goals Scored</span>
                  <span class="val">${stats.goals || 0}</span>
                </div>
                <div class="player-stat-row">
                  <span class="lbl">Assists</span>
                  <span class="val">${stats.assists || 0}</span>
                </div>
              `}
              <div class="player-stat-row">
                <span class="lbl">Average Rating</span>
                <span class="val" style="color:var(--color-gold);">${stats.rating} / 10</span>
              </div>
            </div>

            <div>
              <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px;color:rgba(255,255,255,0.7);">
                <span>Performance Index</span>
                <span>${ratingPct}%</span>
              </div>
              <div style="height:6px;background:rgba(255,255,255,0.2);border-radius:3px;overflow:hidden;margin-bottom:var(--sp-4);">
                <div style="height:100%;width:${ratingPct}%;background:var(--color-gold);"></div>
              </div>

              <button type="button" class="btn btn--gold btn--sm btn--full" data-flip-player="${player.id}">
                ⟲ Back to Card
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('[data-flip-player]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const wrap = document.getElementById(`wrap-player-${btn.dataset.flipPlayer}`);
      if (wrap) wrap.classList.toggle('is-flipped');
    });
  });

  container.querySelectorAll('[data-view-player]').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = players.find(x => x.id === btn.dataset.viewPlayer);
      if (p) showPlayerModal(p);
    });
  });
}

function showPlayerModal(player) {
  const nameEl = document.getElementById('player-modal-name');
  const numEl = document.getElementById('player-modal-num');
  const bodyEl = document.getElementById('player-modal-body');
  if (!nameEl || !bodyEl) return;

  nameEl.textContent = player.name;
  numEl.textContent = `#${player.number}`;

  const isGK = player.positionShort === 'GK';
  const stats = player.stats || {};

  bodyEl.innerHTML = `
    <div style="display:flex;align-items:center;gap:var(--sp-5);margin-bottom:var(--sp-4);padding-bottom:var(--sp-4);border-bottom:1px solid var(--color-border);">
      <div style="font-size:4rem;background:var(--color-bg);width:80px;height:80px;border-radius:50%;display:flex;align-items:center;justify-content:center;">
        ${player.emoji || '⚽'}
      </div>
      <div>
        <h4 style="font-family:var(--font-display);font-size:var(--fs-xl);margin-bottom:2px;">${player.name}</h4>
        <p class="text-sm text-muted">${player.position} · ${player.nationality} · ${player.age} Years Old</p>
        <span class="badge badge--gold" style="margin-top:4px;">Squad #${player.number}</span>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:var(--sp-3);text-align:center;margin-bottom:var(--sp-4);">
      <div style="background:var(--color-bg);padding:var(--sp-3);border-radius:var(--radius-md);">
        <span style="font-family:var(--font-display);font-size:var(--fs-xl);font-weight:700;display:block;color:var(--color-navy);">${stats.appearances || 0}</span>
        <span class="text-xs text-muted">Appearances</span>
      </div>
      <div style="background:var(--color-bg);padding:var(--sp-3);border-radius:var(--radius-md);">
        <span style="font-family:var(--font-display);font-size:var(--fs-xl);font-weight:700;display:block;color:var(--color-garnet);">${isGK ? (stats.cleanSheets || 0) : (stats.goals || 0)}</span>
        <span class="text-xs text-muted">${isGK ? 'Clean Sheets' : 'Goals'}</span>
      </div>
      <div style="background:var(--color-bg);padding:var(--sp-3);border-radius:var(--radius-md);">
        <span style="font-family:var(--font-display);font-size:var(--fs-xl);font-weight:700;display:block;color:var(--color-gold);">${stats.rating || 7.5}</span>
        <span class="text-xs text-muted">Match Rating</span>
      </div>
    </div>

    <p class="text-sm" style="line-height:1.6;color:var(--color-text-muted);">
      ${player.name} is a key contributor for FC Barcelona under the high-tempo tactical setup this season. Dedicated to the Blaugrana philosophy of positional play, quick transitions, and passionate technical football.
    </p>
  `;

  openModal('player-modal');
}

function initSquadControls() {
  const searchInput = document.getElementById('squad-search-input');
  searchInput?.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderSquad();
  });

  const sortSelect = document.getElementById('squad-sort-select');
  sortSelect?.addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderSquad();
  });

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
  initModals();
  initSquadControls();
  renderSquad();
  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
}

init();
