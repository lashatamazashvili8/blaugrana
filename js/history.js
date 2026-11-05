/**
 * history.js — Historical timeline, filters, and trophy cabinet cards
 */
import { Storage } from './storage.js';
import { updateNavUI } from './auth.js';
import { initTheme, toggleTheme } from './theme.js';
import { initNav, initCountUp, seedIfNeeded } from './ui.js';

const TIMELINE_DATA = [
  {
    year: '1899',
    category: 'era',
    title: 'Foundation by Joan Gamper',
    desc: 'On 29 November 1899, Swiss sportsman Hans (Joan) Gamper and eleven other enthusiasts founded Futbol Club Barcelona, choosing the iconic Blaugrana colors.',
    tags: ['Founding', 'Les Corts', 'Origins']
  },
  {
    year: '1929',
    category: 'trophy',
    title: 'First Ever La Liga Champions',
    desc: 'Barça became the inaugural champions of the newly formed Spanish Primera División (La Liga), setting the standard for Spanish football.',
    tags: ['La Liga', 'Inaugural Title']
  },
  {
    year: '1957',
    category: 'era',
    title: 'Inauguration of Camp Nou',
    desc: 'Camp Nou opened its gates on 24 September 1957. With a capacity exceeding 90,000, it became an architectural marvel and fortress for generations of Culers.',
    tags: ['Camp Nou', 'Stadium', 'Cathedral of Football']
  },
  {
    year: '1973',
    category: 'legend',
    title: 'The Johan Cruyff Revolution',
    desc: 'Johan Cruyff joined as a player, delivering the legendary 1973–74 title and laying the tactical and cultural philosophy of Total Football at the club.',
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
    desc: 'Ronaldinho’s arrival brought pure joy, breathtaking smiles, and returned European dominance, paving the pathway for Lionel Messi’s debut.',
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
    tags: ['Lamine Yamal', 'La Masia', 'Future']
  }
];

let activeFilter = 'all';

function renderTrophies() {
  const trophies = Storage.get('trophies') || [];
  const container = document.getElementById('trophy-cabinet-container');
  if (!container) return;

  container.innerHTML = trophies.map(t => `
    <article class="trophy-card" role="listitem">
      <span class="trophy-card__icon" aria-hidden="true">${t.emoji}</span>
      <span class="trophy-card__count" data-count="${t.count}">0</span>
      <h3 class="trophy-card__name">${t.name}</h3>
      <p class="trophy-card__first">First won in ${t.firstWon}</p>
    </article>
  `).join('');

  initCountUp('.trophy-card__count');
}

function renderTimeline() {
  const container = document.getElementById('timeline-container');
  if (!container) return;

  const filtered = activeFilter === 'all'
    ? TIMELINE_DATA
    : TIMELINE_DATA.filter(item => item.category === activeFilter);

  container.innerHTML = filtered.map(item => `
    <article class="timeline-entry is-visible timeline-entry--${item.category}" role="article">
      <div class="timeline-entry__year">${item.year}</div>
      <div class="timeline-entry__dot" aria-hidden="true"></div>
      <div class="timeline-entry__card">
        <span class="timeline-entry__era">${item.year} · ${item.category.toUpperCase()}</span>
        <h3 class="timeline-entry__title">${item.title}</h3>
        <p class="timeline-entry__desc">${item.desc}</p>
        <div class="timeline-entry__tags">
          ${item.tags.map(tag => `<span class="badge badge--outline">${tag}</span>`).join('')}
        </div>
      </div>
    </article>
  `).join('');
}

function initTimelineFilters() {
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
  renderTrophies();
  initTimelineFilters();
  renderTimeline();
  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
}

init();
