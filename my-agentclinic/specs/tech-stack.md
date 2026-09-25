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

## Responsive design

Every page must work on phones, tablets, and desktops.

- Every page includes `<meta name="viewport" content="width=device-width, initial-scale=1">` (provided by the shared layout).
- CSS is mobile-first: base styles target small screens, and larger screens are enhanced with `min-width` media queries only (no `max-width` media queries).
- Shared breakpoints: `40rem` (tablet) and `64rem` (desktop).
- Use relative units (`rem`, `%`, `vw`) and fluid sizing with `clamp()` for spacing and type; no fixed pixel widths on layout containers.
- Layouts use flexbox and grid that wrap or reflow instead of overflowing; no horizontal scrolling at a `320px` viewport width.
- Images and media never exceed their container (`max-width: 100%`).
- Interactive elements (links, buttons, form controls) have a touch target of at least `2.75rem` (44px).
- Each phase's `validation.md` includes a manual check at phone (`320px`), tablet (`768px`), and desktop (`1280px`) widths.

## Conventions

- Source lives in `src/`; tests sit next to the code as `*.test.ts`.
- Every automated check in a phase's `validation.md` is backed by a Vitest test.
- `npm run validate` type-checks all of `src/` (tests included) and runs the Vitest suite; a phase is ready to merge only when it passes.
- Routes are grouped by feature (agents, ailments, therapies, appointments, dashboard).
- Database schema changes go through numbered SQL migration files.
- Configuration comes from environment variables with sensible defaults.