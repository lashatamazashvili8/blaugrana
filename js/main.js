/**
 * main.js — Home page: seed data, countdown, fixtures slider, trophy strip, posts preview
 */
import { Storage } from './storage.js';
import { initTheme, toggleTheme } from './theme.js';
import { initNav, initCountUp, initLazyImages, formatDate, formatRelative, showToast, seedIfNeeded } from './ui.js';
import { updateNavUI } from './auth.js';

/* ── Countdown ── */
function startCountdown(targetDate) {
  const days  = document.getElementById('cd-days');
  const hours = document.getElementById('cd-hours');
  const mins  = document.getElementById('cd-mins');
  const secs  = document.getElementById('cd-secs');
  if (!days) return;

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const diff = new Date(targetDate).getTime() - Date.now();
    if (diff <= 0) {
      days.textContent = hours.textContent = mins.textContent = secs.textContent = '00';
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000)  / 60000);
    const s = Math.floor((diff % 60000)    / 1000);
    days.textContent  = pad(d);
    hours.textContent = pad(h);
    mins.textContent  = pad(m);
    secs.textContent  = pad(s);
  }
  tick();
  setInterval(tick, 1000);
}

/* ── Fixtures Slider ── */
function buildFixtureCard(fixture) {
  const isPast = fixture.status === 'result';
  const isHome = fixture.homeTeam.toLowerCase().includes('barcelona');

  const homeInitial = fixture.homeTeam.split(' ').map(w=>w[0]).join('').slice(0,3);
  const awayInitial = fixture.awayTeam.split(' ').map(w=>w[0]).join('').slice(0,3);

  const homeColor = isHome ? '#004D98' : '#888';
  const awayColor = !isHome ? '#004D98' : '#888';

  const scoreHTML = isPast
    ? `<div class="fixture-score">${fixture.homeScore} – ${fixture.awayScore}</div>`
    : `<div class="fixture-score fixture-score--upcoming">${new Date(fixture.date).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}<br>${new Date(fixture.date).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}</div>`;

  return `
    <article class="fixture-card${isPast ? ' fixture-card--past' : ''}" role="listitem">
      <div class="fixture-card__comp">
        <span class="badge badge--outline">${fixture.competition}</span>
      </div>
      <div class="fixture-card__teams">
        <div class="fixture-team">
          <div class="fixture-team__emblem" style="background:${homeColor}20;border:2px solid ${homeColor};">
            <span style="color:${homeColor};font-weight:700;font-size:0.65rem;">${homeInitial}</span>
          </div>
          <span class="fixture-team__name">${fixture.homeTeam}</span>
        </div>
        ${scoreHTML}
        <div class="fixture-team">
          <div class="fixture-team__emblem" style="background:${awayColor}20;border:2px solid ${awayColor};">
            <span style="color:${awayColor};font-weight:700;font-size:0.65rem;">${awayInitial}</span>
          </div>
          <span class="fixture-team__name">${fixture.awayTeam}</span>
        </div>
      </div>
      <div class="fixture-card__date">${fixture.venue}</div>
    </article>`;
}

const DEFAULT_NEXT_MATCH = {
  homeTeam: "FC Barcelona",
  awayTeam: "Real Madrid",
  competition: "La Liga EA Sports",
  date: "2026-11-29T21:00:00Z",
  venue: "Spotify Camp Nou, Barcelona",
  status: "upcoming"
};

const FALLBACK_FIXTURES = [
  DEFAULT_NEXT_MATCH,
  {
    homeTeam: "FC Barcelona",
    awayTeam: "Bayern Munich",
    competition: "UEFA Champions League",
    date: "2026-11-23T21:00:00Z",
    venue: "Spotify Camp Nou, Barcelona",
    status: "upcoming"
  },
  {
    homeTeam: "Atletico Madrid",
    awayTeam: "FC Barcelona",
    homeScore: 1,
    awayScore: 2,
    competition: "La Liga EA Sports",
    date: "2026-11-02T18:30:00Z",
    venue: "Metropolitano, Madrid",
    status: "result"
  },
  {
    homeTeam: "FC Barcelona",
    awayTeam: "Borussia Dortmund",
    homeScore: 3,
    awayScore: 1,
    competition: "UEFA Champions League",
    date: "2026-10-22T21:00:00Z",
    venue: "Spotify Camp Nou, Barcelona",
    status: "result"
  }
];

function initFixturesSlider() {
  let fixtures = Storage.get('fixtures');
  if (!fixtures || !Array.isArray(fixtures) || fixtures.length === 0) {
    fixtures = FALLBACK_FIXTURES;
    Storage.set('fixtures', fixtures);
  }
  const track    = document.getElementById('fixtures-track');
  const dotsEl   = document.getElementById('slider-dots');
  const prevBtn  = document.getElementById('slider-prev');
  const nextBtn  = document.getElementById('slider-next');
  if (!track) return;

  track.innerHTML = fixtures.map(buildFixtureCard).join('');

  // Responsive items per view
  function itemsPerView() { return window.innerWidth >= 768 ? (window.innerWidth >= 1024 ? 3 : 2) : 1; }
  let current = 0;
  const total  = fixtures.length;

  function numDots() { return Math.ceil(total / itemsPerView()); }

  function buildDots() {
    if (!dotsEl) return;
    dotsEl.innerHTML = '';
    for (let i = 0; i < numDots(); i++) {
      const dot = document.createElement('button');
      dot.className = `slider-dot${i === current ? ' is-active' : ''}`;
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.setAttribute('aria-selected', String(i === current));
      dot.addEventListener('click', () => goTo(i));
      dotsEl.appendChild(dot);
    }
  }

  function goTo(idx) {
    const max = numDots() - 1;
    current = Math.max(0, Math.min(idx, max));
    const cardW = track.querySelector('.fixture-card')?.offsetWidth || 280;
    const gap = 16;
    track.style.transform = `translateX(-${current * (cardW + gap) * itemsPerView()}px)`;
    // Update dots
    dotsEl?.querySelectorAll('.slider-dot').forEach((d, i) => {
      d.classList.toggle('is-active', i === current);
      d.setAttribute('aria-selected', String(i === current));
    });
    if (prevBtn) prevBtn.disabled = current === 0;
    if (nextBtn) nextBtn.disabled = current >= numDots() - 1;
  }

  prevBtn?.addEventListener('click', () => goTo(current - 1));
  nextBtn?.addEventListener('click', () => goTo(current + 1));

  // Touch support
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1);
  });

  buildDots();
  goTo(0);

  // Rebuild on resize (debounced)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { buildDots(); goTo(0); }, 200);
  });
}

/* ── Trophy Strip ── */
function initTrophyStrip() {
  const trophies = Storage.get('trophies') || [];
  const strip    = document.getElementById('trophy-strip');
  if (!strip) return;

  strip.innerHTML = trophies.map(t => `
    <div class="trophy-item" role="listitem">
      <span class="trophy-item__icon" aria-hidden="true">${t.emoji}</span>
      <span class="trophy-item__count" data-count="${t.count}" aria-label="${t.count} ${t.name} trophies">0</span>
      <span class="trophy-item__name">${t.name}</span>
    </div>`).join('');

  initCountUp('[data-count]');
}

/* ── Posts Preview ── */
function initPostsPreview() {
  const posts = (Storage.get('posts') || []).slice(0, 3);
  const container = document.getElementById('posts-preview');
  if (!container) return;

  if (!posts.length) {
    container.innerHTML = '<p class="text-muted text-sm">No posts yet. Be the first!</p>';
    return;
  }

  const tagColors = { Match: 'navy', Transfers: 'garnet', History: 'gold', Memes: 'outline', Top: 'outline', Latest: 'outline' };

  container.innerHTML = posts.map(p => `
    <article class="card card--link" role="listitem" tabindex="0" aria-label="Post by ${p.username}">
      <div class="card__body">
        <div class="card__meta">
          <span class="badge badge--${tagColors[p.tag] || 'outline'}">${p.tag}</span>
          <span class="text-xs text-muted">${formatRelative(p.timestamp)}</span>
        </div>
        <p class="card__excerpt" style="-webkit-line-clamp:3;display:-webkit-box;-webkit-box-orient:vertical;overflow:hidden;">
          ${p.content}
        </p>
      </div>
      <div class="card__footer">
        <div style="display:flex;align-items:center;gap:var(--sp-2)">
          <div class="avatar" style="width:28px;height:28px;font-size:0.65rem;" aria-hidden="true">${p.username.slice(0,2).toUpperCase()}</div>
          <span class="text-sm font-medium">@${p.username}</span>
        </div>
        <span class="text-xs text-muted">❤️ ${p.likes?.length || 0} likes</span>
      </div>
    </article>`).join('');

  // Make cards keyboard-activatable
  container.querySelectorAll('.card--link').forEach(card => {
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        window.location.href = 'pages/feed.html';
      }
    });
  });
}

/* ── Next match hero info ── */
function initHeroMatch() {
  const fixtures = Storage.get('fixtures') || [];
  const next = fixtures.find(f => f.status === 'upcoming') || DEFAULT_NEXT_MATCH;

  const homeEl  = document.getElementById('hero-home');
  const awayEl  = document.getElementById('hero-away');
  const infoEl  = document.getElementById('hero-match-info');

  if (homeEl)  homeEl.textContent  = next.homeTeam;
  if (awayEl)  awayEl.textContent  = next.awayTeam;
  if (infoEl)  infoEl.textContent  = `${formatDate(next.date)} · ${next.competition} · ${next.venue}`;

  startCountdown(next.date);
}

/* ── Boot ── */
async function init() {
  initTheme();
  await seedIfNeeded();
  updateNavUI();
  initNav();
  initHeroMatch();
  initFixturesSlider();
  initTrophyStrip();
  initPostsPreview();
  initLazyImages();

  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
}

init();
