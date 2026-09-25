# Tech Stack

## Summary

A server-side TypeScript web app: **Node.js + Hono** with server-rendered JSX, backed by **SQLite**, with minimal client-side JavaScript.

## Choices

| Area | Choice | Why |
|---|---|---|
| Language | TypeScript (strict mode) | Mary's requirement; types across server, views, and data |
| Runtime | Node.js (current LTS) | Popular and stable |
| Web framework | [Hono](https://hono.dev) with `@hono/node-server` | Small, fast, well-typed, widely used, built-in JSX rendering |
| Views | Hono JSX (server-rendered) | Type-checked templates with no frontend build step |
| Styling | Plain modern CSS (custom properties, grid, flexbox) | Attractive and responsive in evergreen browsers without a CSS framework |
| Interactivity | Progressive enhancement; add [htmx](https://htmx.org) only if needed | Keeps client JS minimal |
| Database | SQLite | Zero-config, file-based, reliable for this scale |
| DB access | `better-sqlite3` | Simple, synchronous, popular |
| Validation | Zod | Validate form input and share types |
| Testing and validation | Vitest | Fast, TypeScript-native; test routes with Hono's `app.request()`; automated checks in each phase's `validation.md` are written as Vitest tests |
| Dev loop | `tsx watch` | Run TypeScript directly with reload |
| Build | `tsc -p tsconfig.build.json` | Emits `dist/` without test files; `tsconfig.json` stays the full config used for type-checking and tests |
| Formatting and linting | Prettier + ESLint (typescript-eslint) | Consistent code |

## Browser support

The latest two versions of Chrome, Edge, Firefox, and Safari. No legacy browser polyfills.

## Conventions

- Source lives in `src/`; tests sit next to the code as `*.test.ts`.
- Every automated check in a phase's `validation.md` is backed by a Vitest test.
- `npm run validate` type-checks all of `src/` (tests included) and runs the Vitest suite; a phase is ready to merge only when it passes.
- Routes are grouped by feature (agents, ailments, therapies, appointments, dashboard).
- Database schema changes go through numbered SQL migration files.
- Configuration comes from environment variables with sensible defaults.