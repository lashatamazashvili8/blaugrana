/**
 * profile.js — User profile controller: statistics, user posts, user comments, saved posts, and profile editing
 */
import { Storage } from './storage.js';
import { getSession, isLoggedIn, updateNavUI } from './auth.js';
import { initTheme, toggleTheme } from './theme.js';
import { initNav, initTabs, initModals, openModal, closeModal, showToast, formatRelative, seedIfNeeded } from './ui.js';

function renderProfile() {
  const session = getSession();
  if (!session) {
    const main = document.getElementById('main-content');
    if (main) {
      main.innerHTML = `
        <div class="container section" style="text-align:center;">
          <div class="card" style="max-width:480px;margin-inline:auto;padding:var(--sp-8);">
            <span style="font-size:3rem;display:block;margin-bottom:var(--sp-3);">🔑</span>
            <h2 class="heading-2">Sign in Required</h2>
            <p class="text-sm text-muted" style="margin-bottom:var(--sp-6);">
              Please sign in to access your fan profile, view your posts, and manage your membership.
            </p>
            <a href="auth.html" class="btn btn--primary btn--full">Sign In to Continue</a>
          </div>
        </div>`;
    }
    const hero = document.getElementById('profile-header-sec');
    if (hero) hero.style.display = 'none';
    return;
  }

  // Find user record in storage
  const users = Storage.get('users') || [];
  const user = users.find(u => u.id === session.userId || u.username === session.username) || {
    ...session,
    bio: session.bio || 'Força Barça! 🔵🔴',
    favoritePlayer: session.favoritePlayer || 'Lamine Yamal'
  };

  // Header Elements
  document.getElementById('prof-avatar').textContent = user.avatarInitials || user.username.slice(0, 2).toUpperCase();
  document.getElementById('prof-tier-badge').textContent = (user.tier || 'free').toUpperCase();
  document.getElementById('prof-display-name').textContent = user.displayName || user.username;
  document.getElementById('prof-username').textContent = `@${user.username}`;
  document.getElementById('prof-bio').textContent = user.bio || 'Passionate FC Barcelona supporter.';
  document.getElementById('prof-fav-player').textContent = user.favoritePlayer || 'Pedri';

  const memberDate = user.memberSince ? new Date(user.memberSince).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : 'Nov 2026';
  document.getElementById('prof-since').textContent = memberDate;

  // Datasets
  const allPosts = Storage.get('posts') || [];
  const allComments = Storage.get('comments') || [];

  const myPosts = allPosts.filter(p => p.userId === session.userId || p.username === session.username);
  const myComments = allComments.filter(c => c.userId === session.userId || c.username === session.username);
  const mySaved = allPosts.filter(p => p.likes?.includes(session.userId));

  // Sidebar Stats
  document.getElementById('stat-posts-count').textContent = myPosts.length;
  document.getElementById('stat-comments-count').textContent = myComments.length;
  document.getElementById('stat-likes-count').textContent = mySaved.length;
  document.getElementById('stat-tier-badge').textContent = (user.tier || 'free').toUpperCase();

  // Tab counters
  document.getElementById('tab-posts-count').textContent = myPosts.length;
  document.getElementById('tab-comments-count').textContent = myComments.length;
  document.getElementById('tab-saved-count').textContent = mySaved.length;

  // Render My Posts Panel
  const postsList = document.getElementById('user-posts-list');
  if (myPosts.length === 0) {
    postsList.innerHTML = `
      <div class="empty-state">
        <span class="empty-state__icon">📝</span>
        <p class="empty-state__text">You haven't published any posts yet.</p>
        <a href="feed.html" class="btn btn--primary btn--sm" style="margin-top:var(--sp-4);">Join the Feed</a>
      </div>`;
  } else {
    postsList.innerHTML = myPosts.map(p => `
      <article class="card" style="padding:var(--sp-4);">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--sp-2);">
          <span class="badge badge--navy">${p.tag}</span>
          <span class="text-xs text-muted">${formatRelative(p.timestamp)}</span>
        </div>
        <p class="text-sm" style="line-height:1.5;margin-bottom:var(--sp-3);">${escapeHTML(p.content)}</p>
        <div style="display:flex;align-items:center;justify-content:space-between;font-size:var(--fs-xs);color:var(--color-text-muted);">
          <span>❤️ ${p.likes?.length || 0} likes</span>
          <button type="button" class="post-card__delete" data-delete-id="${p.id}">Delete</button>
        </div>
      </article>
    `).join('');

    postsList.querySelectorAll('[data-delete-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('Delete this post?')) {
          Storage.removeFrom('posts', btn.dataset.deleteId);
          showToast('Post deleted', 'info');
          renderProfile();
        }
      });
    });
  }

  // Render My Comments Panel
  const commentsList = document.getElementById('user-comments-list');
  if (myComments.length === 0) {
    commentsList.innerHTML = `
      <div class="empty-state">
        <span class="empty-state__icon">💬</span>
        <p class="empty-state__text">You haven't written any comments yet.</p>
      </div>`;
  } else {
    commentsList.innerHTML = myComments.map(c => `
      <div class="comment" style="background:var(--color-bg);padding:var(--sp-3) var(--sp-4);border-radius:var(--radius-md);border:1px solid var(--color-border);">
        <div style="width:100%;">
          <div style="display:flex;justify-content:space-between;font-size:var(--fs-xs);margin-bottom:4px;">
            <strong>Comment on Discussion</strong>
            <span class="text-muted">${formatRelative(c.timestamp)}</span>
          </div>
          <p class="text-sm">${escapeHTML(c.text)}</p>
        </div>
      </div>
    `).join('');
  }

  // Render Liked Posts Panel
  const savedList = document.getElementById('user-saved-list');
  if (mySaved.length === 0) {
    savedList.innerHTML = `
      <div class="empty-state">
        <span class="empty-state__icon">❤️</span>
        <p class="empty-state__text">You haven't liked any posts yet.</p>
      </div>`;
  } else {
    savedList.innerHTML = mySaved.map(p => `
      <article class="card" style="padding:var(--sp-4);">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--sp-2);">
          <span class="badge badge--garnet">@${p.username}</span>
          <span class="text-xs text-muted">${formatRelative(p.timestamp)}</span>
        </div>
        <p class="text-sm" style="line-height:1.5;">${escapeHTML(p.content)}</p>
      </article>
    `).join('');
  }

  // Setup Edit Profile Modal
  const editBtn = document.getElementById('edit-profile-btn');
  const editBioInput = document.getElementById('edit-bio');
  const editFavInput = document.getElementById('edit-fav-player');
  const editForm = document.getElementById('edit-profile-form');

  editBtn?.addEventListener('click', () => {
    if (editBioInput) editBioInput.value = user.bio || '';
    if (editFavInput) editFavInput.value = user.favoritePlayer || '';
    openModal('edit-profile-modal');
  });

  editForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const updatedBio = editBioInput.value.trim();
    const updatedFav = editFavInput.value.trim();

    Storage.updateIn('users', session.userId, {
      bio: updatedBio,
      favoritePlayer: updatedFav
    });

    session.bio = updatedBio;
    session.favoritePlayer = updatedFav;
    Storage.set('session', session);

    closeModal('edit-profile-modal');
    showToast('Profile updated successfully!', 'success');
    renderProfile();
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
  initTabs();
  initModals();
  renderProfile();
  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
}

init();
