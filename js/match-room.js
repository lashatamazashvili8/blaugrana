import { Storage } from './storage.js';
import { getSession, isLoggedIn, isMember, updateNavUI } from './auth.js';
import { initTheme, toggleTheme } from './theme.js';
import { initNav, showToast, seedIfNeeded } from './ui.js';

const INITIAL_CHAT = [
  { id: 'm1', author: 'CulerMarc', text: 'WHAT A GOAL FROM LAMINE! Golazo absoluto!', time: '71\'', own: false },
  { id: 'm2', author: 'BarcaTactics', text: 'Pedri’s vision to spot that run was pure masterclass.', time: '72\'', own: false },
  { id: 'm3', author: 'Elena_Blaugrana', text: 'Camp Nou is electric right now! 🔵🔴', time: '73\'', own: false },
  { id: 'm4', author: 'PauFan2026', text: 'Cubarsi has Mbappe completely locked down!', time: '74\'', own: false }
];

const SIMULATED_REACTIONS = [
  { author: 'Jordi_Tarragona', text: 'Keep the ball, control the tempo now!' },
  { author: 'Sergio_Culer', text: 'Pedri is running the whole show in midfield 🎩' },
  { author: 'ViscaBarca99', text: 'LAMINE YAMAL FUTURE BALLON D’OR! 🔥' },
  { author: 'CampNouVoice', text: 'Outstanding pressing from Gavi and Casadó!' },
  { author: 'RaphinhaMagic', text: 'Another counter! Come on Barça get the third!' },
  { author: 'BojanFan', text: 'Defensive line holding strong. 15 minutes left!' }
];

function initMOTMPoll() {
  const form = document.getElementById('motm-poll-form');
  if (!form) return;

  const defaultVotes = {
    lamine: 824,
    pedri: 341,
    lewy: 170,
    cubarsi: 85
  };

  let pollData = Storage.get('motm_poll') || defaultVotes;
  let hasVoted = Storage.get('motm_voted') || false;

  function updatePollUI() {
    const total = Object.values(pollData).reduce((a, b) => a + b, 0);
    document.getElementById('poll-votes-total').textContent = `${total.toLocaleString()} votes`;

    for (const [key, count] of Object.entries(pollData)) {
      const pct = Math.round((count / total) * 100);
      const pctEl = document.getElementById(`pct-${key}`);
      const optionEl = form.querySelector(`[data-player="${key}"]`);
      const barEl = optionEl?.querySelector('.poll-bar');

      if (pctEl) pctEl.textContent = `${pct}%`;
      if (barEl) barEl.style.width = `${pct}%`;
    }

    if (hasVoted) {
      const submitBtn = document.getElementById('poll-submit-btn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '✓ Vote Recorded';
        submitBtn.classList.replace('btn--primary', 'btn--outline');
      }
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!isLoggedIn()) {
      showToast('Authorization required: Please sign in to vote in MOTM polls.', 'warning');
      return;
    }
    if (hasVoted) {
      showToast('You have already voted in this match poll.', 'info');
      return;
    }

    const selected = form.querySelector('input[name="motm"]:checked')?.value;
    if (!selected) return;

    pollData[selected] = (pollData[selected] || 0) + 1;
    hasVoted = true;

    Storage.set('motm_poll', pollData);
    Storage.set('motm_voted', true);

    showToast('Your vote for Man of the Match has been recorded!', 'success');
    updatePollUI();
  });

  updatePollUI();
}

function initLiveChat() {
  const container = document.getElementById('chat-messages');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const unlockedFooter = document.getElementById('chat-unlocked-footer');
  const lockedFooter = document.getElementById('chat-locked-footer');

  const userIsLoggedIn = isLoggedIn();
  const session = getSession();

  if (unlockedFooter) unlockedFooter.hidden = !userIsLoggedIn;
  if (lockedFooter) lockedFooter.hidden = userIsLoggedIn;

  let chatHistory = Storage.get('match_chat');
  if (!chatHistory || !Array.isArray(chatHistory) || chatHistory.length === 0) {
    chatHistory = [...INITIAL_CHAT];
    Storage.set('match_chat', chatHistory);
  }

  function renderMessages() {
    if (!container) return;
    container.innerHTML = chatHistory.map(msg => {
      const isMyMsg = session && (msg.userId === session.userId || msg.author === session.username);
      const deleteMsgBtn = isMyMsg
        ? `<button type="button" class="post-card__delete" data-del-chat="${msg.id}" style="font-size:10px;padding:1px 4px;margin-left:4px;" title="Delete message">✕</button>`
        : '';

      return `
        <div class="chat-msg ${isMyMsg ? 'chat-msg--own' : ''}">
          <div class="chat-msg__bubble">
            <div class="chat-msg__author" style="display:flex;align-items:center;justify-content:space-between;">
              <span>${escapeHTML(msg.author)} ${msg.time ? `· <span class="text-xs font-normal">${msg.time}</span>` : ''}</span>
              ${deleteMsgBtn}
            </div>
            <div class="chat-msg__text">${escapeHTML(msg.text)}</div>
          </div>
        </div>
      `;
    }).join('');

    container.scrollTop = container.scrollHeight;

    container.querySelectorAll('[data-del-chat]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.delChat;
        chatHistory = chatHistory.filter(m => m.id !== id);
        Storage.set('match_chat', chatHistory);
        renderMessages();
      });
    });
  }

  
  
  const syncMessages = (event) => {
    if (event.key !== 'bh_match_chat') return;
    try {
      const latest = event.newValue ? JSON.parse(event.newValue) : [];
      if (Array.isArray(latest)) {
        chatHistory = latest;
        renderMessages();
      }
    } catch {
      
    }
  };
  window.addEventListener('storage', syncMessages);

  renderMessages();

  chatForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!isLoggedIn()) {
      showToast('Authorization required: Please sign in to send messages.', 'warning');
      return;
    }

    const text = chatInput.value.trim();
    if (!text) return;

    const newMsg = {
      id: 'm' + Date.now(),
      userId: session.userId,
      author: session.username,
      text,
      time: 'Now',
      own: true
    };

    chatHistory.push(newMsg);
    if (chatHistory.length > 60) chatHistory.shift();
    Storage.set('match_chat', chatHistory);

    chatInput.value = '';
    renderMessages();
    showToast('Message sent and saved to local storage.', 'info', 1500);
  });

  let reactionIdx = 0;
  const interval = setInterval(() => {
    if (document.hidden) return;
    
    
    const latest = Storage.get('match_chat');
    if (Array.isArray(latest)) chatHistory = latest;
    const item = SIMULATED_REACTIONS[reactionIdx % SIMULATED_REACTIONS.length];
    reactionIdx++;

    const simMsg = {
      id: 'm' + Date.now(),
      author: item.author,
      text: item.text,
      time: '76\'',
      own: false
    };

    chatHistory.push(simMsg);
    if (chatHistory.length > 60) chatHistory.shift();
    Storage.set('match_chat', chatHistory);
    renderMessages();
  }, 10000);

  window.addEventListener('beforeunload', () => {
    clearInterval(interval);
    window.removeEventListener('storage', syncMessages);
  });
}

function escapeHTML(str) {
  return (str || '').replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}

async function init() {
  initTheme();
  await seedIfNeeded();
  initNav();
  updateNavUI();
  initMOTMPoll();
  initLiveChat();
  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
}

init();
