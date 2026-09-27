# MVP — Validation

The `mvp` branch is ready to merge into `main` when:

1. `npm run validate` passes. It runs the type-check, ESLint, Prettier check, and the Vitest suite.
2. Every automated check below is backed by a passing Vitest test.
3. Every manual check below is ticked.

Tests use an in-memory SQLite database (`':memory:'`), migrated and seeded per test file, and a fixed `now` so "today" is deterministic.

## Automated checks (Vitest)

### Tooling (`src/dependencies.test.ts`)
- [ ] `prettier`, `eslint`, and `typescript-eslint` are dev dependencies. `better-sqlite3`, `zod`, and `htmx.org` are dependencies.
- [ ] The `validate` script runs `lint`. `lint` runs both ESLint and `prettier --check`.
- [ ] The `db:migrate` and `db:seed` scripts exist.

### Database (`src/db/migrate.test.ts`, `src/db/seed.test.ts`)
- [ ] `migrate` on a fresh database applies every file in `migrations/` in order and records each version in `schema_migrations`.
- [ ] Running `migrate` a second time applies nothing and doesn't throw.
- [ ] Foreign keys are enforced: inserting an `agent_ailments` row for a missing agent throws.
- [ ] The `severity` and `status` `CHECK` constraints reject invalid values.
- [ ] The partial unique index rejects a second `booked` appointment for the same date and slot, but allows one when the first is `cancelled`.
- [ ] With `DATABASE_PATH` unset, the database is the project's `data/agentclinic.db` whatever the working directory (`src/db/connection.test.ts`). `DATABASE_PATH` overrides it.
- [ ] `seed` inserts exactly 6 agents, 8 ailments, 6 therapies, and 10 appointments. Running it twice gives the same counts.
- [ ] The seed includes an agent with no ailments, an ailment with no therapies, and 3 `booked` appointments dated today relative to `now`.

### Nav (`src/components/nav.test.tsx`)
- [ ] `navItems` is Home, Agents, Ailments, Therapies, Appointments, and Dashboard, in that order.
- [ ] `aria-current="page"` matches by section: `/agents/3` and `/agents/3/dashboard` mark Agents, `/` marks only Home, and `/appointments/new` marks Appointments.

### Catalog (`src/agents/agents.test.ts`, `src/ailments/ailments.test.ts`, `src/therapies/therapies.test.ts`)
- [ ] `GET /agents` returns 200 and lists all 6 seeded agents, each linking to `/agents/{id}`.
- [ ] `GET /agents/:id` shows the agent's name in the `<h1>`, their ailments linking to `/ailments#ailment-{id}`, and their recommended therapies, each listed only once.
- [ ] Recommended therapies are exactly the distinct therapies treating the agent's ailments (a query-level test).
- [ ] The agent with no ailments shows the empty state for ailments and for recommended therapies.
- [ ] `GET /agents/999` and `GET /agents/abc` return the 404 page.
- [ ] `parseId` rejects zero, signs, decimals, exponents, leading zeros, and ids beyond `Number.MAX_SAFE_INTEGER` (`src/validation/params.test.ts`).
- [ ] `GET /ailments` lists all 8 ailments with `id="ailment-{id}"` anchors, their severity as text, and linked agents.
- [ ] `GET /therapies` lists all 6 therapies with the ailments each treats. The untreated ailment is absent from every therapy.

### Appointments list (`src/appointments/appointments-list.test.ts`)
- [ ] `GET /appointments` returns 200 and shows upcoming booked appointments in date-then-slot order.
- [ ] Past and cancelled appointments are inside a `<details>` element, not the main table.
- [ ] The table has a `<caption>`, `th scope` headers, and sits inside `.overflow-auto`.
- [ ] With no appointments, the page shows the empty state and a link to book.

### Booking (`src/appointments/schema.test.ts`, `src/appointments/booking.test.ts`, `src/appointments/slots.test.ts`)
- [ ] `bookingSchema` accepts a valid booking and rejects:
  - a non-integer `agentId`
  - an unknown `slot`
  - a malformed date
  - a past date
  - a slot earlier today that has already started
  - `notes` over 500 characters
- [ ] `GET /appointments/new` renders a form where every control has an associated `<label>`, and `?agentId=2` preselects agent 2.
- [ ] A valid `POST /appointments` returns 303 to `/appointments/{id}?booked=1` and inserts one `booked` row.
- [ ] Following the redirect shows the confirmation banner with the agent, therapy, date, and slot.
- [ ] An invalid `POST` returns 400, keeps the submitted values, and shows an error summary with `role="alert"`. Invalid fields have `aria-invalid="true"` and `aria-describedby`.
- [ ] A `POST` for a taken date and slot returns 409 with the "slot taken" message and inserts nothing.
- [ ] An unknown `agentId` or `therapyId` returns 400, not 500.
- [ ] `GET /appointments/slots?date=` returns 8 `<option>`s with taken slots `disabled`. An invalid date returns 400.
- [ ] `GET /htmx.min.js` returns 200 with a JavaScript `Content-Type`. Only the booking page includes the script tag.

### Cancel (`src/appointments/cancel.test.ts`)
- [ ] `POST /appointments/:id/cancel` on an upcoming booked appointment returns 303 and sets its status to `cancelled`.
- [ ] After cancelling, the same slot can be booked again.
- [ ] Cancelling a cancelled or past appointment returns 409 and changes nothing.
- [ ] `GET /appointments/:id` shows the Cancel button only for booked, upcoming appointments.

### Dashboard (`src/dashboard/dashboard.test.ts`)
- [ ] `GET /dashboard` shows these counts for the seed: 6 agents, 8 ailments, 6 therapies, 3 today, and the correct number upcoming.
- [ ] It lists today's 3 appointments in slot order and links every agent to `/agents/{id}/dashboard`.
- [ ] With no appointments today, it shows the "no appointments today" empty state.
- [ ] `GET /agents/:id/dashboard` shows that agent's ailments, recommended therapies, and upcoming booked appointments only, excluding past and cancelled ones and other agents' appointments.
- [ ] The agent with nothing booked shows each empty state and a "Book an appointment" link.
- [ ] `GET /agents/999/dashboard` returns 404.

### Polish (`src/errors/errors.test.ts`, `src/layout.test.tsx`)
- [ ] An unknown path returns 404 with the not-found page inside the layout, with an `<h1>` and a link to `/`.
- [ ] A route that throws returns 500 with the error page, and the body contains no stack trace or error message.
- [ ] `Layout` renders a "Skip to content" link as the first focusable element, targeting `#main`, and `<main id="main">`.
- [ ] Every page route renders exactly one `<h1>` (tested across a list of routes).

### Regression
- [ ] All Phase 0 and Phase 1 checks still pass: layout, Pico, and the stylesheet rules (including no `max-width` media queries).

### Gate
- [ ] `npm run validate` passes.
- [ ] `npm run build`, then `npm run db:migrate && npm run db:seed && npm start` from a different working directory, serves `/` and `/agents` (checked once by hand, since migrations are resolved from the module location).

## Manual checks

Run `npm run db:migrate && npm run db:seed && npm run dev` and open `http://localhost:3000/`.

### Responsive: every page at phone (`320px`), tablet (`768px`), and desktop (`1280px`)
- [ ] Pages: Home, Agents, agent detail, Ailments, Therapies, Appointments, appointment detail, booking form (including its error state), staff dashboard, agent dashboard, 404.
- [ ] No horizontal page scroll at `320px`. Wide tables scroll inside their container.
- [ ] The six-link nav wraps cleanly on phones and sits on one row at desktop width.
- [ ] Card grids use 1, 2, and 3 columns at the three widths.
- [ ] Links, buttons, and form controls have tap targets of at least 44px.

### Booking flow
- [ ] With JavaScript on, changing the date updates the slot list, and taken slots show as disabled "(taken)".
- [ ] With JavaScript off, the form still submits, and picking a taken slot shows the 409 error.
- [ ] Booking, the confirmation, cancelling, and rebooking the freed slot all work end to end.
- [ ] Double-submitting the form (refresh after POST) doesn't create a duplicate, thanks to PRG.

### Accessibility
- [ ] Keyboard-only: the skip link appears on first Tab and jumps to content, every interactive element can be reached with a visible focus ring, and the booking form can be completed and submitted.
- [ ] A screen reader (VoiceOver) announces the error summary on a failed booking, and each field's error is read with its field.
- [ ] Severity, appointment status, and the current nav link are never shown by color alone.
- [ ] Contrast is WCAG AA in light and dark OS themes on every page, including disabled options and the count cards.
- [ ] Each page's heading outline is logical (one `<h1>`, no skipped levels).

### Browsers
- [ ] Every page and the booking flow work in the latest Chrome, Firefox, Safari, and Edge.

### Offline and content
- [ ] No page requests anything outside its own origin (Pico and htmx are served locally).
- [ ] Copy is playful throughout, including empty states and error pages, while the layout stays clean and easy to scan.
