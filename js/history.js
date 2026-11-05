import { Storage } from './storage.js';
import { updateNavUI } from './auth.js';
import { initTheme, toggleTheme } from './theme.js';
import { initNav, initModals, openModal, closeModal, initCountUp, seedIfNeeded } from './ui.js';

const TIMELINE_DATA = [
  {
    year: '1899',
    category: 'era',
    title: 'Foundation by Joan Gamper',
    desc: 'On 29 November 1899, Swiss sportsman Hans (Joan) Gamper and eleven international enthusiasts gathered at Gimnasio Solé to found Futbol Club Barcelona. They adopted the historic Blaugrana blue and deep red colors and the city crest.',
    tags: ['Founding', 'Origins', 'Joan Gamper', 'Gimnasio Solé']
  },
  {
    year: '1910',
    category: 'trophy',
    title: 'First Copa del Rey Triumph',
    desc: 'Barça claimed their first national Spanish Cup (Copa del Rey) in Madrid, coming back to win 3-2 against Español de Madrid. This marked the start of Barça becoming the "King of Cups" (31 titles).',
    tags: ['Copa del Rey', 'First National Silverware', 'Madrid']
  },
  {
    year: '1922',
    category: 'era',
    title: 'Inauguration of Camp de Les Corts',
    desc: 'Affectionately known as "The Cathedral of Football", Les Corts was constructed with an initial capacity of 22,000, later expanded to 60,000 to house the roaring masses following Paulino Alcántara and Josep Samitier.',
    tags: ['Les Corts', 'Cathedral of Football', 'Samitier']
  },
  {
    year: '1929',
    category: 'trophy',
    title: 'Inaugural La Liga Champions',
    desc: 'Barcelona won the inaugural season of the newly founded Primera División (La Liga), finishing two points ahead of Real Madrid after a heroic campaign managed by James Bellamy.',
    tags: ['La Liga', 'Inaugural Champion', 'League History']
  },
  {
    year: '1950',
    category: 'legend',
    title: 'The Arrival of László Kubala & "Les Cinc Copes"',
    desc: 'Hungarian genius László Kubala arrived in Barcelona, dazzling fans with unprecedented dribbling, swerved free kicks, and penalties. Between 1951 and 1953, the team won all five available trophies in a single season ("The 5 Cups").',
    tags: ['Kubala', 'Les Cinc Copes', 'Golden Decade']
  },
  {
    year: '1957',
    category: 'era',
    title: 'Inauguration of Spotify Camp Nou',
    desc: 'Because Les Corts could no longer contain the crowds coming to see Kubala, Camp Nou was built and opened on 24 September 1957. Over 90,000 Culers witnessed the opening victory over Legia Warsaw.',
    tags: ['Camp Nou', 'Fortress', 'Sanctuary', 'Architecture']
  },
  {
    year: '1973',
    category: 'legend',
    title: 'Johan Cruyff & Total Football Revolution',
    desc: 'Cruyff signed from Ajax and transformed the club forever. He led Barça to their first league title in 14 years, punctuated by the unforgettable 0-5 demolition of Real Madrid at the Santiago Bernabéu on 17 February 1974.',
    tags: ['Cruyff', 'Total Football', 'Bernabeu 0-5', 'Philosophy']
  },
  {
    year: '1979',
    category: 'trophy',
    title: 'The Basel Invasion & European Cup Winners\' Cup',
    desc: 'Over 30,000 Barcelona fans traveled across Europe to Basel, Switzerland, creating an ocean of Blaugrana flags as Barça defeated Fortuna Düsseldorf 4-3 in extra time.',
    tags: ['Basel 79', 'European Cup Winners Cup', 'Traveling Fans']
  },
  {
    year: '1979',
    category: 'era',
    title: 'The Inception of La Masia',
    desc: 'At Cruyff’s recommendation, club president Josep Lluís Núñez transformed the 18th-century farmhouse adjacent to Camp Nou into the youth football academy that would produce Messi, Xavi, Iniesta, Puyol, and Lamine Yamal.',
    tags: ['La Masia', 'Youth Academy', 'Heritage', 'Identity']
  },
  {
    year: '1988',
    category: 'era',
    title: 'The Dream Team Is Born',
    desc: 'Cruyff returned as head coach and assembled the immortal Dream Team: Zubizarreta, Koeman, Guardiola, Bakero, Laudrup, Stoichkov, and later Romário, playing an intoxicating brand of 3-4-3 possession football.',
    tags: ['Dream Team', 'Guardiola', 'Cruyff Manager', 'Tiki-Taka Genesis']
  },
  {
    year: '1992',
    category: 'trophy',
    title: 'First European Cup at Wembley',
    desc: 'On 20 May 1992 at Wembley Stadium, Ronald Koeman smashed a 112th-minute free-kick missile past Sampdoria’s Gianluca Pagliuca. "Salid y disfrutad" (Go out and enjoy it) became the club motto.',
    tags: ['Wembley 92', 'European Cup', 'Koeman', 'First Champions League']
  },
  {
    year: '1996',
    category: 'legend',
    title: 'Ronaldo Nazário\'s Wonder Season',
    desc: 'In just a single season under Bobby Robson, 20-year-old Brazilian phenomenon Ronaldo scored 47 goals in 49 matches, including the miraculous solo goal against Compostela where he beat half the opposing team.',
    tags: ['Ronaldo O Fenomeno', 'Compostela', 'Cup Winners Cup']
  },
  {
    year: '2004',
    category: 'legend',
    title: 'Ronaldinho Magic & Frank Rijkaard Revival',
    desc: 'Ronaldinho arrived with his contagious smile and unplayable flair, earning a standing ovation from the Santiago Bernabéu after scoring two solo goals in a 0-3 victory and restoring European swagger to the club.',
    tags: ['Ronaldinho', 'Bernabeu Ovation', 'Ballon d\'Or', 'Joga Bonito']
  },
  {
    year: '2006',
    category: 'trophy',
    title: 'Paris 2006: Second Champions League',
    desc: 'In a rain-drenched Stade de France, Barça came from behind with goals from Samuel Eto\'o and substitute Juliano Belletti to defeat Arsenal 2-1 and lift their second Champions League trophy.',
    tags: ['Paris 2006', 'Champions League', 'Belletti', 'Etoo']
  },
  {
    year: '2008',
    category: 'era',
    title: 'The Pep Guardiola Masterpiece Begins',
    desc: 'Promoting youth coach Pep Guardiola to the senior dugout unleashed the greatest club side in football history, centered around Lionel Messi, Xavi Hernández, Andrés Iniesta, and Sergio Busquets.',
    tags: ['Guardiola', 'Tiki-Taka', 'La Masia Core', 'Dominance']
  },
  {
    year: '2009',
    category: 'trophy',
    title: 'The Historic Sextuple (6 Trophies in 1 Year)',
    desc: 'Barcelona achieved the absolute impossible: winning La Liga, Copa del Rey, Champions League, Supercopa de España, UEFA Super Cup, and FIFA Club World Cup — winning all six out of six available competitions.',
    tags: ['Sextuple', 'World Record', 'Rome 2009', 'Messi Chest Goal']
  },
  {
    year: '2011',
    category: 'trophy',
    title: 'Wembley Masterclass vs Manchester United',
    desc: 'Widely praised by Sir Alex Ferguson as the best team he ever faced, Barça dismantled Manchester United 3-1 at Wembley with goals from Pedro, Messi, and David Villa, accompanied by Eric Abidal lifting the trophy.',
    tags: ['Wembley 2011', 'Masterclass', 'MVP Trident', 'Abidal']
  },
  {
    year: '2015',
    category: 'trophy',
    title: 'Berlin Treble with the MSN Trident',
    desc: 'The deadliest attacking triumvirate in football history — Lionel Messi, Luis Suárez, and Neymar Jr (122 goals combined) — conquered Juventus 3-1 in Berlin, making Barça the first European club to win two continental trebles.',
    tags: ['Treble 2015', 'MSN', 'Berlin', '122 Goals']
  },
  {
    year: '2021',
    category: 'legend',
    title: 'Lionel Messi\'s Unrivalled Legacy',
    desc: 'Messi concluded his first-team career with 672 goals in 778 matches, 35 major club trophies, 8 Ballon d\'Or titles, and 6 European Golden Shoes, forever cementing his status as the undisputed greatest of all time.',
    tags: ['Messi', 'GOAT', '672 Goals', '35 Trophies', 'Records']
  },
  {
    year: '2023',
    category: 'trophy',
    title: 'Xavi Wins La Liga with Historic Defense',
    desc: 'Manager Xavi Hernández restored domestic championship glory to Camp Nou, conceding just 20 goals all season with Marc-André ter Stegen recording a record 26 clean sheets.',
    tags: ['La Liga 2023', 'Xavi', 'Ter Stegen', 'Defense Record']
  },
  {
    year: '2024+',
    category: 'era',
    title: 'La Masia Golden Generation & The New Spotify Camp Nou',
    desc: 'A dazzling new wave of teenage prodigies led by Lamine Yamal (Euro 2024 champion at 17), Pau Cubarsí, Pedri, and Gavi leads the Blaugrana into the state-of-the-art renovated Spotify Camp Nou.',
    tags: ['Lamine Yamal', 'Pau Cubarsi', 'Spotify Camp Nou', 'Future']
  }
];

const CLUB_RECORDS = [
  { label: 'All-Time Appearances', value: '778', detail: 'Lionel Messi (2004–2021)' },
  { label: 'All-Time Top Scorer', value: '672', detail: 'Lionel Messi (0.86 goals/game)' },
  { label: 'Most Trophies Won by Player', value: '35', detail: 'Lionel Messi (10x La Liga, 4x UCL)' },
  { label: 'Ballon d\'Or Victories', value: '12', detail: 'Messi (8x), Cruyff (2x), Ronaldinho, Rivaldo, Stoichkov, Suárez' },
  { label: 'Longest Winning Run in La Liga', value: '16', detail: 'Matches won in a row (2010–11 season)' },
  { label: 'Unbeaten League Streak', value: '43', detail: 'Consecutive matches undefeated (2017–18)' }
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
      <p class="trophy-card__first">First won in ${t.firstWon}</p>
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

  const trophyHistories = {
    t1: {
      desc: 'La Liga is the premier domestic league championship in Spain. Barcelona won the very first edition in 1929 and has dominated the modern era with 11 league titles in the 21st century alone.',
      milestones: ['1929: Inaugural championship', '1974: Cruyff triumph', '1991–1994: Dream Team 4-in-a-row', '2009, 2011, 2015: Treble/Sextuple years', '2023: Xavi championship']
    },
    t2: {
      desc: 'The UEFA Champions League represents the pinnacle of European football. Barça has lifted the prestigious trophy 5 times, including two unforgettable Trebles in 2009 and 2015.',
      milestones: ['1992: London Wembley (vs Sampdoria 1-0)', '2006: Paris Saint-Denis (vs Arsenal 2-1)', '2009: Rome Olimpico (vs Man United 2-0)', '2011: London Wembley (vs Man United 3-1)', '2015: Berlin Olympiastadion (vs Juventus 3-1)']
    },
    t3: {
      desc: 'With 31 Copa del Rey titles, FC Barcelona is the all-time record winner of Spain\'s oldest national football competition, renowned as the "King of Cups".',
      milestones: ['1910: First national cup', '1968: The famous "Bottles Final" at Bernabéu', '2009: 4-1 comeback vs Athletic Bilbao', '2015: Messi miracle solo goal vs Bilbao', '2021: 4-0 demolition in Seville']
    },
    t4: {
      desc: 'Supercopa de España pits the champions of La Liga against the Copa del Rey winners. Barça holds the all-time record with 15 Supercopa trophies.',
      milestones: ['1983: First official Supercopa', '2011: Thrilling 5-4 aggregate win vs Real Madrid', '2023: 3-1 masterclass in Riyadh over Real Madrid']
    },
    t5: {
      desc: 'Contested between Champions League winners and Europa League winners. Barcelona shares the European record with 5 titles.',
      milestones: ['1992 vs Werder Bremen', '1997 vs Borussia Dortmund', '2009 vs Shakhtar Donetsk', '2011 vs Porto', '2015 vs Sevilla (thrilling 5-4 extra time)']
    },
    t6: {
      desc: 'The FIFA Club World Cup crowns the champions of the entire planet. Barcelona won in 2009, 2011, and 2015.',
      milestones: ['2009: Abu Dhabi (Messi chest goal vs Estudiantes)', '2011: Yokohama (4-0 clinic vs Santos & Neymar)', '2015: Yokohama (3-0 vs River Plate)']
    }
  };

  const h = trophyHistories[trophy.id] || {
    desc: 'One of the prestigious trophies won by FC Barcelona during its historic century-long football history.',
    milestones: [`First won in ${trophy.firstWon}`, `Total Titles: ${trophy.count}`]
  };

  body.innerHTML = `
    <div style="text-align:center;padding:var(--sp-4);background:var(--color-bg);border-radius:var(--radius-md);margin-bottom:var(--sp-4);">
      <span style="font-size:4rem;display:block;">${trophy.emoji}</span>
      <span style="font-family:var(--font-display);font-size:3rem;font-weight:700;color:var(--color-gold);display:block;line-height:1;">
        ${trophy.count} Titles Won
      </span>
      <span class="badge badge--navy" style="margin-top:var(--sp-2);">${trophy.category.toUpperCase()} RECORD</span>
    </div>

    <div style="display:flex;flex-direction:column;gap:var(--sp-3);font-size:var(--fs-sm);">
      <p style="line-height:1.6;color:var(--color-text);">${h.desc}</p>
      
      <div>
        <h4 style="font-family:var(--font-display);font-size:var(--fs-sm);text-transform:uppercase;color:var(--color-navy);margin-bottom:6px;">Historic Finals & Highlights:</h4>
        <ul style="display:flex;flex-direction:column;gap:4px;padding-left:var(--sp-4);list-style:disc;color:var(--color-text-muted);">
          ${h.milestones.map(m => `<li>${m}</li>`).join('')}
        </ul>
      </div>

      <div style="padding-top:var(--sp-3);border-top:1px solid var(--color-border);font-size:var(--fs-xs);color:var(--color-text-muted);">
        <strong>First Conquered:</strong> ${trophy.firstWon} · FC Barcelona Honours Archive
      </div>
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
        <p class="text-muted">No historical milestones found for "${searchQuery}". Try searching for Cruyff, Wembley, Messi, or Treble.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(item => `
    <article class="timeline-entry timeline-entry--${item.category}" role="article">
      <span class="timeline-entry__year-badge">${item.year}</span>
      <div class="timeline-entry__dot" aria-hidden="true"></div>
      <div class="timeline-entry__card">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:var(--sp-2);margin-bottom:var(--sp-2);">
          <span class="badge badge--outline">${item.category.toUpperCase()}</span>
          <span class="text-xs text-muted font-bold">${item.year}</span>
        </div>
        <h3 class="timeline-entry__title">${item.title}</h3>
        <p class="timeline-entry__desc">${item.desc}</p>
        <div class="timeline-entry__tags">
          ${item.tags.map(tag => `<span class="badge badge--outline">${tag}</span>`).join('')}
        </div>
      </div>
    </article>
  `).join('');
}

function renderRecords() {
  const container = document.getElementById('records-grid-container');
  if (!container) return;

  container.innerHTML = CLUB_RECORDS.map(r => `
    <div class="card" style="padding:var(--sp-4);text-align:center;">
      <span style="font-family:var(--font-display);font-size:var(--fs-3xl);font-weight:700;color:var(--color-navy);display:block;line-height:1;">
        ${r.value}
      </span>
      <strong style="font-size:var(--fs-sm);display:block;margin-top:var(--sp-1);text-transform:uppercase;">${r.label}</strong>
      <span class="text-xs text-muted" style="display:block;margin-top:2px;">${r.detail}</span>
    </div>
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
  renderRecords();
  initTimelineControls();
  renderTimeline();
  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
}

init();
