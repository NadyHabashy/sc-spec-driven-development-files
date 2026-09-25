# Phase 0: Skeleton — Validation

The branch can merge when every check below passes.

## Automated (Vitest)

Run with `npm run validate`, which type-checks all of `src/` (tests included) and runs the Vitest suite.

- [x] `GET /` returns status 200, an HTML `Content-Type`, and a body containing `<title>AgentClinic</title>` and "Welcome to AgentClinic" (`src/app.test.ts`).
- [x] `GET /` renders a `<header>`, `<main>`, and `<footer>`, and links `/styles.css` (`src/app.test.ts`).
- [x] `GET /styles.css` returns status 200 with a `text/css` `Content-Type` (`src/app.test.ts`).
- [x] `Header`, `Main`, and `Footer` each render from their own file under `src/components/` (`src/layout.test.tsx`).
- [x] `Layout` renders `lang="en"`, charset and viewport meta tags, an HTML-escaped `<title>` from its `title` prop, the stylesheet link in `<head>`, and `<header>`, `<main>` (containing its children), and `<footer>` in order (`src/layout.test.tsx`).

## Build

- [x] `npm install` completes without errors.
- [x] `npm run build` compiles with strict TypeScript and no errors, and `dist/` contains no test files.

## Manual

- [x] `npm start` (after build) serves the app; `curl http://localhost:3000/` returns the HTML home page with "Welcome to AgentClinic".
- [ ] In a browser, the tab title reads "AgentClinic", the page shows the header, heading, tagline, and footer, and the styles from `styles.css` are applied.
- [x] `PORT=4000 npm start` serves on port 4000.
- [x] `npm run dev` starts the server, the page shows the welcome text, and editing `src/home.tsx` reloads it without a manual restart.

## Housekeeping

- [x] Phase 0 items are checked off in `specs/roadmap.md`.
- [x] Nothing out of scope (navigation, design system, database, linting) was added.