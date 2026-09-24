# Phase 0: Skeleton — Validation

The branch can merge when every check below passes.

## Automated

- [ ] `npm install` completes without errors.
- [ ] `npm test` passes, including a test that `GET /` returns status 200, an HTML `Content-Type`, and a body containing `<title>AgentClinic</title>` and "Welcome to AgentClinic".
- [ ] `npm run build` compiles with strict TypeScript and no errors, and `dist/` contains no test files.

## Manual

- [ ] `npm start` (after build) serves the app; `curl http://localhost:3000/` returns the HTML home page with "Welcome to AgentClinic".
- [ ] In a browser, the tab title reads "AgentClinic" and the page shows the heading and tagline.
- [ ] `PORT=4000 npm start` serves on port 4000.
- [ ] `npm run dev` starts the server, the page shows the welcome text, and editing `src/home.tsx` reloads it without a manual restart.

## Housekeeping

- [ ] Phase 0 items are checked off in `specs/roadmap.md`.
- [ ] Nothing out of scope (layout, CSS, database, linting) was added.