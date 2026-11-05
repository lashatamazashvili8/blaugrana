# Blaugrana Hub — Unofficial FC Barcelona Fan Community

> **Unofficial Fan Project**: This website is an independent, non-commercial fan community platform created for educational and practical assessment purposes. It is **not** affiliated with, authorized, maintained, or endorsed by FC Barcelona. No official logos, copyrighted photos, or trademarked brand assets are used.

---

## 📌 Project Overview

**Blaugrana Hub** is an ad-free, responsive web platform designed exclusively for FC Barcelona supporters worldwide. The project demonstrates a modern frontend architecture built entirely with **vanilla web standards** (Semantic HTML5, CSS3 Grid/Flexbox, and native ES2022 JavaScript modules) without frameworks, bundlers, or third-party runtime dependencies.

### Key Philosophy
- **100% Ad-Free**: Pure football culture without intrusive banners, trackers, or commercial clutter.
- **Standards-Driven**: Native ES modules, CSS Custom Properties, and Semantic HTML.
- **Resilient Mock Architecture**: Client-side localStorage persistence layer mimicking authentic authentication, tier gating, and real-time community engagement.

---

## 🌟 Core Features & Pages

| Page | URL Path | Key Functionality |
|------|----------|-------------------|
| **Home** | `index.html` | Hero match countdown to next fixture, responsive fixtures/results carousel, animated trophy counter (scroll-triggered intersection observer), trending posts preview, and membership teaser. |
| **Authentication** | `pages/auth.html` | Interactive tabs (Sign In & Register), real-time client-side validation (email syntax, username length/regex, password confirmation matching, dynamic 3-stage password strength meter: Weak/Fair/Strong), demo account 1-click test fill buttons. |
| **Community Feed** | `pages/feed.html` | Post publisher with live character countdown (500 chars), optional image attachment preview (`FileReader` data URL), topic tags (`Match`, `Transfers`, `History`, `Memes`), live like toggles, expandable threaded comments with submission, post deletion for author, and topic filter chips. |
| **Live Match Center** | `pages/live.html` | Directory of live & upcoming events (Watch parties, podcasts, tactical analysis). Members-only events feature an access lock overlay with upgrade CTAs for non-members. |
| **El Clásico Match Room** | `pages/match-room.html` | Live match scoreboard header, minute-by-minute timeline with home/away styling, starting lineups (4-3-3 tactical sheet), interactive "Man of the Match" voting poll with real-time percentages, and a simulated live fan terrace chat (members-only) with incoming match reactions. |
| **Membership & Tiers** | `pages/membership.html` | Free, Soci Member, and Gold Supporter tier comparison cards, feature matrix table highlighting "No ads, ever", accessible FAQ accordion, and interactive mock modal upgrade flow that updates the user's tier immediately. |
| **Club History** | `pages/history.html` | Interactive vertical history timeline (1899 founding to the modern La Masia renaissance) filterable by Trophies, Legends, and Eras; full interactive trophy cabinet with animated stat count-up. |
| **Squad Explorer** | `pages/squad.html` | 3D interactive flip player cards with jersey numbers, positions, nationalities, and back-side performance metrics (appearances, goals, assists, clean sheets, match rating bars). Fully keyboard accessible (Enter / Space to flip). Filterable by position (GK, DEF, MID, FWD). |
| **User Profile** | `pages/profile.html` | User avatar, tier badge, member since date, bio and favorite player fields (editable in modal), community metrics, and activity tabs (My Posts with deletion, My Comments, and Liked Posts). |

---

## 🎨 Design System & Accessibility

### Color Palette
- **Deep Navy**: `#004D98` (`--color-navy`)
- **Garnet / Blaugrana Red**: `#A50044` (`--color-garnet`)
- **Gold Accent**: `#EDBB00` (`--color-gold`)
- **Background (Light)**: `#F5F5F0` (`--color-bg`)
- **Surface**: `#FFFFFF` (`--color-surface`)
- **Dark Theme Surface**: `#1c2333` / `#0d1117`

### Typography
- **Headings & Badges**: `Oswald` (Google Fonts CDN) — Condensed, bold, high-impact athletic display.
- **Body & Controls**: `Inter` (Google Fonts CDN) — Neutral, readable, clean UI font.

### Accessibility Highlights
- **Skip Link**: `#main-content` jump link on every page for keyboard and screen-reader users.
- **Focus Indicators**: Customized `:focus-visible` ring using `--color-gold` with distinct offset.
- **Focus Trapping**: Active in mobile hamburger drawer and dialog modals (`Escape` key dismiss, tab cycling).
- **ARIA Semantics**: `role="tablist"`, `aria-selected`, `aria-expanded`, `aria-controls`, `role="radiogroup"`, `aria-live="polite"` for toast notifications and live terrace chat.
- **High Contrast**: Meets WCAG 2.1 AA standards across both light and dark themes.

---

## 🔒 Mock Authentication & Security Disclaimer

> ⚠️ **SECURITY DISCLAIMER (Academic / Mock Prototype Only)**:
> - Passwords and user records are stored as unencrypted client-side objects in browser `localStorage`.
> - **DO NOT** enter real-world, sensitive passwords on this site.
> - This mock authentication system is strictly designed to showcase client-side state handling, role-based access control (RBAC), and route guarding in a static frontend environment.

### Default Test Accounts
For quick testing and grading, you can click the quick-fill buttons on `pages/auth.html` or use:

| Role | Username | Password | Email | Tier |
|------|----------|----------|-------|------|
| **Supporter** | `culerdemo` | `Demo1234!` | `demo@blaugrana.hub` | `supporter` |
| **Member** | `blaugrana_fan` | `Fan12345!` | `fan@blaugrana.hub` | `member` |
| **Free User** | `freeuser` | `Free1234!` | `free@blaugrana.hub` | `free` |

---

## 📁 Project Structure

```
barca-hub/
├── index.html                    # Landing page & Home
├── pages/
│   ├── auth.html                 # Login & Registration with real-time validation
│   ├── feed.html                 # Fan community discussion feed
│   ├── live.html                 # Live match center & events list
│   ├── match-room.html           # Live match room, poll & terrace chat
│   ├── membership.html           # Tier pricing, comparison table & upgrade flow
│   ├── history.html              # Vertical timeline & trophy cabinet
│   ├── squad.html                # 3D interactive flip player cards
│   └── profile.html              # User activity, statistics & profile editor
├── css/
│   ├── variables.css             # Design tokens (Light & Dark theme variables)
│   ├── base.css                  # Modern reset, typography, utilities & animations
│   ├── layout.css                # Sticky navbar, mobile drawer, footer, layout grid
│   ├── components.css            # Buttons, cards, modals, tabs, accordion, badges
│   └── pages/                    # Page-specific stylesheets
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
│   ├── storage.js                # LocalStorage abstraction with try/catch & array helpers
│   ├── auth.js                   # Session management, guards, login, register, tier upgrade
│   ├── theme.js                  # Dark/Light mode switcher with persistence
│   ├── ui.js                     # Toasts, hamburger drawer, modals, tabs, count-up
│   ├── main.js                   # Home page controller (countdown, carousel, trophies)
│   ├── auth-page.js              # Real-time form validation & strength meter
│   ├── feed.js                   # Feed publisher, image reader, likes & comments
│   ├── live.js                   # Live events directory & member lock overlays
│   ├── match-room.js             # MOTM poll & simulated game-day live chat
│   ├── membership.js             # Pricing cards & mock upgrade workflow
│   ├── history.js                # Historical timeline & trophy count-up
│   ├── squad.js                  # 3D card flipping & position filters
│   ├── profile.js                # Profile tabs, stats, and metadata editor
│   └── data/                     # Seed JSON datasets
│       ├── users.json
│       ├── posts.json
│       ├── comments.json
│       ├── fixtures.json
│       ├── players.json
│       ├── trophies.json
│       └── events.json
├── assets/
│   ├── icons/                    # Custom SVG crests
│   │   └── logo.svg
│   └── images/                   # Generated vector illustrations
│       ├── camp-nou-illustration.svg
│       └── trophy-illustration.svg
├── PLAN.md                       # Project plan, stages, risks, and DoD
├── README.md                     # Documentation & technical guide
└── PRESENTATION.md               # Slide-by-slide presentation outline
```

---

## 🚀 How to Run

Because this project uses native **ES Modules** (`import` / `export`), browsers require files to be served over HTTP/HTTPS rather than the direct `file://` protocol.

### Option 1: Using `npx serve`
```bash
cd barca-hub
npx serve .
# Open http://localhost:3000 in your browser
```

### Option 2: Using Python 3 Built-in HTTP Server
```bash
cd barca-hub
python3 -m http.server 8000
# Open http://localhost:8000 in your browser
```

### Option 3: VS Code Live Server
1. Open the `barca-hub` folder in VS Code.
2. Click **Go Live** in the status bar or right-click `index.html` → **Open with Live Server**.

---

## 🛠️ Challenges & Architectural Solutions

1. **Client-Side State Synchronization Across 9 Independent Pages**:
   - *Challenge*: Keeping user authentication, liked posts, comments, and membership tiers in sync across page navigations without a centralized framework store like Redux.
   - *Solution*: Designed `js/storage.js` as an encapsulated singleton. All reads, mutations, and array updates flow through standard CRUD methods, backed by automatic initial data seeding (`seedIfNeeded()`) from JSON fixtures.

2. **Accessible 3D Card Flipping**:
   - *Challenge*: Standard CSS 3D flip effects on `:hover` fail on mobile touch screens and break accessibility for keyboard-only users.
   - *Solution*: Added dual activation triggers: CSS `preserve-3d` with both mouse hover and an `.is-flipped` toggle class attached to `Enter` and `Space` keydown events (`tabindex="0"`).

3. **Subdirectory vs Root Relative Routing**:
   - *Challenge*: Links between root `index.html` and `pages/*.html` can break depending on whether the project is served at the domain root or a subdirectory.
   - *Solution*: Normalized all hrefs and redirects to strict relative hierarchy paths (`pages/feed.html` from root; `../index.html` and `feed.html` from pages).

4. **Zero-Framework Responsive Fixture Carousel**:
   - *Challenge*: Creating a smooth, swipeable, and keyboard-accessible fixtures slider without relying on heavy third-party libraries like Swiper.
   - *Solution*: Built a vanilla CSS Transform + Flexbox carousel with debounced window resize observers, touch start/end swipe detection, and ARIA dot navigation.

---

## 🔮 Future Roadmap (Production Transition)

In a future commercial or scalable deployment, the client-side mock layer would transition into a production-grade full-stack architecture:

1. **Backend**: NestJS (TypeScript) or Go REST & GraphQL API with clean architecture.
2. **Database**: PostgreSQL with Prisma ORM for relational integrity (Users, Posts, Comments, Fixtures, Subscriptions).
3. **Authentication**: Argon2 / Bcrypt password hashing, HTTP-only JWT cookies, OAuth 2.0 (Google & Apple Sign-In).
4. **Real-Time Match Chat**: Scalable WebSockets (Socket.io or Redis Pub/Sub) with channel rooms per match.
5. **CDN & Assets**: Cloudflare CDN for edge caching and WebP/AVIF image transformations.

---

## 📜 License & Copyright Notice

This project is open-source under the MIT License for educational and non-commercial portfolio purposes. FC Barcelona, Camp Nou, and related trademarks belong to their respective owners.
