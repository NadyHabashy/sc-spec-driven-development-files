# Phase 1: Layout and look — Validation

Phase 1 is ready to merge when every check below passes.

## Automated checks (Vitest)

Each check is backed by a Vitest test and runs as part of `npm run validate`.

### Nav (`src/components/nav.test.tsx`)
- [x] `Nav` renders a `<nav>` with `aria-label="Primary"`.
- [x] It renders the site-name link to `/`.
- [x] It renders one link per entry in `navItems`, and `navItems` contains only Home (`/`) in this phase.
- [x] Only the link whose `href` matches `currentPath` has `aria-current="page"`.

### Layout (`src/layout.test.tsx`)
- [x] `Header` renders `<header class="container">` containing the primary nav.
- [x] `Main` and `Footer` render with the `container` class.
- [x] `Layout` links `/pico.min.css` before `/styles.css` in `<head>`.
- [x] `Layout` requires `currentPath` (type-checked) and passes it to the nav.
- [x] Phase 0 layout checks still pass: `lang`, charset, viewport meta, title, `<header>`/`<main>`/`<footer>` in order, and children inside `<main>`.

### Pico and home page (`src/app.test.ts`)
- [x] `GET /pico.min.css` returns 200 with a `text/css` `Content-Type`.
- [x] Pico and `/styles.css` are served regardless of the working directory.
- [x] `GET /` returns 200 with an HTML `Content-Type`.
- [x] The body contains "Welcome to AgentClinic" in an `<h1>` and the tagline.
- [x] The Home nav link has `aria-current="page"`.
- [x] The body contains a `.feature-grid` element holding three `<article>` cards with `<h2>` headings Ailments, Therapies, and Appointments.

### Stylesheet (`src/app.test.ts`)
- [x] `GET /styles.css` returns 200 with a `text/css` `Content-Type`.
- [x] It sets at least one `--pico-` custom property and uses `clamp(`.
- [x] It defines `.feature-grid` with `grid-template-columns`.
- [x] It overrides `.container` with a `rem` `max-width`.
- [x] Nav links have a `2.75rem` minimum height via `--touch-target`.
- [x] The `aria-current="page"` nav link is underlined.
- [x] It has `min-width` media queries at `40rem` and `64rem` and no `max-width` media queries.

### Dependencies (`src/dependencies.test.ts`)
- [x] `@picocss/pico` is listed under `dependencies` in `package.json`.

### Gate
- [x] `npm run validate` passes (type-check of all `src/`, tests included, plus the Vitest suite).

## Manual checks

Run `npm run dev` and open `http://localhost:3000/` in a current evergreen browser.

- [x] **Phone (`320px`)**: no horizontal scroll; brand and nav fit or wrap cleanly; cards stack in one column; nav link tap target is at least 44px tall.
- [x] **Tablet (`768px`)**: brand and nav sit on one row; cards show in two columns, with the third spanning the row.
- [x] **Desktop (`1280px`)**: cards show in three columns; content is centered in the container.
- [x] **Light and dark**: switch the OS color scheme; text, links, and cards stay readable in both, and white text on primary button backgrounds is at least 4.5:1.
- [x] **Offline**: the page requests nothing outside its own origin, so Pico loads without a network (served locally, no CDN).
- [x] Keyboard: tabbing reaches the site-name and nav links with a visible focus ring.
- [x] The current page's nav link is distinguishable without relying on color (underlined).
- [x] The copy reads as playful while the layout stays clean and easy to scan.

Manual checks were run in headless Chrome 153 with device-metrics emulation at each width and emulated `prefers-color-scheme`, measuring scroll width, link heights, card positions, focus styles, and network requests.
