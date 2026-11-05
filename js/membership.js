/**
 * membership.js — Interactive membership selection, FAQ accordion, and mock upgrade modal flow
 */
import { getSession, isLoggedIn, upgradeTier, updateNavUI } from './auth.js';
import { initTheme, toggleTheme } from './theme.js';
import { initNav, initAccordion, openModal, closeModal, initModals, showToast, seedIfNeeded } from './ui.js';

let pendingTier = 'member';

function initTierButtons() {
  const session = getSession();

  // If logged in, display active banner and highlight card
  if (session) {
    const banner = document.getElementById('current-tier-banner');
    const tierName = document.getElementById('active-tier-name');
    if (banner && tierName) {
      banner.style.display = 'block';
      tierName.textContent = session.tier;
    }

    const currentCard = document.getElementById(`card-tier-${session.tier}`);
    if (currentCard) {
      const btn = currentCard.querySelector('[data-upgrade-target]');
      if (btn) {
        btn.textContent = '✓ Current Tier';
        btn.classList.add('btn--outline');
      }
    }
  }

  document.querySelectorAll('[data-upgrade-target]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.upgradeTarget;
      if (!isLoggedIn()) {
        showToast('Please sign in or register to choose a membership tier!', 'info');
        setTimeout(() => {
          window.location.href = 'auth.html';
        }, 1200);
        return;
      }

      pendingTier = target;
      const modalTierLabel = document.getElementById('modal-selected-tier');
      if (modalTierLabel) {
        modalTierLabel.textContent = target.toUpperCase();
      }

      openModal('upgrade-modal');
    });
  });

  // Confirm upgrade in modal
  document.getElementById('confirm-upgrade-btn')?.addEventListener('click', () => {
    const success = upgradeTier(pendingTier);
    closeModal('upgrade-modal');

    if (success) {
      showToast(`Membership successfully updated to ${pendingTier.toUpperCase()}!`, 'success');
      setTimeout(() => {
        window.location.reload();
      }, 900);
    } else {
      showToast('Could not update tier. Please try again.', 'error');
    }
  });
}

async function init() {
  initTheme();
  await seedIfNeeded();
  initNav();
  updateNavUI();
  initAccordion();
  initModals();
  initTierButtons();
  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
}

init();
