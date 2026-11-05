/**
 * match-room.js — Live match room logic: MOTM poll and simulated live chat
 */
import { Storage } from './storage.js';
import { getSession, isMember, updateNavUI } from './auth.js';
import { initTheme, toggleTheme } from './theme.js';
import { initNav, showToast, seedIfNeeded } from './ui.js';

// Simulated default chat stream
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
  const lockedOverlay = document.getElementById('chat-locked-overlay');

  const userIsMember = isMember();
  const session = getSession();

  if (!userIsMember) {
    if (lockedOverlay) lockedOverlay.style.display = 'flex';
    if (unlockedFooter) unlockedFooter.style.display = 'none';
  } else {
    if (lockedOverlay) lockedOverlay.style.display = 'none';
    if (unlockedFooter) unlockedFooter.style.display = 'flex';
  }

  let chatHistory = Storage.get('match_chat') || INITIAL_CHAT;

  function renderMessages() {
    if (!container) return;
    container.innerHTML = chatHistory.map(msg => `
      <div class="chat-msg ${msg.own ? 'chat-msg--own' : ''}">
        <div class="chat-msg__bubble">
          <div class="chat-msg__author">${escapeHTML(msg.author)} ${msg.time ? `· <span class="text-xs font-normal">${msg.time}</span>` : ''}</div>
          <div class="chat-msg__text">${escapeHTML(msg.text)}</div>
        </div>
      </div>
    `).join('');
    container.scrollTop = container.scrollHeight;
  }

  renderMessages();

  // Send message
  chatForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;

    const newMsg = {
      id: 'm' + Date.now(),
      author: session ? session.username : 'Guest',
      text,
      time: 'Now',
      own: true
    };

    chatHistory.push(newMsg);
    if (chatHistory.length > 50) chatHistory.shift();
    Storage.set('match_chat', chatHistory);

    chatInput.value = '';
    renderMessages();
  });

  // Simulated live match reactions every 9 seconds
  let reactionIdx = 0;
  const interval = setInterval(() => {
    // Only simulate if document is visible
    if (document.hidden) return;
    const item = SIMULATED_REACTIONS[reactionIdx % SIMULATED_REACTIONS.length];
    reactionIdx++;

    const simMsg = {
      id: 'm' + Date.now(),
      author: item.author,
      text: item.text,
      time: '75\'',
      own: false
    };

    chatHistory.push(simMsg);
    if (chatHistory.length > 50) chatHistory.shift();
    Storage.set('match_chat', chatHistory);
    renderMessages();
  }, 9000);

  window.addEventListener('beforeunload', () => clearInterval(interval));
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
