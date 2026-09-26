# Phase 1: Layout and look — Plan

See `requirements.md` for scope and decisions, and `validation.md` for merge criteria.

## 1. Shared layout with header, nav, and footer

1.1 Create `src/components/nav.tsx` exporting a typed `NavItem` (`{ href: string; label: string }`), a `readonly` `navItems` array containing only `{ href: '/', label: 'Home' }`, and a `Nav` component.
1.2 `Nav` renders `<nav aria-label="Primary">` with two `<ul>`s: the first holds the site name linking to `/` in a `<strong>`, the second holds one `<li><a>` per `navItems` entry.
1.3 `Nav` takes a `currentPath` prop and sets `aria-current="page"` on the matching link.
1.4 Update `Header` in `src/components/header.tsx` to render `<header class="container">` containing `Nav`, passing `currentPath` through. The site name moves into `Nav`.
1.5 Add `class="container"` to `<main>` in `Main` and to `<footer>` in `Footer`, and give the footer playful one-line copy.
1.6 Update `Layout` in `src/layout.tsx` to take a required `currentPath` prop and pass it to `Header`.
1.7 Define each component's props as a named, exported type (`NavProps`, `HeaderProps`, `MainProps`, `LayoutProps`) instead of inline.

## 2. Pico CSS and base styles

2.1 Install `@picocss/pico` (v2) as a dependency.
2.2 In `src/app.tsx`, resolve `@picocss/pico/css/pico.min.css` with `createRequire(import.meta.url)` and `public/` with `new URL('../public', import.meta.url)`. Serve Pico at `/pico.min.css` (`serveStatic` `path` option) and `public/` by absolute `root`, so neither depends on the working directory.
2.3 In `Layout`'s `<head>`, link `/pico.min.css` before `/styles.css`.
2.4 Rewrite `public/styles.css` as overrides on top of Pico:
  - Remove base rules Pico now covers (body, typography, `overflow-wrap`, `img` `max-width`).
  - Set brand colors and text-selection color with `--pico-*` custom properties for light, OS dark, and explicit `data-theme="dark"`, meeting the contrast targets in `requirements.md`.
2.5 Override `.container` to `max-width: 75rem` with `padding-inline: var(--pico-spacing)`, replacing Pico's fixed pixel widths.
2.6 Keep a fluid `h1` size with `clamp()`, and cap `svg` and `video` at `max-width: 100%`.
2.7 Give nav and site-name links a minimum `2.75rem` height (touch target), and underline and bold `nav li a[aria-current="page"]`.
2.8 Add `.feature-grid`:
  - `display: grid` with `minmax(0, 1fr)` columns: one by default, two at `min-width: 40rem`, three at `min-width: 64rem`.
  - At two columns, an odd last card spans the full row.
  - A gap based on `--pico-spacing`.
  - No `max-width` media queries.

## 3. Home page with playful clinic copy

3.1 Update `HomePage` in `src/home.tsx` to render a hero section: an `<h1>` (keeping "Welcome to AgentClinic"), a tagline, and a short playful intro paragraph.
3.2 Below the hero, render a `<div class="feature-grid">` of three `<article>` cards, each with an `<h2>` and one or two sentences: **Ailments** (e.g. context-window fatigue), **Therapies**, and **Appointments**. The copy teases, without inviting actions that don't exist yet.
3.3 Pass `currentPath="/"` to `Layout`.

## 4. Tests

4.1 Create `src/components/nav.test.tsx`:
  - `Nav` renders `<nav aria-label="Primary">` and the site-name link to `/`.
  - It renders a link for every entry in `navItems`, matching attributes in any order.
  - `aria-current="page"` appears only on the link matching `currentPath`. This file holds the one exact-markup assertion for the current link.
4.2 Update `src/layout.test.tsx`:
  - `Header` renders `<header class="container">` containing the nav.
  - `Main` and `Footer` have the `container` class.
  - `Layout` links `/pico.min.css` before `/styles.css` in `<head>`.
  - `Layout` requires `currentPath` (a `@ts-expect-error` check, enforced by `tsc`) and passes it to the nav.
4.3 Extend `src/app.test.ts`:
  - `GET /pico.min.css` returns 200 with a `text/css` `Content-Type`.
  - On `GET /`, the Home link has `aria-current="page"` and the hero `<h1>` and tagline are present.
  - `GET /` contains three `<article>` cards with headings Ailments, Therapies, and Appointments, in order, inside `.feature-grid`.
  - Pico and `/styles.css` are still served after changing the working directory.
4.4 Update the stylesheet tests in `src/app.test.ts` for `GET /styles.css`:
  - It sets at least one `--pico-` custom property and uses `clamp(`.
  - It defines `.feature-grid` with `grid-template-columns`.
  - It overrides `.container` with a `rem` `max-width`.
  - It defines `--touch-target: 2.75rem` and applies it as the nav links' `min-height`.
  - It underlines the `aria-current="page"` nav link.
  - It has `min-width` queries at `40rem` and `64rem` and no `max-width` media queries.
4.5 Create `src/dependencies.test.ts` asserting `@picocss/pico` is in `package.json` `dependencies`.
4.6 Run `npm run validate` and confirm it passes.

## 5. Wrap-up

5.1 Run every check in `validation.md`, including the manual responsive checks, and tick each one that passes.
5.2 Check off the Phase 1 items in `specs/roadmap.md`.
5.3 Update `CHANGELOG.md`.
