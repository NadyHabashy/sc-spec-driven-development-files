# Phase 1: Layout and look — Requirements

## Scope

Give AgentClinic a shared, polished look that every later page inherits:

- A shared JSX layout with a header, a primary nav, and a footer.
- Base styling with [Pico CSS](https://picocss.com): colors, typography, and a responsive grid, with a small stylesheet of our own for brand tweaks.
- A home page with playful clinic copy: a hero plus three feature cards.

## Out of scope

- Any page other than `/` (agents, ailments, therapies, appointments, dashboard come in later phases).
- Database, forms, or client-side JavaScript.
- 404 and error pages, and the full accessibility pass (Phase 6).
- Pico's optional JavaScript, theme switcher, or custom Sass builds.
- Web fonts or image assets that require downloads; use Pico's system font stack.

## Decisions

- **Pico CSS as the base stylesheet.** Pico styles semantic HTML with very few classes, so pages stay plain Hono JSX with no build step. It's small, popular, and responsive and accessible out of the box, which fits "simple over clever" and "delightful" in `specs/mission.md`. This replaces the earlier "no CSS framework" choice; `specs/tech-stack.md` is updated to match.
- **Install from npm, serve locally.** Add `@picocss/pico` (v2) as a dependency and serve `@picocss/pico/css/pico.min.css` at `/pico.min.css` with `serveStatic`. Both Pico and `public/` are resolved from the app's module location (`createRequire`, `import.meta.url`), not the working directory, so `node dist/index.js` works from any directory. No CDN, so the app works offline at conference booths and the version is pinned in `package-lock.json`.
- **Use the standard (class-light) Pico build**, not the classless one, so we can use `.container` for centered page width. Pico's `.container` switches between fixed pixel widths (510px, 700px, …) at its own breakpoints, which breaks the tech stack's "no fixed pixel widths" rule and squeezes the two-column cards between `40rem` and `768px`. `styles.css` overrides `.container` to a fluid `max-width: 75rem` with constant side padding.
- **Our stylesheet loads after Pico.** `public/styles.css` stays and holds only overrides: brand colors through Pico's `--pico-*` custom properties (e.g. `--pico-primary`, `--pico-text-selection-color`), the container override, a fluid `h1` with `clamp()`, touch targets, the current-page nav style, and the feature grid. Rules Pico already provides (body `overflow-wrap`, `img` `max-width`) aren't repeated. `Layout` links `/pico.min.css` first, then `/styles.css`.
- **Light and dark themes follow the OS.** Pico's default `prefers-color-scheme` handling stays on, and the dark brand colors also apply to an explicit `data-theme="dark"` so a future theme switcher works. Brand colors must meet WCAG AA in both themes: link text at least 4.5:1 on the page background, and white text on every primary button background (default and hover) at least 4.5:1.
- **Build on Phase 0.** `Layout`, `Header`, `Main`, and `Footer` already exist under `src/layout.tsx` and `src/components/`. Phase 1 extends them. `<header>`, `<main>`, and `<footer>` get Pico's `container` class.
- **Nav uses Pico's idiom and shows Home only.** A new `Nav` component in `src/components/nav.tsx` renders `<nav aria-label="Primary">` with two `<ul>`s: the site name (brand) on the left and the links on the right. Only a Home link to `/` exists in this phase. The phase that ships each later page adds its link, so there are never dead links.
- **Nav items are data-driven.** `Nav` renders links from a typed array of `{ href, label }` items. `navItems` is `readonly`. The link matching the current path gets `aria-current="page"`. Pico removes nav-link underlines, so `styles.css` underlines and bolds the current link so it isn't marked by color alone. `Layout` requires a `currentPath` prop and passes it to `Header`/`Nav`; it's required (no default) so a page can't forget it and wrongly mark Home as current.
- **Home page is a hero plus three feature cards.** The hero has a playful `<h1>`, a tagline, and a short intro. The cards are Pico `<article>` cards teasing **Ailments**, **Therapies**, and **Appointments**. They're plain text in this phase, not links, because those pages don't exist yet.
- **Our own grid class, not Pico's `.grid`.** Pico's `.grid` jumps from one column straight to equal columns at `768px`. To keep the tech stack's breakpoints, cards use a `.feature-grid` class in `styles.css`: one column by default, two at `40rem`, three at `64rem`. Columns use `minmax(0, 1fr)` so long words can't stretch them, and in the two-column layout an odd last card spans the full row instead of sitting alone.
- **Humor lives in the copy, not the UX** (mission principle 5). Pico's defaults keep the layout clean and conventional.
- **Responsive per `specs/tech-stack.md`.** Our overrides are mobile-first, with `min-width` queries at `40rem` and `64rem` only and no `max-width` queries. No horizontal scroll at `320px`. Nav and site-name links have a `2.75rem` minimum touch target, set in `styles.css`.

## Context

- Mission: `specs/mission.md`. The audience is course students and conference-booth demos, so the phase must stay small enough to build live.
- Tech stack: `specs/tech-stack.md`. Hono JSX, Vitest for every automated check, `npm run validate` gates merging. Its Styling row now names Pico CSS.
- Previous phase: `specs/2026-09-24-phase-0-skeleton/`.
