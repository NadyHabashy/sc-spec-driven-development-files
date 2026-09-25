# Phase 0: Skeleton — Requirements

## Context

AgentClinic is a server-rendered TypeScript web app (see `specs/mission.md` and `specs/tech-stack.md`). The repo currently has only a `package.json` with a `build` script, a CommonJS `tsconfig.json`, and a placeholder `src/index.ts` that logs a message.

Phase 0 is the first shippable increment from `specs/roadmap.md`: a running Hono server with one page and passing Vitest tests. Everything later builds on it.

## Scope

In scope:

- Install runtime deps: `hono`, `@hono/node-server`.
- Install dev deps: `tsx`, `vitest`, `@types/node`.
- Serve a minimal AgentClinic home page at `GET /`: a valid HTML document rendered with Hono JSX, titled "AgentClinic", with an `<h1>` "Welcome to AgentClinic" and a one-line tagline.
- A main `Layout` component built from three subcomponents, `Header`, `Main`, and `Footer`, each in its own file.
- A stylesheet at `public/styles.css`, served at `/styles.css` and linked from the layout.
- npm scripts: `dev`, `build`, `start`, `test`, `validate`.
- Vitest tests backing every automated check in `validation.md`: route tests using Hono's `app.request()` and render tests for the layout subcomponents.
- Check off Phase 0 items in `specs/roadmap.md`.

Out of scope (later phases):

- Navigation links, a full design system (colors, typography, responsive grid), and the full playful home page copy (Phase 1). Phase 0 ships only the layout structure and base styles.
- Database, migrations, seeds (Phase 2).
- Prettier and ESLint setup.
- htmx or any client-side JavaScript.

## Decisions

| Decision | Choice | Why |
|---|---|---|
| App structure | `src/app.tsx` exports the Hono app; `src/index.ts` starts the Node server | Tests import the app and call `app.request()` without opening a port |
| Module system | ESM: `"type": "module"` in `package.json`; tsconfig `module`/`moduleResolution` = `NodeNext` | Hono and Vitest are ESM-first; avoids CJS interop friction |
| TS target | `ES2022` or newer | Current Node LTS supports it natively |
| JSX | tsconfig `jsx: "react-jsx"`, `jsxImportSource: "hono/jsx"` | Server-rendered JSX for the home page now, and the shared layout in Phase 1 |
| Home page | `HomePage` component in `src/home.tsx`, rendered inside `Layout` and returned via `c.html()` | Pages supply only their content; the layout owns the document shell |
| Layout | `Layout` in `src/layout.tsx` renders the document with `lang`, charset, viewport, `<title>`, and the stylesheet link | One place for the page shell; semantic landmarks for accessibility |
| Layout subcomponents | One file each: `src/components/header.tsx`, `src/components/main.tsx`, `src/components/footer.tsx`, imported by `Layout` | Small, focused files that are easy to find and change independently |
| Stylesheet | Plain CSS in `public/styles.css`, served with `serveStatic` from `@hono/node-server/serve-static`, linked with `<link rel="stylesheet">` | Tech-stack choice of plain CSS; no CSS build step |
| Port | `PORT` env var, default `3000` | Tech-stack convention: config from env vars with sensible defaults |
| Strictness | Keep `strict: true` | Mission principle: reliable by default |
| Tests location | `src/app.test.ts` and `src/layout.test.tsx`, next to the code | Tech-stack convention |
| Validation | Automated checks in `validation.md` are Vitest tests; `npm run validate` type-checks all of `src/` (tests included) and runs them | Tech-stack convention: a phase merges only when `validate` passes |
| TypeScript configs | `tsconfig.json` covers all of `src/` for type-checking and Vitest; `tsconfig.build.json` extends it and excludes test files | Tests are type-checked and get the Hono JSX settings, but never land in `dist/` |
| Build output | `tsc -p tsconfig.build.json` to `dist/`; test files excluded from the build | `npm start` runs `node dist/index.js` |

## Scripts

| Script | Command |
|---|---|
| `dev` | `tsx watch src/index.ts` |
| `build` | `tsc -p tsconfig.build.json` |
| `start` | `node dist/index.js` |
| `test` | `vitest run` |
| `validate` | `tsc --noEmit && vitest run` |