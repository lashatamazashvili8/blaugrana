# PLAN.md — Blaugrana Hub
> Unofficial FC Barcelona Fan Community Website  
> Status: **Planning Phase** | Version: 1.0 | Date: 2026-11-05

---

## 1. Project Overview

**Blaugrana Hub** is an ad-free, unofficial fan community platform for FC Barcelona supporters. It provides match information, community discussion, club history, squad info, membership tiers, and simulated live match experiences — all without a backend, using vanilla HTML5, CSS3, and ES-module JavaScript with localStorage as the data layer.

> **Disclaimer:** This is an unofficial fan project. Not affiliated with FC Barcelona. No official logos or copyrighted assets are used.

---

## 2. Goals

| # | Goal |
|---|------|
| G1 | Build a fully responsive (390 / 768 / 1440 px), accessible, semantic website |
| G2 | Demonstrate mastery of Flexbox, Grid, CSS custom properties, and ES modules |
| G3 | Implement mock auth, session management, and membership gating via localStorage |
| G4 | Achieve Lighthouse 90+ in Performance, Accessibility, and Best Practices |
| G5 | Maintain clean Git history with conventional commits |
| G6 | Deliver complete documentation (README.md, PLAN.md, PRESENTATION.md) |

---

## 3. Scope

### In Scope
- 9 HTML pages (index, auth, feed, live, match-room, membership, history, squad, profile)
- Light / Dark theme toggle (persisted in localStorage)
- Responsive hamburger nav
- Mock login/register with real-time validation
- Community feed with posts, likes, comments, filters, and delete
- Live events and match room with member gating
- Membership pricing + FAQ accordion + mock upgrade flow
- Interactive history timeline + trophy cabinet
- Squad cards with flip/hover stat effect + position filter
- Profile page with tabs

### Out of Scope
- Real backend, database, or server-side logic
- Real payment processing
- Official FC Barcelona intellectual property

---

## 4. Stages, Deliverables & Timeline

| Stage | Description | Deliverables | Est. Time |
|-------|-------------|--------------|-----------|
| **S0** | Planning | PLAN.md approved | Day 1 |
| **S1** | Repo init + base CSS system | Git repo, CSS tokens, base styles, layout shell | Day 1 |
| **S2** | Shared components | Navbar, footer, card, button, modal, theme toggle | Day 1 |
| **S3** | Home (index.html) | Hero, countdown, fixtures slider, trophy strip, membership teaser | Day 1–2 |
| **S4** | Auth (auth.html) | Login/register tabs, validators, password strength | Day 2 |
| **S5** | Feed (feed.html) | Post creation, list, likes, comments, filters, delete | Day 2 |
| **S6** | Live + Match Room | Event cards, member lock, score header, timeline, poll, chat | Day 2–3 |
| **S7** | Membership (membership.html) | Pricing cards, comparison table, FAQ accordion, upgrade flow | Day 3 |
| **S8** | History (history.html) | Vertical timeline, trophy cabinet, filter chips | Day 3 |
| **S9** | Squad (squad.html) | Player cards, flip/hover, position filter | Day 3 |
| **S10** | Profile (profile.html) | Avatar, bio, tabs (Posts, Comments, Saved) | Day 3–4 |
| **S11** | QA + Optimization | Lighthouse audit, dead-code removal, lazy-load, HTML validation | Day 4 |
| **S12** | Documentation | README.md, PRESENTATION.md | Day 4 |

---

## 5. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| localStorage quota exceeded with many posts | Low | Medium | Cap post count at 100; prune oldest on overflow |
| Cross-page session inconsistency | Medium | High | All reads go through `js/storage.js` singleton — never raw `localStorage` |
| Countdown breaks on wrong timezone | Medium | Medium | Use `Date.getTime()` UTC delta, not locale strings |
| Images unavailable / copyright violation | High | High | Use SVG placeholders and CSS-generated illustrations only |
| CSS specificity wars across pages | Medium | Medium | Follow BEM-lite naming; never use `!important` except reset |
| Lighthouse score below 90 | Medium | Medium | Lazy-load images, defer non-critical JS, minify inline critical CSS |
| Hamburger menu traps focus | Medium | High | Implement focus-trap on open; restore on close |
| Form autocomplete leaks "mock" passwords | Low | Low | Add `autocomplete="off"` and README disclaimer |

---

## 6. Resources & Tools

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Markup | HTML5 — semantic elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`) |
| Styling | CSS3 — custom properties, Flexbox, Grid, `@media` queries (mobile-first) |
| Scripting | Vanilla ES2022 modules — `import`/`export`, `async/await`, optional chaining |
| Data | JSON seed files + localStorage via `storage.js` |
| Fonts | Google Fonts CDN: **Oswald** (display) + **Inter** (body) |
| Icons | Inline SVG sprites (no external icon library dependency) |
| Version Control | Git + GitHub |
| Dev Server | `npx serve` or VS Code Live Server |
| Linting | Manual HTML W3C Validator; Lighthouse in Chrome DevTools |

### Design Tokens (CSS custom properties)
```css
--color-navy:   #004D98;   /* primary brand */
--color-garnet: #A50044;   /* secondary brand */
--color-gold:   #EDBB00;   /* accent */
--color-bg:     #F5F5F0;   /* off-white background */
--color-surface:#FFFFFF;
--color-text:   #1A1A2E;
--font-display: 'Oswald', sans-serif;
--font-body:    'Inter', sans-serif;
--radius-card:  12px;
--shadow-card:  0 4px 16px rgba(0,0,0,0.08);
```

---

## 7. Project Architecture

```
barca-hub/
├── index.html                    ← Home
├── pages/
│   ├── auth.html                 ← Login / Register
│   ├── feed.html                 ← Community Feed
│   ├── live.html                 ← Live & Upcoming Events
│   ├── match-room.html           ← Match Room
│   ├── membership.html           ← Pricing & Upgrade
│   ├── history.html              ← Club History
│   ├── squad.html                ← Squad Explorer
│   └── profile.html              ← User Profile
├── css/
│   ├── variables.css             ← Design tokens (light + dark)
│   ├── base.css                  ← Reset, typography, global
│   ├── layout.css                ← Navbar, footer, page wrappers
│   ├── components.css            ← Cards, buttons, modals, forms, badges
│   └── pages/
│       ├── home.css
│       ├── auth.css
│       ├── feed.css
│       ├── live.css
│       ├── match-room.css
│       ├── membership.css
│       ├── history.css
│       ├── squad.css
│       └── profile.css
├── js/
│   ├── storage.js                ← localStorage CRUD with try/catch
│   ├── auth.js                   ← Session, login, register, route guard
│   ├── theme.js                  ← Light/dark toggle
│   ├── ui.js                     ← Shared UI helpers (toast, modal, focus-trap)
│   ├── main.js                   ← Home page logic (countdown, slider, count-up)
│   ├── feed.js                   ← Feed CRUD, likes, comments
│   ├── live.js                   ← Live events renderer
│   ├── history.js                ← Timeline, filter chips
│   ├── squad.js                  ← Player cards, position filter
│   └── data/
│       ├── users.json            ← Seed user accounts
│       ├── posts.json            ← Seed community posts
│       ├── fixtures.json         ← Upcoming + past match data
│       ├── players.json          ← Squad data
│       ├── trophies.json         ← Trophy cabinet
│       └── events.json           ← Live / upcoming events
├── assets/
│   ├── icons/                    ← SVG icon sprites
│   └── images/                   ← Placeholder/generated images
├── README.md
├── PLAN.md                       ← This file
└── PRESENTATION.md
```

---

## 8. Data & Auth Architecture

### Mock Auth Flow
```
Register → hash-less password stored in localStorage (README warns: not secure)
Login → compare stored credentials → write session object → redirect
Route guard → check session on member-only pages → redirect to auth if absent
```

### Storage Schema
```js
// storage keys
"bh_users"     → User[]
"bh_session"   → { userId, username, tier, memberSince }
"bh_posts"     → Post[]
"bh_comments"  → Comment[]
"bh_likes"     → { postId: userId[] }
"bh_tier"      → 'free' | 'member' | 'supporter'
"bh_theme"     → 'light' | 'dark'
"bh_seeded"    → boolean (prevents re-seeding)
```

### Membership Tiers
| Tier | Features |
|------|---------|
| **Free** | Browse, read posts, view public match info |
| **Member** | Create posts, like, comment, access live chat and match room |
| **Supporter** | All member features + exclusive events, supporter badge |

---

## 9. Accessibility Checklist

- [ ] Skip-to-content link on every page
- [ ] All images have descriptive `alt` text
- [ ] All form inputs have associated `<label>` elements
- [ ] Color contrast ≥ 4.5:1 for normal text, ≥ 3:1 for large text
- [ ] Focus states visible (not removed with `outline: none` without replacement)
- [ ] Hamburger menu: `aria-expanded`, `aria-controls`, focus trap
- [ ] Modals: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- [ ] Live chat: `aria-live="polite"` region
- [ ] Accordion: `aria-expanded`, correct heading hierarchy
- [ ] Poll: `role="radiogroup"`, keyboard navigable
- [ ] Theme toggle: `aria-pressed`, `aria-label`

---

## 10. Git Commit Convention

Format: `type(scope): short description`

| Type | When |
|------|------|
| `feat` | New feature or page |
| `style` | CSS-only change |
| `fix` | Bug fix |
| `refactor` | Code restructure, no behavior change |
| `docs` | README, PLAN, PRESENTATION |
| `chore` | Repo init, .gitignore, folder setup |
| `a11y` | Accessibility improvement |
| `perf` | Performance optimization |

---

## 11. Professional Responsibilities (Team Roles)

> *Since this is a solo graded project, the developer assumes all roles.*

| Role | Responsibility |
|------|---------------|
| **Project Manager** | Timeline, risk tracking, definition of done |
| **UX/UI Designer** | Design tokens, layout fidelity to Stitch screens, responsive breakpoints |
| **Front-End Developer** | HTML, CSS, JS implementation |
| **QA Engineer** | Cross-breakpoint testing, accessibility audit, Lighthouse |
| **Technical Writer** | README.md, PLAN.md, PRESENTATION.md |

---

## 12. Definition of Done

- [ ] All 9 pages render without console errors at 390px, 768px, 1440px
- [ ] Mock auth: register, login, logout, route guards work
- [ ] Membership upgrade flow changes visible features
- [ ] Feed: create, like, comment, delete, filter all function
- [ ] Countdown reaches zero gracefully
- [ ] Fixtures slider loops and is keyboard/touch-navigable
- [ ] Trophy count-up fires on scroll intersection
- [ ] History timeline filters correctly
- [ ] Squad flip/hover works on mouse and keyboard
- [ ] Dark theme persists across page navigations
- [ ] Lighthouse ≥ 90 (Performance, Accessibility, Best Practices)
- [ ] HTML validates on W3C Validator
- [ ] Git log shows ≥ 20 logical conventional commits
- [ ] README.md, PLAN.md, PRESENTATION.md complete
- [ ] Footer contains "Unofficial fan project" disclaimer

---

*Document owner: Developer | Last updated: 2026-11-05*
