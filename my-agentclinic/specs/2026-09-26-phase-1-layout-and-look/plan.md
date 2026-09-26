# Phase 1: Layout and look — Plan

See `requirements.md` for scope and decisions, and `validation.md` for merge criteria.

## 1. Shared layout with header, nav, and footer

1.1 Create `src/components/nav.tsx` exporting a typed `NavItem` (`{ href: string; label: string }`), a `navItems` array containing only `{ href: '/', label: 'Home' }`, and a `Nav` component.
1.2 `Nav` renders `<nav aria-label="Primary">` with two `<ul>`s: the first holds the site name linking to `/` in a `<strong>`, the second holds one `<li><a>` per `navItems` entry.
1.3 `Nav` takes a `currentPath` prop and sets `aria-current="page"` on the matching link.
1.4 Update `Header` in `src/components/header.tsx` to render `<header class="container">` containing `Nav`, passing `currentPath` through. The site name moves into `Nav`.
1.5 Add `class="container"` to `<main>` in `Main` and to `<footer>` in `Footer`, and give the footer playful one-line copy.
1.6 Update `Layout` in `src/layout.tsx` to accept an optional `currentPath` prop (default `/`) and pass it to `Header`.

## 2. Pico CSS and base styles

2.1 Install `@picocss/pico` (v2) as a dependency.
2.2 In `src/app.tsx`, serve `node_modules/@picocss/pico/css/pico.min.css` at `/pico.min.css` with `serveStatic` (using its `path` option).
2.3 In `Layout`'s `<head>`, link `/pico.min.css` before `/styles.css`.
2.4 Rewrite `public/styles.css` as overrides on top of Pico: remove base rules Pico now covers (body, typography, container width), and set brand colors with `--pico-*` custom properties on `:root`, checking they read well in both light and dark themes.
2.5 Keep a fluid `h1` size with `clamp()`, media capped at `max-width: 100%`, and long-word wrapping.
2.6 Give nav and site-name links a minimum `2.75rem` height (touch target).
2.7 Add `.feature-grid`: `display: grid`, one column by default, two columns at `min-width: 40rem`, three at `min-width: 64rem`, with a gap based on `--pico-spacing`. Use no `max-width` media queries.

## 3. Home page with playful clinic copy

3.1 Update `HomePage` in `src/home.tsx` to render a hero section: an `<h1>` (keeping "Welcome to AgentClinic"), a tagline, and a short playful intro paragraph.
3.2 Below the hero, render a `<div class="feature-grid">` of three `<article>` cards, each with an `<h2>` and one or two sentences: **Ailments** (e.g. context-window fatigue), **Therapies**, and **Appointments**.
3.3 Pass `currentPath="/"` to `Layout`.

## 4. Tests

4.1 Create `src/components/nav.test.tsx`: `Nav` renders `<nav aria-label="Primary">`, the site-name link to `/`, a link for every entry in `navItems`, and `aria-current="page"` only on the link matching `currentPath`.
4.2 Update `src/layout.test.tsx`:
  - `Header` renders `<header class="container">` containing the nav.
  - `Main` and `Footer` have the `container` class.
  - `Layout` links `/pico.min.css` before `/styles.css` in `<head>`.
  - `Layout` defaults `currentPath` to `/`.
4.3 Extend `src/app.test.ts`:
  - `GET /pico.min.css` returns 200 with a `text/css` `Content-Type`.
  - On `GET /`, the Home link has `aria-current="page"` and the hero `<h1>` and tagline are present.
  - `GET /` contains three `<article>` cards with headings Ailments, Therapies, and Appointments inside `.feature-grid`.
4.4 Update the stylesheet tests in `src/app.test.ts` for `GET /styles.css`:
  - It sets at least one `--pico-` custom property and uses `clamp(`.
  - It defines `.feature-grid` with `grid-template-columns`.
  - It has `min-width` queries at `40rem` and `64rem` and no `max-width` media queries.
4.5 Run `npm run validate` and confirm it passes.

## 5. Wrap-up

5.1 Run every check in `validation.md`, including the manual responsive checks.
5.2 Check off the Phase 1 items in `specs/roadmap.md`.
5.3 Update `CHANGELOG.md`.
