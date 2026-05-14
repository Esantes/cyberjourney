# PROJECT_RULES.md

**Project:** CyberJourney Tracker
**Type:** Personal portfolio project. Single developer. No team, no users, no SaaS.
**Stack:** React 18 · Vite · TailwindCSS · Framer Motion · React Router 6 · Context + reducer · LocalStorage

This is the rulebook I follow when working on this codebase. It exists for two reasons: to keep the code readable when I come back in three months, and to prove I can hold a line. Where this file disagrees with anything else in the repo, this file wins.

It is **deliberately not** an enterprise spec. There are no phase gates, no team review processes, no compliance checklists. There is one person here — and these are the rules he agrees to follow.

---

## 0 · Operating principles

1. **Local-first, always.** Every persisted value goes through the storage adapter. Components never touch `localStorage` directly. Even if I never add a second driver, the seam stays.
2. **One source of truth per concern.** URL for navigation. The store for domain data. Component state for transient UI. No syncing the same value across two of these.
3. **Tiers are one-way.** `pages → features → ui → lib`. Never the reverse. A `ui/` component importing from `features/` is a bug.
4. **Boring code beats clever code.** Optimise for me-in-three-months, who will have forgotten everything.
5. **Delete fearlessly.** Anything not used in a real page gets removed. Demo code lives behind a flag or in `data/seed.dev.js`.
6. **Build for myself first.** If a feature wouldn't be useful for *me* tracking *my own* studies, it doesn't ship.

---

## 1 · Folder structure

```
src/
  app/          → app-level wiring (router, providers, layout shells)
  pages/        → route-level views, thin
  features/     → vertical slices (one folder per feature)
    trackers/   → shared tracker domain (registry, store, math, components)
    overthewire/ tryhackme/ hackthebox/ portswigger/
    journal/ skills/ timeline/
  ui/           → presentation primitives (Card, Button, Badge, …)
  hooks/        → reusable hooks
  lib/          → framework-agnostic utilities (storage, date, id, cn)
  data/         → schemas, seeds, migrations
  styles/       → tokens.css, globals.css
```

**Rule:** before adding a new top-level folder, justify it to myself in the commit message. The shape above is intentional.

---

## 2 · File & module naming

| Kind                 | Rule                                          | Example                       |
| -------------------- | --------------------------------------------- | ----------------------------- |
| Folder               | `kebab-case`, plural for collections          | `features/trackers/`          |
| Component file       | `PascalCase.jsx`, one component per file      | `TrackerCard.jsx`             |
| Hook file            | `useCamelCase.js`                             | `useLocalStorage.js`          |
| Utility file         | `camelCase.js`                                | `storageAdapter.js`           |
| Config file          | `slug.config.js`                              | `htb.config.js`               |
| Adapter file         | `slug.adapter.js`                             | `psw.adapter.js`              |
| Test file            | `name.test.js` sibling, or `__tests__/`       | `progress.math.test.js`       |
| Route slug           | short lowercase code                          | `otw · thm · htb · psw`       |
| Store action         | `verbObject()` — no `set` prefix on domain    | `logCompletion(id)`           |
| Event type           | `SCREAMING_SNAKE`                             | `CHALLENGE_COMPLETED`         |
| CSS variable         | `--kebab`, namespaced where useful            | `--card-bg`                   |

**One component per file.** If a sub-component is only used in its parent, it may live in the same file but must not be exported.

**No default exports** except inside `pages/` (React Router likes them there).

---

## 3 · Coding conventions

### 3.1 JavaScript

- Modern ES features are fine; Vite ships through. No transpile-target gymnastics.
- Prefer `const`. `let` is allowed; `var` is not.
- Arrow functions for callbacks; `function` declarations for top-level helpers (better stack traces).
- We use semicolons.
- Imports in this order, with a blank line between groups:
  1. Third-party
  2. `@/lib`, `@/hooks`, `@/ui`
  3. `@/features/*`
  4. Local relative imports
- Path alias: `@` resolves to `src/`. No `../../../` chains beyond two levels.

### 3.2 React

- Function components only. No class components.
- Components are **named function exports**:
  ```js
  export function TrackerCard(props) { … }
  ```
- Props are destructured at the signature. `className` and `...rest` are always last.
- Side effects (storage, listeners, timers) live in **hooks**, not components.
- `useEffect` is a last resort. If derivable from props, derive it. If event-driven, handle it in the event.
- Keys for lists must be stable IDs, never array indices.
- Avoid `useMemo`/`useCallback` unless profiling shows a real win.

### 3.3 Hooks

- One concern per hook. If a hook needs an "options" object with three flags, split it.
- Hooks return either a value, a `[value, setValue]` tuple, or an object with named members. Pick one per hook and stick to it.
- Hooks never throw for "expected" empty states — they return `null` / `undefined` and document it.

### 3.4 Store

- One store, one `StoreProvider`. No store-per-feature.
- Actions live next to the provider and mutate via setState callbacks.
- Selectors live in `features/trackers/selectors.js` once there's a second consumer for one. Components call selectors, never read raw store state through ad-hoc filtering.
- All writes go through the store. Components never call the storage driver directly.

### 3.5 Storage adapter

- The only module that may import a driver (`localStorageDriver`, future others) is `lib/storage/storageAdapter.js`.
- The adapter exposes: `get(key)`, `set(key, value)`, `remove(key)`, `list(prefix)`.
- A failed parse on load triggers a graceful reset to defaults with a recovery banner. Never crash the app on bad storage.

### 3.6 Schemas & migrations

- Persisted shapes are validated on load.
- Each schema change requires a `data/migrations/v00X.js`. No exceptions, even cosmetic renames. This file exists precisely because skipping it once already cost me a Saturday.

### 3.7 Errors

- User-facing errors surface through the toast queue. Never `alert()`, never `throw` for UX.
- Developer-facing errors use `console.error` with a `[domain]` prefix, e.g. `console.error('[storage]', err)`.
- The app must never crash on bad localStorage data; the boot path treats parse failure as a "first run" with a recovery banner.

### 3.8 Testing

- Pure functions in `lib/` and `progress.math.js` get unit tests as I touch them.
- UI primitives don't get tests beyond a click-doesn't-crash smoke test.
- I am not chasing coverage. I am chasing confidence in the math.

### 3.9 Linting & formatting

- ESLint with `react`, `react-hooks`, `jsx-a11y`. Warnings I want to fix; errors block.
- Prettier with default config, 100-col line width.
- No file gets committed with `eslint-disable` unless a comment explains why and it's scoped to one line.

---

## 4 · UI consistency rules

These are the lines I refuse to cross — even on Sundays, even at 1am.

### 4.1 Tokens

- **No literal colors in JSX or CSS** outside `styles/tokens.css`. Use Tailwind classes that resolve to tokens, or `var(--token)`.
- **Spacing scale only**: `2 · 4 · 8 · 12 · 16 · 20 · 24 · 32 · 48 · 64`. Off-scale values are not allowed.
- **Radii**: `3px` (chips), `4px`/`8px` (cards), `12px`+ (overlays). No pill radii on rectangles.
- **Borders before shadows.** Use a 1px `--line` border to separate surfaces. Shadows are reserved for floating overlays.

### 4.2 Color use

- One accent per screen carries the focal weight. Use `--phos` for "home" surfaces; tracker-specific accents only inside that tracker's pages.
- Accents do **not** color body text or large fills. They appear on: 2px rails, ring strokes, badges, single focal CTAs.
- Status uses semantic tokens, never raw color.

### 4.3 Typography

- Two families only: **Space Grotesk** (UI / prose) and **JetBrains Mono** (data / labels / code).
- Monospace is structural, not decorative. It labels things — file paths, IDs, eyebrows, timestamps — never prose.
- Headings use weight + size, not color, for hierarchy.
- `text-wrap: balance` on display headings, `pretty` on body paragraphs.

### 4.4 Cards

- One primitive: `<Card>` with `<Card.Header>`, `<Card.Body>`, `<Card.Footer>`, optional accent rail.
- Variants are composition, not boolean props. Build `TrackerCard`, `StatCard`, etc. from the primitive.
- **Cards never set their own width.** Layout is the parent's job.
- A card has at most one focal element (number, ring, action).

### 4.5 Buttons & inputs

- Three button tones: `primary` (phos), `ghost` (default), `mag` (destructive / negative).
- All form controls share a height token: 36px desktop, 40–44px mobile.
- Every input is wrapped in a label + helper slot. No naked inputs.

### 4.6 Layout

- Page max-width sits at 1320px. Wider screens get more side padding, not more content per row.
- Grids use Tailwind's grid utilities with the project's spacing scale.
- Sticky page headers are 56px. Safe-area insets respected on iOS.

### 4.7 Motion

- All animation goes through Framer Motion or token-driven CSS transitions. No bespoke `setTimeout` choreography.
- Duration tokens: `--dur-fast 120ms`, `--dur-base 180ms`, `--dur-slow 240ms`, `--dur-modal 280ms`.
- **Reduced motion is enforced.** Honor `prefers-reduced-motion`; in reduced mode, only opacity changes are allowed.
- One glow per screen, maximum. No ambient infinite loops. The grid does not pulse.

### 4.8 Iconography

- One icon set (custom inline SVG, 1.6 stroke weight). No mixing.
- Icons are 14–18px in dense rows, 20–24px in page chrome. No other sizes.
- Icons never carry meaning alone — they pair with a label or `aria-label`.
- **No emoji** in the product UI.

### 4.9 Empty, loading, error states

- **Every list view ships three states**: populated, empty, skeleton. No "we'll add the empty state later."
- Skeletons mirror the final layout exactly. No generic grey blocks.
- Empty states explain the situation and offer one action.

### 4.10 Accessibility

- Tab order matches visual order; no `tabindex > 0`.
- Color contrast meets WCAG AA on all token pairings.
- All interactive elements have a visible focus ring.
- All non-decorative icons have `aria-label`. Decorative icons have `aria-hidden="true"`.

---

## 5 · State management rules

| Ring                 | Tool                  | Use for                                       |
| -------------------- | --------------------- | --------------------------------------------- |
| R1 — Local           | `useState`/`useReducer` | Form inputs, hover, open/close            |
| R2 — Cross-cut       | React Context         | Theme, motion pref, hotkey scope, toasts      |
| R3 — Domain          | Store + adapter       | Trackers, journal, events, settings           |

**Promotion path:** start at R1. Promote to R2 only when two unrelated subtrees need the value. Promote to R3 only when the value should survive reload.

---

## 6 · Routing rules

- Hash-based router (or React Router 6) with nested routes under a single `<AppShell/>`.
- Tabs, drawers, and modals worth linking to are URL-driven (`?tab=…`).
- Every route gets a 404 fallback that matches the design system.

---

## 7 · Mobile rules

- Designed at 360px first.
- Tab bar < `lg`, side rail ≥ `lg`. Same destinations, different chrome.
- 44px minimum hit target on touch.
- Drawers replace Modals below `sm`.
- No horizontal scrolling outside explicit carousels.
- Body text ≥ 15px; smallest label ≥ 13px; line-height ≥ 1.5.

---

## 8 · Tracker integration rules

- Each platform is a folder under `features/<slug>/` with:
  - `<slug>.config.js` — catalog + metadata
  - `<slug>.adapter.js` — implements the tracker contract
  - `<slug>Detail.jsx` — detail page (composed of shared tracker components)
- The shared UI in `features/trackers/components/` is **the only** rendering layer for tracker content.
- Adding a fifth platform requires no edits to `ui/`, the store, or any other tracker folder.

---

## 9 · Git rules (just for me)

- Branches: `feat/<short>`, `fix/<short>`, `chore/<short>`, `refactor/<short>`.
- Commits in imperative present: `add tracker registry`, not `added tracker registry`.
- One concern per commit. Reformatting + behavior changes never share a commit.
- Before pushing, ask the same question a reviewer would: *did I just introduce a literal color, off-scale spacing, or a `localStorage` call outside the adapter?* If yes, fix it before pushing.

---

## 10 · Things I will not do

These are the lines that keep this project a tracker, not a startup-shaped time-sink.

- **No accounts, no auth, no multi-tenancy.** This is one person's tracker.
- **No payment integrations, no pricing tiers, no "trial" anything.**
- **No public profile pages, no leaderboards, no social.** I track honestly, or it's worthless.
- **No admin dashboard, no role system.** No users to administrate.
- **No analytics in the product.** A local event log is enough; nothing leaves the device.
- **No CSS-in-JS, no UI kit library.** Tailwind + `tokens.css` is the system. Ours.
- **No emoji in the product UI.**
- **No animated backgrounds, no rainbow gradients, no glow-on-everything.**
- **No "temporary" hacks that aren't tracked as `// TODO:` with a date.**

---

## 11 · What this project is, in one paragraph

A small React app that I use to track my cybersecurity studies. The code is what I am proud of — it is the part I show people. The product on top of it is what I use myself. There is no third audience. If a decision has to be made between "good for the codebase" and "good for hypothetical users," good for the codebase wins, because the codebase is the real point.

---

*End of rules. If something isn't covered, mirror the closest existing pattern and amend this file when I get back.*
