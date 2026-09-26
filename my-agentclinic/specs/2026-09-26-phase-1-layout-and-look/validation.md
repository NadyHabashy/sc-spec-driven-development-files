# Phase 1: Layout and look — Validation

Phase 1 is ready to merge when every check below passes.

## Automated checks (Vitest)

Each check is backed by a Vitest test and runs as part of `npm run validate`.

### Nav (`src/components/nav.test.tsx`)
- [ ] `Nav` renders a `<nav>` with `aria-label="Primary"`.
- [ ] It renders the site-name link to `/`.
- [ ] It renders one link per entry in `navItems`, and `navItems` contains only Home (`/`) in this phase.
- [ ] Only the link whose `href` matches `currentPath` has `aria-current="page"`.

### Layout (`src/layout.test.tsx`)
- [ ] `Header` renders `<header class="container">` containing the primary nav.
- [ ] `Main` and `Footer` render with the `container` class.
- [ ] `Layout` links `/pico.min.css` before `/styles.css` in `<head>`.
- [ ] `Layout` defaults `currentPath` to `/`.
- [ ] Phase 0 layout checks still pass: `lang`, charset, viewport meta, title, `<header>`/`<main>`/`<footer>` in order, and children inside `<main>`.

### Pico and home page (`src/app.test.ts`)
- [ ] `GET /pico.min.css` returns 200 with a `text/css` `Content-Type`.
- [ ] `GET /` returns 200 with an HTML `Content-Type`.
- [ ] The body contains "Welcome to AgentClinic" in an `<h1>` and the tagline.
- [ ] The Home nav link has `aria-current="page"`.
- [ ] The body contains a `.feature-grid` element holding three `<article>` cards with `<h2>` headings Ailments, Therapies, and Appointments.

### Stylesheet (`src/app.test.ts`)
- [ ] `GET /styles.css` returns 200 with a `text/css` `Content-Type`.
- [ ] It sets at least one `--pico-` custom property and uses `clamp(`.
- [ ] It defines `.feature-grid` with `grid-template-columns`.
- [ ] It has `min-width` media queries at `40rem` and `64rem` and no `max-width` media queries.

### Gate
- [ ] `npm run validate` passes (type-check of all `src/`, tests included, plus the Vitest suite).
- [ ] `@picocss/pico` is listed under `dependencies` in `package.json`.

## Manual checks

Run `npm run dev` and open `http://localhost:3000/` in a current evergreen browser.

- [ ] **Phone (`320px`)**: no horizontal scroll; brand and nav fit or wrap cleanly; cards stack in one column; nav link tap target is at least 44px tall.
- [ ] **Tablet (`768px`)**: brand and nav sit on one row; cards show in two columns.
- [ ] **Desktop (`1280px`)**: cards show in three columns; content is centered in Pico's container.
- [ ] **Light and dark**: switch the OS color scheme; text, links, and cards stay readable in both.
- [ ] **Offline**: with the network disabled, the page still loads Pico styles (served locally, no CDN).
- [ ] Keyboard: tabbing reaches the site-name and nav links with a visible focus outline.
- [ ] The copy reads as playful while the layout stays clean and easy to scan.
