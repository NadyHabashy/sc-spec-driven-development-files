# Phase 0: Skeleton — Plan

See `requirements.md` for scope and decisions, and `validation.md` for merge criteria.

## 1. Dependencies and scripts

1.1 Install `hono` and `@hono/node-server` as dependencies.
1.2 Install `tsx`, `vitest`, and `@types/node` as dev dependencies.
1.3 Add `"type": "module"` to `package.json`.
1.4 Add `dev`, `start`, and `test` scripts (keep `build`).
1.5 Update `tsconfig.json`: `target` ES2022, `module`/`moduleResolution` NodeNext, Hono JSX settings, exclude `*.test.ts` from the build.

## 2. Hono app and `/` route

2.1 Create `src/app.ts` that exports a Hono app with `GET /` returning "Welcome to AgentClinic".
2.2 Replace `src/index.ts` with a server entry that serves the app via `@hono/node-server` on `PORT` (default 3000) and logs the URL.

## 3. Minimal home page

3.1 Create `src/home.tsx` with a `HomePage` JSX component that renders a full HTML document: `<!doctype html>`, `lang="en"`, UTF-8 charset, viewport meta, and `<title>AgentClinic</title>`.
3.2 In the body, render an `<h1>` "Welcome to AgentClinic" and a one-line tagline (e.g. "Where hard-working AI agents get relief from their humans.").
3.3 Update `GET /` in `src/app.ts` (renamed to `src/app.tsx` if needed) to return `HomePage` via `c.html()`.

## 4. Main layout and stylesheet

4.1 Create each layout subcomponent in its own file under `src/components/`: `Header` in `header.tsx` (site name linking to `/`), `Main` in `main.tsx` (wraps page content in `<main>`), and `Footer` in `footer.tsx` (a one-line footer).
4.2 Create `src/layout.tsx` with a `Layout` component that imports `Header`, `Main`, and `Footer`, takes a `title` and `children`, and renders the full HTML document (`lang`, charset, viewport, `<title>`) with the three subcomponents in the body.
4.3 Create `public/styles.css` with base styles for the body, header, main, and footer, using CSS custom properties for colors.
4.4 In `src/app.tsx`, import `serveStatic` from `@hono/node-server/serve-static` and serve `public/` so the stylesheet is available at `/styles.css`.
4.5 Link the stylesheet from the `Layout` `<head>` with `<link rel="stylesheet" href="/styles.css">`.
4.6 Update `HomePage` in `src/home.tsx` to render its heading and tagline inside `Layout`.

## 5. Route tests

5.1 Create `src/app.test.ts` that calls `app.request('/')`.
5.2 Assert status 200, an HTML `Content-Type`, and that the body contains `<title>AgentClinic</title>` and "Welcome to AgentClinic".
5.3 Assert the body contains a `<header>`, `<main>`, and `<footer>`, and a link to `/styles.css`.
5.4 Assert `GET /styles.css` returns status 200 with a `text/css` `Content-Type`.
5.5 Run `npm test` and confirm it passes.

## 6. Roadmap update

6.1 Run every check in `validation.md`.
6.2 Check off the Phase 0 items in `specs/roadmap.md`.