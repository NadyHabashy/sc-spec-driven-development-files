# MVP — Plan

See `requirements.md` for scope and decisions, and `validation.md` for merge criteria. Work on the `mvp` branch. Each numbered section leaves the app runnable with `npm run validate` passing, and ends with a commit, ticked roadmap items, and a `CHANGELOG.md` entry.

## 1. Tooling

1.1 Install `prettier`, `eslint`, `@eslint/js`, and `typescript-eslint` as dev dependencies.
1.2 Add `eslint.config.js` (flat config, `recommendedTypeChecked`, ignoring `dist/`) and `.prettierrc` (`semi: false`, `singleQuote: true`, `printWidth: 100`, with a CSS override keeping double quotes), plus a `.prettierignore` for `dist/`, `data/`, `package-lock.json`, and `*.md`.
1.3 Add `lint` and `format` scripts, and change `validate` to `tsc --noEmit && npm run lint && vitest run`.
1.4 Run `npm run format` once, fix any lint errors, and commit the formatting on its own.
1.5 Extend `src/dependencies.test.ts` to assert the new dev dependencies and that `validate` runs `lint`.
1.6 Add `renderToString` in `src/render.ts`, which narrows Hono's possibly-async JSX element type to a string and throws on an async component. Use it wherever JSX becomes an HTML string (routes and tests) instead of `.toString()` or `+`, which the type-checked lint rules reject.

## 2. Phase 2: Data and catalog

### Database
2.1 Install `better-sqlite3`, `@types/better-sqlite3` (dev), and `zod`.
2.2 Create `src/db/connection.ts`: `openDb(path)` creates the parent directory for file paths, opens the database, sets `foreign_keys = ON` and `journal_mode = WAL`, and returns it. It exports a `Db` type. `DATABASE_PATH` defaults to the project's `data/agentclinic.db`, resolved with `import.meta.url` rather than the working directory. Add `data/` to `.gitignore` and to ESLint's ignores.
2.3 Create `src/db/migrate.ts`:
  - `migrate(db)` resolves `migrations/` with `new URL('../../migrations', import.meta.url)` and creates `schema_migrations(version TEXT PRIMARY KEY, applied_at TEXT)`.
  - It applies each unapplied `NNN_*.sql` in filename order, each in its own transaction, and returns the versions it applied.
  - Add a `db:migrate` script.
2.4 Write `migrations/001_catalog.sql`: `agents`, `ailments` (with a severity `CHECK`), `therapies`, `agent_ailments`, and `ailment_therapies`, with unique names, composite primary keys, and cascading foreign keys.
2.5 Create `src/db/seed.ts` exporting `seed(db)` (Phase 3 adds a `now` parameter for appointment dates). It clears the catalog tables and inserts 6 agents, 8 ailments, and 6 therapies with their links in one transaction, including an agent with no ailments and an ailment no therapy treats. Add `src/db/migrate-cli.ts` and `src/db/seed-cli.ts` (which also migrates), run with `tsx` by the `db:migrate` and `db:seed` scripts.
2.6 Create `src/test/db.ts` with a `testDb({ seeded })` helper (`openDb(':memory:')`, then `migrate`, then `seed` unless `seeded: false`, for empty states) and `testApp(db?)`, which returns `createApp({ db, now })` with a fixed date. Exclude `src/test/` from `tsconfig.build.json`.

### App wiring
2.7 Refactor `src/app.tsx` to export `createApp({ db, now = () => new Date() })` and move shared context (`db`, `now`) into Hono `Variables`. Update `src/index.ts` to open the database, migrate, and serve `createApp`. Update the existing tests to use `testApp()`.
2.8 Create `src/validation/params.ts` with a Zod `idParam` (a positive integer from the string, rejecting values beyond `Number.MAX_SAFE_INTEGER`). An invalid id calls `c.notFound()`.
2.9 Change `Nav`'s current-link matching to section prefixes: `/` matches exactly, and any other item matches its path and sub-paths.

### Pages
2.10 Create `src/agents/` with typed queries `listAgents` (including ailment count), `getAgent`, `ailmentsForAgent`, and `recommendedTherapiesForAgent` (distinct, via `agent_ailments` joined to `ailment_therapies`), plus these routes:
  - `GET /agents` lists agents as Pico `<article>` cards in a responsive grid.
  - `GET /agents/:id` shows the bio, ailments (linking to `/ailments#ailment-{id}`), recommended therapies, and a "Book an appointment" link. The link targets `/appointments/new?agentId={id}` and is added once Phase 4 ships.
2.11 Create `src/ailments/`: `GET /ailments` lists every ailment with an `id="ailment-{id}"` anchor, its severity as text, its description, and linked agents.
2.12 Create `src/therapies/`: `GET /therapies` lists every therapy with its duration, description, and the ailments it treats (linked to their anchors).
2.13 Add Agents, Ailments, and Therapies to `navItems`, and update the home feature cards so Ailments and Therapies link to their pages.
2.14 Add any needed styles (card grid reuse, `.overflow-auto` tables) mobile-first in `public/styles.css`.

### Tests
2.15 `src/db/connection.test.ts`, `src/db/migrate.test.ts`, `src/db/seed.test.ts`, `src/validation/params.test.ts`, `src/agents/agents.test.ts`, `src/ailments/ailments.test.ts`, `src/therapies/therapies.test.ts`, and updated `src/components/nav.test.tsx`, covering the Phase 2 checks in `validation.md`.

## 3. Phase 3: Appointments (read)

3.1 Write `migrations/002_appointments.sql`:
  - `appointments` with `status` and slot `CHECK`s, and FKs to agents and therapies.
  - A partial unique index on `(date, slot) WHERE status = 'booked'`.
  - An index on `(agent_id, date)`.
3.2 Create `src/appointments/slots.ts` with the `readonly` `SLOTS` list (`09:00`–`16:00`) and date helpers: `toIsoDate(date)` and `addDays(date, days)` for local dates, and `formatDate(isoDate)` for display ("Thu, Oct 1, 2026", formatted in UTC so the server's time zone can't shift the day).
3.3 Extend `seed` with 10 appointments relative to `now`: 3 today, 5 in the future, 1 in the past, and 1 cancelled.
3.4 Create `src/appointments/queries.ts` with `listUpcoming(db, today)` (booked, today or later, ordered by date then slot) and `listPastOrCancelled(db, today)`.
3.5 `GET /appointments` renders a table (with `<caption>` and `th scope`, inside `.overflow-auto`) of upcoming appointments, linked to agents and therapies. Past and cancelled appointments go in a `<details>` with a text Status column. The empty state gets its link to book in Phase 4, when the booking page exists. Add Appointments to `navItems`.
3.6 In `public/styles.css`, let `header nav ul` wrap as well as `header nav` (five links overflow at `320px`), and keep table `<time>` elements on one line.
3.7 Tests: `src/appointments/appointments-list.test.ts`, plus the migration, seed, nav, and stylesheet tests updated for `002`, the seeded appointments, the Appointments link, and the new CSS rules.

## 4. Phase 4: Appointments (booking)

### Form and validation
4.1 Create `src/appointments/schema.ts`: `bookingSchema` (Zod) for `agentId`, `therapyId`, `date`, `slot`, and `notes`. It takes `today` and `currentTime` through a factory, `bookingSchema(now)`, so past-date and past-slot rules are testable. Export `BookingInput = z.infer<…>`.
4.2 Create a `BookingForm` component. Every control has a `<label>`. Invalid fields get `aria-invalid` and `aria-describedby` pointing to their error message. An error summary (`role="alert"`) at the top links to each field. Submitted values are re-filled.
4.3 `GET /appointments/new` renders the form (`?agentId=` preselects the agent, and today is the default date).

### Create, confirm, cancel
4.4 In `POST /appointments`:
  - Parse the form with `bookingSchema`, and check that the agent and therapy exist and the slot is free.
  - Insert and redirect with 303 to `/appointments/:id?booked=1`.
  - On a validation error, re-render with 400. On a taken slot, re-render with 409, and also catch `SQLITE_CONSTRAINT_UNIQUE` from the insert and map it to 409.
4.5 `GET /appointments/:id` shows the appointment details, a confirmation banner when `booked=1`, and a Cancel form (a POST button) while it's booked and upcoming.
4.6 `POST /appointments/:id/cancel`: validate the id, reject cancelled or past appointments with a message (409), otherwise set `status = 'cancelled'` and redirect with 303.
4.7 Add the "Book an appointment" link to agent detail and a "Book" button to `/appointments`.

### htmx
4.8 Install `htmx.org`. Serve `htmx.org/dist/htmx.min.js` at `/htmx.min.js`, resolved with `createRequire` like Pico. Add an optional `scripts` prop to `Layout` so only the booking page loads it (`defer`).
4.9 `GET /appointments/slots?date=` validates the date and returns `<option>` elements for all eight slots, with taken ones `disabled` and labelled "(taken)". The date input gets `hx-get`, `hx-target` (the slot `<select>`), and `hx-trigger="change"`. Without JavaScript, the full slot list still works.
4.10 Update `specs/tech-stack.md`'s Interactivity row to say htmx is used, served locally, for the booking slot picker.

### Tests
4.11 `src/appointments/schema.test.ts`, `src/appointments/booking.test.ts`, `src/appointments/cancel.test.ts`, and `src/appointments/slots.test.ts`, covering the Phase 4 checks in `validation.md`.

## 5. Phase 5: Dashboard

5.1 Create `src/dashboard/queries.ts`: `counts(db, today)` and `todaysAppointments(db, today)`, plus `upcomingForAgent(db, agentId, today)` reused from appointments.
5.2 `GET /dashboard` (staff):
  - A `.feature-grid` of count cards (agents, ailments, therapies, today's appointments, upcoming appointments).
  - Today's appointments in slot order, with an empty state.
  - Agent links to `/agents/:id/dashboard`.
5.3 `GET /agents/:id/dashboard` (agent): "My ailments", "Recommended therapies", and "Upcoming appointments", each with its own empty state, plus a "Book an appointment" link. Link to it from agent detail.
5.4 Add Dashboard to `navItems`, and make `/agents/:id/dashboard` mark Agents as current.
5.5 Tests: `src/dashboard/dashboard.test.ts`, using a fixed `now` so "today" is deterministic.

## 6. Phase 6: Polish

6.1 Create `src/errors/`: a `NotFoundPage` (404, inside the layout, playful copy, link home) wired through `app.notFound`, and an `ErrorPage` (500, no stack trace) wired through `app.onError`, which logs with `console.error`.
6.2 Review every list for its empty state (appointments, today, agent ailments, recommended therapies, therapies for an ailment, agents for an ailment) and add playful copy with a next action.
6.3 Accessibility pass:
  - Add a "Skip to content" link targeting `<main id="main">` in `Layout`.
  - Check there's one `<h1>` per page and the heading order is logical.
  - Check every table has a `<caption>` and `th scope`.
  - Check form errors are announced and linked.
  - Check severity and status appear as text.
  - Check focus is visible, and check contrast in both themes.
6.4 Responsive pass: check every page at `320px`, `768px`, and `1280px`, including the wrapping nav with six links and the scrolling tables. Fix issues in `public/styles.css` using `min-width` queries only.
6.5 Cross-browser pass in the latest Chrome, Firefox, Safari, and Edge.
6.6 Tests: `src/errors/errors.test.ts`, plus skip-link and empty-state assertions in the relevant page tests.

## 7. Wrap-up

7.1 Run every check in `validation.md`, including all manual checks, and tick each one that passes.
7.2 Check off Phases 2–6 in `specs/roadmap.md`, adding Tooling and "Cancel an appointment" as done items where they were delivered.
7.3 Update `CHANGELOG.md`.
7.4 Open a PR from `mvp` to `main`.
