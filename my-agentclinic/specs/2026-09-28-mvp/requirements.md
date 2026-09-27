# MVP — Requirements

## Scope

Finish the roadmap (`specs/roadmap.md` Phases 2–6) on the `mvp` branch and deliver a working AgentClinic with all four core concepts from `specs/mission.md` and a dashboard:

- **Tooling**: Prettier and ESLint (typescript-eslint), included in `npm run validate`.
- **Phase 2, Data and catalog**: SQLite through `better-sqlite3`, numbered SQL migrations, a seed script, and `agents`, `ailments`, and `therapies` with their relationships. Pages: agents list, agent detail, ailments catalog, and therapies.
- **Phase 3, Appointments (read)**: an `appointments` table, seed data, and an appointments list page.
- **Phase 4, Appointments (booking)**: a booking form validated with Zod, a confirmation page, double-booking prevention, and staff cancellation. htmx loads the free slots for the chosen date.
- **Phase 5, Dashboard**: a staff dashboard (today's appointments and counts) and a per-agent dashboard (my ailments, recommended therapies, and upcoming appointments).
- **Phase 6, Polish**: empty states, a 404 page, an error page, an accessibility pass, a cross-browser check, and a responsive check of every page.

## Out of scope

- Authentication, sessions, or user accounts. Nothing is protected (see Decisions).
- Creating, editing, or deleting agents, ailments, or therapies through the UI. The catalog comes from seed data only.
- Rescheduling appointments (to move one, cancel it and book again), and recurring appointments.
- Multiple therapists or rooms, time zones, weekends and holidays, and opening-hours configuration.
- Automated browser tests (Playwright) and automated axe checks. Accessibility and browser checks are manual.
- Deployment and hosting.
- Real medical or mental-health advice (mission non-goal).

## Decisions

### Data

- **SQLite file with an env-configurable path.** `DATABASE_PATH` sets the file, defaulting to the project's `data/agentclinic.db`. The default is resolved from the module location (like Pico and `migrations/`), not the working directory, so the server, `db:migrate`, and `db:seed` share one file however they're started. A relative `DATABASE_PATH` is relative to the working directory, as usual for command-line paths. `data/` is gitignored (and ignored by ESLint and Prettier) and created if it doesn't exist. The connection enables `foreign_keys = ON` and `journal_mode = WAL`.
- **Injected database.** `src/app.tsx` exports `createApp({ db, now })` instead of a module-level `app`, so tests pass an in-memory database (`':memory:'`) and a fixed clock. `src/index.ts` opens the file database, runs migrations, and starts the server. `now: () => Date` defaults to the real clock and is the only source of "today".
- **Numbered SQL migrations.** Migrations are plain `.sql` files in `migrations/` at the project root (`001_catalog.sql`, `002_appointments.sql`, …). They're resolved from the module location with `import.meta.url` (like Pico), so both `tsx` and `dist/` find them. A `schema_migrations` table records applied versions. Each migration runs in its own transaction, in filename order, and a migration that has already run is never re-applied. `npm run db:migrate` runs them, and the server also runs them on startup.
- **Many-to-many relationships.** The schema has the tables `agents`, `ailments`, `therapies`, `agent_ailments(agent_id, ailment_id)`, and `ailment_therapies(ailment_id, therapy_id)`, with composite primary keys and `ON DELETE CASCADE` foreign keys. An agent has many ailments, and a therapy treats many ailments. An agent's **recommended therapies** are the distinct therapies that treat any of their ailments.
- **Columns** (all `NOT NULL` unless noted):
  - `agents`: `id`, `name` (unique), `model` (e.g. "GPT-ish 4"), `bio`.
  - `ailments`: `id`, `name` (unique), `description`, `severity` (`'mild' | 'moderate' | 'severe'`, enforced by a `CHECK`).
  - `therapies`: `id`, `name` (unique), `description`, `duration_minutes` (always 60 in the MVP, since one slot is one hour).
  - `appointments`: `id`, `agent_id` (FK), `therapy_id` (FK), `date` (`TEXT`, `YYYY-MM-DD`), `slot` (`TEXT`, `HH:MM`), `status` (`'booked' | 'cancelled'`, default `'booked'`), `notes` (nullable), `created_at`.
- **Small, fixed, deterministic seed.** 6 agents, 8 ailments, 6 therapies, and 10 appointments. It includes one agent with no ailments and no appointments, and one ailment that no therapy treats yet ("no known cure"), so empty states have real data to show. Appointment dates are relative to `now()` (3 today, 5 in the future, 1 in the past, and 1 cancelled), so the dashboard always has something to show. `seed(db, now)` clears the tables and inserts everything in one transaction, so it's idempotent. `npm run db:seed` runs it against `DATABASE_PATH`. Names and copy are playful (e.g. "Context-Window Fatigue", "Hallucination Anxiety", "Prompt-Injection Trauma").

### Booking

- **Fixed hourly slots.** The clinic has one therapy room. Slots start on the hour from `09:00` to `16:00`, eight per day, every day. An appointment is an agent, a therapy, a date, a slot, and optional notes.
- **Double-booking rule.** A slot on a date can hold only one `booked` appointment, clinic-wide. This also covers an agent booking the same slot twice. It's enforced twice:
  - The route checks first and re-renders the form with a friendly error (409).
  - A partial unique index, `UNIQUE (date, slot) WHERE status = 'booked'`, is the final guard. A constraint violation becomes the same 409 message, never a 500.
  - Cancelled appointments free their slot.
- **Past dates are rejected.** The date must be today or later, and today's slots that have already started are rejected, both judged by `now()`.
- **Zod everywhere input enters.** A `bookingSchema` validates the form (`agentId` and `therapyId` as positive integers that must exist, `date` as an ISO date not in the past, `slot` as one of the eight slots, and `notes` optional, trimmed, and at most 500 characters). Route params such as `:id` go through a shared `idParam` schema: plain digits with no leading zero, and no larger than `Number.MAX_SAFE_INTEGER`, so a huge id can't round to a neighboring row. An invalid or unknown id returns the 404 page. Form types come from `z.infer`.
- **Post/Redirect/Get.** `POST /appointments` redirects with 303 to `/appointments/:id?booked=1`, which shows a confirmation. On a validation error, it re-renders the form with status 400 (409 for a taken slot), keeps what the user entered, and shows an error summary with per-field messages.
- **Cancellation.** `POST /appointments/:id/cancel` sets `status = 'cancelled'` and redirects with 303 back to the appointment. Cancelling a cancelled or past appointment is rejected with a message. There's no auth, so anyone can cancel. That's acceptable for a demo app.
- **htmx for free slots, as progressive enhancement.** The booking form works with no JavaScript: it lists all eight slots, and the server rejects taken ones. When htmx loads, changing the date triggers `hx-get="/appointments/slots?date=…"`, which returns the `<option>` list with taken slots disabled. htmx is installed from npm (`htmx.org`), served locally at `/htmx.min.js` (no CDN, so booth demos work offline), and loaded only on the booking page. `specs/tech-stack.md` is updated to say htmx is now in use.

### Pages and routes

- **Routes grouped by feature** (tech-stack convention): `src/agents/`, `src/ailments/`, `src/therapies/`, `src/appointments/`, `src/dashboard/`, and `src/errors/`. Each has a `routes.tsx` (a Hono sub-app), page components, and a `queries.ts` of typed query functions that take `db`.

| Route | Page |
|---|---|
| `GET /agents` | Agents list: name, model, and ailment count, each linking to detail |
| `GET /agents/:id` | Agent detail: bio, ailments (linked), recommended therapies, and a "Book an appointment" link prefilled with the agent |
| `GET /ailments` | Ailments catalog: each ailment with its severity, the agents who have it (linked to their detail pages), and the therapies that treat it (or "no known cure"). Each ailment has an `id="ailment-{id}"` anchor |
| `GET /therapies` | Therapies: each therapy with its duration and the ailments it treats (linked to their anchors). Each therapy has an `id="therapy-{id}"` anchor, which agent detail and the ailments catalog link to |
| `GET /appointments` | List of upcoming `booked` appointments, soonest first (date, slot, agent, therapy), with a "Book" button. Past and cancelled appointments are in a collapsed `<details>` |
| `GET /appointments/new` | Booking form (`?agentId=` preselects an agent) |
| `GET /appointments/slots` | htmx fragment of `<option>`s for `?date=` |
| `POST /appointments` | Create and redirect, or re-render with errors |
| `GET /appointments/:id` | Appointment detail and confirmation, with a Cancel button while booked and upcoming |
| `POST /appointments/:id/cancel` | Cancel and redirect |
| `GET /dashboard` | Staff dashboard |
| `GET /agents/:id/dashboard` | Agent dashboard |

- **Nav grows one link per shipped page**, as Phase 1 decided: Home, Agents, Ailments, Therapies, Appointments, and Dashboard. `aria-current` matches the section prefix, so `/agents/3` marks Agents as current. At `320px` the nav wraps rather than scrolling horizontally.
- **Staff dashboard** (`/dashboard`, no auth): count cards (agents, ailments, therapies, today's appointments, upcoming appointments), then today's appointments in slot order, then a list of agents linking to their agent dashboards.
- **Agent dashboard** (`/agents/:id/dashboard`, no auth, reached from the staff dashboard and the agent detail page): "My ailments", "Recommended therapies", and "Upcoming appointments" (booked, today or later), each with an empty state.
- **Tables are responsive.** Every table is wrapped in Pico's `.overflow-auto` so a wide table scrolls inside its container, not the page. It has a `<caption>` and `<th scope>`.

### Polish

- **Empty states** for every list: no appointments, an agent with no ailments, an ailment no therapy treats, no appointments today. Each uses playful copy and a next action where one exists.
- **Error pages.** `app.notFound` renders a 404 page inside the layout (playful copy and a link home). `app.onError` logs the error and renders a generic 500 page without a stack trace.
- **Accessibility pass:**
  - A "Skip to content" link.
  - One `<h1>` per page and a logical heading order.
  - Every form control has a `<label>`. Errors use `aria-invalid` and `aria-describedby`, and an error summary with `role="alert"` links to each field.
  - Visible focus on everything interactive.
  - Status isn't shown by color alone: severity and appointment status appear as text.
  - WCAG AA contrast in light and dark themes.
- **Browsers**: the latest Chrome, Firefox, Safari, and Edge (tech stack).

### Tooling

- **Prettier + ESLint.** Add `prettier`, `eslint`, and `typescript-eslint` with a flat `eslint.config.js` (recommended type-checked rules) and a `.prettierrc` matching the current style (no semicolons, single quotes, 100 columns). New scripts: `lint` (`eslint . && prettier --check .`) and `format` (`prettier --write .`). `validate` becomes `tsc --noEmit && npm run lint && vitest run`.
- **Prettier formats code, not Markdown.** `.prettierignore` excludes `*.md`, because Prettier reflows the specs' numbered-step lines into the nested list above them, which changes the plan's meaning. CSS keeps double quotes (a `.prettierrc` override), matching the existing stylesheet and its tests.
- **JSX is rendered through `renderToString`.** Hono types a JSX element as `HtmlEscapedString | Promise<HtmlEscapedString>`, so the type-checked lint rules reject `.toString()` and string concatenation on it. `src/render.ts` exports `renderToString`, which narrows the element to a string and throws on an async component (no silent failures). Routes and tests use it.
- **Build output.** `migrations/` stays outside `src/`, so `tsc` doesn't need to copy it. `dist/` resolves it as `../migrations`.

## Context

- Mission: `specs/mission.md`. The four concepts (agents, ailments, therapies, appointments) plus a dashboard are the MVP. The humor lives in the copy.
- Tech stack: `specs/tech-stack.md`. Hono JSX, `better-sqlite3`, Zod, Vitest, Pico CSS, mobile-first CSS with `40rem`/`64rem` breakpoints, `npm run validate` as the merge gate.
- Previous phases: `specs/2026-09-24-phase-0-skeleton/` and `specs/2026-09-26-phase-1-layout-and-look/`. Their patterns carry forward: named prop types, `readonly` data arrays, assets resolved from module location, and every automated check backed by a Vitest test.
- Work happens on the `mvp` branch, with one commit (or more) per phase, and it merges to `main` only when `validation.md` passes.
