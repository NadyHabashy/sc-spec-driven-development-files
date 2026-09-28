# MVP — Validation

The `mvp` branch is ready to merge into `main` when:

1. `npm run validate` passes. It runs the type-check, ESLint, Prettier check, and the Vitest suite.
2. Every automated check below is backed by a passing Vitest test.
3. Every manual check below is ticked.

Tests use an in-memory SQLite database (`':memory:'`), migrated and seeded per test file, and a fixed `now` so "today" is deterministic.

## Automated checks (Vitest)

### Tooling (`src/dependencies.test.ts`)
- [x] `prettier`, `eslint`, and `typescript-eslint` are dev dependencies. `better-sqlite3`, `zod`, and `htmx.org` are dependencies.
- [x] The `validate` script runs `lint`. `lint` runs both ESLint and `prettier --check`.
- [x] The `db:migrate` and `db:seed` scripts exist.

### Database (`src/db/migrate.test.ts`, `src/db/seed.test.ts`)
- [x] `migrate` on a fresh database applies every file in `migrations/` in order and records each version in `schema_migrations`.
- [x] Running `migrate` a second time applies nothing and doesn't throw.
- [x] Foreign keys are enforced: inserting an `agent_ailments` row for a missing agent throws.
- [x] The `severity`, `status`, `slot`, and `date` `CHECK` constraints reject invalid values (including impossible dates such as `2026-13-45` and `2026-02-30`).
- [x] The partial unique index rejects a second `booked` appointment for the same date and slot, but allows one when the first is `cancelled`.
- [x] With `DATABASE_PATH` unset, the database is the project's `data/agentclinic.db` whatever the working directory (`src/db/connection.test.ts`). `DATABASE_PATH` overrides it.
- [x] `seed` inserts exactly 6 agents, 8 ailments, 6 therapies, and 10 appointments. Running it twice gives the same counts.
- [x] The seed includes an agent with no ailments, an ailment with no therapies, and 3 `booked` appointments dated today relative to `now`.

### Nav (`src/components/nav.test.tsx`)
- [x] `navItems` is Home, Agents, Ailments, Therapies, Appointments, and Dashboard, in that order.
- [x] `aria-current="page"` matches by section: `/agents/3` and `/agents/3/dashboard` mark Agents, `/` marks only Home, and `/appointments/new` marks Appointments.

### Catalog (`src/agents/agents.test.ts`, `src/ailments/ailments.test.ts`, `src/therapies/therapies.test.ts`)
- [x] `GET /agents` returns 200 and lists all 6 seeded agents, each linking to `/agents/{id}`.
- [x] `GET /agents/:id` shows the agent's name in the `<h1>`, their ailments linking to `/ailments#ailment-{id}`, and their recommended therapies, each listed only once.
- [x] Recommended therapies are exactly the distinct therapies treating the agent's ailments (a query-level test).
- [x] The agent with no ailments shows the empty state for ailments and for recommended therapies.
- [x] `GET /agents/999` and `GET /agents/abc` return the 404 page.
- [x] `parseId` rejects zero, signs, decimals, exponents, leading zeros, and ids beyond `Number.MAX_SAFE_INTEGER` (`src/validation/params.test.ts`).
- [x] `GET /ailments` lists all 8 ailments with `id="ailment-{id}"` anchors, their severity as text, and linked agents.
- [x] `GET /therapies` lists all 6 therapies with the ailments each treats. The untreated ailment is absent from every therapy.

### Appointments list (`src/appointments/appointments-list.test.ts`)
- [x] `GET /appointments` returns 200 and shows booked appointments whose slot hasn't started, in date-then-slot order. At 10:30, today's 09:00 appointment is in the past-and-cancelled section as "Completed".
- [x] Past and cancelled appointments are inside a `<details>` element, not the main table.
- [x] Each row's date links to `/appointments/{id}`.
- [x] The table has a `<caption>`, `th scope` headers, and sits inside `.overflow-auto`.
- [x] With no appointments, the page shows the empty state and a link to book (met in Phase 4, when the booking page exists).

### Booking (`src/appointments/schema.test.ts`, `src/appointments/booking.test.ts`, `src/appointments/slots.test.ts`)
- [x] `bookingSchema` accepts a valid booking and rejects:
  - a non-integer `agentId`
  - an unknown `slot`
  - a malformed date
  - a past date
  - a slot earlier today that has already started
  - `notes` over 500 characters
- [x] `GET /appointments/new` renders a form where every control has an associated `<label>`, and `?agentId=2` preselects agent 2.
- [x] A valid `POST /appointments` returns 303 to `/appointments/{id}?booked=1` and inserts one `booked` row.
- [x] Following the redirect shows the confirmation banner with the agent, therapy, date, and slot.
- [x] An invalid `POST` returns 400, keeps the submitted values, and shows an error summary with `role="alert"`. Invalid fields have `aria-invalid="true"` and `aria-describedby`.
- [x] A `POST` for a taken date and slot returns 409 with the "slot taken" message and inserts nothing.
- [x] An unknown `agentId` or `therapyId` returns 400, not 500.
- [x] `GET /appointments/slots?date=` returns the placeholder plus 8 slot `<option>`s, with taken slots `disabled` "(taken)" and today's started slots `disabled` "(past)". Cancelled appointments don't block a slot. An invalid date returns 400.
- [x] `GET /htmx.min.js` returns 200 with a JavaScript `Content-Type`. Only the booking page includes the script tag.

### Cancel (`src/appointments/cancel.test.ts`)
- [x] `POST /appointments/:id/cancel` on an upcoming booked appointment returns 303 and sets its status to `cancelled`.
- [x] After cancelling, the same slot can be booked again.
- [x] Cancelling a cancelled appointment, or one whose slot has started, returns 409 and changes nothing.
- [x] `GET /appointments/:id` shows the Cancel button only for booked appointments whose slot hasn't started.
- [x] Status labels follow one rule: "Booked" until the slot starts, "In progress" for its hour, then "Completed"; "Cancelled" always wins (`src/appointments/status.test.ts`).

### Dashboard (`src/dashboard/dashboard.test.ts`)
- [x] `GET /dashboard` shows these counts for the seed at 10:30: 6 agents, 8 ailments, 6 therapies, 3 today (all of today's bookings), and 7 upcoming (slot not yet started; cancelled ones don't count). Today's table shows each appointment's status.
- [x] It lists today's 3 appointments in slot order and links every agent to `/agents/{id}/dashboard`.
- [x] With no appointments today, it shows the "no appointments today" empty state.
- [x] `GET /agents/:id/dashboard` shows that agent's ailments, recommended therapies, and upcoming booked appointments only, excluding started and cancelled ones and other agents' appointments.
- [x] The agent with nothing booked shows each empty state and a "Book an appointment" link.
- [x] `GET /agents/999/dashboard` returns 404.

### Polish (`src/errors/errors.test.ts`, `src/layout.test.tsx`)
- [x] An unknown path returns 404 with the not-found page inside the layout, with an `<h1>` and a link to `/`.
- [x] A route that throws returns 500 with the error page, and the body contains no stack trace or error message.
- [x] `Layout` renders a "Skip to content" link as the first focusable element, targeting `#main`, and `<main id="main">`.
- [x] Every page route renders exactly one `<h1>`, first, with no skipped heading levels, and starts with the skip link (`src/pages.test.ts`, across every page including the 404 and the booking error state).
- [x] Invalid or unknown ids (`/agents/999`, `/appointments/abc`) get the styled 404 page, not plain text.
- [x] A database failure in a real route returns the 500 page.

### Regression
- [x] All Phase 0 and Phase 1 checks still pass: layout, Pico, and the stylesheet rules (including no `max-width` media queries).

### Gate
- [x] `npm run validate` passes.
- [x] `npm run build`, then `npm run db:migrate && npm run db:seed && npm start` from a different working directory, serves `/` and `/agents` (checked once by hand, since migrations are resolved from the module location).

## Manual checks

Run `npm run db:migrate && npm run db:seed && npm run dev` and open `http://localhost:3000/`.

### Responsive: every page at phone (`320px`), tablet (`768px`), and desktop (`1280px`)
- [x] Pages: Home, Agents, agent detail, Ailments, Therapies, Appointments, appointment detail, booking form (including its error state), staff dashboard, agent dashboard, 404.
- [x] No horizontal page scroll at `320px`. Wide tables scroll inside their container.
- [x] The six-link nav wraps cleanly on phones and sits on one row at desktop width.
- [x] Card grids use 1, 2, and 3 columns at the three widths.
- [x] Links, buttons, and form controls have tap targets of at least 44px. *Nav links, buttons, form controls, and `<details>` toggles all measure at least 44px; links inside sentences are exempt, as in WCAG 2.5.8.*

### Booking flow
- [x] With JavaScript on, changing the date updates the slot list, and taken slots show as disabled "(taken)".
- [x] With JavaScript off, the form still submits, and picking a taken slot shows the 409 error.
- [x] Booking, the confirmation, cancelling, and rebooking the freed slot all work end to end.
- [x] Double-submitting the form (refresh after POST) doesn't create a duplicate, thanks to PRG.

### Accessibility
- [ ] Keyboard-only: the skip link appears on first Tab and jumps to content, every interactive element can be reached with a visible focus ring, and the booking form can be completed and submitted. *Partly verified: the skip link is the first Tab stop on every page and all 210 Tab stops on five pages show a focus ring (both themes). Completing and submitting the form with the keyboard alone still needs a manual run.*
- [ ] A screen reader (VoiceOver) announces the error summary on a failed booking, and each field's error is read with its field. *Not yet run: needs a manual VoiceOver session. The markup is in place (`role="alert"`, `aria-invalid`, `aria-describedby`) and tested.*
- [x] Severity, appointment status, and the current nav link are never shown by color alone.
- [ ] Contrast is WCAG AA in light and dark OS themes on every page, including disabled options and the count cards. *Partly verified: all text on every page, including the count cards, measures at least 6:1 in both themes. Disabled `<option>`s render in the browser's native menu, which headless Chrome can't measure; check them by hand.*
- [x] Each page's heading outline is logical (one `<h1>`, no skipped levels).

### Browsers
- [x] Chrome (automated, headless): every page at three widths in both themes, a keyboard walk of every Tab stop, and the booking flow with and without JavaScript.
- [ ] Firefox (by hand): every page and the booking flow, including the htmx slot list. *Not yet run.*
- [ ] Safari (by hand): every page and the booking flow, including the htmx slot list. *Not yet run.*
- [ ] Edge (by hand): a spot check of the booking flow (same engine as Chrome). *Not yet run: Edge isn't installed on the development machine.*

### Offline and content
- [x] No page requests anything outside its own origin (Pico and htmx are served locally).
- [x] Copy is playful throughout, including empty states and error pages, while the layout stays clean and easy to scan.

## Results (2026-09-28)

- `npm run validate` passes: type-check, ESLint, Prettier, and 229 Vitest tests.
- Gate: after `npm run build`, `db:migrate`, and `db:seed`, `node my-agentclinic/dist/index.js` started from the parent folder served `/` and `/agents` (200, all 6 agents) from the project's database.
- Automated manual checks ran in headless Chrome 153 against that build, driven over the DevTools protocol:
  - 15 pages (including the 404 and an anchored ailment) at `320px`, `768px`, and `1280px` in light and dark themes (90 combinations). None had horizontal page scroll, overflowing elements, a tap target under 44px, text under 4.5:1 contrast, or more than one `<h1>`.
  - A keyboard walk of every Tab stop on five pages in both themes (210 stops). All had a visible focus indicator, and the first stop was always "Skip to content".
  - The booking flow (17 steps): the htmx slot list on load and on date change, booking and its confirmation, refresh after POST, cancel and rebook, the error state at all three widths, and the form with JavaScript disabled.
  - No request left the app's origin.
- Still open before merging: completing the booking form with the keyboard alone, a VoiceOver pass, disabled-option contrast, and Firefox, Safari, and Edge by hand. Headless Firefox wouldn't start from the development session, Safari's WebDriver needs "Allow Remote Automation" enabled by the user, and Edge isn't installed.
