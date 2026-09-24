# Phase 0: Skeleton — Validation

The branch can merge when every check below passes.

## Automated

- [x] `npm install` completes without errors.
- [x] `npm test` passes, including a test that `GET /` returns status 200, an HTML `Content-Type`, and a body containing `<title>AgentClinic</title>`, "Welcome to AgentClinic", a `<header>`, `<main>`, and `<footer>`, and a link to `/styles.css`; and a test that `GET /styles.css` returns status 200 with a `text/css` `Content-Type`.
- [x] `npm run build` compiles with strict TypeScript and no errors, and `dist/` contains no test files.

## Manual

- [x] `npm start` (after build) serves the app; `curl http://localhost:3000/` returns the HTML home page with "Welcome to AgentClinic".
- [ ] In a browser, the tab title reads "AgentClinic", the page shows the header, heading, tagline, and footer, and the styles from `styles.css` are applied.
- [x] `PORT=4000 npm start` serves on port 4000.
- [x] `npm run dev` starts the server, the page shows the welcome text, and editing `src/home.tsx` reloads it without a manual restart.

## Housekeeping

- [x] Phase 0 items are checked off in `specs/roadmap.md`.
- [x] `Header`, `Main`, and `Footer` each live in their own file under `src/components/`, and `src/layout.tsx` imports them.
- [x] Nothing out of scope (navigation, design system, database, linting) was added.