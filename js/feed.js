import { z } from './vendor/zod.js';
import { createFormik } from './vendor/formik.js';
import { Storage } from './storage.js';
import { getSession, isLoggedIn, updateNavUI } from './auth.js';
import { initTheme, toggleTheme } from './theme.js';
import { initNav, showToast, formatRelative, seedIfNeeded } from './ui.js';

let activeFilter = 'All';
let currentImageData = null;

const postSchema = z.object({
  content: z.string('Please write some thoughts').min(3, 'Post must be at least 3 characters.').max(500, 'Post cannot exceed 500 characters.'),
  tag: z.enum(['Match', 'Transfers', 'History', 'Memes'])
});

function renderFeed() {
  const posts = Storage.get('posts') || [];
  const comments = Storage.get('comments') || [];
  const session = getSession();
  const container = document.getElementById('post-list-container');
  if (!container) return;

  let displayedPosts = [...posts].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  if (activeFilter === 'Top') {
    displayedPosts.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
  } else if (activeFilter !== 'All') {
    displayedPosts = displayedPosts.filter(p => p.tag?.toLowerCase() === activeFilter.toLowerCase());
  }

  if (displayedPosts.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="background:var(--color-surface);border-radius:var(--radius-card);border:1px solid var(--color-border);padding:var(--sp-8);text-align:center;">
        <span class="empty-state__icon" style="font-size:2.5rem;display:block;margin-bottom:var(--sp-2);">💬</span>
        <h3 class="heading-2">No discussions found</h3>
        <p class="text-sm text-muted">There are no posts under "${activeFilter}". Be the first to share one!</p>
      </div>`;
    return;
  }

  const tagColors = {
    Match: 'navy',
    Transfers: 'garnet',
    History: 'gold',
    Memes: 'outline'
  };

  container.innerHTML = displayedPosts.map(post => {
    const isLiked = session && post.likes?.includes(session.userId);
    const likeCount = post.likes?.length || 0;
    const postComments = comments.filter(c => c.postId === post.id);
    const commentCount = postComments.length;
    const isAuthor = session && (post.userId === session.userId || post.username === session.username);

    const imageMarkup = post.image
      ? `<div class="post-card__image"><img src="${post.image}" alt="Image shared by ${post.username}" loading="lazy"/></div>`
      : '';

    const deleteBtn = isAuthor
      ? `<button type="button" class="post-card__delete" data-delete-id="${post.id}" aria-label="Delete your post">🗑️ Delete</button>`
      : '';

    return `
      <article class="post-card" id="post-${post.id}">
        <header class="post-card__header">
          <div class="avatar" aria-hidden="true">${post.username.slice(0, 2).toUpperCase()}</div>
          <div class="post-card__user-info">
            <div style="display:flex;align-items:center;gap:var(--sp-2);">
              <span class="post-card__username">@${post.username}</span>
              <span class="badge badge--${tagColors[post.tag] || 'outline'}">${post.tag || 'General'}</span>
            </div>
            <time class="post-card__meta" datetime="${post.timestamp}">${formatRelative(post.timestamp)}</time>
          </div>
          <div class="post-card__menu">
            ${deleteBtn}
          </div>
        </header>

        <div class="post-card__body">
          <p class="post-card__text">${escapeHTML(post.content)}</p>
          ${imageMarkup}
        </div>

        <footer class="post-card__footer">
          <button type="button" class="like-btn ${isLiked ? 'is-liked' : ''}" data-like-id="${post.id}" aria-label="${isLiked ? 'Unlike' : 'Like'} this post, ${likeCount} likes">
            <svg viewBox="0 0 24 24" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span class="like-count">${likeCount}</span>
          </button>

          <button type="button" class="btn btn--ghost btn--sm" data-comment-toggle="${post.id}" aria-expanded="false" aria-controls="comments-${post.id}">
            💬 Comments (${commentCount})
          </button>
        </footer>

        <section class="comments" id="comments-${post.id}" aria-label="Comments for post by ${post.username}">
          <div class="comment-list" id="comment-list-${post.id}">
            ${postComments.length > 0 ? postComments.map(c => {
              const isCommentAuthor = session && (c.userId === session.userId || c.username === session.username);
              const deleteCommentBtn = isCommentAuthor
                ? `<button type="button" class="post-card__delete" data-delete-comment-id="${c.id}" style="margin-left:auto;font-size:11px;" title="Delete this comment line">✕ Delete</button>`
                : '';

              return `
                <div class="comment" id="comment-${c.id}">
                  <div class="avatar" style="width:28px;height:28px;font-size:0.65rem;" aria-hidden="true">${c.username.slice(0, 2).toUpperCase()}</div>
                  <div class="comment__bubble" style="flex:1;">
                    <div style="display:flex;align-items:center;justify-content:space-between;">
                      <span class="comment__author">@${c.username} · <span class="text-xs text-muted font-normal">${formatRelative(c.timestamp)}</span></span>
                      ${deleteCommentBtn}
                    </div>
                    <div class="comment__text">${escapeHTML(c.text)}</div>
                  </div>
                </div>`;
            }).join('') : '<p class="text-xs text-muted" style="margin-bottom:var(--sp-3);">No comments yet. Start the conversation!</p>'}
          </div>

          <form class="comment-input-row" data-comment-form="${post.id}">
            <label for="comment-field-${post.id}" class="visually-hidden">Write a comment</label>
            <input type="text" id="comment-field-${post.id}" placeholder="${session ? 'Write a comment...' : '🔒 Authorization required to comment'}" ${!session ? 'disabled' : ''} required />
            <button type="submit" class="btn btn--primary btn--sm" ${!session ? 'disabled' : ''}>Send</button>
          </form>
        </section>
      </article>`;
  }).join('');

  attachEventHandlers();
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

function attachEventHandlers() {
  const session = getSession();

  document.querySelectorAll('[data-like-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!isLoggedIn()) {
        showToast('Authorization required: Please sign in to like posts!', 'warning');
        return;
      }
      const postId = btn.dataset.likeId;
      const posts = Storage.get('posts') || [];
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      post.likes = post.likes || [];
      const idx = post.likes.indexOf(session.userId);
      if (idx >= 0) {
        post.likes.splice(idx, 1);
      } else {
        post.likes.push(session.userId);
      }
      Storage.updateIn('posts', postId, { likes: post.likes });
      renderFeed();
    });
  });

  document.querySelectorAll('[data-comment-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const postId = btn.dataset.commentToggle;
      const commentsSection = document.getElementById(`comments-${postId}`);
      if (!commentsSection) return;
      const isOpen = commentsSection.classList.contains('is-open');
      commentsSection.classList.toggle('is-open', !isOpen);
      btn.setAttribute('aria-expanded', String(!isOpen));
      if (!isOpen) {
        const input = commentsSection.querySelector('input');
        if (input && !input.disabled) input.focus();
      }
    });
  });

  document.querySelectorAll('[data-comment-form]').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!isLoggedIn()) {
        showToast('Authorization required: Please sign in to write comments.', 'warning');
        return;
      }
      const postId = form.dataset.commentForm;
      const input = form.querySelector('input');
      const text = input.value.trim();
      if (!text) return;

      const newComment = {
        id: 'c' + Date.now(),
        postId,
        userId: session.userId,
        username: session.username,
        text,
        timestamp: new Date().toISOString()
      };

      Storage.pushTo('comments', newComment);
      input.value = '';
      showToast('Comment posted and saved!', 'success');
      renderFeed();
      const sec = document.getElementById(`comments-${postId}`);
      if (sec) sec.classList.add('is-open');
    });
  });

  document.querySelectorAll('[data-delete-comment-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const commentId = btn.dataset.deleteCommentId;
      if (confirm('Delete this line of comment?')) {
        Storage.removeFrom('comments', commentId);
        showToast('Comment deleted.', 'info');
        renderFeed();
      }
    });
  });

  document.querySelectorAll('[data-delete-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const postId = btn.dataset.deleteId;
      if (confirm('Are you sure you want to delete this post?')) {
        Storage.removeFrom('posts', postId);
        showToast('Post removed.', 'info');
        renderFeed();
      }
    });
  });
}

function initComposer() {
  const session = getSession();
  const authBox = document.getElementById('create-post-auth');
  const gatedBox = document.getElementById('create-post-gated');
  const avatar = document.getElementById('author-avatar');

  if (session) {
    if (authBox) authBox.style.display = 'block';
    if (gatedBox) gatedBox.style.display = 'none';
    if (avatar) avatar.textContent = session.avatarInitials || session.username.slice(0, 2).toUpperCase();
  } else {
    if (authBox) authBox.style.display = 'none';
    if (gatedBox) gatedBox.style.display = 'flex';
    return;
  }

  const form = document.getElementById('create-post-form');
  const textarea = document.getElementById('post-textarea');
  const charCounter = document.getElementById('char-counter');
  const fileInput = document.getElementById('post-image-file');
  const urlToggleBtn = document.getElementById('btn-toggle-img-url');
  const urlInput = document.getElementById('post-image-url');
  const previewBox = document.getElementById('img-preview-box');
  const previewImg = document.getElementById('img-preview-el');
  const removeImgBtn = document.getElementById('img-preview-remove');
  const tagSelect = document.getElementById('post-tag-select');

  urlToggleBtn?.addEventListener('click', () => {
    if (!urlInput) return;
    const isHidden = urlInput.style.display === 'none';
    urlInput.style.display = isHidden ? 'inline-block' : 'none';
    if (isHidden) urlInput.focus();
  });

  urlInput?.addEventListener('input', () => {
    const val = urlInput.value.trim();
    if (val && /^https?:\/\/.+/i.test(val)) {
      currentImageData = val;
      previewImg.src = val;
      previewBox.classList.add('is-visible');
    }
  });

  const composerFormik = createFormik({
    initialValues: {
      content: '',
      tag: 'Match'
    },
    validationSchema: postSchema,
    onSubmit: async (values, { resetForm }) => {
      if (!isLoggedIn()) {
        showToast('Authorization required: Please log in to publish a post.', 'warning');
        return;
      }

      const newPost = {
        id: 'post' + Date.now(),
        userId: session.userId,
        username: session.username,
        content: values.content.trim(),
        tag: values.tag,
        image: currentImageData || null,
        timestamp: new Date().toISOString(),
        likes: [],
        comments: []
      };

      const posts = Storage.get('posts') || [];
      posts.unshift(newPost);
      Storage.set('posts', posts);

      resetForm();
      if (textarea) textarea.value = '';
      if (charCounter) charCounter.textContent = '500';
      currentImageData = null;
      if (previewImg) previewImg.src = '';
      if (previewBox) previewBox.classList.remove('is-visible');
      if (fileInput) fileInput.value = '';
      if (urlInput) {
        urlInput.value = '';
        urlInput.style.display = 'none';
      }

      activeFilter = 'All';
      document.querySelectorAll('.filter-chips button.chip').forEach(c => {
        c.classList.toggle('is-active', c.dataset.filter === 'All');
      });

      renderFeed();

      const listEl = document.getElementById('post-list-container');
      listEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });

      showToast('Your post has been published and added to the top!', 'success');
    }
  });

  textarea?.addEventListener('input', (e) => {
    composerFormik.handleChange(e);
    const remaining = 500 - (e.target.value?.length || 0);
    charCounter.textContent = remaining;
    charCounter.style.color = remaining < 50 ? 'var(--color-garnet)' : 'var(--color-text-muted)';
  });
  textarea?.addEventListener('blur', (e) => composerFormik.handleBlur(e));

  tagSelect?.addEventListener('change', (e) => composerFormik.handleChange(e));

  fileInput?.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('Image size must be under 2MB', 'warning');
      fileInput.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      currentImageData = e.target.result;
      previewImg.src = currentImageData;
      previewBox.classList.add('is-visible');
    };
    reader.readAsDataURL(file);
  });

  removeImgBtn?.addEventListener('click', () => {
    currentImageData = null;
    previewImg.src = '';
    previewBox.classList.remove('is-visible');
    if (fileInput) fileInput.value = '';
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    composerFormik.setFieldValue('content', textarea?.value || '', false);
    composerFormik.setFieldValue('tag', tagSelect?.value || 'Match', false);
    const ok = await composerFormik.handleSubmit(e);
    if (!ok) {
      const err = composerFormik.errors.content || composerFormik.errors.tag || 'Please check your post content.';
      showToast(err, 'warning');
    }
  });
}

function initFilters() {
  document.querySelectorAll('.filter-chips button.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chips button.chip').forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      activeFilter = chip.dataset.filter || 'All';
      renderFeed();
    });
  });

  document.querySelectorAll('[data-quick]').forEach(span => {
    span.addEventListener('click', () => {
      const tag = span.dataset.quick;
      const targetChip = document.querySelector(`.filter-chips button[data-filter="${tag}"]`);
      if (targetChip) {
        targetChip.click();
      }
    });
  });
}

async function init() {
  initTheme();
  await seedIfNeeded();
  initNav();
  updateNavUI();
  initComposer();
  initFilters();
  renderFeed();
  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);
}

init();
