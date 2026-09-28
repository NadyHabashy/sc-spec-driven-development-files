# Changelog

All notable changes to AgentClinic, grouped by date (newest first).

## 2026-09-28

- Fixed a second branch review finding: multi-line booking notes now keep their line breaks on the appointment page instead of running together on one line.
- Fixed a branch review finding: booking notes now count a line break as one character, as the form's text box does, so a note the browser allows is no longer rejected for being over 500 characters. Notes are stored with plain `\n` line breaks.
- Wrapped up the MVP: ran every check in `specs/2026-09-28-mvp/validation.md` and recorded the results. 69 of 75 checks pass, including a production build started from another folder and a full headless Chrome pass of every page, the keyboard, and the booking flow. Still open before merging to `main`: completing the booking form with the keyboard alone, a VoiceOver pass, disabled-option contrast, and Firefox, Safari, and Edge by hand.
- Added the delivered Tooling item to Phase 2 of the roadmap. Every roadmap item is done except the cross-browser check.
- Clarified the MVP spec after building it: an appointment is upcoming until its slot starts, then "In progress" for its hour and "Completed" after (the appointments list, dashboard counts, agent dashboards, and status labels now all follow this); the server's local time is clinic time; seeding is an explicit reset that the server never runs; therapies always take one slot; cancelling is open to anyone by design; and Firefox, Safari, and Edge are checked by hand at wrap-up.
- Added setup steps to the README.
- Implemented most of Phase 6 (Polish): styled 404 and 500 pages inside the layout (the 500 page never shows the error), a "Skip to content" link on every page, next actions in empty states, and a 44px tap target for `<details>` toggles.
- Added `src/pages.test.ts`, checking every page for one `<h1>`, no skipped heading levels, and the skip link. Checked every page in headless Chrome at 320, 768, and 1280px in light and dark themes, plus a keyboard walk of every Tab stop. Firefox, Safari, and Edge still need a manual check.
- Implemented Phase 5 (Dashboard): a staff dashboard at `/dashboard` with counts, today's appointments, and links to each agent's dashboard; and an agent dashboard at `/agents/:id/dashboard` with the agent's ailments, recommended therapies, and upcoming appointments, each with an empty state. Dashboard is now in the nav, and agent pages link to their dashboard.
- Appointment rows now link to the appointment's page, so any booking can be opened and cancelled from the lists and dashboards.
- Implemented Phase 4 (Appointments, booking): a booking form at `/appointments/new` validated with Zod, with an error summary and per-field messages; bookings redirect to a confirmation page, a slot can't be double-booked (checked in the route and guarded by the unique index), and upcoming appointments can be cancelled, freeing the slot.
- Added htmx (served locally, loaded only on the booking page) to show which slots are taken or already past when a date is picked; without JavaScript the form still works and the server rejects taken slots.
- Added "Book an appointment" buttons to agent pages and the appointments list, and recorded htmx in `specs/tech-stack.md`.
- Implemented Phase 3 (Appointments, read): an `appointments` migration (slot, status, and date `CHECK`s, and a partial unique index so a slot holds one booked appointment), 10 seeded appointments dated relative to today, and an `/appointments` page listing upcoming appointments, with past and cancelled ones in a collapsible section. Appointments is now in the nav.
- Fixed the nav overflowing sideways at phone width now that it has five links, and kept table dates and times on one line.
- Fixed two Phase 2 review findings: the default database path is now resolved from the project (not the working directory), so starting the server from another folder no longer creates an empty database; and route ids larger than `Number.MAX_SAFE_INTEGER` return 404 instead of rounding to a neighboring row.
- Implemented Phase 2 (Data and catalog): SQLite via `better-sqlite3` (`DATABASE_PATH`, default `data/agentclinic.db`), a numbered SQL migration runner (`migrations/`, `npm run db:migrate`), and a deterministic seed of 6 agents, 8 ailments, and 6 therapies (`npm run db:seed`).
- Added the agents list and agent detail pages (ailments and recommended therapies), the ailments catalog (patients and treating therapies), and the therapies page, each linked to the others and added to the nav.
- `createApp({ db, now })` replaces the module-level `app`, so tests run against an in-memory database with a fixed clock; the nav now marks a section as current on its sub-pages, and invalid or unknown ids return 404.
- Linked the home page's Ailments and Therapies cards to their new pages.
- Added Prettier and ESLint (`typescript-eslint` recommended type-checked rules) with `lint` and `format` scripts; `npm run validate` now runs lint between the type-check and the tests. Prettier skips Markdown and keeps double quotes in CSS.
- Added `renderToString` (`src/render.ts`) to turn JSX into HTML strings with correct types, and used it in the app and tests.
- Reformatted the code with Prettier.
- Added the MVP spec (`specs/2026-09-28-mvp/`) covering roadmap Phases 2–6, and started work on the `mvp` branch.

## 2026-09-26

- Implemented Phase 1 (Layout and look): adopted Pico CSS v2 (`@picocss/pico`), served locally at `/pico.min.css` and loaded before `public/styles.css`, which now holds only brand overrides (teal primary color for light and dark themes, fluid heading, 44px nav touch targets).
- Added a data-driven `Nav` component (`src/components/nav.tsx`) with the site name and a Home link marked `aria-current="page"`; `Layout` takes an optional `currentPath`, and the header, main, and footer use Pico's `container` class.
- Rewrote the home page with a playful hero and three feature cards (Ailments, Therapies, Appointments) in a new `.feature-grid` that shows one, two, or three columns at the `40rem` and `64rem` breakpoints.
- Added Vitest coverage for the nav, Pico serving, container classes, stylesheet order, home page cards, and brand stylesheet rules.
- Extracted component props into named TypeScript types (`NavProps`, `HeaderProps`, `MainProps`, `LayoutProps`).
- Fixed issues found in a branch review: `Layout` now requires `currentPath`; Pico and `public/` are resolved from the module so the app works from any directory; dark-mode button colors now meet 4.5:1 contrast; the current nav link is underlined and bold; `.container` is fluid in `rem` instead of Pico's fixed pixel widths; an odd card spans the row at tablet width; brand colors cover text selection and an explicit `data-theme="dark"`; `navItems` is `readonly`; and tests are less brittle, with new checks for touch targets, the container, dependencies, and working-directory independence.
- Recorded Phase 1 validation results in `validation.md`, and documented Pico's breakpoints and module-relative asset paths in `specs/tech-stack.md`.
- Added the Phase 1 layout-and-look spec and switched the tech stack's styling choice to Pico CSS.

## 2026-09-25

- Added a `/changelog` Claude Code skill (`.claude/skills/changelog/`) that creates or updates this changelog from git history, run manually before merging a branch.
- Added this `CHANGELOG.md`, built from the project's git history.
- Made responsive design a product requirement: added a "Responsive by default" principle to `specs/mission.md` and a Responsive design section to `specs/tech-stack.md` (mobile-first CSS, `min-width` breakpoints at `40rem` and `64rem`, `clamp()` sizing, no horizontal scrolling at `320px`, `44px` touch targets, and width checks in every phase).
- Rewrote `public/styles.css` mobile-first, with a Vitest check that it uses `min-width` breakpoints and no `max-width` media queries.
- Combined roadmap phases 2–5 (database, agents, ailments, therapies) into a single Phase 2 "Data and catalog", renumbered the later phases 3–6, and added a responsive check to the Polish phase.
- Adopted Vitest as the validation framework: every automated check in a phase's `validation.md` is now backed by a test, run with the new `npm run validate` script (type-check plus tests).
- Changed TypeScript config so tests are type-checked: `tsconfig.json` now covers all of `src/`, and the new `tsconfig.build.json` keeps test files out of `dist/`.
- Added render tests for the `Header`, `Main`, and `Footer` components and a test suite for `Layout`.
- Implemented Phase 0: a Hono app serving the AgentClinic home page at `/` with server-rendered JSX, plus `dev`, `build`, `start`, and `test` npm scripts and route tests.
- Added a main `Layout` built from `Header`, `Main`, and `Footer` components (each in its own file under `src/components/`), linking a stylesheet served from `public/styles.css`.
- Added the Phase 0 skeleton spec: requirements, plan, and validation.

## 2026-09-24

- Added the project constitution: mission, tech stack, and roadmap in `specs/`.
- Ignored the `.idea` directory in git.
- Added the AgentClinic starting point: `package.json`, TypeScript config, a placeholder `src/index.ts`, the README, and course prompts.
