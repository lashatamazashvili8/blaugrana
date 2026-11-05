import { Storage } from './storage.js';
import { updateNavUI } from './auth.js';
import { initTheme, toggleTheme } from './theme.js';
import { initNav, initModals, openModal, closeModal, initCountUp, seedIfNeeded } from './ui.js';

const TIMELINE_DATA = [
  {
    year: '1899',
    category: 'era',
    title: 'Foundation by Joan Gamper',
    desc: 'On 29 November 1899, Swiss sportsman Hans (Joan) Gamper and eleven other enthusiasts founded Futbol Club Barcelona, choosing the iconic Blaugrana colors.',
    tags: ['Founding', 'Origins', 'Joan Gamper']
  },
  {
    year: '1929',
    category: 'trophy',
    title: 'First Ever La Liga Champions',
    desc: 'Barça became the inaugural champions of the newly formed Spanish Primera División (La Liga), establishing the club at the pinnacle of national football.',
    tags: ['La Liga', 'Inaugural Title']
  },
  {
    year: '1957',
    category: 'era',
    title: 'Inauguration of Camp Nou',
    desc: 'Camp Nou opened on 24 September 1957. With an initial capacity exceeding 90,000, it became the grand cathedral and fortress for generations of Culers.',
    tags: ['Camp Nou', 'Fortress', 'Cathedral']
  },
  {
    year: '1973',
    category: 'legend',
    title: 'The Johan Cruyff Revolution',
    desc: 'Johan Cruyff arrived as a player, delivering the legendary 1973–74 title and laying down the tactical and cultural philosophy of Total Football at the club.',
    tags: ['Cruyff', 'Total Football', 'Revolution']
  },
  {
    year: '1988',
    category: 'era',
    title: 'The Dream Team Era',
    desc: 'Cruyff returned as manager to build the fabled "Dream Team" alongside Stoichkov, Koeman, Laudrup, and a young Pep Guardiola.',
    tags: ['Dream Team', 'Philosophy', 'La Masia']
  },
  {
    year: '1992',
    category: 'trophy',
    title: 'First European Cup at Wembley',
    desc: 'Ronald Koeman’s iconic 112th-minute free kick against Sampdoria won Barcelona their first European Cup on sacred Wembley turf.',
    tags: ['Wembley 92', 'Champions League', 'Koeman']
  },
  {
    year: '2004',
    category: 'legend',
    title: 'Ronaldinho & the Modern Spark',
    desc: 'Ronaldinho brought pure joy, breathtaking smiles, and returned European dominance, paving the pathway for Lionel Messi’s debut.',
    tags: ['Ronaldinho', 'Magic', 'Ballon d\'Or']
  },
  {
    year: '2009',
    category: 'trophy',
    title: 'The Unprecedented Sextuple',
    desc: 'Under Pep Guardiola, Barça achieved what no club had ever done before: winning all 6 trophies in a single calendar year (La Liga, Copa, Champions League, Supercopa, UEFA Super Cup, Club World Cup).',
    tags: ['Sextuple', 'Guardiola', 'Tiki-Taka', 'Messi']
  },
  {
    year: '2015',
    category: 'trophy',
    title: 'The Second Historic Treble',
    desc: 'The unstoppable MSN trident (Messi, Suárez, Neymar) conquered Europe, completing Barcelona’s second continental treble in Berlin.',
    tags: ['Treble', 'MSN', 'Berlin 2015']
  },
  {
    year: '2024+',
    category: 'era',
    title: 'The Next Generation: La Masia Renaissance',
    desc: 'A breathtaking new generation led by Lamine Yamal, Pau Cubarsí, Gavi, and Pedri heralds an inspiring new era for the renovated Spotify Camp Nou.',
    tags: ['Lamine Yamal', 'La Masia', 'Spotify Camp Nou']
  }
];

let activeFilter = 'all';
let searchQuery = '';

function renderTrophies() {
  const trophies = Storage.get('trophies') || [];
  const container = document.getElementById('trophy-cabinet-container');
  if (!container) return;

  container.innerHTML = trophies.map(t => `
    <article class="trophy-card" role="listitem" data-trophy-id="${t.id}" title="Click to view details for ${t.name}">
      <span class="trophy-card__icon" aria-hidden="true">${t.emoji}</span>
      <span class="trophy-card__count" data-count="${t.count}">${t.count}</span>
      <h3 class="trophy-card__name">${t.name}</h3>
      <p class="trophy-card__first">Since ${t.firstWon}</p>
    </article>
  `).join('');

  container.querySelectorAll('[data-trophy-id]').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.trophyId;
      const t = trophies.find(x => x.id === id);
      if (t) showTrophyModal(t);
    });
  });

  initCountUp('.trophy-card__count');
}

function showTrophyModal(trophy) {
  const title = document.getElementById('trophy-modal-title');
  const body = document.getElementById('trophy-modal-body');
  if (!title || !body) return;

  title.textContent = `${trophy.emoji} ${trophy.name}`;

  body.innerHTML = `
    <div style="text-align:center;padding:var(--sp-4);background:var(--color-bg);border-radius:var(--radius-md);margin-bottom:var(--sp-4);">
      <span style="font-size:4rem;display:block;">${trophy.emoji}</span>
      <span style="font-family:var(--font-display);font-size:3rem;font-weight:700;color:var(--color-gold);display:block;line-height:1;">
        ${trophy.count} Titles Won
      </span>
      <span class="badge badge--navy" style="margin-top:var(--sp-2);">${trophy.category.toUpperCase()} COMPETITION</span>
    </div>

    <div style="display:flex;flex-direction:column;gap:var(--sp-2);font-size:var(--fs-sm);">
      <p><strong>First Title:</strong> ${trophy.firstWon}</p>
      <p><strong>Status:</strong> FC Barcelona is among the most decorated clubs in world football history in this competition.</p>
      <p class="text-xs text-muted" style="line-height:1.6;margin-top:var(--sp-2);">
        Each trophy represents the collective triumph of Blaugrana generations from Les Corts to Camp Nou, defined by our distinctive identity and commitment to attacking football.
      </p>
    </div>
  `;

  openModal('trophy-modal');
}

function renderTimeline() {
  const container = document.getElementById('timeline-container');
  const countEl = document.getElementById('milestone-count');
  if (!container) return;

  let filtered = activeFilter === 'all'
    ? TIMELINE_DATA
    : TIMELINE_DATA.filter(item => item.category === activeFilter);

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(item =>
      item.title.toLowerCase().includes(q) ||
      item.desc.toLowerCase().includes(q) ||
      item.year.includes(q) ||
      item.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  if (countEl) countEl.textContent = filtered.length;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="padding:var(--sp-8);text-align:center;background:var(--color-surface);border-radius:var(--radius-card);border:1px solid var(--color-border);">
        <p class="text-muted">No historical milestones found for "${searchQuery}".</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(item => `
    <article class="timeline-entry timeline-entry--${item.category}" role="article">
      <span class="timeline-entry__year-badge">${item.year}</span>
      <div class="timeline-entry__dot" aria-hidden="true"></div>
      <div class="timeline-entry__card">
        <span class="badge badge--outline" style="margin-bottom:var(--sp-2);">${item.category.toUpperCase()}</span>
        <h3 class="timeline-entry__title">${item.title}</h3>
        <p class="timeline-entry__desc">${item.desc}</p>
        <div class="timeline-entry__tags">
          ${item.tags.map(tag => `<span class="badge badge--outline">${tag}</span>`).join('')}
        </div>
      </div>
    </article>
  `).join('');
}

function initTimelineControls() {
  const searchInput = document.getElementById('history-search-input');
  searchInput?.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderTimeline();
  });

  document.querySelectorAll('[data-timeline-filter]').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('[data-timeline-filter]').forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      activeFilter = chip.dataset.timelineFilter || 'all';
      renderTimeline();
    });
  });
}

async function init() {
  initTheme();
  await seedIfNeeded();
  initNav();
  updateNavUI();
  initModals();
  renderTrophies();
  initTimelineControls();
  renderTimeline();
  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
}

init();
