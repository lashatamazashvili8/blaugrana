import { z } from './vendor/zod.js';
import { createFormik } from './vendor/formik.js';
import { Storage } from './storage.js';
import { getSession, isLoggedIn, updateNavUI } from './auth.js';
import { initTheme, toggleTheme } from './theme.js';
import { initNav, initTabs, initModals, openModal, closeModal, showToast, formatRelative, seedIfNeeded } from './ui.js';

const profileSchema = z.object({
  bio: z.string().max(250, 'Bio cannot exceed 250 characters.'),
  favoritePlayer: z.string().max(50, 'Player name is too long.')
});

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

  const users = Storage.get('users') || [];
  const user = users.find(u => u.id === session.userId || u.username === session.username) || {
    ...session,
    bio: session.bio || 'Força Barça! 🔵🔴',
    favoritePlayer: session.favoritePlayer || 'Lamine Yamal'
  };

  document.getElementById('prof-avatar').textContent = user.avatarInitials || user.username.slice(0, 2).toUpperCase();
  document.getElementById('prof-tier-badge').textContent = (user.tier || 'free').toUpperCase();
  document.getElementById('prof-display-name').textContent = user.displayName || user.username;
  document.getElementById('prof-username').textContent = `@${user.username}`;
  document.getElementById('prof-bio').textContent = user.bio || 'Passionate FC Barcelona supporter.';
  document.getElementById('prof-fav-player').textContent = user.favoritePlayer || 'Pedri';

  const memberDate = user.memberSince ? new Date(user.memberSince).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : 'Nov 2026';
  document.getElementById('prof-since').textContent = memberDate;

  const allPosts = Storage.get('posts') || [];
  const allComments = Storage.get('comments') || [];

  const myPosts = allPosts.filter(p => p.userId === session.userId || p.username === session.username);
  const myComments = allComments.filter(c => c.userId === session.userId || c.username === session.username);
  const mySaved = allPosts.filter(p => p.likes?.includes(session.userId));

  document.getElementById('stat-posts-count').textContent = myPosts.length;
  document.getElementById('stat-comments-count').textContent = myComments.length;
  document.getElementById('stat-likes-count').textContent = mySaved.length;
  document.getElementById('stat-tier-badge').textContent = (user.tier || 'free').toUpperCase();

  document.getElementById('tab-posts-count').textContent = myPosts.length;
  document.getElementById('tab-comments-count').textContent = myComments.length;
  document.getElementById('tab-saved-count').textContent = mySaved.length;

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

  const commentsList = document.getElementById('user-comments-list');
  if (myComments.length === 0) {
    commentsList.innerHTML = `
      <div class="empty-state">
        <span class="empty-state__icon">💬</span>
        <p class="empty-state__text">You haven't written any comments yet.</p>
      </div>`;
  } else {
    commentsList.innerHTML = myComments.map(c => `
      <div class="comment" style="background:var(--color-bg);padding:var(--sp-3) var(--sp-4);border-radius:var(--radius-md);border:1px solid var(--color-border);display:flex;justify-content:space-between;align-items:flex-start;">
        <div style="flex:1;">
          <div style="display:flex;justify-content:space-between;font-size:var(--fs-xs);margin-bottom:4px;">
            <strong>Comment on Discussion</strong>
            <span class="text-muted">${formatRelative(c.timestamp)}</span>
          </div>
          <p class="text-sm">${escapeHTML(c.text)}</p>
        </div>
        <button type="button" class="post-card__delete" data-del-comment-line="${c.id}" style="margin-left:var(--sp-3);font-size:11px;" title="Delete this line of comment">✕ Delete</button>
      </div>
    `).join('');

    commentsList.querySelectorAll('[data-del-comment-line]').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('Delete this line of comment?')) {
          Storage.removeFrom('comments', btn.dataset.delCommentLine);
          showToast('Comment deleted', 'info');
          renderProfile();
        }
      });
    });
  }

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

  const editBtn = document.getElementById('edit-profile-btn');
  const editBioInput = document.getElementById('edit-bio');
  const editFavInput = document.getElementById('edit-fav-player');
  const editForm = document.getElementById('edit-profile-form');

  const profileFormik = createFormik({
    initialValues: {
      bio: user.bio || '',
      favoritePlayer: user.favoritePlayer || ''
    },
    validationSchema: profileSchema,
    onSubmit: async (values) => {
      const updatedBio = values.bio.trim();
      const updatedFav = values.favoritePlayer.trim();

      Storage.updateIn('users', session.userId, {
        bio: updatedBio,
        favoritePlayer: updatedFav
      });

      session.bio = updatedBio;
      session.favoritePlayer = updatedFav;
      Storage.set('session', session);

      closeModal('edit-profile-modal');
      showToast('Profile updated and saved!', 'success');
      renderProfile();
    }
  });

  editBtn?.addEventListener('click', () => {
    if (editBioInput) {
      editBioInput.value = user.bio || '';
      profileFormik.setFieldValue('bio', user.bio || '');
    }
    if (editFavInput) {
      editFavInput.value = user.favoritePlayer || '';
      profileFormik.setFieldValue('favoritePlayer', user.favoritePlayer || '');
    }
    openModal('edit-profile-modal');
  });

  editBioInput?.addEventListener('input', (e) => profileFormik.handleChange(e));
  editFavInput?.addEventListener('input', (e) => profileFormik.handleChange(e));

  editForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    profileFormik.handleSubmit(e);
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
